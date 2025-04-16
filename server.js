const http = require("http");
const fs = require("fs");
const url = require("url");
const { EventEmitter } = require("events");

// Config
const PORT = 3000;
const TODOS_FILE = "todos.json";
const LOG_FILE = "logs.txt";

// Logger setup
const logger = new EventEmitter();
logger.on("log", (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFile(LOG_FILE, `${timestamp} - ${message}\n`, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
});

// Data operations
function readTodos(callback) {
  fs.readFile(TODOS_FILE, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return fs.writeFile(TODOS_FILE, "[]", (err) =>
          callback(err, err ? null : [])
        );
      }
      return callback(err);
    }
    try {
      callback(null, JSON.parse(data));
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}

function writeTodos(todos, callback) {
  fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2), callback);
}

// Parse request body
function parseBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    if (!body) return callback(null, {});
    try {
      callback(null, JSON.parse(body));
    } catch (err) {
      callback(err);
    }
  });
  req.on("error", callback);
}

// HTTP Server
const server = http.createServer((req, res) => {
  // Log request
  logger.emit("log", `${req.method} ${req.url}`);

  // Setup response headers
  res.setHeader("Content-Type", "application/json");

  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  const pathSegments = path.split("/").filter(Boolean);
  const query = parsedUrl.query;

  // Helper for sending responses
  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode);
    res.end(data ? JSON.stringify(data) : "");
  };

  const sendError = (statusCode, message) => {
    sendJSON(statusCode, { message });
  };

  // Routes
  if (path === "/todos" && method === "GET") {
    // GET /todos
    readTodos((err, todos) => {
      if (err) {
        console.error("Error reading todos:", err);
        return sendError(500, "Internal Server Error");
      }

      // Filter by completed status if requested
      if (query.completed !== undefined) {
        const isCompleted = query.completed === "true";
        todos = todos.filter((todo) => todo.completed === isCompleted);
      }

      sendJSON(200, todos);
    });
  } else if (
    pathSegments[0] === "todos" &&
    pathSegments.length === 2 &&
    method === "GET"
  ) {
    // GET /todos/:id
    const id = parseInt(pathSegments[1], 10);
    if (isNaN(id)) return sendError(400, "Invalid Todo ID");

    readTodos((err, todos) => {
      if (err) return sendError(500, "Internal Server Error");

      const todo = todos.find((t) => t.id === id);
      if (todo) {
        sendJSON(200, todo);
      } else {
        sendError(404, `Todo with ID ${id} not found`);
      }
    });
  } else if (path === "/todos" && method === "POST") {
    // POST /todos
    parseBody(req, (err, body) => {
      if (err) return sendError(400, "Invalid JSON in request body");
      if (!body || typeof body.title !== "string" || body.title.trim() === "")
        return sendError(400, "Missing or invalid title field");

      readTodos((err, todos) => {
        if (err) return sendError(500, "Internal Server Error");

        // Generate new ID
        const newId =
          todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;

        const newTodo = {
          id: newId,
          title: body.title.trim(),
          completed:
            typeof body.completed === "boolean" ? body.completed : false,
        };

        todos.push(newTodo);

        writeTodos(todos, (err) => {
          if (err) return sendError(500, "Internal Server Error");
          sendJSON(201, newTodo);
        });
      });
    });
  } else if (
    pathSegments[0] === "todos" &&
    pathSegments.length === 2 &&
    method === "PUT"
  ) {
    // PUT /todos/:id
    const id = parseInt(pathSegments[1], 10);
    if (isNaN(id)) return sendError(400, "Invalid Todo ID");

    parseBody(req, (err, body) => {
      if (err) return sendError(400, "Invalid JSON in request body");

      const hasTitle = body.hasOwnProperty("title");
      const hasCompleted = body.hasOwnProperty("completed");

      if (!hasTitle && !hasCompleted)
        return sendError(400, "Missing fields to update (title or completed)");

      if (
        hasTitle &&
        (typeof body.title !== "string" || body.title.trim() === "")
      )
        return sendError(400, "Invalid title field");

      if (hasCompleted && typeof body.completed !== "boolean")
        return sendError(400, "Invalid completed field (must be boolean)");

      readTodos((err, todos) => {
        if (err) return sendError(500, "Internal Server Error");

        const todoIndex = todos.findIndex((t) => t.id === id);
        if (todoIndex === -1)
          return sendError(404, `Todo with ID ${id} not found`);

        // Update the todo
        const updatedTodo = { ...todos[todoIndex] };
        if (hasTitle) updatedTodo.title = body.title.trim();
        if (hasCompleted) updatedTodo.completed = body.completed;
        todos[todoIndex] = updatedTodo;

        writeTodos(todos, (err) => {
          if (err) return sendError(500, "Internal Server Error");
          sendJSON(200, updatedTodo);
        });
      });
    });
  } else if (
    pathSegments[0] === "todos" &&
    pathSegments.length === 2 &&
    method === "DELETE"
  ) {
    // DELETE /todos/:id
    const id = parseInt(pathSegments[1], 10);
    if (isNaN(id)) return sendError(400, "Invalid Todo ID");

    readTodos((err, todos) => {
      if (err) return sendError(500, "Internal Server Error");

      const initialLength = todos.length;
      const filteredTodos = todos.filter((t) => t.id !== id);

      if (filteredTodos.length === initialLength)
        return sendError(404, `Todo with ID ${id} not found`);

      writeTodos(filteredTodos, (err) => {
        if (err) return sendError(500, "Internal Server Error");
        res.writeHead(204);
        res.end();
      });
    });
  } else {
    // Not Found
    sendError(404, "Endpoint not found");
  }
});

// Initialize and start server
(function init() {
  // Create log file if it doesn't exist
  fs.access(LOG_FILE, fs.constants.F_OK, (err) => {
    if (err)
      fs.writeFile(LOG_FILE, "", (err) => {
        if (err) console.error("Failed to create log file:", err);
      });
  });

  // Start server
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Handle server errors
  server.on("error", (err) => {
    console.error("Server error:", err);
  });
})();

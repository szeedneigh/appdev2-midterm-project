#  CRUD HTTP Server Using the File System Module

## Project Overview

This project is a RESTful API that mimics JSONPlaceholder's todos endpoint using Node.js and the fs module. It provides endpoints for creating, reading, updating, and deleting todo items, with data stored in a JSON file. The API also includes a logging system that tracks all API requests.

## Features

- **CRUD Operations**: Create, read, update, and delete todo items
- **Data Persistence**: Stores todo items in a JSON file
- **Filtering**: Filter todos by completion status
- **Request Logging**: Logs all API requests with timestamps
- **Error Handling**: Returns appropriate HTTP status codes for different scenarios

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /todos | Fetch all todos (optional filtering by completed status) |
| GET | /todos/:id | Fetch a specific todo by ID |
| POST | /todos | Create a new todo |
| PUT | /todos/:id | Update a todo by ID |
| DELETE | /todos/:id | Delete a todo by ID |

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/appdev2-midterm-project.git
   cd appdev2-midterm-project
   ```

2. Make sure you have Node.js installed on your system.

3. Create the initial todos.json file with sample data:
   ```json
   [
     { "id": 1, "title": "Learn Node.js", "completed": false },
     { "id": 2, "title": "Build an API", "completed": true }
   ]
   ```

## Usage

1. Start the server:
   ```
   node server.js
   ```

2. The server will run on port 3000. You can access the API at http://localhost:3000

3. Use a tool like Postman, curl, or any HTTP client to interact with the API.

### Example Requests

#### Get all todos
```
GET http://localhost:3000/todos
```

#### Get completed todos only
```
GET http://localhost:3000/todos?completed=true
```

#### Get a specific todo
```
GET http://localhost:3000/todos/1
```

#### Create a new todo
```
POST http://localhost:3000/todos
Content-Type: application/json

{
  "title": "Complete midterm project",
  "completed": false
}
```

#### Update a todo
```
PUT http://localhost:3000/todos/1
Content-Type: application/json

{
  "title": "Learn Node.js and Express",
  "completed": true
}
```

#### Delete a todo
```
DELETE http://localhost:3000/todos/1
```

## Project Structure

- `server.js` - Main application file containing the HTTP server and API logic
- `todos.json` - JSON file for storing todo items
- `logs.txt` - Log file containing API request logs

## Implementation Details

- **HTTP Server**: Uses Node.js built-in http module
- **Data Storage**: Uses fs module to read from and write to todos.json
- **Request Logging**: Uses EventEmitter from the events module to log API requests
- **URL Parsing**: Uses the url module to parse request URLs and query parameters

## Error Handling

The API returns appropriate status codes:
- 200 – Success
- 201 – Created (when a new todo is created)
- 204 – No Content (when a todo is deleted)
- 400 – Bad request (e.g., missing fields, invalid data)
- 404 – Not found (e.g., trying to fetch a non-existent todo)
- 500 – Internal server error (e.g., failed file operations)

## API Demonstration

[]

## About Me

### Sidney John Manalansan Sarcia

I am a technology enthusiast currently pursuing my degree in Bachelor of Information Systems at La Verdad Christian College, I am deeply interested in creating efficient, scalable, and maintainable software solutions that leverage the modern technology standards.

### Skills & Expertise
- **Programming Languages**: JavaScript, Typescript, Python, Java, C++, C#, PHP
- **Frameworks & Libraries**: Express.js, Django, Flask, Node.js, React, Next.js
- **Tools & Technologies**: Git, GitHub, OpenCV, YOLOv10, Tesseract OCR 
- **Databases**: MySQL, MongoDB

### Connect With Me
- GitHub: [szeedneigh](github.com/szeedneigh)
- Instagram: [szeedneigh](instagram.com/szeedneigh)
- X: [szeedneigh](x.com/szeedneigh)

---

*This RESTful API project demonstrates my understanding of backend development principles, Node.js fundamentals, and RESTful architecture. It showcases my ability to implement CRUD operations, error handling, and logging mechanisms without relying on external libraries.*

## Introduction

DynamicResponder is a lightweight routing library for Deno that allows you to handle dynamic routes with ease. It enables you to define routes with parameters,
making it simple to build RESTful APIs.

## Usage

Creating an Instance

First, create an instance of the DynamicResponder class.

const responder = new DynamicResponder();

Defining Routes

You can define routes for various HTTP methods (GET, POST, PUT) using the following methods:

- get(pathname: string, func: ResponseFunction)

- post(pathname: string, func: ResponseFunction)

- put(pathname: string, func: ResponseFunction)

## Example

```typescript
responder.get("/user/:name", (req) => {
	return new Response(`Hello, ${req.params.name}!`); // Accessing the parameter
});
```

### Starting the Server

To start the server, use the start method, specifying the port and optionally the hostname.

```typescript
responder.start(80);
```

### Complete Example

Here is a complete example demonstrating the usage of the DynamicResponder class.

```typescript
import DynamicResponder from "./path/to/DynamicResponder.ts";
const responder = new DynamicResponder();

responder.get("/user/:name", (req) => {
	return new Response(`Hello, ${req.params.name}!`);
});

responder.start(80);
```

### License

This project is licensed under the MIT License. See the LICENSE file for details.

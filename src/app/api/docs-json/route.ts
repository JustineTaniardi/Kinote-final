import { NextResponse } from "next/server";

export async function GET() {
  const swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: "Kinote API",
      description:
        "API documentation for Kinote - Productivity & Task Management Application",
      version: "1.0.0",
      contact: {
        name: "Kinote Support",
        email: "support@kinote.app",
      },
    },
    servers: [
      {
        url: process.env.APP_URL || "http://localhost:3000",
        description: "Production Server",
      },
    ],
    paths: {
      // Authentication Endpoints
      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user",
          description: "Create a new user account with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "John Doe" },
                    email: {
                      type: "string",
                      format: "email",
                      example: "john@example.com",
                    },
                    password: {
                      type: "string",
                      minLength: 6,
                      example: "password123",
                    },
                  },
                  required: ["name", "email", "password"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "User created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          email: { type: "string" },
                        },
                      },
                      token: { type: "string" },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid input or email already exists" },
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login user",
          description: "Authenticate user with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "john@example.com",
                    },
                    password: { type: "string", example: "password123" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      user: { type: "object" },
                      token: { type: "string" },
                    },
                  },
                },
              },
            },
            "401": { description: "Invalid credentials" },
          },
        },
      },

      "/api/auth/forgot-password": {
        post: {
          tags: ["Authentication"],
          summary: "Request password reset",
          description: "Send password reset email to user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "john@example.com",
                    },
                  },
                  required: ["email"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Password reset email sent",
            },
          },
        },
      },

      "/api/auth/reset-password": {
        post: {
          tags: ["Authentication"],
          summary: "Reset password",
          description: "Reset password using token from email",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    password: { type: "string", minLength: 6 },
                  },
                  required: ["token", "password"],
                },
              },
            },
          },
          responses: {
            "200": { description: "Password updated successfully" },
            "400": { description: "Invalid or expired token" },
          },
        },
      },

      "/api/auth/verify": {
        get: {
          tags: ["Authentication"],
          summary: "Verify email",
          description: "Verify user email address with token",
          parameters: [
            {
              name: "token",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Email verified successfully" },
            "400": { description: "Invalid or expired token" },
          },
        },
      },

      // Tasks Endpoints
      "/api/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "Get all tasks",
          description: "Retrieve all tasks for authenticated user",
          responses: {
            "200": {
              description: "List of tasks",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Tasks"],
          summary: "Create new task",
          description: "Create a new task",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["title"],
                },
              },
            },
          },
          responses: {
            "201": { description: "Task created successfully" },
          },
        },
      },

      "/api/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Task details" },
            "404": { description: "Task not found" },
          },
        },
      },

      // Streaks Endpoints
      "/api/streaks": {
        get: {
          tags: ["Streaks"],
          summary: "Get all streaks",
          description: "Retrieve all user streaks",
          responses: {
            "200": { description: "List of streaks" },
          },
        },
        post: {
          tags: ["Streaks"],
          summary: "Create new streak",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    taskId: { type: "string" },
                    name: { type: "string" },
                  },
                  required: ["taskId"],
                },
              },
            },
          },
          responses: {
            "201": { description: "Streak created successfully" },
          },
        },
      },

      // Categories Endpoints
      "/api/categories": {
        get: {
          tags: ["Categories"],
          summary: "Get all categories",
          responses: {
            "200": { description: "List of categories" },
          },
        },
        post: {
          tags: ["Categories"],
          summary: "Create new category",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    color: { type: "string" },
                  },
                  required: ["name"],
                },
              },
            },
          },
          responses: {
            "201": { description: "Category created successfully" },
          },
        },
      },

      // Status Endpoints
      "/api/status": {
        get: {
          tags: ["Status"],
          summary: "Get API status",
          description: "Check if API is running",
          responses: {
            "200": { description: "API is healthy" },
          },
        },
      },
    },
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            completed: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Streak: {
          type: "object",
          properties: {
            id: { type: "string" },
            taskId: { type: "string" },
            name: { type: "string" },
            count: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication endpoints",
      },
      {
        name: "Tasks",
        description: "Task management endpoints",
      },
      {
        name: "Streaks",
        description: "Streak tracking endpoints",
      },
      {
        name: "Categories",
        description: "Category management endpoints",
      },
      {
        name: "Status",
        description: "API status endpoints",
      },
    ],
  };

  return NextResponse.json(swaggerSpec);
}

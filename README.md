# Blog App

A RESTful Blog application built with **NestJS** and **MongoDB**.  
Supports **blog CRUD**, **Comment CRUD**, **Authentication with Access & Refresh Tokens**, and API documentation using **Swagger**.

---

## Features

- **Authentication**
  - JWT-based authentication
  - Access Token & Refresh Token mechanism
  - Protected routes

- **blogs**
  - Create, Read, Update, Delete (CRUD) blogs
  - Each blog has an **author** (User)
- **Comments**
  - Create, Read, Update, Delete (CRUD) comments on blogs
  - Each comment linked to a **user**

- **API Documentation**
  - Swagger available at `/api`

---

## How to Run

### 1. Clone the repository

```bash
git clone <repository-url>
cd blog-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a .env file in the project root

Add the following environment variables:

```bash
APP_NAME=Blog App
PORT=3000
NODE_ENV=development

# MongoDB connection
MONGO_URI=mongodb://localhost:27017/blog-app

# JWT Authentication
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_ACCESS_TOKEN_EXPIRATION_TIME=15m
JWT_REFRESH_TOKEN_EXPIRATION_TIME=1d
```

### 4. Run the project in development mode

```bash
npm run start:dev
```

Server will run on http://localhost:3000 by default

### 4. Access API and Swagger

Swagger documentation:

```bash
http://localhost:3000/api
```

You can view all API endpoints, request/response schemas, and test routes directly in the browser.

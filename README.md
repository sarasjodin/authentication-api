# My Authentication Lab

A lab focused on user registration, login, JWT authentication, bcrypt password hashing and authorization for protected resources. 

## Frontend

[![Netlify Status](https://api.netlify.com/api/v1/badges/c31d6962-98b9-4f88-bc68-2b41750a0729/deploy-status)](https://app.netlify.com/projects/my-authentication-lab/deploys)

A live version of the API frontend: https://my-authentication-lab.netlify.app/

## Backend

API Base URL:
https://authentication.sarasjodin.se/api
Note: This is the API base URL, not a browsable web page

Health check endpoint:
GET https://authentication.sarasjodin.se/health

This endpoint can be used to verify that the API is running correctly on the deployed VPS environment.

## The authentication service is built with:

- Node.js
- Express
- SQLite
- JWT
- Docker
- Traefik

---

| Table   | Column     | Type     | Constraints / Default        |
| ------- | ---------- | -------- | ---------------------------- |
| `users` | `id`       | INTEGER  | PRIMARY KEY, AUTOINCREMENT   |
| `users` | `username` | TEXT     | NOT NULL, UNIQUE             |
| `users` | `email`    | TEXT     | NOT NULL, UNIQUE             |
| `users` | `password` | TEXT     | NOT NULL, stores bcrypt hash |
| `users` | `created`  | DATETIME | DEFAULT CURRENT_TIMESTAMP    |

---

| Method | Endpoint         | Description                                                    |
| ------ | ---------------- | -------------------------------------------------------------- |
| GET    | `/health`        | Basic API health check endpoint.                               |
| POST   | `/api/register`  | Register a new user.                                           |
| POST   | `/api/login`     | Authenticate a user and return a JWT token.                    |
| GET    | `/api/protected` | Return protected user information. Requires a valid JWT token. |

## Create user

A new user is created by sending the following JSON body:

```json
{
  "username": "name",
  "email": "name@domain.se",
  "password": "SomeText123"
}
```

## Example database record:

```json
{
  "id": 2,
  "username": "name",
  "email": "name@domain.se",
  "password": "$2b$10$hashedPasswordExample...",
  "created": "2026-06-22 16:14:10"
}
```

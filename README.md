# Project Name

Fullstack DevCase — Users Dashboard

---

### Setup & Run Locally

Install dependencies
npm install

#### Copy .env.example to .env and fill in the values:
NODE_ENV=production
APP_PORT=3000

# db credentials
DB_USERNAME= YOUR_DB_USERNAME
DB_PASSWORD= YOUR_DB_PASSWORD
DB_NAME=YOUR_DB_NAME
DB_HOST=localhost
DB_PORT=5432


# jwt info
JWT_SECRET=my-secrte-code-jwt
JWT_EXPIRES_IN=15d

# admin info for seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin1234


If using Docker:
docker-compose up -d


Run migrations & seeds
npm run migrate
npm run seed


if Start the server in dev mode
npm run start:dev

## Features

- Registration & login with email/password (bcrypt + JWTs)  
- Access token + refresh token support  
- CRUD operations for users  
- Nested users (parent/child relationships)  
- Pagination, sorting, filtering support on list endpoints  
- Zod validation for inputs (body, query, params)  
- Swagger / OpenAPI documentation  
- Secure headers (Helmet), CORS configuration, rate limiting, etc.

---

## Technologies & Tools

- Node.js, Express.js  
- Sequelize ORM  
- PostgreSQL  
- bcrypt for password hashing  
- JSON Web Tokens (JWT)  
- Zod for validation  
- cors 

---

## Getting Started

### Prerequisites

- Node.js and npm (or Yarn)  
- PostgreSQL (locally or via Docker)  
- Git  



# Fullstack DevCase — Backend

---

### Setup & Run Locally

Install dependencies  
```bash
npm install

Copy .env.example → .env and fill in the values

NODE_ENV=production  
APP_PORT=3000  

# DB credentials  
DB_USERNAME=YOUR_DB_USERNAME  
DB_PASSWORD=YOUR_DB_PASSWORD  
DB_NAME=YOUR_DB_NAME  
DB_HOST=localhost  
DB_PORT=5432  

# JWT info  
JWT_SECRET=my-secret-code-jwt  
JWT_EXPIRES_IN=15d  

# Admin info for seed  
ADMIN_EMAIL=admin@example.com  
ADMIN_PASSWORD=admin1234  

If using Docker:

docker-compose up -d  
# or  
docker compose up --build --force-recreate -d

Run migrations & seeds (Locally):
npm run migrate  
npm run seed

Start the server in dev mode:

npm run start:dev


Features

Registration & login using email/password (bcrypt + JWT)

Access token + refresh token support

CRUD operations for users

Nested users (parent / child relationships)

Pagination, sorting & filtering support on list endpoints

Input validation via Zod (body, query, params)

Swagger / OpenAPI documentation

Secure headers (Helmet), CORS configuration, rate limiting, etc.

Technologies & Tools

Node.js & Express.js

Sequelize ORM

PostgreSQL

bcrypt (password hashing)

JSON Web Tokens (JWT)

Zod (validation)

cors

Getting Started
Prerequisites

Node.js & npm (or Yarn)

PostgreSQL (local or via Docker)

Git
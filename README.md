# blog_backend

A NestJS-based blog backend providing JWT authentication and user management. This repository contains the API server, configuration, and instructions to run the project locally.

## Tech Stack

- **Node.js** (>= 22)
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Swagger/OpenAPI** - API documentation
- **bcrypt** - Password hashing

## Features

- **JWT Authentication**
  - User registration
  - User login with access and refresh tokens
  - Refresh token generation
  - Logout endpoint (placeholder)
- **User Management**
  - Create, read, update, and delete users
  - Password hashing with bcrypt
  - Protected routes with JWT authentication
- **API Documentation**
  - Swagger UI available at `/api`
  - Bearer token authentication support
- **Clean Architecture**
  - Modular structure using NestJS modules
  - Separation of concerns (controllers, services, DTOs, schemas)
  - Global validation pipes

## Prerequisites

- Node.js 22+ and yarn (or npm)
- MongoDB database (local or remote)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
PORT=8080
MONGODB_URI=mongodb://user:pass@localhost:27017/blog_db
HASH_SECRET=your_jwt_secret_here
NODE_ENV=development
```

**Required Environment Variables:**

- `MONGODB_URI` - MongoDB connection string
- `HASH_SECRET` - Secret key for JWT token signing and verification
- `PORT` - Server port (defaults to 8080 if not provided)

## Installation

Install dependencies:

```bash
yarn install
```

## Development

Run the app in development mode with hot reload:

```bash
yarn start:dev
```

The server will listen on the port specified in `PORT` environment variable or default to 8080.

Access Swagger API documentation at: `http://localhost:8080/api`

## Build

Build the TypeScript to JavaScript:

```bash
yarn build
```

## Production

Start the built app:

```bash
yarn start:prod
```

## Scripts

- `yarn start` - Start the application
- `yarn start:dev` - Start in development mode with watch
- `yarn start:debug` - Start in debug mode
- `yarn start:prod` - Start production build
- `yarn build` - Build the application
- `yarn format` - Format code with Prettier
- `yarn lint` - Lint and fix code
- `yarn test` - Run unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:cov` - Run tests with coverage
- `yarn test:e2e` - Run end-to-end tests

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
  - Body: `{ username, email, password, firstName?, lastName?, gender? }`
  - Returns: User data (password excluded)

- `POST /auth/login` - Login and receive JWT tokens
  - Body: `{ email, password }`
  - Returns: `{ accessToken: "Bearer ...", refreshToken: "Bearer ..." }`
  - Access token expires in 1 minute
  - Refresh token expires in 3 minutes

- `POST /auth/refresh-token` - Generate new access token using refresh token
  - Body: `{ refreshToken: "Bearer ..." }`
  - Returns: New access and refresh tokens

- `POST /auth/logout` - Logout (placeholder)

### Users (Protected - Requires JWT Bearer Token)

All user endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

- `POST /users` - Create a new user (authenticated)
  - Body: `{ username, email, password, firstName?, lastName?, gender? }`

- `GET /users` - Get all users (authenticated)
  - Returns: Array of users (passwords excluded)

- `GET /users/:id` - Get a user by ID (authenticated)
  - Returns: User data (password excluded)

- `PATCH /users/:id/update` - Update a user (authenticated)
  - Body: Partial user data

- `DELETE /users/:id/delete` - Delete a user (authenticated)

## Project Structure

```
src/
├── app.module.ts              # Root application module
├── main.ts                    # Application bootstrap and Swagger setup
├── core/
│   ├── auth/
│   │   ├── auth.controller.ts # Authentication endpoints
│   │   ├── auth.service.ts    # Authentication business logic
│   │   ├── auth.module.ts     # Auth module configuration
│   │   ├── auth.guard.ts      # JWT authentication guard
│   │   └── dto/
│   │       ├── login-auth.dto.ts
│   │       └── refresh-token.dto.ts
│   └── user/
│       ├── user.controller.ts # User CRUD endpoints
│       ├── user.service.ts    # User business logic
│       ├── user.module.ts     # User module configuration
│       ├── schema/
│       │   └── user.schema.ts # Mongoose user schema
│       └── dto/
│           └── update-user.dto.ts
└── common/
    └── dto/
        └── user.dto.ts        # Shared user DTO
```

## Authentication Flow

1. **Registration**: User registers with username, email, and password
   - Password is hashed using bcrypt (10 rounds)
   - User is saved to MongoDB

2. **Login**: User provides email and password
   - Password is verified against stored hash
   - JWT access token (1m expiry) and refresh token (3m expiry) are generated
   - Refresh token is stored in user document (max 2 tokens per user)

3. **Protected Routes**: Include access token in Authorization header
   - Token is verified by AuthGuard
   - User ID is extracted and available in request

4. **Token Refresh**: Use refresh token to get new access token
   - Refresh token is validated
   - New access and refresh tokens are generated

## User Schema

```typescript
{
  firstName?: string;
  lastName?: string;
  username: string;        // Required, unique
  email: string;           // Required, unique
  password: string;        // Required, hashed
  gender?: 'male' | 'female' | 'other';
  postsIds?: string[];
  refreshTokens: string[]; // Array of refresh tokens (max 2)
}
```

## API Documentation

Swagger UI is available at `/api` when the server is running. The documentation includes:

- All available endpoints
- Request/response schemas
- Authentication requirements
- Interactive API testing

To test protected endpoints in Swagger:

1. Login via `/auth/login`
2. Copy the `accessToken` value (without "Bearer " prefix)
3. Click "Authorize" button in Swagger UI
4. Enter: `Bearer <your_access_token>`
5. Test protected endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please follow existing code style and add tests for new behavior.

## Troubleshooting

- **Missing environment variables**: Ensure `.env` file exists with all required variables
- **MongoDB connection errors**: Verify `MONGODB_URI` is correct and MongoDB is running
- **JWT errors**: Check that `HASH_SECRET` is set and consistent
- **TypeScript errors**: Run `yarn build` to see full diagnostics
- **Port already in use**: Change `PORT` in `.env` or stop the process using the port

## License

MIT

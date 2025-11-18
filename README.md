# blog_backend

A NestJS-based blog backend providing JWT authentication, user management, post management, categories, tags, and comments. This repository contains the API server, configuration, and instructions to run the project locally.

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
  - Track user's posts and comments via arrays
  - Get all posts by a specific user
- **Post Management**
  - Create, read, update, and delete posts
  - Posts are linked to users via foreign key reference
  - Posts can be associated with categories and tags
  - User's `posts` array automatically maintained
  - Get all posts (public) or individual posts (protected)
  - Posts include user, category, tags, and comments information via population
  - Get all comments for a specific post
- **Category Management**
  - Create, read, update, and delete categories
  - Categories have unique names
  - Get all posts under a specific category
  - Category's `posts` array automatically maintained
- **Tag Management**
  - Create, read, update, and delete tags
  - Tags have unique names
  - Posts can have multiple tags
  - Get all posts under a specific tag
  - Tag's `posts` array automatically maintained
- **Comment Management**
  - Create, read, update, and delete comments
  - Comments are linked to posts and users
  - Support for nested comments (replies)
  - Get all comments for a post
  - Comment's `replies` array automatically maintained
  - User's `comments` array automatically maintained
- **API Documentation**
  - Swagger UI available at `/api`
  - Bearer token authentication support
  - Interactive API testing with parameter inputs
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

- `GET /users/:id/posts` - Get all posts by a user (public)
  - Returns: Array of posts with populated user, category, tags, and comments

- `PATCH /users/:id/update` - Update a user (authenticated)
  - Body: Partial user data

- `DELETE /users/:id/delete` - Delete a user (authenticated)

### Posts

- `POST /posts` - Create a new post (authenticated)
  - Body: `{ title: string, content: string, categoryId?: string, tagIds?: string[] }`
  - Automatically associates post with authenticated user
  - Returns: Created post data with populated user, category, and tags

- `GET /posts` - Get all posts (public)
  - Returns: Array of posts with populated user, category, tags, and comments information

- `GET /posts/:id` - Get a post by ID (authenticated)
  - Returns: Post data with populated user, category, tags, and comments information

- `GET /posts/:id/comments` - Get all comments for a post (public)
  - Returns: Array of top-level comments with nested replies

- `PATCH /posts/:id/update` - Update a post (authenticated)
  - Body: Partial post data `{ title?: string, content?: string, categoryId?: string, tagIds?: string[] }`
  - Returns: Updated post data

- `DELETE /posts/:id/delete` - Delete a post (authenticated)
  - Automatically removes post ID from user's `posts` array
  - Removes post from category's `posts` array
  - Removes post from tags' `posts` arrays
  - Deletes all associated comments
  - Returns: Success message

### Categories

- `POST /categories` - Create a new category (authenticated)
  - Body: `{ name: string, description?: string }`
  - Returns: Created category data

- `GET /categories` - Get all categories (public)
  - Returns: Array of categories

- `GET /categories/:id` - Get a category by ID (public)
  - Returns: Category data

- `GET /categories/:id/posts` - Get all posts under a category (public)
  - Returns: Array of posts with populated user, category, tags, and comments

- `PATCH /categories/:id/update` - Update a category (authenticated)
  - Body: Partial category data `{ name?: string, description?: string }`
  - Returns: Updated category data

- `DELETE /categories/:id/delete` - Delete a category (authenticated)
  - Automatically removes category reference from all associated posts
  - Returns: Success message

### Tags

- `POST /tags` - Create a new tag (authenticated)
  - Body: `{ name: string, description?: string }`
  - Returns: Created tag data

- `GET /tags` - Get all tags (public)
  - Returns: Array of tags

- `GET /tags/:id` - Get a tag by ID (public)
  - Returns: Tag data

- `GET /tags/:id/posts` - Get all posts under a tag (public)
  - Returns: Array of posts with populated user, category, tags, and comments

- `PATCH /tags/:id/update` - Update a tag (authenticated)
  - Body: Partial tag data `{ name?: string, description?: string }`
  - Returns: Updated tag data

- `DELETE /tags/:id/delete` - Delete a tag (authenticated)
  - Automatically removes tag reference from all associated posts
  - Returns: Success message

### Comments

- `POST /comments` - Create a new comment (authenticated)
  - Body: `{ content: string, postId: string, parentCommentId?: string }`
  - Automatically associates comment with authenticated user
  - Supports nested comments (replies) via `parentCommentId`
  - Returns: Created comment data

- `GET /comments` - Get all comments (public)
  - Query params: `?postId={postId}` - Filter comments by post
  - Returns: Array of comments with populated user, post, parentComment, and replies

- `GET /comments/:id` - Get a comment by ID (public)
  - Returns: Comment data with populated user, post, parentComment, and replies

- `PATCH /comments/:id/update` - Update a comment (authenticated)
  - Body: Partial comment data `{ content?: string, postId?: string, parentCommentId?: string | null }`
  - Returns: Updated comment data

- `DELETE /comments/:id/delete` - Delete a comment (authenticated)
  - Automatically removes comment from post's `comments` array
  - Removes comment from user's `comments` array
  - Removes comment from parent comment's `replies` array (if applicable)
  - Deletes all nested replies
  - Returns: Success message

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
├── post/
│   ├── post.controller.ts    # Post CRUD endpoints
│   ├── post.service.ts       # Post business logic
│   ├── post.module.ts        # Post module configuration
│   ├── schema/
│   │   └── post.schema.ts    # Mongoose post schema
│   └── dto/
│       ├── create-post.dto.ts
│       └── update-post.dto.ts
├── category/
│   ├── category.controller.ts # Category CRUD endpoints
│   ├── category.service.ts    # Category business logic
│   ├── category.module.ts     # Category module configuration
│   ├── schema/
│   │   └── category.schema.ts # Mongoose category schema
│   └── dto/
│       ├── create-category.dto.ts
│       └── update-category.dto.ts
├── tag/
│   ├── tag.controller.ts      # Tag CRUD endpoints
│   ├── tag.service.ts         # Tag business logic
│   ├── tag.module.ts          # Tag module configuration
│   ├── schema/
│   │   └── tag.schema.ts      # Mongoose tag schema
│   └── dto/
│       ├── create-tag.dto.ts
│       └── update-tag.dto.ts
├── comment/
│   ├── comment.controller.ts  # Comment CRUD endpoints
│   ├── comment.service.ts     # Comment business logic
│   ├── comment.module.ts      # Comment module configuration
│   ├── schema/
│   │   └── comment.schema.ts  # Mongoose comment schema
│   └── dto/
│       ├── create-comment.dto.ts
│       └── update-comment.dto.ts
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

## Database Schemas

### User Schema

```typescript
{
  firstName?: string;
  lastName?: string;
  username: string;        // Required, unique
  email: string;           // Required, unique
  password: string;        // Required, hashed
  gender?: 'male' | 'female' | 'other';
  posts: Types.ObjectId[];     // Array of post IDs (automatically maintained)
  comments: Types.ObjectId[];  // Array of comment IDs (automatically maintained)
  refreshTokens: string[];      // Array of refresh tokens (max 2)
  createdAt: Date;             // Auto-generated
  updatedAt: Date;             // Auto-generated
}
```

### Post Schema

```typescript
{
  title: string;                    // Required
  content: string;                   // Required
  user: Types.ObjectId;              // Required, reference to User
  category?: Types.ObjectId;         // Optional, reference to Category
  tags: Types.ObjectId[];            // Array of tag references
  comments: Types.ObjectId[];       // Array of comment references
  createdAt: Date;                   // Auto-generated timestamp
  updatedAt: Date;                   // Auto-generated timestamp
}
```

**Note:** When a post is created, its ID is automatically added to the user's `posts` array. When a post is deleted, its ID is automatically removed from the user's `posts` array, category's `posts` array, and all tags' `posts` arrays. Associated comments are also deleted.

### Category Schema

```typescript
{
  name: string;                // Required, unique
  description?: string;
  posts: Types.ObjectId[];     // Array of post IDs (automatically maintained)
  createdAt: Date;             // Auto-generated timestamp
  updatedAt: Date;             // Auto-generated timestamp
}
```

**Note:** When a post is assigned to a category, the post ID is automatically added to the category's `posts` array. When a category is deleted, all associated posts have their category reference removed.

### Tag Schema

```typescript
{
  name: string;                // Required, unique
  description?: string;
  posts: Types.ObjectId[];     // Array of post IDs (automatically maintained)
  createdAt: Date;             // Auto-generated timestamp
  updatedAt: Date;             // Auto-generated timestamp
}
```

**Note:** When a post is assigned tags, the post ID is automatically added to each tag's `posts` array. When a tag is deleted, all associated posts have the tag reference removed from their `tags` array.

### Comment Schema

```typescript
{
  content: string;                    // Required
  user: Types.ObjectId;               // Required, reference to User
  post: Types.ObjectId;               // Required, reference to Post
  parentComment?: Types.ObjectId;     // Optional, reference to parent Comment (for replies)
  replies: Types.ObjectId[];          // Array of reply comment IDs (automatically maintained)
  createdAt: Date;                    // Auto-generated timestamp
  updatedAt: Date;                    // Auto-generated timestamp
}
```

**Note:** When a comment is created, its ID is automatically added to the post's `comments` array and the user's `comments` array. If it's a reply, it's also added to the parent comment's `replies` array. When a comment is deleted, it's removed from all these arrays, and all nested replies are also deleted.

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

# Rolexa API Design

## 1. Overview

This document defines the API design for Rolexa.

The API provides the communication layer between the React frontend and the Express.js backend (implemented with TypeScript).

The API design is based on:

- Requirements established during Phase 1 ([01-project-charter.md](01-project-charter.md))
- System architecture established during Phase 2 ([02-system-design.md](02-system-design.md))
- Database design established during Phase 3 ([03-database-design.md](03-database-design.md))

The API is designed to provide:

- Clear resource-oriented RESTful endpoints
- Consistent request and response structures
- Secure authentication and authorization
- User data isolation
- Predictable validation and error handling
- API versioning
- Interactive API documentation through OpenAPI and Swagger

---

## 2. API Objectives

The Rolexa API shall:

1. Provide RESTful access to Rolexa resources.
2. Support user registration and authentication.
3. Allow authenticated users to manage their own data.
4. Support job application management (CRUD).
5. Support interview management.
6. Support document metadata and file references.
7. Support application notes.
8. Support reminders.
9. Provide dashboard statistics and metrics.
10. Support application search, filtering, and sorting.
11. Enforce user ownership and authorization.
12. Validate client input before processing requests.
13. Return consistent success and error responses.
14. Support future API evolution through versioning.
15. Provide machine-readable API documentation through OpenAPI.

---

## 3. API Architecture

Rolexa uses a REST API implemented with Express.js and TypeScript.

The API sits between the React frontend and the backend application layers:

```text
React Frontend
      |
      | HTTP / REST (JSON)
      v
API Routes (/api/v1/...)
      |
      v
Controllers (HTTP parsing & response formatting)
      |
      v
Services (Business logic & authorization checks)
      |
      v
Repositories (Database queries & data access)
      |
      v
PostgreSQL Database
```

---

## 4. Base URL, Versioning & Conventions

### 4.1 Base URL
All API routes are prefixed with the API version:

```text
/api/v1
```

### 4.2 Standard Request & Response Headers

| Header | Value | When Required |
|---|---|---|
| `Content-Type` | `application/json` | Required on requests with a JSON body (`POST`, `PUT`, `PATCH`) |
| `Accept` | `application/json` | Recommended on all requests |
| `Authorization` | `Bearer <access_token>` | Required on all protected endpoints |

### 4.3 URL Naming & Resource Conventions

- **Plural nouns for resources**: Endpoints represent resource collections (e.g., `/api/v1/applications`, `/api/v1/interviews`), never actions/verbs.
- **Resource identifiers**: Use UUID path parameters for specific records: `/api/v1/applications/:id`.
- **Nested routes for owned child resources**:
  - `/api/v1/applications/:id/interviews`
  - `/api/v1/applications/:id/notes`
  - `/api/v1/applications/:id/documents`
- **Direct routes for direct operations**: Individual sub-resources can be updated or deleted directly by their unique ID:
  - `PATCH /api/v1/interviews/:id`
  - `DELETE /api/v1/notes/:id`

### 4.4 HTTP Method Semantics

- `GET`: Retrieve a resource or list of resources (safe, idempotent).
- `POST`: Create a new resource.
- `PUT`: Fully replace an existing resource.
- `PATCH`: Partially update an existing resource.
- `DELETE`: Remove a resource.

---

## 5. Standard Response Format

All responses follow a predictable JSON envelope structure so the frontend handles data and errors uniformly.

### 5.1 Success Response (Single Item or Action)

```json
{
  "success": true,
  "data": {
    "id": "e4b2d3c1-8f4a-4a2b-9e23-7a1b2c3d4e5f",
    "company_name": "Acme Corp",
    "job_title": "Software Engineer",
    "status": "applied",
    "applied_at": "2026-10-01T10:00:00Z",
    "created_at": "2026-10-01T10:00:00Z",
    "updated_at": "2026-10-01T10:00:00Z"
  },
  "message": "Resource retrieved successfully"
}
```

### 5.2 Success Response (Paginated Lists)

```json
{
  "success": true,
  "data": [
    {
      "id": "e4b2d3c1-8f4a-4a2b-9e23-7a1b2c3d4e5f",
      "company_name": "Acme Corp",
      "job_title": "Software Engineer",
      "status": "applied",
      "applied_at": "2026-10-01T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_records": 42,
    "total_pages": 5
  }
}
```

### 5.3 Error Response Structure

All errors (4xx client errors and 5xx server errors) return this standard structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request payload failed validation",
    "details": [
      {
        "field": "company_name",
        "issue": "Company name is required"
      },
      {
        "field": "applied_at",
        "issue": "Must be a valid ISO 8601 timestamp"
      }
    ]
  }
}
```

---

## 6. Authentication, Security & Data Isolation

### 6.1 Authentication Mechanism
- **Token Mechanism**: Stateless JSON Web Tokens (JWT).
- **Transport**: Passed in the `Authorization` request header: `Bearer <jwt_token>`.
- **Token Payload**:
  ```json
  {
    "sub": "user-uuid",
    "email": "user@example.com",
    "iat": 1791460800,
    "exp": 1791547200
  }
  ```
- **Passwords**: Passwords must never be stored in plaintext. They will be hashed using `bcrypt` (work factor 12) before persistence.

### 6.2 Data Isolation & Authorization Model
- Protected endpoints execute through an `authenticate` middleware.
- The middleware verifies the JWT signature and extracts the authenticated `user_id`.
- **Ownership Verification**:
  1. For top-level resources (`job_applications`, `reminders`), queries must always include `WHERE user_id = :authenticated_user_id`.
  2. For child resources (`interviews`, `notes`, `documents`), the Service layer verifies that the parent `job_application` belongs to the authenticated user before executing the operation.
  3. If a resource exists but belongs to another user, the API responds with `404 Not Found` (to prevent leaking resource existence) or `403 Forbidden`.

---

## 7. Endpoint Specifications

### 7.1 Authentication & User Profile

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive JWT | No |
| `GET` | `/api/v1/auth/me` | Get currently authenticated user profile | Yes |
| `PATCH` | `/api/v1/users/me` | Update current user profile | Yes |

#### `POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "first_name": "Jane",
    "last_name": "Doe"
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "uuid",
          "email": "user@example.com",
          "first_name": "Jane",
          "last_name": "Doe",
          "created_at": "2026-10-08T12:00:00Z"
        },
        "token": "jwt-token-string"
      },
      "message": "User registered successfully"
    }
    ```
  - `400 Bad Request`: Validation failure.
  - `409 Conflict`: Email already in use (`EMAIL_ALREADY_EXISTS`).

#### `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Responses**:
  - `200 OK`: Returns user profile and `token`.
  - `401 Unauthorized`: Invalid email or password (`INVALID_CREDENTIALS`).

#### `GET /api/v1/auth/me`
- **Responses**:
  - `200 OK`: Returns user profile.
  - `401 Unauthorized`: Missing or invalid token.

#### `PATCH /api/v1/users/me`
- **Request Body**:
  ```json
  {
    "first_name": "Janet",
    "last_name": "Doe"
  }
  ```
- **Responses**:
  - `200 OK`: Returns updated user object.

---

### 7.2 Job Applications

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/applications` | Create a new job application | Yes |
| `GET` | `/api/v1/applications` | List applications (with filtering/search/pagination) | Yes |
| `GET` | `/api/v1/applications/:id` | Get application details (including notes, interviews) | Yes |
| `PATCH` | `/api/v1/applications/:id` | Update an existing job application | Yes |
| `DELETE` | `/api/v1/applications/:id` | Delete a job application and cascade child records | Yes |

#### Query Parameters for `GET /api/v1/applications`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `status` | string | optional | Filter by status (`applied`, `interviewing`, `offered`, `rejected`, `saved`) |
| `search` | string | optional | Search keyword across `company_name` and `job_title` |
| `sort_by` | string | `applied_at` | Field to sort by (`applied_at`, `company_name`, `created_at`) |
| `sort_order` | string | `desc` | `asc` or `desc` |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Records per page (maximum: `50`) |

#### `POST /api/v1/applications`
- **Request Body**:
  ```json
  {
    "company_name": "Google",
    "job_title": "Software Engineer",
    "job_url": "https://careers.google.com/jobs/12345",
    "status": "applied",
    "applied_at": "2026-10-08T09:00:00Z",
    "location": "Johannesburg, South Africa",
    "employment_type": "Full-time",
    "salary": "R750,000"
  }
  ```
- **Responses**:
  - `201 Created`: Application created.
  - `400 Bad Request`: Validation error.

#### `GET /api/v1/applications/:id`
- **Responses**:
  - `200 OK`: Detailed application object, including lists of associated interviews, notes, and document metadata.
  - `404 Not Found`: Application not found or not owned by user.

#### `PATCH /api/v1/applications/:id`
- **Request Body**: Any editable field (partial update):
  ```json
  {
    "status": "interviewing",
    "salary": "R800,000"
  }
  ```
- **Responses**:
  - `200 OK`: Updated application.
  - `404 Not Found`: Application not found.

#### `DELETE /api/v1/applications/:id`
- **Responses**:
  - `204 No Content`: Application successfully deleted.
  - `404 Not Found`: Application not found.

---

### 7.3 Interviews

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/applications/:id/interviews` | Schedule an interview for an application | Yes |
| `GET` | `/api/v1/applications/:id/interviews` | List all interviews for an application | Yes |
| `GET` | `/api/v1/interviews/:id` | Get details of a single interview | Yes |
| `PATCH` | `/api/v1/interviews/:id` | Update interview details or outcome | Yes |
| `DELETE` | `/api/v1/interviews/:id` | Delete an interview | Yes |

#### `POST /api/v1/applications/:id/interviews`
- **Request Body**:
  ```json
  {
    "scheduled_at": "2026-10-15T14:00:00Z",
    "interview_type": "Technical Round",
    "location": "Google Meet: https://meet.google.com/abc-defg-hij",
    "notes": "Focus on data structures and system design",
    "outcome": "pending"
  }
  ```
- **Responses**:
  - `201 Created`: Interview scheduled.
  - `404 Not Found`: Parent application not found.

#### `PATCH /api/v1/interviews/:id`
- **Request Body**:
  ```json
  {
    "outcome": "passed",
    "notes": "Positive feedback, advancing to final round"
  }
  ```
- **Responses**:
  - `200 OK`: Interview updated.

---

### 7.4 Application Notes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/applications/:id/notes` | Create a note for an application | Yes |
| `GET` | `/api/v1/applications/:id/notes` | List notes for an application | Yes |
| `DELETE` | `/api/v1/notes/:id` | Delete a note | Yes |

#### `POST /api/v1/applications/:id/notes`
- **Request Body**:
  ```json
  {
    "content": "Contacted recruiter on LinkedIn following submission."
  }
  ```
- **Responses**:
  - `201 Created`: Note created.

---

### 7.5 Documents (Metadata)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/applications/:id/documents` | Attach document metadata to an application | Yes |
| `GET` | `/api/v1/applications/:id/documents` | List documents for an application | Yes |
| `DELETE` | `/api/v1/documents/:id` | Delete document record | Yes |

#### `POST /api/v1/applications/:id/documents`
- **Request Body**:
  ```json
  {
    "file_name": "Kamogelo_Resume_2026.pdf",
    "document_type": "CV",
    "file_url": "https://storage.rolexa.app/resumes/uuid.pdf",
    "mime_type": "application/pdf",
    "file_size": 184500
  }
  ```
- **Responses**:
  - `201 Created`: Document metadata saved.

---

### 7.6 Reminders

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/reminders` | Create a reminder (optionally linked to application) | Yes |
| `GET` | `/api/v1/reminders` | List all reminders for authenticated user | Yes |
| `PATCH` | `/api/v1/reminders/:id` | Update reminder (e.g. mark completed) | Yes |
| `DELETE` | `/api/v1/reminders/:id` | Delete a reminder | Yes |

#### Query Parameters for `GET /api/v1/reminders`
- `status`: `all`, `pending` (default), `completed`
- `application_id`: Optional filter for reminders linked to a specific application

#### `POST /api/v1/reminders`
- **Request Body**:
  ```json
  {
    "application_id": "e4b2d3c1-8f4a-4a2b-9e23-7a1b2c3d4e5f",
    "title": "Send thank-you email",
    "description": "Send follow-up email to hiring manager after interview",
    "remind_at": "2026-10-16T09:00:00Z"
  }
  ```
- **Responses**:
  - `201 Created`: Reminder created.

#### `PATCH /api/v1/reminders/:id`
- **Request Body**:
  ```json
  {
    "completed_at": "2026-10-16T09:30:00Z"
  }
  ```
- **Responses**:
  - `200 OK`: Reminder marked as complete.

---

### 7.7 Dashboard & Analytics

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/dashboard/stats` | Aggregated metrics for user dashboard | Yes |

#### `GET /api/v1/dashboard/stats`
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "total_applications": 32,
        "status_breakdown": {
          "saved": 4,
          "applied": 18,
          "interviewing": 6,
          "offered": 1,
          "rejected": 3
        },
        "upcoming_interviews": [
          {
            "id": "interview-uuid",
            "application_id": "app-uuid",
            "company_name": "Google",
            "job_title": "Software Engineer",
            "scheduled_at": "2026-10-15T14:00:00Z",
            "interview_type": "Technical Round",
            "location": "Google Meet"
          }
        ],
        "pending_reminders_count": 5
      }
    }
    ```

---

## 8. HTTP Status Codes & Error Glossary

### 8.1 HTTP Status Codes

| Code | Meaning | Usage in Rolexa |
|---|---|---|
| `200 OK` | Success | Successful retrieval (`GET`), update (`PATCH`), or login |
| `201 Created` | Created | Successfully created resource (`POST`) |
| `204 No Content` | No Content | Successful deletion (`DELETE`) |
| `400 Bad Request` | Client Error | Payload schema validation failure or malformed UUID |
| `401 Unauthorized` | Authentication Error | Missing, expired, or invalid JWT token |
| `403 Forbidden` | Authorization Error | Valid token, but user does not have permission to access resource |
| `404 Not Found` | Not Found | Resource does not exist or does not belong to the user |
| `409 Conflict` | Conflict | Duplicate unique constraint violation (e.g. duplicate email) |
| `500 Internal Server Error` | Server Error | Unhandled server exception |

### 8.2 Standard Error Codes

| Error Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body or query parameters failed validation |
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `TOKEN_EXPIRED` | 401 | JWT expired |
| `TOKEN_INVALID` | 401 | Malformed or unauthorized token |
| `RESOURCE_NOT_FOUND` | 404 | Target entity could not be found |
| `EMAIL_ALREADY_EXISTS` | 409 | User registration with already existing email |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 9. TypeScript Integration & Data Contracts

Because Rolexa uses **TypeScript**, all API request bodies, response envelopes, and query parameters will be defined using TypeScript interfaces and runtime schema validators (such as **Zod**):

### Example Shared DTO Contracts:

```typescript
// Standard API Envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: PaginationMeta;
  message?: string;
  error?: ApiError;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; issue: string }>;
}

// Application DTOs
export interface CreateApplicationDto {
  company_name: string;
  job_title: string;
  job_url?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  applied_at: string;
  location?: string;
  employment_type?: string;
  salary?: string;
}

export interface ApplicationQueryDto {
  status?: string;
  search?: string;
  sort_by?: 'applied_at' | 'company_name' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

---

## 10. OpenAPI / Swagger Documentation

The API will include interactive OpenAPI 3.0 documentation served at:

```text
/api/docs
```

This endpoint will provide a live Swagger UI for testing routes directly in the browser during development.

---

## 11. Document Status & Next Steps

- **Phase**: Phase 4 – API Design
- **Status**: Completed and approved
- **Next Work**:
  1. Repository hygiene ([README.md](README.md), [.gitignore](.gitignore), [LICENSE](LICENSE))
  2. Architecture Decision Record update for TypeScript ([adr/001-system-architecture.md](adr/001-system-architecture.md))
  3. Backend initialization & PostgreSQL migrations (Phase 5)
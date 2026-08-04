# System Design

## Architecture Style

Rolexa follows a **Modular Monolith Architecture**.

The application consists of a single backend application organised into independent modules, each responsible for a specific business domain such as authentication, applications, interviews, reminders, and documents.

This architecture was selected because it provides a clean separation of concerns while keeping development, testing, and deployment simple. It also allows the project to evolve into a microservices architecture in the future if scalability requirements increase.

---

## Backend Architecture

The backend will follow a feature-based modular architecture to improve maintainability, scalability, and separation of concerns.

Each business domain will be organised into its own module, including:

- Authentication
- Users
- Job Applications
- Interviews
- Reminders
- Documents
- Dashboard

Within each module, requests will follow a layered architecture:

1. Route
2. Controller
3. Service
4. Repository (Data Access Layer)
5. PostgreSQL Database

### Responsibilities

- **Routes** define API endpoints and forward requests to controllers.
- **Controllers** handle HTTP requests and responses.
- **Services** implement business logic and application rules.
- **Repositories** communicate with the database and perform CRUD operations.

This separation of responsibilities improves readability, testability, and maintainability while reducing coupling between different parts of the application.


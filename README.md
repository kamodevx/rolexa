# Rolexa 🎯

> A modern, centralised career management platform built to help job seekers track applications, manage interviews, organise documents, and gain actionable insights throughout their recruitment journey.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev/)

---

## 📌 Problem Statement

Job seekers often apply for dozens of roles across multiple job boards, LinkedIn, and company portals. Managing this process with ad-hoc spreadsheets, email folders, or notes frequently leads to:
- Disorganised application histories and duplicate submissions.
- Missed interview deadlines and follow-ups.
- Scattered resumes and cover letters.
- Zero visibility into application-to-interview conversion rates.

**Rolexa** solves this by providing a unified, reliable workspace designed around the entire job hunting lifecycle.

---

## 🏗️ Architecture & Engineering Design

Rolexa is built as a **Modular Monolith** with a strictly decoupled, layered architecture:

```text
React Frontend (Vite + TypeScript)
      │
      ▼  REST API (JSON /api/v1)
Routes & Middlewares (Auth / JWT / Zod Validation)
      │
      ▼
Controllers (HTTP translation & response envelopes)
      │
      ▼
Services (Domain business rules & user authorization)
      │
      ▼
Repositories (Data access layer)
      │
      ▼
PostgreSQL Database
```

### Key Architectural Decisions
- **Modularity**: Domain features (`auth`, `applications`, `interviews`, `documents`, `reminders`, `dashboard`) are encapsulated into isolated modules.
- **Strict Data Isolation**: Every data access operation enforces user ownership checks at the service and query levels.
- **Type Safety**: End-to-end typing via **TypeScript** across controllers, services, DTOs, and database models.
- **Derived Analytics**: Dashboard statistics are derived directly via optimized SQL aggregations, avoiding out-of-sync cache tables.

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Language** | TypeScript | Static type safety, contract integrity, maintainability |
| **Backend** | Node.js + Express.js | Lightweight, mature ecosystem, non-blocking I/O |
| **Database** | PostgreSQL | Relational integrity, ACID compliance, mature JSON & indexing |
| **Frontend** | React + Vite + Tailwind CSS | Fast rendering, modular component hierarchy, modern tooling |
| **Validation** | Zod | Runtime schema validation for requests and environment variables |
| **Documentation** | OpenAPI 3.0 / Swagger | Self-documenting, interactive REST API explorer |

---

## 📂 Project Documentation

This project strictly follows the **Software Development Life Cycle (SDLC)**. Detailed specifications can be found in the [`docs/`](docs/) directory:

- 📄 **[Project Charter](docs/01-project-charter.md)**: Problem statement, vision, stakeholders, MVP scope, and functional requirements.
- 🏛️ **[System Design](docs/02-system-design.md)**: Architectural pattern, layer responsibilities, and modular structure.
- 🗄️ **[Database Design](docs/03-database-design.md)**: 6 relational entities, schema constraints, indexing strategy, and [ERD Diagram](docs/diagrams/rolexa-erd.svg).
- 🌐 **[API Design](docs/04-api-design.md)**: RESTful endpoints, JWT security, standard response envelopes, and TypeScript DTOs.
- 📐 **[Architecture Decision Records](docs/adr/)**: Architectural trade-offs and decisions.

---

## 🚀 Core Features (MVP)

- **Authentication & Profiles**: Secure registration, login, and profile management with stateless JWT and bcrypt password hashing.
- **Job Application Tracking**: Full CRUD management with statuses (`saved`, `applied`, `interviewing`, `offered`, `rejected`).
- **Search, Filtering & Sorting**: Instant multi-parameter querying by status, company, role, and application dates.
- **Interview Scheduling**: Track technical rounds, HR screens, dates, links, and outcomes per application.
- **Notes & Documents**: Attach timeline notes and metadata references (CV, cover letter) directly to job applications.
- **Reminders**: Custom follow-up and task reminders linked to specific jobs or general deadlines.
- **Analytics Dashboard**: Aggregated overview of active applications, status breakdown, and upcoming interviews.

---

## 🗺️ Project Roadmap & Status

- [x] **Phase 1**: Project Charter & Requirements Definition
- [x] **Phase 2**: System Architecture & ADR
- [x] **Phase 3**: Logical Database Design & Entity Relationship Diagram
- [x] **Phase 4**: RESTful API Design Specification
- [ ] **Phase 5**: Database Migration & Backend Scaffolding (Node.js / Express / TypeScript)
- [ ] **Phase 6**: Core Backend Modules & Automated Testing
- [ ] **Phase 7**: Frontend Client Development (React / Vite)
- [ ] **Phase 8**: CI/CD Pipelines, Dockerization & Cloud Deployment

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Kamogelo Bathebeng**
- GitHub: [@kamodevx](https://github.com/kamodevx)
# ADR-002: TypeScript Adoption for Backend and Frontend

## Status

Accepted (Supercedes language selection in ADR-001)

---

## Context

ADR-001 originally selected JavaScript for both the React frontend and Node.js/Express backend to minimize MVP overhead. However, as the system design, relational database models (6 entities), and REST API design developed, the need for strict data contracts, compile-time type safety, and interface-driven development became evident.

---

## Decision

Rolexa will use **TypeScript** across both the backend (Node.js + Express) and the frontend (React + Vite) instead of plain JavaScript.

---

## Rationale

1. **Contract Integrity**: Allows end-to-end typing from database query results, through Service layers and Controllers, out to API DTOs.
2. **Developer Experience**: Superior IDE auto-completion, refactoring tooling, and early bug detection at compile time rather than runtime.
3. **Layer Decoupling**: Interfaces can be explicitly defined for Repositories and Services, reinforcing clean modular monolith boundaries.
4. **Industry Alignment**: Demonstrates professional software engineering standards expected in modern full-stack development.

---

## Consequences

### Positive
- Prevents runtime `TypeError` and null-pointer bugs.
- Makes request validation schemas (e.g. Zod) and TypeScript types mutually inferable.
- Self-documenting code through explicit types and interfaces.

### Negative
- Requires a build/compilation step (`tsc` or `tsx`/`ts-node` in development).
- Slightly higher initial configuration setup.
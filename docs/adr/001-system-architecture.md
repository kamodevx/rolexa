# ADR-001: System Architecture

## Status

Accepted

---

## Decision

Rolexa will use a Modular Monolith Architecture with:

- React (JavaScript) frontend
- Node.js + Express.js backend
- PostgreSQL database

---

## Rationale

This architecture was selected because it:

- Keeps the MVP simple.
- Reduces operational complexity.
- Supports feature-based development.
- Is easy to test and deploy.
- Can evolve into microservices if future requirements demand it.

---

## Alternatives Considered

### Microservices

Rejected for the MVP due to increased development and deployment complexity.

### Layered Monolith

Rejected because feature-based organisation provides better modularity as the application grows.

---

## Consequences

Positive:

- Simpler deployment.
- Easier debugging.
- Faster development.
- Lower maintenance cost.

Negative:

- Very large future systems may eventually require service decomposition.


# CloudOps Manager

Full-stack web platform to centralize the management of projects, servers and cloud applications, with monitoring indicators and alert handling.
Academic project (NestJS / Next.js), 8 weeks, pair or trio, graded out of 20.

## Goals

- Manage projects, teams, servers (VPS/VM) and applications
- Visualize CPU/RAM metrics, availability and history
- Configure alert thresholds, track incidents and notify users in-app
- Ship everything as containers, deployed on a VM/VPS/cloud for the demo

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Recharts, TanStack Query |
| Backend | NestJS, TypeScript, REST API, Swagger |
| Database | PostgreSQL + Prisma |
| Security | JWT (httpOnly cookie), Guards, role-based access control, password hashing |
| Infrastructure | Docker, Docker Compose, Nginx (reverse proxy) |
| Tests | Jest (essentials) |
| CI/CD (bonus) | GitHub Actions |

## Scope decisions

- Notifications: **in-app only** (no email)
- **Audit log** included
- **No password reset** for now
- Monitoring data is **simulated** (cron-based simulator) and **seed data** is provided
- Password hashing is mandatory (bcrypt/argon2); rate limiting optional
- Environments and deployment kept simple (university project)
- Bonus targeted: CI/CD with GitHub Actions (up to +2, final grade capped at 20/20)

## Architecture

```
Browser -> Nginx -> Next.js (:3000)
                 -> NestJS API (:4000, /api/v1) -> PostgreSQL (volume)
Metrics simulator (cron in the API) -> Metric -> alert check -> Incident -> Notification
```

Docker Compose services: `nginx`, `web`, `api`, `db`.

### Backend modules

| Module | Role |
|---|---|
| `auth` | login, register, JWT, guards, roles decorator |
| `users` | profiles, role management |
| `projects` | projects, teams, assignments, environments |
| `servers` | VPS/VM CRUD (provider, region, CPU, RAM, storage, IP, status) |
| `applications` | applications linked to servers (version, environment, status) |
| `monitoring` | metrics storage, history, availability, simulator |
| `alerts` | configurable thresholds, severity, incident history |
| `notifications` | in-app notifications |
| `audit` | audit log of user actions |
| `dashboard` | aggregated counters and indicators |
| `common` | DTO base, exception filter, pagination, pipes |

### Draft entities

`User`, `Project`, `ProjectMember`, `Environment`, `Server`, `Application`, `Metric`, `AlertRule`, `Incident`, `Notification`, `AuditLog`

### Roles

- **Admin:** full access
- **DevOps:** manage servers, applications and alerts
- **Viewer:** read-only

Detailed role/permission matrix: to be written in `docs/`.

### Frontend routes

`/login`, `/dashboard`, `/projects`, `/servers`, `/servers/[id]`, `/applications`, `/alerts`, `/notifications`, `/audit` (Admin only)

## Minimum technical requirements (from the cahier des charges)

- At least 8 linked entities and 20 REST endpoints documented in Swagger
- DTO + pipe validation, centralized exception handling, pagination, search and filters
- At least 3 roles with distinct permissions, enforced on the backend
- Responsive UI with loading and error states
- Unit tests and a few integration tests
- Git history reflecting each student's contribution

## Repository structure

```
cloudops-manager/
├── apps/
│   ├── api/            # NestJS
│   └── web/            # Next.js
├── docker/             # Dockerfiles, nginx.conf
├── docs/               # analysis, UML, architecture (.drawio + exports)
├── .github/workflows/  # CI/CD
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Git workflow

- Branches: `main` (stable), `develop`, `feature/<module>-<name>`
- Pull requests into `develop`, reviewed by a teammate; no direct push to `main`
- Commit messages: `feat(servers): add CRUD endpoints`, `fix(auth): ...`, `docs: ...`
- Never commit `.env`
- GitHub Issues per module and a Project board with the 8 weekly milestones

## CI/CD plan (bonus)

- **CI** on every PR: install, lint, build, Jest tests (`api` and `web`)
- **CD** on merge into `main`: build Docker images, push to GHCR, deploy to the VM via SSH

## Planning

| Week | Deliverable |
|---|---|
| 1 | Needs analysis, UML, architecture, Git repository |
| 2 | Data models, entities, migrations, NestJS modules |
| 3 | JWT, Guards, roles, validation, Swagger |
| 4 | Next.js UI, authentication, API consumption (**checkpoint, 30% of the grade**) |
| 5 | Projects, servers, applications finalized |
| 6 | Monitoring, charts, alerts, dashboard |
| 7 | Docker, Compose, tests, deployment |
| 8 | Fixes, documentation, final defense (**70% of the grade**) |

Defense: 5 min presentation, 10 min demo, 5 min questions. A small live code change may be requested from each member.

## Week 1 checklist

- [ ] Repository created and structure in place, teammate invited
- [ ] Needs analysis document (actors, functional and non-functional requirements, role matrix)
- [ ] UML: use case, class diagram/ERD, sequence (login), sequence (alert flow), deployment, incident state diagram (optional)
- [ ] Architecture diagrams exported to `docs/`
- [ ] README skeleton and `.env.example`

## Deliverables

GitHub link, deployed or demonstrable application on a VM, Docker files, installation README, Swagger, architecture diagram, data model, technical report (10 to 15 pages), presentation slides.

## Getting started

_To be completed in week 7 (prerequisites, `.env` setup, `docker compose up`, default seed accounts)._
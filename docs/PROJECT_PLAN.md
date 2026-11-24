# LBLMS — Project Plan

**Project:** Libris — Library Borrowing & Loan Management System (LBLMS)  
**Status:** Existing React frontend; FastAPI + Neon integration planned  
**Related documents:** `ERD.md`, `WEBSITE_FLOW.md`

## 1. Goal

Build a role-based web application for managing physical library copies, student borrowing requests, loans, returns, fines, and librarian accounts. Preserve the existing Libris frontend and replace its browser-only data handling with a secure backend and PostgreSQL database.

## 2. Users and Roles

| Role | Responsibilities |
|---|---|
| Student | Register/sign in, browse catalog, request copies, cancel pending requests, view loans and fines, manage profile |
| Librarian | Review requests, issue and return books, manage copies, inspect student history, issue and settle fines |
| Superlibrarian | All librarian operations plus librarian-account management and system oversight; only one designated active account |

## 3. Core Features

### Public and account access
- Landing page, sign in, student registration, email verification, forgot/reset password.
- Role-based dashboards and protected routes; unauthorized access shows 403.
- Profile and password changes for all roles.
- Temporary-password change required for newly created librarians.
- Mandatory TOTP MFA for staff; optional for students.

### Student
- Browse/search catalog and inspect physical-copy details.
- Request an available copy; view pending, active, and past loans.
- Cancel own pending requests.
- View unpaid, paid, waived, and estimated overdue fines.

### Librarian
- Approve or reject pending requests.
- Issue desk loans and process returns.
- Add, edit, and soft-delete book copies.
- Search student accounts and view borrowing history.
- Record damaged/lost fines; record fine payments or waivers.

### Superlibrarian
- Create, update, and deactivate librarian accounts.
- Perform librarian functions and view system oversight information.
- Prevent accidental removal/deactivation of the sole active Superlibrarian.

## 4. Borrowing and Fine Rules

1. Each `book` row represents **one physical copy**.
2. Maximum **5 combined pending requests and active loans** per student.
3. Pending requests do **not** reserve copies; the book remains `Available`.
4. Staff approval starts a **14-day loan** and changes the copy to `Borrowed`.
5. Only one active loan per copy; approval rejects competing pending requests in the same database transaction.
6. Overdue fines accrue at **₱5 per overdue calendar day per copy**.
7. Unpaid fines or accrued overdue balances block new requests and new loans; returns remain allowed.
8. Students cannot settle their own fines; staff record payments and waivers.
9. Preserve historical loans/fines by soft-deleting referenced books and librarian profiles.
10. Recheck eligibility, availability, and limits within PostgreSQL transactions to avoid race conditions.

## 5. Scope

**In scope:** Browser-based catalog, accounts, role-based access, physical-copy management, borrowing requests, loans, returns, fines, staff management, secure backend API, PostgreSQL persistence, and deployment.

**Out of scope for the initial integration:** Online payment gateway, mobile-native application, barcode/RFID hardware integration, and automated book recommendations. These are not required for the current website flow.

## 6. Functional Requirements

- FR-01: Authenticate users and route them to role-specific dashboards.
- FR-02: Register and verify student accounts; support password reset.
- FR-03: Restrict staff functions by role and enforce staff MFA.
- FR-04: Display searchable book copies and their availability.
- FR-05: Create/cancel student borrowing requests subject to eligibility checks.
- FR-06: Approve/reject requests and create direct desk loans safely.
- FR-07: Process returns and update book availability.
- FR-08: Calculate, record, display, pay, and waive fines according to permissions.
- FR-09: Maintain student borrowing history and staff audit-relevant references.
- FR-10: Allow only the Superlibrarian to manage librarian accounts.

## 7. Nonfunctional Requirements

- **Security:** Hash passwords with Argon2; use secure authenticated sessions, TOTP for staff, server-side authorization, encrypted MFA secrets, and environment-based credentials.
- **Integrity:** Use PostgreSQL PKs/FKs/CHECK constraints, partial unique indexes, transactions, and row locking for critical operations.
- **Usability:** Keep the existing React interface and role-specific navigation.
- **Reliability:** Preserve loan and fine history; handle concurrent approvals safely.
- **Maintainability:** Separate frontend, FastAPI routes/services, ORM models, migrations, and configuration.
- **Deployment:** Use HTTPS, restricted CORS, and secrets stored in hosting environment settings.

## 8. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18, Vite 6 | Existing web interface |
| UI | Tailwind CSS 3 | Existing styling |
| Navigation | React Router 6 | Client-side routing |
| Backend | Python, FastAPI | API, validation, authorization, borrowing logic |
| ORM | SQLAlchemy | PostgreSQL data access |
| Migrations | Alembic | Database schema versioning |
| Database | Neon PostgreSQL | Persistent cloud storage |
| DB administration | pgAdmin 4 | Connect to and manage Neon |
| Authentication | JWT with secure HTTP-only cookies (planned) | Sessions |
| Passwords | Argon2 | Password hashing |
| MFA | TOTP | Staff two-factor authentication |
| Frontend hosting | Vercel (planned) | React deployment |
| Backend hosting | Render (planned) | FastAPI deployment |
| Version control | Git, GitHub | Source history and collaboration |

## 9. Data Model

Six entities: `account`, `student`, `librarian`, `book`, `borrow`, and `fine`. Student and Librarian have separate profiles connected to Account. The Superlibrarian is a `librarian.role`, not a separate table. See `ERD.md` and the PostgreSQL schema for full attributes, relationships, and constraints.

## 10. Existing Implementation vs Planned Work

| Area | Existing frontend | Planned integration |
|---|---|---|
| Pages and navigation | React screens and role flows | Preserve and connect to API |
| Data persistence | Browser `localStorage` | Neon PostgreSQL via FastAPI |
| Registration verification | Simulated | Real verification delivery and validation |
| Password reset | Simulated | Secure token-based reset flow |
| Loans and fines | Browser-side logic | Server-authoritative transactions and calculations |
| Staff MFA | Requires backend enforcement | TOTP verification and secure secret storage |
| Payments | Staff records settlement | Retain manual settlement; no payment gateway initially |

## 11. Development Phases

1. **Planning:** Finalize `PROJECT_PLAN.md`, `ERD.md`, and `WEBSITE_FLOW.md`.
2. **Database:** Create Neon database; validate PostgreSQL schema using pgAdmin; set up Alembic migrations.
3. **Backend foundation:** FastAPI project structure, configuration, SQLAlchemy models, authentication, and role permissions.
4. **Core API:** Catalog, borrowing requests, approvals, direct loans, returns, fines, and staff management.
5. **Frontend integration:** Replace `localStorage` data operations with authenticated API calls while retaining the existing UI.
6. **Testing:** Verify role access, loan limits, overdue fines, concurrent approvals, MFA, and history preservation.
7. **Deployment:** Deploy frontend/backend, configure Neon connection, HTTPS, CORS, and environment variables.

## 12. Acceptance Criteria

- All three roles can complete their documented journeys using persistent server data.
- Borrowing rules hold even with simultaneous requests/approvals.
- Only authorized staff can process loans, fines, and librarian accounts.
- The sole active Superlibrarian is protected.
- A return restores copy availability and correctly records any overdue charge.
- Records remain available for historical reporting after soft deletion.
- Existing React screens function against FastAPI + Neon without depending on `localStorage` as the source of truth.

> **Development approach:** Plan → AI review → approval → implement → report → test → next feature. Do not rewrite the frontend or add features without approval.

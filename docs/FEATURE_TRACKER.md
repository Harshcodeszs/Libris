# Libris — Feature Tracker

This tracker separates the existing browser-only implementation from the planned FastAPI and Neon PostgreSQL integration. It is based on `PROJECT_PLAN.md`, `WEBSITE_FLOW.md`, `ERD.md`, `LBLMS_Neon_PostgreSQL_Schema.sql`, `README.md`, and the current source code; a feature's presence in code does not establish that its full user journey works.

## Statuses and updates

- **Planned** — Approved, not yet implemented.
- **In Progress** — Partially implemented or missing a required part of the documented feature.
- **Testing** — Implemented in the current scope but awaiting verification and owner approval.
- **Completed** — Manually tested and explicitly approved by the project owner.
- **Blocked** — Cannot proceed because of an identified issue.

After this initial approval, update this file automatically as approved development progresses. Record significant additions, modifications, and removals in Change History; preserve previous entries. Move an implemented feature to Testing after AI testing, and to Completed only after the owner's manual testing and explicit approval. Do not modify application code solely to update this tracker or start the next feature automatically.

## Existing frontend and browser-side features

| Feature | Status | Relevant files | Verification or remaining work |
| --- | --- | --- | --- |
| Public landing and role-based navigation | Testing | `src/App.jsx`, `src/pages/Landing.jsx`, `src/components/layout/` | Verify routes and responsive navigation. |
| Sign-in, sign-out, and route guards | Testing | `src/lib/auth.js`, `src/context/AuthContext.jsx`, `src/components/layout/ProtectedRoute.jsx` | Verify role access; authentication is browser-managed, not server-secured. |
| Development-only local test accounts | Testing | `src/lib/devAccounts.js`, `src/pages/auth/DevAccounts.jsx`, `src/App.jsx`, `tests/devAccounts.test.mjs` | Creates missing Student, Librarian, and Superlibrarian accounts and can regenerate passwords for those three test emails without changing other data; automated tests cover login, preservation, repeat use, reset, and production exclusion. Owner should test the page and each dashboard manually. |
| Student registration and email verification | In Progress | `src/pages/auth/Register.jsx`, `src/pages/auth/VerifyEmail.jsx`, `src/lib/auth.js` | Browser-local verification tokens exist; real email delivery and server validation are missing. |
| Password reset and account password changes | In Progress | `src/pages/auth/ForgotPassword.jsx`, `src/pages/auth/ResetPassword.jsx`, `src/pages/auth/ChangePassword.jsx`, `src/lib/auth.js` | Browser-local reset tokens and password changes exist; delivery and secure server-side reset are missing. |
| Profile editing | Testing | `src/pages/Profile.jsx`, `src/lib/auth.js` | Verify edits for each role. |
| Student catalog, search, and copy details | Testing | `src/pages/student/Catalog.jsx`, `src/pages/student/BookDetail.jsx` | Verify listing, filtering, and detail screens against local records. |
| Borrow requests and student cancellation | Testing | `src/pages/student/BookDetail.jsx`, `src/pages/student/MyLoans.jsx`, `src/lib/rules.js` | Verify eligibility checks and status transitions. |
| Student loan history and fine views | Testing | `src/pages/student/MyLoans.jsx`, `src/pages/student/MyFines.jsx` | Verify records, statuses, and overdue estimates. |
| Staff request approval and rejection | Testing | `src/pages/librarian/ManageRequests.jsx`, `src/lib/rules.js` | Verify competing requests and outcomes; the frontend can omit the staff processor, while the planned backend requires one and atomic approval. |
| Desk loans and returns | Testing | `src/pages/librarian/ManageLoans.jsx`, `src/lib/rules.js` | Verify due dates, availability, and overdue fines. |
| Book CRUD frontend refactor | Testing | `src/pages/librarian/ManageBooks.jsx`, `src/lib/bookOperations.js`, `tests/bookOperations.test.mjs` | Separate Create, Read, Update, and Delete handlers and reusable Book data/validation logic; automated tests and build passed. Owner should verify the UI and role-based access in a browser. Book data still uses shared localStorage through `src/lib/rules.js` and `src/lib/db.js`; no API or database integration was added. |
| Book-copy management | In Progress | `src/pages/librarian/ManageBooks.jsx`, `src/lib/bookOperations.js`, `src/lib/rules.js` | Add/edit exist; removal currently deletes records instead of the planned soft deletion, and title/author uniqueness is not enforced by current frontend rules. |
| Student search and borrowing history | Testing | `src/pages/librarian/ManageStudents.jsx` | Verify search, records, and access by role. |
| Staff fine issuance and settlement | Testing | `src/pages/librarian/ManageFines.jsx`, `src/lib/rules.js`, `README.md` | Verify issuance and waivers; students pay at the library counter, staff mark fines paid in the app, and no payment gateway is planned. |
| Librarian-account management | In Progress | `src/pages/super/ManageLibrarians.jsx`, `src/lib/auth.js` | Create/edit exist; removal currently deletes records instead of the planned deactivation/soft deletion. |
| Dashboards and oversight statistics | Testing | `src/pages/student/StudentDashboard.jsx`, `src/pages/librarian/LibrarianDashboard.jsx`, `src/pages/super/SuperDashboard.jsx`, `src/lib/stats.js` | Verify displayed counts and activity against records. |
| Staff first-sign-in password change | Testing | `src/components/layout/ProtectedRoute.jsx`, `src/lib/auth.js`, `src/pages/auth/ChangePassword.jsx` | Verify redirect and completion for a newly created librarian. |

## Planned integration and gaps

| Feature | Status | Relevant files or dependency | Verification or remaining work |
| --- | --- | --- | --- |
| Accrued-overdue borrowing restriction | Planned | `src/lib/rules.js`; `PROJECT_PLAN.md` §4 | `canBorrow()` checks recorded unpaid fines, not accrued overdue balances. |
| FastAPI API, PostgreSQL models, and migrations | Planned | `backend/app/`, `backend/alembic.ini`, `backend/pyproject.toml`, `PROJECT_PLAN.md` §11 | Empty backend scaffold files exist, but no runnable API, models, migrations, or configured database integration are implemented. Database setup remains owner-controlled. |
| Server authentication, authorization, and staff MFA | Planned | `PROJECT_PLAN.md` §§3, 7–8; `ERD.md` §§1, 4 | Secure sessions, Argon2, server-side role checks, encrypted TOTP secrets, and staff MFA require backend implementation; session revocation after reset remains to be designed. |
| Verification/reset tokens and real email delivery | Planned | `ERD.md` §§1, 4; `LBLMS_Neon_PostgreSQL_Schema.sql`; `PROJECT_PLAN.md` §6 | The seven-table schema defines `account.email_verified_at` and `auth_token`; implement hashed, expiring, single-use tokens and Resend delivery. Student verification is required; staff verification policy remains to be specified. |
| Authenticated staff processor on active loans | Planned | `ERD.md` §4; `LBLMS_Neon_PostgreSQL_Schema.sql`; `PROJECT_PLAN.md` §6 | Approval and direct issuance must derive `processed_by_id` from authenticated staff and retain it on return; this is stricter than the current frontend. |
| Atomic borrowing rules and historical soft deletion | Planned | `PROJECT_PLAN.md` §§4, 7; `ERD.md` §4 | Add server-side transactions, five-item enforcement, and soft deletion preserving book/librarian history; no database rules have been verified on Neon. |
| Sole active Superlibrarian protection | Planned | `PROJECT_PLAN.md` §§2–4; `ERD.md` §§1, 4 | Database uniqueness allows at most one non-deleted Superlibrarian; backend logic must provision one and prevent deactivation of the sole active account. |
| Frontend–API integration and deployment | Planned | `PROJECT_PLAN.md` §§10–12; `src/lib/db.js` | Replace `localStorage` as the source of truth; hosting and connections require owner approval. |

## Change History

Record significant changes here as they occur. Do not backdate the initial codebase inventory as if the tracked features were implemented today.

| Date | Feature | Change type | Description | Affected files | Current status |
| --- | --- | --- | --- | --- | --- |
| 2026-11-25 | Documentation and feature inventory | Modified | Aligned planned backend entries with the seven-table schema, token/email design, staff processor, Superlibrarian protection, and counter-payment flow; preserved unverified feature statuses. | `docs/FEATURE_TRACKER.md` | Approved |
| 2026-11-25 | Development-only local test accounts | Added | Added local-only setup for three roles without changing existing accounts or connecting to Neon; automated tests passed, pending owner browser testing. | `src/App.jsx`, `src/lib/devAccounts.js`, `src/pages/auth/DevAccounts.jsx`, `tests/devAccounts.test.mjs`, `docs/FEATURE_TRACKER.md` | Approved |
| 2026-11-25 | Development-only local test accounts | Modified | Added password regeneration for the three seeded emails without deleting accounts, books, loans, or other local records; pending owner browser testing. | `src/lib/devAccounts.js`, `src/pages/auth/DevAccounts.jsx`, `tests/devAccounts.test.mjs`, `docs/FEATURE_TRACKER.md` | Approved |
| 2026-11-27 | Book CRUD frontend refactor | Added / Modified | Separated Book Create, Read, Update, and Delete page handlers; added reusable Book operations and validation with automated coverage. Shared localStorage behavior and development-only test accounts remain unchanged; browser testing is pending. | `src/pages/librarian/ManageBooks.jsx`, `src/lib/bookOperations.js`, `tests/bookOperations.test.mjs`, `docs/FEATURE_TRACKER.md` | Approved |

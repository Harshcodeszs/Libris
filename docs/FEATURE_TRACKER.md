# Libris — Feature Tracker

This tracker separates the existing browser-only implementation from the planned FastAPI and PostgreSQL integration. It is based on `PROJECT_PLAN.md`, `WEBSITE_FLOW.md`, `ERD.md`, and the current source code; a feature's presence in code does not establish that its full user journey works.

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
| Student registration and email verification | In Progress | `src/pages/auth/Register.jsx`, `src/pages/auth/VerifyEmail.jsx`, `src/lib/auth.js` | Local tokens exist; real email delivery and server validation are missing. |
| Password reset and account password changes | In Progress | `src/pages/auth/ForgotPassword.jsx`, `src/pages/auth/ResetPassword.jsx`, `src/pages/auth/ChangePassword.jsx`, `src/lib/auth.js` | Local reset logic exists; reset-link delivery and secure server tokens are missing. |
| Profile editing | Testing | `src/pages/Profile.jsx`, `src/lib/auth.js` | Verify edits for each role. |
| Student catalog, search, and copy details | Testing | `src/pages/student/Catalog.jsx`, `src/pages/student/BookDetail.jsx` | Verify listing, filtering, and detail screens against local records. |
| Borrow requests and student cancellation | Testing | `src/pages/student/BookDetail.jsx`, `src/pages/student/MyLoans.jsx`, `src/lib/rules.js` | Verify eligibility checks and status transitions. |
| Student loan history and fine views | Testing | `src/pages/student/MyLoans.jsx`, `src/pages/student/MyFines.jsx` | Verify records, statuses, and overdue estimates. |
| Staff request approval and rejection | Testing | `src/pages/librarian/ManageRequests.jsx`, `src/lib/rules.js` | Verify competing requests and outcomes; server transactions are not yet implemented. |
| Desk loans and returns | Testing | `src/pages/librarian/ManageLoans.jsx`, `src/lib/rules.js` | Verify due dates, availability, and overdue fines. |
| Book-copy management | In Progress | `src/pages/librarian/ManageBooks.jsx`, `src/lib/rules.js` | Add/edit exist; removal currently deletes records instead of the planned soft deletion. |
| Student search and borrowing history | Testing | `src/pages/librarian/ManageStudents.jsx` | Verify search, records, and access by role. |
| Staff fine issuance and settlement | Testing | `src/pages/librarian/ManageFines.jsx`, `src/lib/rules.js` | Verify issuance, recorded payment, and waiver; no payment gateway is planned. |
| Librarian-account management | In Progress | `src/pages/super/ManageLibrarians.jsx`, `src/lib/auth.js` | Create/edit exist; removal currently deletes records instead of the planned deactivation/soft deletion. |
| Dashboards and oversight statistics | Testing | `src/pages/student/StudentDashboard.jsx`, `src/pages/librarian/LibrarianDashboard.jsx`, `src/pages/super/SuperDashboard.jsx`, `src/lib/stats.js` | Verify displayed counts and activity against records. |
| Staff first-sign-in password change | Testing | `src/components/layout/ProtectedRoute.jsx`, `src/lib/auth.js`, `src/pages/auth/ChangePassword.jsx` | Verify redirect and completion for a newly created librarian. |

## Planned integration and gaps

| Feature | Status | Relevant files or dependency | Verification or remaining work |
| --- | --- | --- | --- |
| Accrued-overdue borrowing restriction | Planned | `src/lib/rules.js`; `PROJECT_PLAN.md` §4 | `canBorrow()` checks recorded unpaid fines, not accrued overdue balances. |
| FastAPI API, PostgreSQL models, and migrations | Planned | `PROJECT_PLAN.md` §§7–11; `ERD.md` | No backend, API endpoints, ORM models, or migrations are present. Database setup remains owner-controlled. |
| Server authentication, authorization, and staff MFA | Planned | `PROJECT_PLAN.md` §§3, 7–8 | Secure sessions, Argon2, server-side role checks, and TOTP require backend implementation. |
| Real email verification and reset delivery | Planned | `PROJECT_PLAN.md` §§3, 10; `src/lib/auth.js` | Replace browser-only token flows and connect an approved delivery service. |
| Atomic borrowing rules and historical soft deletion | Planned | `PROJECT_PLAN.md` §§4, 7; `ERD.md` | Add server-side transactions and preserve book/librarian references through soft deletion. |
| Frontend–API integration and deployment | Planned | `PROJECT_PLAN.md` §§10–12; `src/lib/db.js` | Replace `localStorage` as the source of truth; hosting and connections require owner approval. |

## Change History

Record significant changes here as they occur. Do not backdate the initial codebase inventory as if the tracked features were implemented today.

| Date | Feature | Change type | Description | Affected files | Current status |
| --- | --- | --- | --- | --- | --- |

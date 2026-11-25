# LBLMS — Website Flow

**System:** Library Borrowing & Loan Management System (Libris)  
**Purpose:** Document the existing website's pages, navigation, role permissions, and user journeys.  
**Basis:** Existing *Libris – Website Flow* documentation. This is not a fresh route-by-route audit of the React source.

## 1. Existing Website Overview

The website has three user roles: **Student**, **Librarian**, and **Superlibrarian**. Its current documented implementation uses browser `localStorage`; backend APIs, and real email delivery are not yet connected; online payment processing is out of scope.

## 2. Public Pages and Authentication

```text
Landing Page
├── Sign In
│   └── Role-based redirect
│       ├── Student → Student Dashboard
│       ├── Librarian → Librarian Dashboard
│       └── Superlibrarian → Superlibrarian Dashboard
├── Student Registration
│   └── Email Verification (currently simulated)
│       └── Sign In
└── Forgot Password
    └── Reset Password (currently simulated)
        └── Sign In
```

- Students register using a Gmail address.
- Staff accounts are created by the Superlibrarian, not through public registration.
- New librarians change their temporary password on first sign-in.
- All authenticated roles can open their profile and change their password.
- Protected pages require sign-in; unauthorized role access leads to a **403** page.
- Staff MFA is required by the finalized security plan; actual server-side enforcement is part of the FastAPI integration, not a claim about the existing frontend.

### Planned backend authentication (not implemented)

- Registration → Resend verification email → validate token → mark email verified → sign in.
- Forgot password → generic response → Resend reset email → validate token → set new password → consume token and invalidate sessions → sign in.

Generate tokens using `secrets.token_urlsafe(32)`; store only SHA-256 hashes. Verification expires after 24 hours and password reset after 15 minutes. Send raw tokens only in HTTPS email links through Resend. Validate account, purpose, expiry and unused status; consume tokens atomically with the account update. Serialize issuance and consumption by locking the account row. On resend, delete previous unused tokens of the same type. Rate-limit requests and return generic reset responses. After password reset, invalidate existing sessions (session revocation mechanism to be designed during backend implementation). Never log raw tokens. Student sign-in requires verified email; staff provisioning and verification policy remains to be specified.

## 3. Student Pages and Navigation

```text
Student Dashboard
├── Browse Catalog
│   └── Book Details
│       └── Request Available Physical Copy
├── My Loans
│   ├── Pending Requests
│   │   └── Cancel Pending Request
│   ├── Active Loans
│   └── Returned / Historical Loans
├── My Fines
│   ├── Unpaid Fines
│   ├── Paid / Waived Fines
│   └── Overdue Fine Estimates
└── Profile & Settings
    └── Change Password
```

**Student journey:** Sign in → browse/search books → open details → request an available copy → view request in My Loans → wait for staff approval → view active loan and due date → return book through library staff → review loan history and any fines.

Students can view fines but cannot mark them paid or waive them.

## 4. Librarian Pages and Navigation

```text
Librarian Dashboard
├── Borrow Requests
│   ├── Approve Request
│   └── Decline Request
├── Books
│   ├── Add Physical Copy
│   ├── Edit Physical Copy
│   └── Remove Physical Copy
├── Borrow & Return
│   ├── Issue Direct Desk Loan
│   └── Process Return
├── Students
│   ├── Search Students
│   └── View Borrowing History
├── Fines
│   ├── Issue Manual Fine
│   ├── Mark Fine Paid
│   └── Waive Fine
└── Profile & Settings
    └── Change Password
```

**Librarian journey:** Sign in → review pending requests → approve/decline → issue or return books → manage catalog copies and fines → inspect student records as needed.

A physical copy with an active loan cannot be removed as an ordinary deletion. Historical records must remain available.

## 5. Superlibrarian Pages and Navigation

```text
Superlibrarian Dashboard
├── Librarian Accounts
│   ├── Create Librarian Account
│   ├── Edit Librarian Account
│   └── Remove / Deactivate Librarian Account
├── Borrow Requests
├── Books
├── Borrow & Return
├── Students
├── Fines
└── Profile & Settings
    └── Change Password
```

**Superlibrarian journey:** Sign in → manage librarian accounts and system operations → use all librarian functions when necessary.

Only the Superlibrarian manages librarian accounts. The finalized backend design protects the sole active Superlibrarian account from accidental deactivation or removal.

## 6. Core User Journeys

### 6.1 Book Request and Approval

```text
Student opens available book copy
  → Submit request
  → Request status: pending (copy stays Available)
      ├── Student cancels → cancelled
      ├── Staff declines → rejected
      └── Staff approves → active
           ├── Copy status becomes Borrowed
           ├── Due date is 14 days from approval/issue
           └── Other pending requests for same copy become rejected
```

### 6.2 Direct Desk Loan

```text
Librarian selects student and available copy
  → Check borrowing eligibility
  → Issue loan
  → Loan becomes active; copy becomes Borrowed
  → Due date is 14 days from issue
```

### 6.3 Return and Fines

```text
Staff selects active loan
  → Process return
  → Loan becomes returned; copy becomes Available
      ├── On time → No overdue fine
      └── Late → Overdue fine at ₱5 per overdue calendar day
                    ├── Unpaid
                    ├── Staff marks paid
                    └── Staff waives
```

Manual fines may also be recorded for **Damaged** or **Lost** books. The actual settlement is recorded by staff; a payment gateway is not part of the documented existing implementation.

### 6.4 Librarian Account Creation

```text
Superlibrarian opens Librarian Accounts
  → Create staff account with temporary password
  → Librarian signs in
  → Required password change
  → Required MFA setup / verification (backend security requirement)
  → Librarian Dashboard
```

## 7. Navigation and Permissions

| Function | Student | Librarian | Superlibrarian |
|---|:---:|:---:|:---:|
| Browse catalog and request copies | Yes | — | — |
| View own loans and fines | Yes | — | — |
| Cancel own pending request | Yes | No | No |
| Approve / reject requests | No | Yes | Yes |
| Add / edit / remove book copies | No | Yes | Yes |
| Issue / return loans | No | Yes | Yes |
| Search students / view loan history | No | Yes | Yes |
| Record / settle / waive fines | No | Yes | Yes |
| Manage librarian accounts | No | No | Yes |
| Profile / change password | Yes | Yes | Yes |

**Note:** “—” means that access to that student-facing screen was not established by the existing website-flow reference; it does not assert a technical prohibition.

## 8. Borrowing Rules Affecting Navigation

- Each `BOOK` record represents **one physical copy**.
- Pending requests **do not reserve** copies.
- Maximum **5 combined pending and active** loans per student.
- An approved or directly issued loan lasts **14 days**.
- Current frontend: Recorded unpaid fines block new borrowing requests and loans until paid or waived.
- Planned backend rule: Accrued but unrecorded overdue charges will also block new borrowing requests and loans.
- Students can still return books despite outstanding fines.
- Overdue fine: **₱5 per overdue calendar day per copy**.
- Students can cancel only their own **pending** requests.
- Staff actions must preserve loan and fine history; book and librarian removal uses soft deletion in the planned backend.

## 9. Existing Frontend vs Backend Integration

| Area | Existing documented website | Planned FastAPI + Neon integration |
|---|---|---|
| Authentication | Browser-managed / simulated flows | Server-side authentication and role checks |
| Email verification and password reset | Simulated links | Real email delivery and secure tokens |
| Records | `localStorage` | PostgreSQL via FastAPI |
| Borrow approvals | Frontend behavior | Atomic database transactions and row locking |
| Loan limits / fine eligibility | Frontend checks | Authoritative server-side validation |
| Staff MFA | Not verified in existing flow | Mandatory TOTP enforcement |
| Payments | Staff records paid / waived status | Staff-managed fine records; no gateway assumed |

**Integration principle:** Keep the existing page structure and user journeys. Replace local data operations with authenticated FastAPI endpoints, and enforce business rules in the backend.

## 10. Scope Note

This document describes **documented screens and flows**, not exact React route paths or component filenames. Confirm those against the current `src/` code before using them as implementation contracts. Do not treat planned backend features as already built.

### Planned staff accountability

Approval and direct issuance must record the authenticated librarian or superlibrarian in `processed_by_id`. The existing frontend may omit this value; the backend intentionally enforces it. Students view fines; only staff record payments and waivers. No online payment gateway.

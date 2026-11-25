# Libris — Library Borrowing System

A browser-based library borrowing system built with **React 18**, **Vite 6**, **Tailwind CSS 3**, and **React Router 6**. Data is persisted in `localStorage`; no backend is included.

## Getting started

```bash
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

## First run

The application starts with an empty local database: no books, students, staff accounts, loans, or fines.

- Students can register with a `@gmail.com` address.
- Registration requires opening a confirmation link before the account becomes active.
- There is no built-in bootstrap for the first superlibrarian. Staff accounts must be provisioned separately before staff dashboards can be used.
- Email delivery is not configured in this frontend. Verification and reset links are generated locally and must be delivered by external infrastructure; the interface does not display them.

## Borrowing rules

- Students submit a **borrow request**; a librarian or superlibrarian approves or declines it.
- The copy stays `Available` while a request is pending. It is only marked `Borrowed` when the request is approved.
- Approving a request starts a **14-day loan** from the approval date.
- A student may have at most **5 active loans and pending requests combined**.
- Overdue fines are **₱5 per day** per item.
- Students with any **unpaid fine** cannot request or borrow until it is paid or waived.
- If several students request the same copy, approving one automatically declines the others.
- Students can cancel their own pending requests before they are reviewed.
- Each book row represents **one physical copy**; its status is `Available`, `Borrowed`, `Lost`, or `Damaged`.
- A book with active loans cannot be deleted. Historical borrow records are kept even after a book or librarian is removed.

## What each role can do

### Students

- Browse and search the catalog, view book details, and request available copies.
- Track pending requests, current and past loans, including due dates and overdue status.
- Cancel a request that has not been reviewed yet.
- View outstanding fines and payment status.
- Pay fines physically at the library counter.
- Regain borrowing privileges once all outstanding fines
  are marked as paid or waived by library staff.
- Edit their profile and change their password.

### Librarians

- Dashboard with live counts, pending requests, and an overdue shelf.
- Review the **Borrow requests** queue: approve a request to issue the loan, or decline it.
- Add, edit, and remove books.
- Issue and return loans directly at the desk, with confirmation dialogs.
- Look up students and review their borrowing history.
- Receive fine payments at the library counter and mark
  fines as paid in the system.
- Waive fines when appropriate.

### Superlibrarians

- Everything librarians can do.
- Create, edit, and delete librarian accounts.
- See staff workload and system-wide oversight stats.

## Local data

All data lives under the `libris.db.v1` key in `localStorage`.

- Use **Profile → Clear local data**, or
- Clear the key manually in DevTools:

```js
localStorage.removeItem('libris.db.v1')
```

Reload the page and an empty database is created automatically.

## Project structure

```
src/
  components/
    books/        Book cover rendering
    layout/       App shell, navigation, public layout
    ui/           Reusable UI components
  context/        Auth and toast providers
  lib/            Local database, auth, rules, helpers
  pages/
    auth/         Sign-in, registration, verification,
                  forgot and reset password
    student/      Dashboard, catalog, loans, fines
    librarian/    Dashboard, requests, books, loans,
                  students, fines
    super/        Dashboard, librarian management
  App.jsx         Route map and role guards
```

## Notes

- This is a browser-only build. Data, accounts, loans, fines, and sessions are stored in `localStorage`.
- Passwords are hashed with a small local helper in `src/lib/hash.js`; do not reuse it in production.
- Email verification, password reset delivery, and staff provisioning require external infrastructure and are not included.
- Fine payment is recorded locally and does not process real payments.
- The interface is responsive and works down to small mobile widths.
- Fine payments are handled physically at the library
  counter. Library staff receive payments and mark fines
  as paid in the system. No online payment gateway is included.
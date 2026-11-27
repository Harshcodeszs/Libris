backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   ├── account.py
│   │   ├── student.py
│   │   ├── librarian.py
│   │   ├── book.py
│   │   ├── borrow.py
│   │   └── fine.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── account.py
│   │   ├── book.py
│   │   ├── borrow.py
│   │   ├── fine.py
│   │   └── student.py
│   ├── api/
│   │   ├── deps.py
│   │   └── routes/ # Incoming HTTP requests from the frontend
│   │       ├── auth.py
│   │       ├── books.py
│   │       ├── borrows.py
│   │       ├── fines.py
│   │       ├── students.py
│   │       └── librarians.py
│   ├── services/
│   │   ├── borrowing.py
│   │   ├── fines.py
│   │   └── accounts.py
│   └── tests/
│       ├── test_auth.py
│       ├── test_borrows.py
│       └── test_fines.py
├── alembic/
│   └── versions/
├── alembic.ini
├── pyproject.toml
├── .env.example
└── README.md


## Development test accounts

For local testing, start the development server:

```bash
npm run dev
```
Open the local app and visit /dev/accounts. Select Create test accounts to create any missing Student, Librarian, and Superlibrarian accounts in this browser’s local data.
The page displays each account’s email and a randomly generated password. Copy the passwords when they appear; they are not shown again. Sign in at /login and choose the role you want to test.
If all three test accounts already exist but you no longer have their passwords, choose Reset test passwords. This replaces the passwords for the three test accounts only; it does not delete accounts, books, or loans. Copy the new passwords when displayed.
These accounts and passwords are for local development only. The data is stored in this browser’s localStorage; it is not connected to Neon or shared with other browsers. The test-account page is available only in development builds, not production.
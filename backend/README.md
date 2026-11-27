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
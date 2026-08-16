# TrackWise 💰

A full-stack personal expense tracking application. Track your spending by category, visualize trends with interactive charts, and keep every user's data isolated in its own database.

Built with an **ASP.NET Core Web API** backend and an **Angular** single-page application frontend.

---

## ✨ Features

- **User registration & login** — JWT-based authentication with hashed passwords.
- **Expense management** — add, edit, list, filter, and delete expenses with categories and dates.
- **Categories** — built-in default categories with icons and colors, plus the ability to add your own.
- **Interactive dashboard** — Highcharts visualizations:
  - Pie chart: spend split by category for a selected month.
  - Line chart: monthly spend totals across the year.
  - Monthly total card.
- **Per-user data isolation** — every user gets their own SQLite database automatically.
- **User preferences** — country, currency, language, and theme stored per user.
- **Currency-aware registration** — the country dropdown maps each country to its currency symbol, and the selection is stored on the account.

---

## 🧱 Tech Stack

### Backend (`TrackWise/Backend`)
| Technology | Purpose |
|---|---|
| .NET 8 / ASP.NET Core | Web API |
| EF Core 8 + SQLite | Data access |
| JWT Bearer | Authentication |
| Swashbuckle (Swagger) | API documentation |

### Frontend (`TrackWise/Frontend`)
| Technology | Purpose |
|---|---|
| Angular 21 | SPA framework (standalone components) |
| Bootstrap 5 + Bootstrap Icons | UI styling |
| Highcharts | Dashboard charts |
| @ng-select | Searchable dropdowns |

---

## 🗄️ Database design

- **Host database** (`DB/host.db`) — stores the `Users` table (accounts + preferences).
- **Per-user databases** (`DB/<username>/`) — one SQLite file per user holding their `Expenses` and `Categories`. Created automatically on registration/first access.
- Managed with **EF Core migrations** (`HostDbContext`); per-user databases are created with `EnsureCreated()`.

---

## 🚀 Getting started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (18+) and npm

### 1. Run the backend

```bash
cd TrackWise/Backend
dotnet run
```

The API starts at `http://localhost:5204`. Swagger UI is available at `/swagger`.

> The port can be overridden with the `PORT` environment variable.

### 2. Run the frontend

```bash
cd TrackWise/Frontend
npm install
npm start
```

The app opens at `http://localhost:4200`. The Angular dev server proxies API calls to the backend (`proxy.conf.json`).

### 3. Register an account

Sign up with a username, email, country (currency auto-mapped), and password. You'll be logged in automatically and land on the dashboard.

---

## 📁 Project structure

```
TrackWise/
├── Backend/                      # ASP.NET Core Web API
│   ├── Controller/               # API controllers (Auth, Expense, Category, Dashboard)
│   ├── Data/                     # DbContexts, per-user DB management, seed data
│   ├── Migrations/               # EF Core migrations
│   ├── Model/ & Models/          # Entities and DTOs
│   ├── Repository/               # Data access layer (repos + dynamic filtering)
│   └── Services/                 # Business logic (auth, expenses, categories)
└── Frontend/                     # Angular SPA
    └── src/app/
        ├── login/ register/      # Authentication screens
        ├── main/
        │   ├── dashboard/        # Charts + monthly totals
        │   ├── expense-list/     # Expense table (add/delete)
        │   ├── add-expense/      # New expense form
        │   ├── expense-category/ # Category management
        │   └── layout/           # App shell (sidebar, user badge)
        └── shared/               # Services, guards, interceptors, models
```

---

## 🔌 API overview

Base URL: `http://localhost:5204`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/Auth/register` | Create account (username, email, country, currency, password) | — |
| POST | `/api/Auth/login` | Authenticate and receive a JWT | — |
| GET | `/api/Expenses` | List all expenses | Bearer |
| POST | `/api/Expenses` | Create an expense | Bearer |
| PUT | `/api/Expenses/{id}` | Update an expense | Bearer |
| DELETE | `/api/Expenses/{id}` | Delete an expense | Bearer |
| POST | `/api/Expenses/filter` | Filter/project expenses dynamically | Bearer |
| GET | `/api/Categories` | List categories | Bearer |
| POST | `/api/Categories` | Create a category | Bearer |
| GET | `/api/Dashboard/getAmountByMonth?month=` | Total spend for a month | — |
| GET | `/api/Dashboard/getExpensesByCategory?month=` | Spend by category for a month | — |
| GET | `/api/Dashboard/getExpensesByMonth?year=` | Monthly spend totals for a year | — |

Full interactive docs: **`/swagger`**.

---

## 🌍 Environment configuration

- **Development** — `Frontend/src/environments/environment.ts` → `http://localhost:5204`
- **Production** — `Frontend/src/environments/environment.prod.ts` → Render API URL

---

## 🐳 Docker & CI

- `Backend/Dockerfile` — containerizes the backend.
- `.github/workflows/build.yml` — CI build pipeline.
- `dotnet-codespaces.sln` — solution file for building the backend.

---

## ⚠️ Notes

- JWT signing key lives in `appsettings.json` (dev-only placeholder). **In production, set the `Jwt__Key` environment variable to a strong secret** — the API refuses to start in Production if it's missing or still the placeholder.
- Tokens expire after `Jwt:ExpirationDays` (default: 7 days).

---

## 📄 License

No license specified. Use at your own discretion.

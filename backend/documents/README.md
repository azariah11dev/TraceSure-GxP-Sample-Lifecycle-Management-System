# 🧪 TraceSure Backend API

> **A GxP-Compliant Laboratory Information Management System (LIMS) Backend built with FastAPI**

TraceSure is a modern, role-based Laboratory Information Management System (LIMS) designed to streamline laboratory operations while supporting GxP-compliant workflows. The backend provides a secure REST API for managing laboratory samples, test execution, deviations, approvals, audit trails, and user authentication.

Built with **FastAPI**, **SQLAlchemy**, and **uv**, TraceSure emphasizes clean architecture, maintainability, and extensibility for laboratory environments.

---

## 🚀 Features

* 🔬 Laboratory sample creation and management
* 🧪 Test assignment and execution workflows
* ✅ Multi-stage review and approval process
* ⚠️ Deviation form creation, updates, and validation
* 📝 Correction tracking with audit history
* 🔐 JWT Authentication
* 👥 Role-Based Access Control (RBAC)
* 📊 Dashboard endpoints for laboratory status
* 📈 Historical reporting endpoints
* 🏗️ Clean separation of API endpoints by HTTP method
* 📦 Modular service layer for business logic

---

# 🏛️ Technology Stack

| Technology | Purpose                             |
| ---------- | ----------------------------------- |
| FastAPI    | REST API Framework                  |
| SQLAlchemy | ORM                                 |
| Pydantic   | Data Validation                     |
| PostgreSQL | Database                            |
| JWT        | Authentication                      |
| Docker     | Containerization                    |
| uv         | Dependency & Environment Management |

---

# 📁 Project Structure

```text
backend/
├── .dockerignore
├── .env
├── .env.example
├── .python-version
├── docker-compose.yml
├── dockerfile
├── pyproject.toml
├── uv.lock
│
├── documents/
│   ├── README.md
│   ├── docker-commands.txt
│   └── postgres-commands.txt
│
└── src/
    ├── app.py
    ├── main.py
    │
    ├── endpoints/
    │   ├── get_endpoints/
    │   ├── post_endpoints/
    │   └── put_endpoints/
    │
    ├── models/
    ├── schemas/
    └── services/
```

---

# 📂 Project Organization

## `endpoints/`

Contains all API routes organized by HTTP method.

```
GET
POST
PUT
```

This separation keeps routing organized and scalable as the application grows.

---

## `models/`

SQLAlchemy ORM models representing database tables.

Examples include:

* Users
* Samples
* Tests
* Deviations
* Corrections

---

## `schemas/`

Pydantic models responsible for

* Request validation
* Response serialization
* API documentation

---

## `services/`

Contains business logic including:

* JWT Authentication
* Role authorization
* Sample processing
* Correction tracking
* Specification validation
* Dependency injection
* Utility functions

---

## `documents/`

Project documentation including

* Docker commands
* PostgreSQL commands
* Development notes

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tracesure-backend.git

cd tracesure-backend
```

---

## 2. Install uv

### macOS / Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Windows

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

---

## 3. Install Dependencies

```bash
uv sync
```

This installs all packages specified in:

* `pyproject.toml`
* `uv.lock`

---

## 4. Configure Environment Variables

Copy the example environment file.

```bash
cp .env.example .env
```

Update the values inside `.env` for your environment.

---

## 5. Start the API

```bash
uv run src/main.py
```

Or run with automatic reloading during development.

```bash
uv run fastapi dev src/main.py
```

---

# 🐳 Docker

Build and start the application.

```bash
docker-compose up --build
```

The application will read configuration values from your `.env` file.

---

# ❤️ Health Check

```http
GET /health
```

Returns the current API health status.

Example response

```json
{
    "status": "healthy"
}
```

---

# 📘 API Overview

The backend organizes routes by HTTP method for maintainability.

---

## GET Endpoints

* Add Tests
* Display Tests
* Deviation Forms
* User Roles

---

## POST Endpoints

* User Authentication
* Test Management
* Deviation Forms

---

## PUT Endpoints

* Review Tests
* Assign Roles
* Update Sample Tests
* Update Deviation Forms

---

# 🔐 Authentication

TraceSure uses **JWT Authentication** to secure API access.

Protected endpoints require a valid Bearer Token.

Example:

```http
Authorization: Bearer <your_token>
```

---

# 👥 User Roles

The application supports Role-Based Access Control (RBAC).

Current roles include:

* Administrator
* Technician
* Manager
* QA
* Supervisor

Permissions are enforced throughout the application to support controlled laboratory workflows.

---

# 📊 Laboratory Workflow

```text
Sample Created
        │
        ▼
Test Assigned
        │
        ▼
Technician Executes Test
        │
        ▼
Manager Review
        │
        ▼
QA Approval
        │
        ▼
Released
```

Deviation and correction workflows are available throughout the lifecycle.

---

# 🧪 API Testing

Interactive API documentation is automatically generated.

### Swagger UI

```
/docs
```

### ReDoc

```
/redoc
```

The API can also be tested using:

* Postman
* Thunder Client
* curl
* HTTPie

---

# 🎯 Design Goals

TraceSure was built with the following objectives:

* Maintainable architecture
* Clear separation of concerns
* Regulatory-friendly workflows
* Secure authentication
* Extensible service layer
* Production-ready API structure

---

# 📈 Future Enhancements

Planned improvements include:

* Electronic signatures (21 CFR Part 11)
* Full audit trail reporting
* Instrument management
* Sample inventory tracking
* Notification system
* Report generation
* Dashboard analytics
* File attachments
* Laboratory scheduling

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for the complete license text.

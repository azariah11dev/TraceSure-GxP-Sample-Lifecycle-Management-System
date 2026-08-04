# 🧪 TraceSure — GxP Laboratory Information Management System (LIMS)

<p align="center">
Modern • Modular • Secure • GxP-Oriented
</p>

---

## 📖 Overview

**TraceSure** is a lightweight Laboratory Information Management System (LIMS) designed to demonstrate modern laboratory workflow management using a modular full-stack architecture.

Built with **FastAPI**, **PostgreSQL**, **Vanilla JavaScript**, and **Docker**, the application models many of the workflows found in regulated laboratory environments, including sample management, test execution, deviation tracking, approval chains, audit history, and role-based access control.

The project was developed as a portfolio application to showcase backend API design, frontend architecture, authentication, database modeling, and enterprise software engineering principles commonly found in pharmaceutical and biotechnology environments.

---

# 🚀 Key Features

### 🔬 Laboratory Sample Management

* Create laboratory samples
* Assign laboratory tests
* Track sample lifecycle
* Release completed samples

---

### 🧪 Testing Workflow

* Test assignment
* Technician execution
* Manager review
* QA approval
* Sample release

---

### ⚠️ Deviation Management

* Create deviation forms
* Modify existing deviations
* Validation workflows
* Pending deviation queue
* Correction tracking

---

### 🔐 Security

* JWT Authentication
* Role-Based Access Control (RBAC)
* Protected API endpoints
* Multi-role authorization

Supported roles include:

* Administrator
* Technician
* Manager
* QA
* Supervisor

---

### 📊 Reporting

* Dashboard overview
* Historical sample reporting
* Historical testing reports
* Laboratory status monitoring

---

# 🏗️ Technology Stack

| Layer              | Technology              |
| ------------------ | ----------------------- |
| Frontend           | HTML5, CSS3, JavaScript |
| Backend            | FastAPI                 |
| Database           | PostgreSQL              |
| ORM                | SQLAlchemy              |
| Validation         | Pydantic                |
| Authentication     | JWT                     |
| Package Management | uv                      |
| Containerization   | Docker                  |

---

# 📁 Project Structure

```text id="ofq1ur"
TraceSure/
├── backend/
│   └── documents/
│       └── README.md
│
├── frontend/
│   └── documents/
│       └── README.md
│
├── LICENSE
└── README.md
```

Detailed setup instructions for each application can be found in:

* **Backend:** `backend/documents/README.md`
* **Frontend:** `frontend/documents/README.md`

---

# 🏛️ System Architecture

```text id="u5ng8x"
                User
                  │
                  ▼
         TraceSure Frontend
        (HTML • CSS • JavaScript)
                  │
                  ▼
          FastAPI Backend API
                  │
      JWT Authentication & RBAC
                  │
                  ▼
             PostgreSQL
```

The frontend communicates with the backend through RESTful API endpoints. Authentication is handled using JWT tokens, while SQLAlchemy manages persistence within PostgreSQL.

---

# 🧪 Laboratory Workflow

```text id="hrlnaj"
Sample Creation
        │
        ▼
Test Assignment
        │
        ▼
Laboratory Testing
        │
        ▼
Manager Review
        │
        ▼
QA Approval
        │
        ▼
Sample Release
```

Deviation forms and corrective actions may be initiated throughout the testing lifecycle to support quality management processes.

---

🎥 Demo
A complete walkthrough of the project is available here.

📺 YouTube
https://youtu.be/WmHbdRCe2-E

---

# 📚 Project Documentation

Each application contains its own detailed documentation.

## Backend Documentation

Includes:

* Installation
* API setup
* Docker configuration
* Endpoint overview
* Authentication
* Project architecture

Location:

```text id="lsh2ot"
backend/documents/README.md
```

---

## Frontend Documentation

Includes:

* Installation
* Express server
* Navigation architecture
* Component organization
* API integration
* Authentication flow

Location:

```text id="04ud7d"
frontend/documents/README.md
```

---

# 🎯 Project Goals

TraceSure was developed to demonstrate enterprise software engineering concepts including:

* Clean architecture
* Modular application design
* REST API development
* Authentication & authorization
* Relational database design
* Component-based frontend architecture
* Laboratory workflow automation
* GxP-inspired quality processes

Although designed as a portfolio project, the architecture intentionally mirrors patterns commonly found in commercial laboratory information management systems.

---

# 📈 Future Enhancements

Planned improvements include:

* Electronic signatures (21 CFR Part 11)
* Comprehensive audit trail reporting
* Instrument management
* Inventory management
* Email notifications
* File attachments
* Dashboard analytics
* Advanced search and filtering
* Report generation
* Responsive mobile interface

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for additional information.

---

## 👨‍💻 About

TraceSure was built as a portfolio project to demonstrate full-stack software engineering within a regulated laboratory domain. The project emphasizes maintainability, modular design, secure authentication, and workflow-driven application architecture while showcasing technologies commonly used in modern enterprise development.

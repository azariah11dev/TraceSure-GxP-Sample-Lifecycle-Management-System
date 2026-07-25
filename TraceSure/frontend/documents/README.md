# 🧪 TraceSure Frontend

> **A lightweight, modular frontend for the TraceSure GxP Laboratory Information Management System (LIMS).**

TraceSure Frontend provides a clean, responsive user interface for interacting with the TraceSure Backend API. Built with **HTML**, **CSS**, and **Vanilla JavaScript**, the application supports laboratory sample management, testing workflows, deviation handling, approvals, reporting, and role-based administration.

The frontend is served using a lightweight **Node.js Express** static server, making deployment simple and portable without requiring a frontend framework.

---

# 🚀 Features

* 🔐 User Authentication (Login & Registration)
* 📊 Laboratory Dashboard
* 🧪 Sample Creation
* 📝 Test Assignment & Execution
* ✅ Multi-stage Review & Approval Workflow
* ⚠️ Deviation Form Management
* 📋 Pending Deviation Queue
* ✔️ Sample Release Workflow
* 📈 Historical Sample & Test Reporting
* 👥 Role Assignment (Administrator)
* 🧩 Modular Component-Based Architecture
* 🔗 Integration with the TraceSure Backend API

---

# 🏛️ Technology Stack

| Technology        | Purpose               |
| ----------------- | --------------------- |
| HTML5             | User Interface        |
| CSS3              | Styling               |
| JavaScript (ES6+) | Application Logic     |
| Node.js           | Static File Server    |
| Express           | Frontend Hosting      |
| REST API          | Backend Communication |
| JWT               | Authentication        |

---

# 📁 Project Structure

```text
frontend/
├── documents/
├── images/
│   └── landing-page.jpg
│
├── index.html
├── server.js
│
├── navigation/
│   ├── dashboard-main.html
│   ├── login/
│   ├── register/
│   └── components/
│       ├── create_deviation/
│       ├── dashboard/
│       ├── deviation_form/
│       ├── pending_deviation/
│       ├── role_assignment/
│       ├── sample_approval/
│       ├── sample_creation/
│       ├── sample_history/
│       ├── sample_release/
│       ├── sample_review/
│       └── sample_testing/
│
├── scripts/
│   ├── dashboard/
│   └── navigation.js
│
└── styles/
    ├── global-styles.css
    ├── container-1.css
    ├── container-2.css
    ├── container-3.css
    └── main-dashboard/
```

---

# 📂 Project Organization

## `navigation/`

Contains the application's navigation system and page components.

The application uses a modular architecture where each feature is separated into its own folder.

Each component contains:

* `*.html` — User Interface
* `*.css` — Component Styling
* `*.js` — API Calls & UI Logic

This keeps the project organized, maintainable, and easy to extend.

---

## `scripts/`

Contains shared JavaScript utilities and navigation logic.

Highlights include:

* Dynamic page loading
* Navigation management
* Dashboard functionality
* API communication

---

## `styles/`

Application styling is divided into:

### Global Styles

```text
styles/global-styles.css
styles/container-*.css
```

### Dashboard Styles

```text
styles/main-dashboard/
```

Each UI component also includes its own isolated stylesheet.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tracesure-frontend.git

cd tracesure-frontend
```

---

## 2. Install Node.js

Download the latest LTS version from:

https://nodejs.org/

Verify the installation.

```bash
node -v
npm -v
```

---

## 3. Install Express

If Express is not already installed:

```bash
npm install express
```

---

## 4. Start the Frontend

```bash
node server.js
```

You should see:

```text
Frontend running at http://localhost:3000
```

Open your browser:

```text
http://localhost:3000
```

The entire `frontend/` directory is served as the application's static root.

---

# 🧭 Navigation Architecture

TraceSure uses a lightweight component-based navigation system instead of a JavaScript framework.

Core files include:

* `dashboard-main.html` — Main application shell
* `navigation.js` — Dynamic page loader
* Component folders — Individual application modules

This approach provides a multi-page SPA experience while keeping the project dependency-free.

---

# 🔌 Backend Integration

The frontend communicates directly with the TraceSure Backend REST API using the Fetch API.

Example authentication request:

```javascript
const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username,
        password
    })
});
```

JWT access tokens are stored in `localStorage` and automatically attached to protected API requests.

---

# 👥 User Roles

The application supports Role-Based Access Control (RBAC).

Current roles include:

* Administrator
* Technician
* Manager
* QA
* Supervisor

Navigation and available actions are determined by the authenticated user's role.

---

# 🧪 Laboratory Workflow

```text
User Login
      │
      ▼
Dashboard
      │
      ▼
Sample Creation
      │
      ▼
Test Assignment
      │
      ▼
Testing
      │
      ▼
Review
      │
      ▼
QA Approval
      │
      ▼
Sample Release
```

Deviation forms and correction workflows can be initiated throughout the testing lifecycle.

---

# 🎨 User Interface

The frontend focuses on:

* Responsive layouts
* Modular components
* Clear laboratory workflows
* Lightweight performance
* Easy navigation
* Minimal dependencies

---

# 🔐 Authentication

Authentication is handled through JWT tokens issued by the TraceSure Backend.

Protected API requests include:

```http
Authorization: Bearer <access_token>
```

---

# 📈 Future Enhancements

Planned improvements include:

* Responsive mobile layout
* Dark mode
* User profile management
* Notification center
* Dashboard analytics
* Real-time status updates
* Electronic signatures
* Advanced reporting
* Search and filtering
* Accessibility improvements

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for additional information.

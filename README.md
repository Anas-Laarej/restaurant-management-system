# 🍽️ Zefran — Restaurant Management System

> A full-stack web application for managing restaurant operations, orders, reservations, stock, tables, staff and customer interactions.

**Zefran** is a restaurant management system developed as part of a **Computer Engineering project at EMSI**.

The platform is designed to centralize restaurant operations through a modern web application with dedicated interfaces for restaurant staff and customers.

---

## 📌 Overview

Zefran provides a centralized solution for managing the main activities of a restaurant.

The application includes dedicated interfaces for different types of users:

- 🧑‍💼 **Manager** — Restaurant administration and monitoring
- 👨‍🍳 **Chef** — Kitchen and order management
- 🧑‍🍳 **Waiter** — Tables and customer orders
- 💳 **Cashier** — Order and payment operations
- 👤 **Client** — Menu, orders, reservations and reviews

The system follows a **frontend/backend architecture** with a REST API connecting the user interface to the backend.

---

# 🚀 Features

## 👥 Role-Based Management

Different users have access to different functionalities according to their role.

### 🧑‍💼 Manager

- Restaurant management
- Staff management
- Menu management
- Stock monitoring
- Reservation management
- Dashboard and statistics
- Operational monitoring

### 👨‍🍳 Chef

- View orders
- Manage kitchen orders
- Follow order status
- Monitor food preparation

### 🧑‍🍳 Waiter

- Manage tables
- Create and manage orders
- Follow customer orders
- Manage restaurant service

### 💳 Cashier

- Manage orders
- Handle payment operations
- Monitor completed orders

### 👤 Client

Customers can:

- Browse the restaurant
- View the menu
- Place orders
- Make reservations
- Submit reviews
- Interact with the restaurant platform

---

# 📋 Restaurant Management

Zefran provides several modules for managing restaurant operations:

- 🍔 **Menu Management**
- 📋 **Order Management**
- 🪑 **Table Management**
- 📅 **Reservation Management**
- 📦 **Stock Management**
- 👥 **Staff Management**
- ⭐ **Customer Reviews**
- 📊 **Dashboard & Statistics**
- 🔐 **Authentication & Authorization**

---

# 🖼️ Screenshots

The project includes screenshots of the main interfaces.

### 🔐 Login

![Login](screenshots/interface_login.png)

### 🏠 Home

![Home](screenshots/interface_accueil.png)

### 👤 Client Interface

![Client Interface](screenshots/interface_client.png)

### 📊 Dashboard

![Dashboard](screenshots/interface_dashboard.png)

### 📋 Orders

![Orders](screenshots/interface_commandes.png)

### 👨‍🍳 Kitchen

![Kitchen](screenshots/interface_cuisine.png)

### 📅 Reservations

![Reservations](screenshots/interface_reservations.png)

### 📦 Stock

![Stock](screenshots/interface_stocks.png)

### ⭐ Reviews

![Reviews](screenshots/interface_avis.png)

---

# 🏗️ Architecture

Zefran follows a separated frontend/backend architecture.

```text
                    ┌────────────────────────┐
                    │     Web Interface      │
                    │   React / Frontend     │
                    └────────────┬───────────┘
                                 │
                                 │ HTTP / REST API
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │      Django API        │
                    │ Django REST Framework  │
                    └────────────┬───────────┘
                                 │
                                 │ Django ORM
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │        SQLite          │
                    │       Database         │
                    └────────────────────────┘
```

### Application Flow

```text
User
 │
 ▼
Frontend
 │
 │ HTTP Requests
 ▼
Django REST API
 │
 │ Business Logic
 ▼
Database
```

---

# 📁 Project Structure

```text
restaurant-management-system/
│
├── mangermanger/
│   │
│   ├── api/
│   │   └── ...
│   │
│   ├── restaurant/
│   │   └── ...
│   │
│   ├── mangermanger/
│   │   └── ...
│   │
│   ├── frontend/
│   │   └── ...
│   │
│   ├── staticfiles/
│   │   └── ...
│   │
│   ├── manage.py
│   ├── seed_data.py
│   ├── requirements.txt
│   └── db.sqlite3
│
├── mangermanger-front/
│   └── ...
│
├── screenshots/
│   ├── interface_login.png
│   ├── interface_accueil.png
│   ├── interface_client.png
│   ├── interface_dashboard.png
│   ├── interface_commandes.png
│   ├── interface_cuisine.png
│   ├── interface_reservations.png
│   ├── interface_stocks.png
│   └── interface_avis.png
│
├── .gitignore
└── README.md
```

---

# 🛠️ Technologies

## Backend

- 🐍 Python
- Django
- Django REST Framework
- SQLite
- django-cors-headers
- REST API
- Token Authentication

## Frontend

- ⚛️ React
- Vite
- Axios
- React Router
- Recharts
- JavaScript / JSX
- HTML5
- CSS3

## Development

- Git
- GitHub
- Visual Studio Code
- npm
- Python Virtual Environment

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Anas-Laarej/restaurant-management-system.git
cd restaurant-management-system
```

---

# 🐍 Backend Setup

Navigate to the backend:

```bash
cd mangermanger
```

### Create a Virtual Environment

```bash
python -m venv .venv
```

### Windows

```powershell
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

### Install Dependencies

```bash
python -m pip install -r requirements.txt
```

### Check the Django Project

```bash
python manage.py check
```

### Apply Database Migrations

```bash
python manage.py migrate
```

### Optional: Load Seed Data

If you want to populate the database with initial/test data:

```bash
python seed_data.py
```

### Start the Backend

```bash
python manage.py runserver
```

The backend will normally be available at:

```text
http://127.0.0.1:8000/
```

---

# ⚛️ Frontend Setup

If your frontend is located in `mangermanger-front`:

```bash
cd mangermanger-front
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173/
```

> If the active frontend is the `mangermanger/frontend` directory instead, use that directory according to the project's current configuration.

---

# 🔗 Frontend & Backend Communication

The frontend communicates with the Django backend through REST API requests.

```text
┌──────────────────────┐
│   React + Vite       │
│      Frontend        │
└──────────┬───────────┘
           │
           │ Axios / HTTP
           ▼
┌──────────────────────┐
│   Django REST API    │
│       Backend        │
└──────────┬───────────┘
           │
           │ Django ORM
           ▼
┌──────────────────────┐
│       SQLite         │
│      Database        │
└──────────────────────┘
```

---

# 🔐 Authentication & Authorization

Zefran uses authentication and role-based authorization to control access to the application's different functionalities.

```text
                     User
                       │
                       ▼
                Authentication
                       │
                       ▼
                 User Role
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Manager        Chef        Waiter
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
                Authorized Access
```

This approach allows each employee to access only the functionalities associated with their responsibilities.

---

# 📊 Dashboard

The management dashboard provides an overview of restaurant activity.

It can be used to monitor information such as:

- Orders
- Reservations
- Stock
- Restaurant activity
- Operational statistics

Data visualization is implemented using **Recharts** where applicable.

---

# 📦 Main Modules

| Module            | Description                            |
| ----------------- | -------------------------------------- |
| 🔐 Authentication | User authentication and access control |
| 👥 Staff          | Employee and role management           |
| 🍔 Menu           | Menu and food item management          |
| 📋 Orders         | Order creation and tracking            |
| 👨‍🍳 Kitchen        | Kitchen order management               |
| 🪑 Tables         | Restaurant table management            |
| 📅 Reservations   | Customer reservation management        |
| 📦 Stock          | Inventory and stock monitoring         |
| ⭐ Reviews        | Customer feedback management           |
| 📊 Dashboard      | Restaurant activity and statistics     |

---

# 🎯 Project Objectives

The main objectives of Zefran are:

- Digitize restaurant management
- Centralize restaurant operations
- Simplify order management
- Improve reservation management
- Monitor restaurant stock
- Facilitate staff coordination
- Implement role-based access
- Improve the customer experience
- Reduce manual management tasks

---

# 🔮 Future Improvements

Possible future developments include:

- 💳 Online payment integration
- 📱 Mobile application
- 🔔 Real-time notifications
- 📧 Email notifications
- 📈 Advanced analytics
- 🤖 AI-powered recommendations
- 📦 Intelligent inventory forecasting
- 🧾 Automatic invoice generation
- ☁️ Cloud deployment
- 🔒 Advanced security
- 📱 Improved responsive design

---

# 🧪 Development

Before starting the project, verify that Python and Node.js are installed.

```bash
python --version
```

```bash
node --version
```

For the Django backend:

```bash
python manage.py check
```

For the frontend:

```bash
npm run dev
```

---

# 👥 Team

Developed by:

- **Anas Laarej**
- **Anass Nazih**

🎓 **Computer Engineering — EMSI**

---

# 🎓 Academic Project

Zefran was developed as part of an academic **Computer Engineering project at EMSI**.

The project applies software engineering concepts including:

- Web application development
- REST API development
- Frontend development
- Backend development
- Database management
- Authentication
- Role-based authorization
- Software architecture
- Version control with Git and GitHub

---

# 📄 License

This project was developed for **educational and academic purposes**.

---

# ⭐ Repository

If you find this project interesting, feel free to explore the source code and follow its development.

**GitHub Repository:**

https://github.com/Anas-Laarej/restaurant-management-system

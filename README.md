# 🍽️ Zefran — Restaurant Management System

> A full-stack restaurant management system designed to centralize and simplify restaurant operations.

Zefran is a modern web-based restaurant management platform developed as part of a final-year **Computer Engineering project at EMSI**.

The application provides dedicated interfaces for restaurant staff and customers, allowing the management of daily operations such as orders, reservations, menu items, tables, stock and customer interactions.

---

## 📌 Project Overview

Zefran is designed to digitize and simplify restaurant management through a centralized platform.

The system is divided into two main interfaces:

- 🧑‍💼 **Staff Interface** — Management and operational dashboard
- 🛒 **Client Interface** — Customer-facing platform

The application follows a modern **frontend/backend architecture**, where a React application communicates with a Django REST API.

---

## 🚀 Features

### 🧑‍💼 Staff Management

Zefran provides role-based interfaces for different restaurant employees:

- 👨‍💼 **Manager**
- 👨‍🍳 **Chef**
- 🧑‍🍳 **Waiter**
- 💳 **Cashier**

Each role has access to the functionalities required for its responsibilities.

---

### 📋 Restaurant Management

The platform provides several tools for managing restaurant operations:

- 📋 Order management
- 🍔 Menu management
- 📦 Stock management
- 🪑 Table management
- 📅 Reservation management
- ⭐ Customer reviews
- 📊 Dashboard and statistics
- 👥 Staff management
- 🔐 Authentication and authorization
- 💰 Billing and payment management

---

### 🛒 Client Features

Customers can interact with the restaurant through a dedicated interface.

They can:

- Browse the restaurant
- View available menu items
- Place orders
- Make reservations
- Submit reviews
- Access the online restaurant interface

---

## 🖼️ Screenshots

### 🔐 Login

![Login](screenshots/interface_login.png)

---

### 🏠 Home

![Home](screenshots/interface_accueil.png)

---

### 👤 Client Interface

![Client Interface](screenshots/interface_client.png)

---

### 📊 Dashboard

![Dashboard](screenshots/interface_dashboard.png)

---

### 🛒 Order Management

![Orders](screenshots/interface_commandes.png)

---

### 👨‍🍳 Kitchen Interface

![Kitchen](screenshots/interface_cuisine.png)

---

### 📅 Reservation Management

![Reservations](screenshots/interface_reservations.png)

---

### 📦 Stock Management

![Stock](screenshots/interface_stocks.png)

---

### ⭐ Customer Reviews

![Reviews](screenshots/interface_avis.png)

---

## 🏗️ System Architecture

Zefran follows a separated **frontend/backend architecture**.

```text
                         ┌──────────────────────┐
                         │     React + Vite     │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                              Axios / HTTP
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Django REST API    │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       SQLite         │
                         │      Database        │
                         └──────────────────────┘
```

### 🔄 Application Flow

```text
Client / Staff
      │
      ▼
React Frontend
      │
      │ HTTP Requests
      ▼
Django REST Framework
      │
      │ Business Logic
      ▼
Database
```

---

## 📁 Project Structure

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
│   ├── manage.py
│   ├── seed_data.py
│   ├── requirements.txt
│   └── db.sqlite3
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
- Token Authentication
- REST API

## Frontend

- ⚛️ React
- Vite
- Axios
- React Router
- Recharts
- JavaScript / JSX
- HTML5
- CSS3

## Development Tools

- Git
- GitHub
- Visual Studio Code
- npm
- Python Virtual Environment

---

# ⚙️ Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Anas-Laarej/restaurant-management-system.git
```

Navigate to the project:

```bash
cd restaurant-management-system
```

---

# 🐍 Backend Setup

Navigate to the Django backend:

```bash
cd mangermanger
```

## Create a Virtual Environment

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

---

## Install Dependencies

Install all required Python packages:

```bash
python -m pip install -r requirements.txt
```

---

## Database Setup

Run Django migrations:

```bash
python manage.py migrate
```

---

## Optional: Load Test Data

If seed data is available:

```bash
python seed_data.py
```

---

## Start the Backend Server

```bash
python manage.py runserver
```

The Django API will be available at:

```text
http://127.0.0.1:8000/
```

---

# ⚛️ Frontend Setup

Open another terminal.

Navigate to the frontend directory:

```bash
cd mangermanger/frontend
```

Install the JavaScript dependencies:

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

---

# 🔗 Frontend ↔ Backend Communication

The React frontend communicates with the Django backend through REST API endpoints.

```text
┌─────────────────────┐
│    React + Vite     │
│      Frontend       │
└──────────┬──────────┘
           │
           │ Axios
           │ HTTP Requests
           ▼
┌─────────────────────┐
│   Django REST API   │
│       Backend       │
└──────────┬──────────┘
           │
           │ ORM
           ▼
┌─────────────────────┐
│       SQLite        │
│      Database       │
└─────────────────────┘
```

---

# 🔐 Authentication & Authorization

The application implements authentication and role-based authorization.

Different users can access different functionalities depending on their role.

```text
                    User
                     │
                     ▼
              Authentication
                     │
                     ▼
              User Role Check
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Manager      Chef      Waiter
          │          │          │
          └──────────┼──────────┘
                     ▼
              Authorized Access
```

---

# 📊 Dashboard

The staff dashboard provides an overview of restaurant activity.

It can be used to monitor:

- Orders
- Reservations
- Restaurant activity
- Stock
- Statistics
- Operational information

Data visualization is implemented using **Recharts**.

---

# 📦 Main Modules

| Module            | Description                        |
| ----------------- | ---------------------------------- |
| 🔐 Authentication | User login and access control      |
| 👥 Staff          | Employee and role management       |
| 🍔 Menu           | Restaurant menu management         |
| 🛒 Orders         | Order creation and tracking        |
| 👨‍🍳 Kitchen        | Kitchen order management           |
| 🪑 Tables         | Restaurant table management        |
| 📅 Reservations   | Customer reservation management    |
| 📦 Stock          | Inventory and stock management     |
| ⭐ Reviews        | Customer review management         |
| 📊 Dashboard      | Statistics and restaurant overview |

---

# 🎯 Project Objectives

The main objectives of Zefran are:

- Digitize restaurant management
- Centralize restaurant operations
- Improve order management
- Simplify reservation management
- Improve stock monitoring
- Provide role-based access
- Improve communication between restaurant employees
- Provide customers with an easy-to-use online interface
- Reduce manual management tasks

---

# 🔮 Future Improvements

Possible future improvements include:

- 💳 Online payment integration
- 📱 Mobile application
- 🔔 Real-time notifications
- 📈 Advanced analytics
- 🤖 AI-powered recommendations
- 📦 Advanced inventory forecasting
- 🧾 Automatic invoice generation
- ☁️ Cloud deployment
- 🔒 Advanced security features
- 📧 Email notifications
- 📱 Responsive mobile-first improvements

---

# 🧪 Development

Before starting development, make sure that:

```bash
python --version
```

and:

```bash
node --version
```

are available on your system.

For the backend:

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

🎓 Computer Engineering — **EMSI**

---

# 🎓 Academic Project

Zefran was developed as part of an academic **Computer Engineering project at EMSI**.

The project focuses on applying software engineering concepts including:

- Software architecture
- REST API development
- Database management
- Frontend development
- Backend development
- Authentication
- Role-based authorization
- Agile development
- Version control with Git

---

# 📄 License

This project was developed for educational and academic purposes.

---

# ⭐ Project

If you find this project interesting, feel free to explore the repository and follow its development.

**Repository:**

https://github.com/Anas-Laarej/restaurant-management-system

# 🍽️ Zefran — Restaurant Management System

> **Full-Stack Restaurant Management System** built with Django REST Framework and React.

Zefran is a complete restaurant management application designed to centralize and simplify the daily operations of a restaurant. The system provides dedicated interfaces for managers, kitchen staff, waiters, cashiers and clients.

The application combines a **Django REST API**, a **React frontend**, authentication, restaurant management modules, online reservations, order management, notifications and AI-powered customer review sentiment analysis.

---

## 📌 Overview

Zefran allows a restaurant to manage its main operations from a single platform:

- 👨‍💼 Staff and user management
- 🍽️ Menu and categories
- 🧂 Ingredients and stock
- 🪑 Tables and reservations
- 🛎️ Orders and order items
- 💳 Billing and payments
- 🎟️ Promotional codes
- ⭐ Customer reviews
- 🔔 Notifications
- 👤 Customer accounts
- 🧠 AI-powered sentiment analysis
- 📊 Dashboard and statistics

The system supports different roles with dedicated access and functionalities.

---

## 👥 User Roles

### 👨‍💼 Manager

The manager has access to the restaurant administration features:

- Dashboard and statistics
- Employee management
- Menu management
- Categories
- Ingredients and stock
- Tables
- Reservations
- Orders
- Billing
- Promotional codes
- Customer reviews
- Notifications

### 👨‍🍳 Chef

The chef can:

- View orders
- Monitor orders in preparation
- Manage order preparation
- Mark order items as ready

### 🧑‍🍳 Waiter

The waiter can:

- Manage restaurant tables
- Create orders
- Manage reservations
- Update order status
- Monitor customer requests

### 💰 Cashier

The cashier can:

- Access billing information
- Process payments
- Manage completed orders

### 👤 Client

Customers can:

- Create an account
- Log in
- View their profile
- Browse the menu
- Make reservations
- Place orders
- View their reservations
- Cancel reservations
- Manage their password
- Receive notifications
- Leave reviews

---

## ✨ Main Features

### 📊 Dashboard

Centralized dashboard providing an overview of restaurant activity and key statistics.

### 🍽️ Menu Management

- Create, update and delete dishes
- Organize dishes by category
- Manage prices
- Manage availability

### 🧂 Inventory Management

- Manage ingredients
- Track stock quantities
- Define minimum stock levels
- Detect low-stock ingredients
- Display stock alerts

### 🪑 Table Management

- View restaurant tables
- Manage table capacity
- Update table status
- Track available and occupied tables
- Manage reserved tables

### 📅 Reservation Management

Customers can reserve tables according to availability.

The system handles:

- Table availability
- Reservation dates and times
- Capacity validation
- Reservation confirmation
- Reservation cancellation
- Automatic table status updates

### 🛎️ Order Management

The application supports restaurant order processing:

1. Order creation
2. Order preparation
3. Item preparation
4. Order completion
5. Billing

Order status can be updated throughout the process.

### 💳 Billing

The billing module allows staff to manage restaurant payments and mark invoices as paid.

### 🎟️ Promotional Codes

The system supports promotional codes with validation and discount management.

### ⭐ Customer Reviews

Customers can submit reviews about their experience.

Reviews can be:

- Accepted
- Refused
- Analyzed automatically

### 🧠 AI Sentiment Analysis

Customer reviews are analyzed using a multilingual transformer model:

`nlptown/bert-base-multilingual-uncased-sentiment`

This allows the application to identify the sentiment expressed in customer feedback.

### 🔔 Notifications

The notification system informs users about important events such as:

- New reservations
- Reservation confirmations
- Order updates
- Other restaurant activities

---

## 🏗️ Architecture

The application follows a **client-server architecture**.

```text
┌─────────────────────────────┐
│       React Frontend        │
│                             │
│  React + Vite + Axios       │
└──────────────┬──────────────┘
               │
               │ HTTP / REST API
               ▼
┌─────────────────────────────┐
│       Django Backend        │
│                             │
│ Django REST Framework       │
│ Authentication              │
│ Business Logic               │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          Database           │
│           SQLite            │
└─────────────────────────────┘
```

### Communication

The React frontend communicates with the Django backend through REST API endpoints.

Authentication is handled using **Django REST Framework Token Authentication**.

Example:

```text
React
  │
  │ GET /api/plats/
  ▼
Django REST API
  │
  ▼
Database
```

---

## 🔌 REST API

The backend exposes a REST API for the main restaurant resources.

### Main endpoints

| Resource          | Endpoint                 |
| ----------------- | ------------------------ |
| Login             | `/api/login/`            |
| Register          | `/api/register/`         |
| Dashboard         | `/api/dashboard/`        |
| Dishes            | `/api/plats/`            |
| Categories        | `/api/categories/`       |
| Ingredients       | `/api/ingredients/`      |
| Tables            | `/api/tables/`           |
| Reservations      | `/api/reservations/`     |
| Orders            | `/api/commandes/`        |
| Order Items       | `/api/commande-items/`   |
| Reviews           | `/api/avis/`             |
| Employees         | `/api/employes/`         |
| Promotional Codes | `/api/codes-promo/`      |
| Billing           | `/api/facturation/`      |
| Client Orders     | `/api/commandes-client/` |
| Notifications     | `/api/notifications/`    |

Additional endpoints are available for specific operations such as reservation confirmation, order status updates, stock alerts, notifications and payment processing.

---

## 🛠️ Technologies

### Backend

- Python
- Django
- Django REST Framework
- Django CORS Headers
- SQLite
- Token Authentication
- Hugging Face Transformers
- PyTorch

### Frontend

- React
- Vite
- JavaScript
- Axios
- React Router
- CSS

### Development Tools

- Git
- GitHub
- Visual Studio Code
- npm
- Python Virtual Environment

---

## 📁 Project Structure

```text
restaurant-management-system/
│
├── mangermanger/
│   │
│   ├── api/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── ...
│   │
│   ├── mangermanger/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── ...
│   │
│   ├── restaurant/
│   │   └── ...
│   │
│   ├── frontend/
│   │   └── ...
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── mangermanger-front/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Anas-Laarej/restaurant-management-system.git
cd restaurant-management-system
```

---

## 🐍 Backend Setup

Navigate to the Django project:

```bash
cd mangermanger
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000/
```

---

## ⚛️ Frontend Setup

Open another terminal and navigate to:

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

Vite will provide the frontend URL in the terminal, normally:

```text
http://localhost:5173/
```

---

## 🔐 Authentication

The application uses **Django REST Framework Token Authentication**.

After authentication, the frontend stores the token locally and automatically includes it in API requests.

Example:

```http
Authorization: Token <your-token>
```

The frontend API configuration is centralized in:

```text
mangermanger-front/src/api.js
```

---

## 🔄 Application Flow

```text
                    ┌──────────────┐
                    │    Client    │
                    └──────┬───────┘
                           │
                           ▼
                    Browse Restaurant
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        Make Reservation          Place Order
              │                         │
              ▼                         ▼
        Table Management          Order Management
                                        │
                                        ▼
                                   Kitchen
                                        │
                                        ▼
                                     Cashier
                                        │
                                        ▼
                                    Payment
```

---

## 📸 Screenshots

The project contains interface screenshots illustrating the main application modules.

```text
screenshots/
├── interface_*.png
└── ...
```

---

## 📐 UML & Design

The project was designed using UML diagrams to model the application's architecture and functional requirements.

The design includes diagrams covering:

- Use cases
- Classes
- Application architecture
- Main business processes

---

## 📊 Main Modules

| Module        | Description                        |
| ------------- | ---------------------------------- |
| Dashboard     | Restaurant statistics and overview |
| Menu          | Dishes and categories              |
| Stock         | Ingredients and inventory          |
| Tables        | Table management                   |
| Reservations  | Customer reservations              |
| Orders        | Restaurant order management        |
| Kitchen       | Order preparation                  |
| Billing       | Payments and invoices              |
| Promotions    | Discount codes                     |
| Reviews       | Customer feedback                  |
| Notifications | System notifications               |
| Employees     | Staff management                   |
| Client Area   | Customer services                  |

---

## 🧪 Development

### Backend verification

Run Django system checks:

```bash
python manage.py check
```

### Frontend verification

Build the React application:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

---

## 🔮 Future Improvements

Possible future improvements include:

- ☁️ Production deployment
- 🔒 Improved production security configuration
- 🐳 Docker support
- ⚙️ CI/CD with GitHub Actions
- 📈 More advanced analytics
- 📱 Mobile application
- 💳 Online payment integration
- 🔔 Real-time notifications
- 🤖 More advanced AI-powered customer analysis

---

## 👨‍💻 Team

### Anas Laarej

Computer Engineering Student — EMSI

GitHub:

`https://github.com/Anas-Laarej`

### Anass Nazih

Computer Engineering Student — EMSI

---

## 🎓 Academic Project

This project was developed as an academic software engineering project at **EMSI — École Marocaine des Sciences de l'Ingénieur**.

The project focuses on applying software engineering concepts to a real-world restaurant management scenario.

---

## 📄 License

This project is intended primarily for academic and educational purposes.

---

## ⭐ Support

If you find this project interesting, feel free to ⭐ the repository.

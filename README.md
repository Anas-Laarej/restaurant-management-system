# 🍽️ Zefran — Restaurant Management System

> A full-stack restaurant management system designed to centralize and simplify restaurant operations.

Zefran is a web-based application developed as part of a final-year Computer Engineering project at **EMSI**.

The platform provides dedicated interfaces for restaurant staff and customers, allowing the management of daily operations such as orders, reservations, menu items, stock, tables and restaurant activities.

---

## ✨ Overview

Zefran is built around two main interfaces:

- 🧑‍💼 **Staff Interface** — Management and operational dashboard
- 🛒 **Client Interface** — Customer-facing interface for browsing, ordering and reservations

The system uses a modern **frontend/backend architecture**, with a React frontend communicating with a Django REST API.

---

## 🚀 Features

### 🧑‍💼 Staff Management

The system provides role-based interfaces for:

- 👨‍💼 Manager
- 👨‍🍳 Chef
- 🧑‍🍳 Waiter
- 💳 Cashier

Each role can access the functionalities relevant to their responsibilities.

### 📋 Restaurant Management

- 📋 Order management
- 🍔 Menu management
- 📦 Stock management
- 🪑 Table management
- 📅 Reservation management
- ⭐ Customer reviews
- 📊 Dashboard and statistics
- 👥 Staff management
- 🔐 Authentication and authorization

### 🛒 Client Features

Customers can:

- Browse the restaurant
- View the menu
- Place orders
- Make reservations
- Submit reviews
- Interact with the restaurant's online interface

---

## 🖼️ Screenshots

### 🔐 Login

![Login](screenshots/interface_login.png)

### 🏠 Home

![Home](screenshots/interface_accueil.png)

### 👤 Client Interface

![Client Interface](screenshots/interface_client.png)

### 📊 Dashboard

![Dashboard](screenshots/interface_dashboard.png)

### 🛒 Orders

![Orders](screenshots/interface_commandes.png)

### 👨‍🍳 Kitchen

![Kitchen](screenshots/interface_cuisine.png)

### 📅 Reservations

![Reservations](screenshots/interface_reservations.png)

### 📦 Stock Management

![Stock Management](screenshots/interface_stocks.png)

### ⭐ Reviews

![Reviews](screenshots/interface_avis.png)

---

## 🏗️ Architecture

The application follows a separated **frontend/backend architecture**.

```text
                    ┌─────────────────────┐
                    │      React App      │
                    │      + Vite         │
                    └──────────┬──────────┘
                               │
                         HTTP / Axios
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Django REST API  │
                    │   Django REST       │
                    │   Framework         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       SQLite        │
                    │      Database       │
                    └─────────────────────┘

MangerManger — Restaurant Management System

Restaurant management ERP, built as a final-year project (PFA) in Computer Engineering at EMSI.

📋 Description

MangerManger is a full-featured restaurant management web app, made up of two distinct interfaces:

Staff Interface (Manager, Chef, Waiter, Cashier) — ERP dashboard to manage orders, stock, reservations, billing, and statistics
Client Interface — storefront site with online ordering and reservations
🛠️ Tech Stack

Backend — mangermanger folder

Django 4.x + Django REST Framework
SQLite
django-cors-headers
Token-based authentication (DRF)

Frontend — mangermanger-front folder

React 19 + Vite
Axios
React Router DOM
Recharts (dashboard charts)
🚀 Installation
Backend (Django)
bash
cd mangermanger
python -m venv .venv
.venv\Scripts\activate          # Windows
# or source .venv/bin/activate  # Linux/Mac

pip install django djangorestframework django-cors-headers
python manage.py migrate
python seed_data.py             # test data (optional)
python manage.py runserver
Frontend (React)
bash
cd mangermanger-front
npm install
npm run dev

The backend runs by default on http://localhost:8000 and the frontend on http://localhost:5173.

👥 Team

Built by:

Anas Laarej
Anass Nazih
📄 License

Academic project — EMSI, Computer Engineering.

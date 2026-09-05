# 🍽️ MangerManger — ERP Restaurant

Projet complet **Django REST + React** avec base de données SQLite.

---

## 🏗️ Architecture

```
mangermanger/          ← Backend Django
├── manage.py
├── db.sqlite3         ← Base SQLite (auto-créée)
├── seed_data.py       ← Données de test
├── mangermanger/
│   ├── settings.py    ← Configuration Django
│   └── urls.py        ← URLs racine
├── restaurant/
│   ├── models.py      ← Tous les modèles de données
│   └── admin.py       ← Interface d'administration
└── api/
    ├── serializers.py ← Sérialisation JSON
    ├── views.py       ← Toute la logique API
    └── urls.py        ← Routes API REST

mangermanger-front/    ← Frontend React
├── src/
│   ├── api.js         ← Client Axios
│   ├── context/
│   │   └── AuthContext.jsx  ← Auth + rôles
│   ├── components/
│   │   └── Layout.jsx       ← Sidebar navigation
│   └── pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx    ← Tableau de bord gérant
│       ├── Commandes.jsx    ← Gestion commandes
│       ├── Tables.jsx       ← Plan des tables
│       ├── Menu.jsx         ← CRUD plats & catégories
│       ├── Stock.jsx        ← Gestion ingrédients
│       ├── Cuisine.jsx      ← Interface chef cuisinier
│       ├── Salle.jsx        ← Prise de commande serveur
│       ├── Caisse.jsx       ← Encaissement caissier
│       ├── Avis.jsx         ← Avis clients
│       ├── Personnel.jsx    ← Gestion employés
│       └── Promos.jsx       ← Codes promotionnels
```

---

## 🚀 Installation & Démarrage

### Prérequis
- Python 3.10+
- Node.js 18+

### Backend Django

```bash
cd mangermanger

# Installer les dépendances
pip install django djangorestframework django-cors-headers

# Appliquer les migrations
python manage.py migrate

# Charger les données de test
python seed_data.py

# Démarrer le serveur (port 8000)
python manage.py runserver
```

### Frontend React

```bash
cd mangermanger-front

# Installer les dépendances
npm install

# Mode développement (port 5173)
npm run dev

# Build production
npm run build
```

---

## 🔐 Comptes de connexion

| Identifiant | Mot de passe | Rôle |
|------------|-------------|------|
| `gerant`   | `pass1234`  | Gérant — accès complet |
| `chef`     | `pass1234`  | Chef cuisinier |
| `serveur1` | `pass1234`  | Serveur en salle |
| `caissier` | `pass1234`  | Caissier |
| `admin`    | `admin`     | Admin Django |

---

## 📡 API REST — Endpoints principaux

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/login/` | Authentification → Token |
| GET | `/api/dashboard/` | Stats du jour |
| GET/POST | `/api/plats/` | Liste & création de plats |
| GET/POST | `/api/commandes/` | Liste & création commandes |
| POST | `/api/commandes/nouvelle/` | Nouvelle commande complète |
| PATCH | `/api/commandes/{id}/changer_statut/` | Changer statut |
| GET | `/api/tables/` | Plan des tables |
| PATCH | `/api/tables/{id}/changer_statut/` | Changer statut table |
| GET | `/api/ingredients/alertes/` | Stocks en alerte |
| POST | `/api/codes-promo/valider/` | Valider un code promo |
| POST | `/api/facturation/encaisser/` | Encaisser une commande |

---

## 🎨 Design

- **Thème** : Dark mode élégant avec accent orange (#f97316)
- **Typographie** : Syne (titres) + DM Sans (corps)
- **Animations** : Fade-in, stagger, hover transitions
- **Responsive** : Grid CSS adaptatif

---

## 🗃️ Modèles de données SQLite

- **Employe** — Utilisateurs avec rôles
- **Categorie / Plat / Ingredient** — Menu & stocks
- **Table / Reservation** — Gestion de salle
- **Commande / CommandeItem** — Workflow commandes
- **CodePromo** — Fidélisation clients
- **Avis** — Commentaires clients
- **Facturation** — Encaissements

---

## 📦 Production

```bash
# Backend avec gunicorn
pip install gunicorn
gunicorn mangermanger.wsgi:application --bind 0.0.0.0:8000

# Frontend — servir le dossier dist/
npm run build
# puis servir dist/ avec nginx ou serve
npx serve dist
```

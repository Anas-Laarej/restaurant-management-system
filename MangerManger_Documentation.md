# MangerManger — Documentation Complète du Projet

> Système ERP de gestion de restaurant — Django 4 + React 19 + BERT Analyse de Sentiments

---

## Table des Matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture générale](#2-architecture-générale)
3. [Étapes de création du projet](#3-étapes-de-création-du-projet)
4. [Backend Django — fichiers et fonctions](#4-backend-django--fichiers-et-fonctions)
   - [mangermanger/settings.py](#41-mangermannersettingspy)
   - [mangermanger/urls.py](#42-mangermannnerurlspy)
   - [restaurant/models.py](#43-restaurantmodelspy)
   - [restaurant/sentiment.py](#44-restaurantsentimentpy)
   - [api/serializers.py](#45-apiserializerspy)
   - [api/views.py](#46-apiviewspy)
   - [api/urls.py](#47-apiurlspy)
   - [seed_data.py](#48-seed_datapy)
5. [Frontend React — fichiers et fonctions](#5-frontend-react--fichiers-et-fonctions)
   - [src/main.jsx](#51-srcmainjsx)
   - [src/App.jsx](#52-srcappjsx)
   - [src/api.js](#53-srcapijs)
   - [src/context/AuthContext.jsx](#54-srccontextauthcontextjsx)
   - [src/components/Layout.jsx](#55-srccomponentslayoutjsx)
   - [src/components/NotificationBell.jsx](#56-srccomponentsnotificationbelljsx)
   - [src/components/ClientNotificationBell.jsx](#57-srccomponentsclientnotificationbelljsx)
   - [Pages Staff](#58-pages-staff)
   - [Pages Client](#59-pages-client)
6. [Implémentation de l'Analyse de Sentiments BERT](#6-implémentation-de-lanalyse-de-sentiments-bert)
   - [Choix du modèle](#61-choix-du-modèle)
   - [Étapes d'intégration](#62-étapes-dintégration)
   - [Flux complet de soumission d'un avis](#63-flux-complet-de-soumission-dun-avis)
   - [Affichage dans l'interface](#64-affichage-dans-linterface)
7. [Flux métier principaux](#7-flux-métier-principaux)
8. [Référence complète des endpoints API](#8-référence-complète-des-endpoints-api)

---

## 1. Vue d'ensemble du projet

**MangerManger** est un ERP de gestion de restaurant complet comportant deux interfaces distinctes :

| Interface | Utilisateurs | Fonctionnalités principales |
|-----------|-------------|----------------------------|
| **Staff** | Gérant, Chef, Serveur, Caissier | Dashboard, commandes, cuisine, stock, réservations, personnel |
| **Client** | Clients publics | Site vitrine, réservation en ligne, commande en ligne, avis |

**Stack technique :**
- Backend : Python 3.10+, Django 4, Django REST Framework, SQLite3
- Frontend : React 19, React Router 7, Axios, Recharts, Vite
- IA : Transformers (HuggingFace), modèle BERT multilingue `nlptown/bert-base-multilingual-uncased-sentiment`

---

## 2. Architecture générale

```
pfa/
├── mangermanger/                  # Projet Django
│   ├── manage.py                  # Commande de gestion Django
│   ├── db.sqlite3                 # Base de données SQLite
│   ├── seed_data.py               # Script de peuplement initial
│   ├── mangermanger/              # Configuration Django
│   │   ├── settings.py            # Paramètres globaux
│   │   ├── urls.py                # Routeur principal
│   │   ├── asgi.py                # Serveur ASGI (déploiement async)
│   │   └── wsgi.py                # Serveur WSGI (déploiement sync)
│   ├── restaurant/                # App modèles + analyse sentiments
│   │   ├── models.py              # 16 modèles de la base de données
│   │   ├── sentiment.py           # Module BERT d'analyse de sentiments
│   │   ├── admin.py               # Interface admin Django
│   │   └── migrations/            # Fichiers de migration de la BDD
│   └── api/                       # App REST API
│       ├── views.py               # 35+ vues et ViewSets
│       ├── serializers.py         # Sérialiseurs DRF pour tous les modèles
│       ├── urls.py                # Routes de l'API REST
│       └── admin.py               # Enregistrements admin
└── mangermanger-front/            # Projet React (Vite)
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx               # Point d'entrée React
        ├── App.jsx                # Routeur + gardes d'authentification
        ├── api.js                 # Client Axios configuré
        ├── index.css              # Styles globaux + variables CSS
        ├── context/
        │   └── AuthContext.jsx    # État global d'authentification
        ├── components/
        │   ├── Layout.jsx         # Sidebar staff
        │   ├── NotificationBell.jsx
        │   └── ClientNotificationBell.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Commandes.jsx
            ├── Tables.jsx
            ├── Menu.jsx
            ├── Stock.jsx
            ├── Cuisine.jsx
            ├── Salle.jsx
            ├── Caisse.jsx
            ├── Avis.jsx
            ├── Reservations.jsx
            ├── Personnel.jsx
            ├── Promos.jsx
            ├── Profil.jsx
            └── client/
                ├── ClientLayout.jsx
                ├── ClientHome.jsx
                ├── ClientReserver.jsx
                ├── ClientCommander.jsx
                ├── ClientLogin.jsx
                ├── ClientRegister.jsx
                └── ClientCompte.jsx
```

---

## 3. Étapes de création du projet

### Étape 1 — Initialisation du projet Django

```bash
# Créer l'environnement virtuel
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac

# Installer les dépendances
pip install django djangorestframework django-cors-headers transformers torch

# Créer le projet Django
django-admin startproject mangermanger
cd mangermanger

# Créer les deux applications
python manage.py startapp restaurant
python manage.py startapp api
```

### Étape 2 — Configuration de Django (settings.py)

Ajouter dans `INSTALLED_APPS` :
```python
'rest_framework',
'rest_framework.authtoken',
'corsheaders',
'restaurant',
'api',
```

Configurer le middleware CORS, l'authentification par Token, le fuseau horaire (`Africa/Casablanca`) et la langue (`fr-fr`).

### Étape 3 — Modélisation de la base de données (restaurant/models.py)

Créer les 16 modèles dans l'ordre suivant (en respectant les dépendances FK) :
1. `Employe` (dépend de `User` Django)
2. `Categorie`
3. `Plat` (dépend de `Categorie`)
4. `Ingredient`
5. `PlatIngredient` (table de jointure Plat ↔ Ingredient)
6. `Table`
7. `Reservation` (dépend de `Table`)
8. `CodePromo`
9. `Commande` (dépend de `Table`, `User`, `CodePromo`)
10. `CommandeItem` (dépend de `Commande`, `Plat`)
11. `Avis` (dépend de `Plat`, `Commande`)
12. `Facturation` (dépend de `Commande`)
13. `ClientProfile` (dépend de `User`)
14. `CommandeClient` (dépend de `User`, `Table`, `Reservation`, `CodePromo`, `Commande`)
15. `CommandeClientItem` (dépend de `CommandeClient`, `Plat`)
16. `Notification` (dépend de `User`, `Reservation`, `Commande`)

```bash
python manage.py makemigrations
python manage.py migrate
```

### Étape 4 — Module d'analyse de sentiments (restaurant/sentiment.py)

Créer le fichier `restaurant/sentiment.py` avec le chargement paresseux du modèle BERT et les fonctions d'analyse (voir section 6 pour le détail complet).

### Étape 5 — Sérialiseurs DRF (api/serializers.py)

Créer un `ModelSerializer` pour chacun des 16 modèles. Configurer les champs imbriqués (`nested serializers`) pour les relations FK.

### Étape 6 — Vues et routes API (api/views.py + api/urls.py)

Créer les `ViewSet` pour chaque modèle + les vues fonctionnelles custom (`login_view`, `dashboard_stats`, `creer_employe`, etc.). Enregistrer les routes via `DefaultRouter`.

### Étape 7 — Données initiales (seed_data.py)

Créer et exécuter un script de peuplement pour avoir des données de démonstration :
```bash
python seed_data.py
```

### Étape 8 — Initialisation du projet React

```bash
# Depuis le dossier parent du projet Django
npm create vite@latest mangermanger-front -- --template react
cd mangermanger-front
npm install axios react-router-dom recharts
```

### Étape 9 — Configuration du client API (src/api.js)

Configurer Axios avec l'URL de base Django et un intercepteur qui injecte le token JWT dans chaque requête.

### Étape 10 — Contexte d'authentification (src/context/AuthContext.jsx)

Créer un contexte React global pour gérer l'état de connexion, persisté dans `localStorage`. Ajouter le hook `useNotifications` avec polling toutes les 15 secondes.

### Étape 11 — Routeur et gardes (src/App.jsx)

Définir les routes avec React Router et des composants de garde (`StaffRoute`, `ClientRoute`) qui redirigent les utilisateurs non autorisés.

### Étape 12 — Développement des pages

Développer les 14 pages staff et les 7 pages client avec leurs fonctionnalités respectives.

### Étape 13 — Build et déploiement du frontend

```bash
npm run build
# Copier le contenu de dist/ vers mangermanger/frontend/
```

### Étape 14 — Lancement du serveur

```bash
# Backend (port 8000)
python manage.py runserver

# Frontend en développement (port 5173)
npm run dev
```

---

## 4. Backend Django — fichiers et fonctions

### 4.1 `mangermanger/settings.py`

Fichier de configuration central du projet Django.

| Paramètre | Valeur | Rôle |
|-----------|--------|------|
| `INSTALLED_APPS` | liste des apps | Déclare `restaurant`, `api`, `rest_framework`, `corsheaders` |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | Autorise le frontend React sur localhost |
| `REST_FRAMEWORK` | dict | Configure `TokenAuthentication` comme méthode d'auth par défaut |
| `LANGUAGE_CODE` | `'fr-fr'` | Langue française pour les messages Django |
| `TIME_ZONE` | `'Africa/Casablanca'` | Fuseau horaire du Maroc |
| `AUTH_PASSWORD_VALIDATORS` | liste | Règles de validation des mots de passe |

---

### 4.2 `mangermanger/urls.py`

Routeur principal qui délègue toutes les routes `/api/` à `api/urls.py` et sert le frontend React pour toutes les autres routes.

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Route catch-all pour la SPA React
    re_path(r'^.*$', serve_react_app),
]
```

---

### 4.3 `restaurant/models.py`

Contient les 16 modèles de la base de données.

#### `Employe`
Étend le modèle `User` de Django via une relation `OneToOneField`.

| Champ | Type | Description |
|-------|------|-------------|
| `user` | OneToOneField(User) | Lien vers le compte Django |
| `role` | CharField (choices) | `gerant`, `chef`, `serveur`, `caissier` |
| `telephone` | CharField | Numéro de téléphone |
| `actif` | BooleanField | Si l'employé est actif |
| `date_embauche` | DateField(auto) | Date de création automatique |

**`__str__`** : Retourne `"Prénom Nom (Rôle)"`.

---

#### `Categorie`
Catégorie de plats (Tajines, Pizzas, Boissons, etc.).

| Champ | Type | Description |
|-------|------|-------------|
| `nom` | CharField | Nom de la catégorie |
| `ordre` | IntegerField | Ordre d'affichage dans le menu |

**Meta `ordering`** : Les catégories sont triées par `ordre` automatiquement.

---

#### `Plat`
Représente un plat du menu.

| Champ | Type | Description |
|-------|------|-------------|
| `nom` | CharField | Nom du plat |
| `description` | TextField | Description (facultative) |
| `prix` | DecimalField | Prix en DH |
| `categorie` | ForeignKey(Categorie) | Catégorie parente (SET_NULL si supprimée) |
| `disponible` | BooleanField | Visible sur le menu client |
| `image_url` | URLField | Lien vers l'image |
| `temps_preparation` | IntegerField | Durée en minutes |
| `created_at` | DateTimeField(auto) | Date de création |

---

#### `Ingredient`
Ingrédient du stock.

| Champ | Type | Description |
|-------|------|-------------|
| `nom` | CharField | Nom de l'ingrédient |
| `quantite_stock` | FloatField | Quantité actuelle en stock |
| `quantite_min` | FloatField | Seuil d'alerte |
| `unite` | CharField (choices) | `kg`, `g`, `L`, `ml`, `pcs`, `boite` |
| `plats` | ManyToManyField(Plat) | Via la table `PlatIngredient` |

**`@property en_alerte`** : Retourne `True` si `quantite_stock <= quantite_min`.

**`@property niveau_pct`** : Calcule le pourcentage de remplissage du stock (0–100) pour la barre de progression dans l'interface.

---

#### `PlatIngredient`
Table de jointure entre `Plat` et `Ingredient` (relation Many-to-Many explicite).

| Champ | Type | Description |
|-------|------|-------------|
| `plat` | ForeignKey(Plat) | Plat concerné |
| `ingredient` | ForeignKey(Ingredient) | Ingrédient utilisé |
| `quantite` | FloatField | Quantité nécessaire pour le plat |

---

#### `Table`
Table physique dans la salle du restaurant.

| Champ | Type | Description |
|-------|------|-------------|
| `numero` | IntegerField(unique) | Numéro de la table |
| `capacite` | IntegerField | Nombre de couverts |
| `statut` | CharField (choices) | `libre`, `occupee`, `reservee`, `fermee` |
| `zone` | CharField | Zone de la salle (ex. "Terrasse") |

---

#### `Reservation`
Réservation d'une table.

| Champ | Type | Description |
|-------|------|-------------|
| `table` | ForeignKey(Table) | Table réservée |
| `client_nom` | CharField | Nom du client |
| `client_email` | EmailField | Email pour les notifications |
| `client_tel` | CharField | Téléphone |
| `date_heure` | DateTimeField | Date et heure de la réservation |
| `nombre_personnes` | IntegerField | Nombre de couverts |
| `statut` | CharField (choices) | `confirmee`, `en_attente`, `annulee`, `terminee` |
| `notes` | TextField | Instructions spéciales |
| `created_at` | DateTimeField(auto) | Date de création |

---

#### `CodePromo`
Code de réduction applicable aux commandes.

| Champ | Type | Description |
|-------|------|-------------|
| `code` | CharField(unique) | Code alphanumérique |
| `reduction_pct` | IntegerField | Pourcentage de réduction (ex. 15) |
| `actif` | BooleanField | Si le code est utilisable |
| `date_expiration` | DateField(null) | Date limite |
| `utilisations_max` | IntegerField | Nombre maximum d'utilisations |
| `utilisations_count` | IntegerField | Nombre d'utilisations effectuées |

---

#### `Commande`
Commande côté staff (créée par le serveur ou automatiquement lors d'une commande en ligne).

| Champ | Type | Description |
|-------|------|-------------|
| `table` | ForeignKey(Table) | Table concernée |
| `serveur` | ForeignKey(User) | Employé qui a pris la commande (null si en ligne) |
| `statut` | CharField (choices) | `en_attente`, `en_preparation`, `pret`, `servi`, `paye`, `annulee` |
| `code_promo` | ForeignKey(CodePromo) | Code promo appliqué |
| `montant_total` | DecimalField | Total en DH |
| `notes` | TextField | Notes (ex. "[COMMANDE EN LIGNE]") |
| `created_at` / `updated_at` | DateTimeField(auto) | Horodatages |

**`calculer_total()`** : Recalcule le montant total en sommant les `sous_total` de chaque `CommandeItem`, applique la réduction du code promo si présent, et sauvegarde.

---

#### `CommandeItem`
Ligne d'une commande (un plat + quantité).

| Champ | Type | Description |
|-------|------|-------------|
| `commande` | ForeignKey(Commande) | Commande parente |
| `plat` | ForeignKey(Plat) | Plat commandé |
| `quantite` | IntegerField | Nombre d'exemplaires |
| `prix_unitaire` | DecimalField | Prix au moment de la commande |
| `statut` | CharField (choices) | `en_attente`, `en_preparation`, `pret`, `servi` |
| `notes` | TextField | Demandes spéciales |

**`@property sous_total`** : Retourne `quantite * prix_unitaire`.

---

#### `Avis`
Avis client avec résultats de l'analyse de sentiments BERT.

| Champ | Type | Description |
|-------|------|-------------|
| `client_nom` | CharField | Nom affiché |
| `plat` | ForeignKey(Plat) | Plat mentionné (facultatif) |
| `note` | IntegerField (1–5) | Note calculée par BERT |
| `commentaire` | TextField | Texte du client |
| `commande` | ForeignKey(Commande) | Commande associée (facultatif) |
| `created_at` | DateTimeField(auto) | Date de soumission |
| `valide` | BooleanField(null) | `None`=en attente, `True`=accepté, `False`=refusé |
| `sentiment` | CharField (choices) | `positif`, `neutre`, `negatif` — calculé par BERT |
| `sentiment_score` | FloatField | Confiance du modèle (0.0–1.0) |

---

#### `Facturation`
Facture générée par le caissier lors du paiement.

| Champ | Type | Description |
|-------|------|-------------|
| `commande` | OneToOneField(Commande) | Commande payée |
| `caissier` | ForeignKey(User) | Employé qui a encaissé |
| `montant_ttc` | DecimalField | Montant total TTC |
| `mode_paiement` | CharField (choices) | `especes`, `carte`, `virement` |
| `created_at` | DateTimeField(auto) | Horodatage |

---

#### `ClientProfile`
Profil étendu des clients (complète le `User` Django).

| Champ | Type | Description |
|-------|------|-------------|
| `user` | OneToOneField(User) | Compte Django lié |
| `telephone` | CharField | Numéro de téléphone |
| `date_naissance` | DateField(null) | Date de naissance |
| `points_fidelite` | IntegerField | Points gagnés sur les commandes |
| `created_at` | DateTimeField(auto) | Date d'inscription |

---

#### `CommandeClient`
Commande côté client (vue client d'une commande en ligne).

| Champ | Type | Description |
|-------|------|-------------|
| `client` | ForeignKey(User) | Client connecté |
| `table` | ForeignKey(Table) | Table indiquée |
| `reservation` | ForeignKey(Reservation) | Réservation liée (facultatif) |
| `commande_staff` | OneToOneField(Commande) | Miroir côté staff |
| `statut` | CharField (choices) | `en_attente`, `confirmee`, `en_preparation`, `prete`, `livree`, `annulee` |
| `montant_total` | DecimalField | Total de la commande |
| `code_promo` | ForeignKey(CodePromo) | Code promo appliqué |
| `notes` | TextField | Notes du client |

---

#### `CommandeClientItem`
Ligne d'une commande client.

| Champ | Type | Description |
|-------|------|-------------|
| `commande` | ForeignKey(CommandeClient) | Commande parente |
| `plat` | ForeignKey(Plat) | Plat commandé |
| `quantite` | IntegerField | Nombre d'exemplaires |
| `prix_unitaire` | DecimalField | Prix au moment de la commande |
| `notes` | TextField | Demandes spéciales |

**`@property sous_total`** : Retourne `quantite * prix_unitaire`.

---

#### `Notification`
Notification temps réel affichée dans la cloche.

| Champ | Type | Description |
|-------|------|-------------|
| `type` | CharField (choices) | `reservation`, `commande`, `commande_prete`, `reservation_confirmee`, `reservation_annulee` |
| `titre` | CharField | Titre court |
| `message` | TextField | Corps de la notification |
| `role_cible` | CharField (choices) | `all`, `gerant`, `chef`, `serveur`, `caissier`, `client` |
| `client_user` | ForeignKey(User) | Si destiné à un client précis |
| `reservation` | ForeignKey(Reservation) | Réservation concernée (facultatif) |
| `commande` | ForeignKey(Commande) | Commande concernée (facultatif) |
| `lue` | BooleanField | Marquée comme lue |
| `created_at` | DateTimeField(auto) | Horodatage |

---

### 4.4 `restaurant/sentiment.py`

Module dédié à l'analyse de sentiments via BERT. Voir la section 6 pour une explication approfondie.

#### `_pipeline` (variable globale)
Cache du pipeline BERT. Initialisé à `None`, chargé une seule fois lors du premier appel pour éviter de recharger le modèle à chaque analyse.

#### `_stars_to_label(label_str)`
Convertit le label brut du modèle BERT (ex. `"4 stars"`) en label français.

| Entrée | Sortie |
|--------|--------|
| `"1 stars"` ou `"2 stars"` | `'negatif'` |
| `"3 stars"` | `'neutre'` |
| `"4 stars"` ou `"5 stars"` | `'positif'` |

**Paramètre** : `label_str` — chaîne au format `"N stars"` retournée par HuggingFace.

**Retour** : `str` parmi `'positif'`, `'neutre'`, `'negatif'`.

---

#### `_get_pipeline()`
Charge et met en cache le pipeline BERT de manière paresseuse (lazy loading).

**Comportement** : Si `_pipeline` est `None`, importe `transformers.pipeline` et charge le modèle `nlptown/bert-base-multilingual-uncased-sentiment`. Retourne le pipeline (réutilisé pour tous les appels suivants).

**Pourquoi le lazy loading** : Le modèle BERT pèse ~600 Mo. Le charger au démarrage de Django ralentirait le serveur. Il n'est chargé que lors du premier avis soumis.

---

#### `analyser_sentiment(texte)`
Analyse de base retournant uniquement le label et le score.

**Paramètre** : `texte` — commentaire du client (str).

**Retour** : `tuple(label: str, score: float)`

**Comportement** :
1. Si le texte est vide → retourne `('neutre', 0.5)` par défaut.
2. Appelle `_get_pipeline()` pour récupérer le modèle.
3. Tronque le texte à 512 tokens (limite de BERT).
4. Appelle le pipeline et récupère `result['label']` et `result['score']`.
5. Convertit le label via `_stars_to_label()`.
6. En cas d'exception → retourne `('neutre', 0.5)` sans faire planter le serveur.

---

#### `analyser_sentiment_avec_etoiles(texte)`
Version enrichie retournant aussi la note étoiles (1–5) calculée par BERT.

**Paramètre** : `texte` — commentaire du client (str).

**Retour** : `tuple(label: str, score: float, note: int)`

**Comportement** : Identique à `analyser_sentiment()` mais extrait aussi le chiffre de `result['label']` pour le retourner comme note (1–5). C'est BERT qui décide de la note, pas le client.

**C'est cette fonction qui est utilisée dans `AvisViewSet.perform_create`.**

---

### 4.5 `api/serializers.py`

Un `ModelSerializer` DRF est défini pour chacun des 16 modèles. Voici les patterns importants :

#### `UserSerializer`
Sérialise le modèle `User` Django (id, username, first_name, last_name, email).

#### `EmployeSerializer`
Imbrique `UserSerializer` en lecture seule (`read_only=True`) pour afficher les informations complètes de l'employé sans avoir à faire une deuxième requête.

#### `IngredientSerializer`
Expose les `@property` Django via `serializers.ReadOnlyField()` :
- `en_alerte = serializers.ReadOnlyField()` — expose `Ingredient.en_alerte`
- `niveau_pct = serializers.ReadOnlyField()` — expose `Ingredient.niveau_pct`

#### `CommandeSerializer`
Imbrique `CommandeItemSerializer(many=True, read_only=True, source='items')` pour retourner tous les articles de la commande en un seul appel API.

#### `AvisSerializer`
Sérialise tous les champs d'un avis incluant `sentiment`, `sentiment_score` et `note` calculés par BERT.

#### `CommandeClientSerializer`
Imbrique `CommandeClientItemSerializer(many=True, read_only=True, source='items')` et expose les données du client connecté.

#### `NotificationSerializer`
Sérialise toutes les notifications avec leur type, titre, message, rôle cible et état de lecture.

---

### 4.6 `api/views.py`

#### `login_view(request)` — `POST /api/login/`
Authentifie un utilisateur et retourne son token.

**Étapes** :
1. Récupère `username` et `password` du corps de la requête.
2. Appelle `authenticate()` de Django.
3. Crée ou récupère un `Token` DRF pour l'utilisateur.
4. Détermine le rôle : staff (via `Employe.role`), admin (superuser), ou `'client'` (par défaut).
5. Retourne `{token, user, role}`.

---

#### `dashboard_stats(request)` — `GET /api/dashboard/`
Calcule et retourne toutes les statistiques du tableau de bord.

**Données calculées** :
- `ca_jour` : Chiffre d'affaires du jour (commandes avec statut `paye`).
- `delta_ca` : Variation en % par rapport à la veille.
- `commandes_count` : Nombre de commandes du jour.
- `tables_occupees` / `tables_total` : Taux d'occupation.
- `note_moyenne` : Moyenne des notes des avis validés.
- `stocks_alerte` : Nombre d'ingrédients sous le seuil minimum.
- `top_plats` : Top 5 des plats commandés aujourd'hui (agrégation `Sum('quantite')`).
- `ca_semaine` : Chiffre d'affaires des 7 derniers jours (liste de `{jour, ca}`).

---

#### `PlatViewSet`
CRUD complet pour les plats.

**`get_permissions()`** : Les actions `list` et `retrieve` sont publiques (`AllowAny`). Les modifications nécessitent `IsAuthenticated`.

**`get_queryset()`** : Filtre optionnel par `?categorie=<id>` et `?disponible=true/false` via les query params.

---

#### `CategorieViewSet`
CRUD pour les catégories. Même logique de permissions que `PlatViewSet`.

---

#### `IngredientViewSet`
CRUD pour les ingrédients.

**`alertes(request)`** — `GET /api/ingredients/alertes/` : Retourne uniquement les ingrédients dont `quantite_stock <= quantite_min` (utilise `F()` de Django pour une comparaison de champs).

---

#### `TableViewSet`
CRUD pour les tables.

**`changer_statut(request, pk)`** — `PATCH /api/tables/{id}/changer_statut/` : Met à jour le statut d'une table et retourne l'objet mis à jour.

---

#### `ReservationViewSet`
CRUD pour les réservations.

**`annuler(request, pk)`** — `PATCH /api/reservations/{id}/annuler/` : Passe le statut à `'annulee'`.

---

#### `CommandeViewSet`
CRUD pour les commandes staff.

**`get_queryset()`** : Filtre par `?statut=<statut>` et `?table=<id>`. Tri par `created_at` décroissant.

**`changer_statut(request, pk)`** — `PATCH /api/commandes/{id}/changer_statut/` :
1. Met à jour `statut` de la commande.
2. Si statut = `paye` ou `annulee` : libère la table (`statut = 'libre'`).
3. Si statut = `pret` : crée deux notifications (pour `serveur` et `gerant`).
4. Synchronise le statut de la `CommandeClient` liée via le mapping `statut_map`.

**`nouvelle(request)`** — `POST /api/commandes/nouvelle/` :
1. Récupère la table et le code promo.
2. Crée la `Commande` avec statut `en_preparation`.
3. Crée les `CommandeItem` pour chaque plat.
4. Calcule le total avec réduction promo.
5. Passe la table en `occupee`.

---

#### `CommandeItemViewSet`
CRUD pour les articles de commande.

**`marquer_pret(request, pk)`** — `PATCH /api/commande-items/{id}/marquer_pret/` :
1. Passe l'item en statut `pret`.
2. Vérifie si **tous** les items de la commande sont `pret`.
3. Si oui → passe la commande entière en `pret` et crée des notifications.

---

#### `AvisViewSet`
CRUD pour les avis clients. C'est ici que s'intègre l'analyse BERT.

**`get_permissions()`** : `create`, `list`, `retrieve` sont publics. Les actions de modération nécessitent `IsAuthenticated`.

**`get_queryset()`** :
- Si gérant → voit tous les avis.
- Sinon → voit uniquement les avis `valide=True`.

**`perform_create(serializer)`** :
1. Sauvegarde l'avis avec `valide=None`, `note=3` (valeurs provisoires).
2. Lance un **thread daemon** en arrière-plan.
3. Le thread appelle `analyser_sentiment_avec_etoiles(instance.commentaire)`.
4. Met à jour `sentiment`, `sentiment_score`, `note` via `save(update_fields=[...])`.

**`accepter(request, pk)`** — `POST /api/avis/{id}/accepter/` : Passe `valide = True`.

**`refuser(request, pk)`** — `POST /api/avis/{id}/refuser/` : Passe `valide = False`.

**`stats_sentiment(request)`** — `GET /api/avis/stats_sentiment/` :
Retourne la distribution des sentiments (`positif`/`neutre`/`negatif`) et le score moyen pour tous les avis validés.

---

#### `_is_gerant(user)` (fonction utilitaire)
Vérifie si un utilisateur est un gérant. Retourne `True` si `user.employe.role == 'gerant'`.

---

#### `EmployeViewSet`
CRUD pour les employés.

**`get_queryset()`** : Un non-gérant ne voit que son propre profil.

**`destroy(request, *args, **kwargs)`** : Réservé au gérant. Supprime l'employé ET son compte `User` associé.

**`modifier(request, pk)`** — `PATCH /api/employes/{id}/modifier/` : Réservé au gérant. Met à jour `role`, `telephone`, `actif` de l'employé et `first_name`, `last_name` du User associé.

---

#### `creer_employe(request)` — `POST /api/employes/creer/`
Réservé au gérant. Valide les champs obligatoires (username, password ≥ 6 chars, prénom), vérifie l'unicité du username, crée le `User` Django et le profil `Employe`.

---

#### `CodePromoViewSet`
CRUD pour les codes promo.

**`valider(request)`** — `POST /api/codes-promo/valider/` : Vérifie qu'un code existe et est `actif`. Retourne `{valide: true, reduction: X}` ou `{valide: false}`.

---

#### `FacturationViewSet`
CRUD pour les factures.

**`encaisser(request)`** — `POST /api/facturation/encaisser/` :
1. Crée la `Facturation` avec le caissier et le mode de paiement.
2. Passe la commande en statut `paye`.
3. Libère la table (`statut = 'libre'`).

---

#### `register_client(request)` — `POST /api/register/`
Inscription d'un nouveau client.

**Validations** :
- Username : minimum 3 caractères, uniquement `[a-zA-Z0-9_.-]`, pas d'espaces, unicité.
- Email : format valide, unicité.
- Prénom obligatoire.
- Mot de passe minimum 6 caractères.

**Actions** : Crée `User`, `ClientProfile`, génère un `Token`. Retourne `{token, user, role: 'client'}`.

---

#### `_update_user_fields(user, data)`
Fonction utilitaire qui met à jour `first_name`, `last_name`, `email` d'un User à partir d'un dict.

---

#### `mon_profil_client(request)` — `GET|PATCH /api/mon-profil/`
Retourne ou met à jour le profil du client connecté (informations User + téléphone + date_naissance).

---

#### `changer_mot_de_passe_client(request)` — `POST /api/changer-mot-de-passe/`
1. Vérifie l'ancien mot de passe.
2. Valide la longueur du nouveau.
3. Change le mot de passe, invalide l'ancien token, génère un nouveau token.

---

#### `mon_profil_employe(request)` — `GET|PATCH /api/mon-profil-employe/`
Retourne ou met à jour le profil de l'employé connecté.

---

#### `CommandeClientViewSet`
CRUD pour les commandes client.

**`get_queryset()`** : Filtre par `client = request.user` — un client ne voit que ses propres commandes.

**`annuler(request, pk)`** — `POST /api/commandes-client/{id}/annuler/` :
1. Vérifie que le statut est `en_attente` ou `en_preparation`.
2. Annule la `CommandeClient`.
3. Annule également la `Commande` staff liée si elle existe.
4. Libère la table.

**`passer(request)`** — `POST /api/commandes-client/passer/` :
1. Valide que le panier n'est pas vide et qu'un numéro de table est fourni.
2. Valide le code promo s'il est fourni.
3. Vérifie que la table existe et n'est pas fermée.
4. Crée la `Commande` staff avec note `"[COMMANDE EN LIGNE - Nom]"`.
5. Crée les `CommandeItem` pour chaque plat.
6. Calcule le total avec réduction promo.
7. Passe la table en `occupee`.
8. Crée la `CommandeClient` et les `CommandeClientItem`.
9. Ajoute des points fidélité (`total / 10` arrondi).
10. Envoie une notification au serveur.
11. Retourne les données avec `commande_staff_id` et `table_numero`.

---

#### `tables_disponibles(request)` — `GET /api/tables-disponibles/`
Retourne les tables disponibles pour une date/heure et un nombre de personnes donnés.

**Logique** : Si `date_heure` est fourni, exclut les tables ayant une réservation dans une fenêtre de ±2 heures. Sinon retourne les tables avec statut `libre` et capacité suffisante.

---

#### `reserver_client(request)` — `POST /api/reserver/`
Crée une réservation.

**Logique** :
1. Vérifie la table (capacité, statut non fermé).
2. Vérifie qu'il n'y a pas de conflit de créneau (fenêtre ±2h).
3. Détermine le statut initial : `confirmee` si créé par un staff, `en_attente` si créé par un client.
4. Crée la `Reservation`, passe la table en `reservee`.
5. Envoie notifications au gérant et au serveur.

---

#### `mes_reservations_client(request)` — `GET /api/mes-reservations/`
Retourne les réservations du client connecté, filtrées par son adresse email.

---

#### `annuler_reservation_client(request, pk)` — `POST /api/annuler-reservation/{id}/`
Annule la réservation du client (vérifie que l'email correspond) et libère la table.

---

#### `confirmer_reservation(request, pk)` — `PATCH /api/reservations/{id}/confirmer/`
Permet au gérant de confirmer ou d'annuler une réservation en attente. Envoie une notification de type `reservation_confirmee` ou `reservation_annulee` au client.

---

#### `creer_notification(type_, titre, message, role_cible, ...)` (fonction utilitaire)
Helper pour créer facilement une `Notification` en base de données depuis n'importe quelle vue.

---

#### `_notif_qs_pour_role(role, user, base_qs)` (fonction utilitaire)
Filtre un queryset de notifications selon le rôle :
- `client` → uniquement `role_cible='client'` ET `client_user=user`.
- Staff → `role_cible=role` OU `role_cible='all'`, en excluant les notifications client.

---

#### `NotificationViewSet`
CRUD pour les notifications.

**`_get_role()`** : Détermine le rôle du user connecté (employé ou client).

**`get_queryset()`** : Retourne les 50 dernières notifications filtrées par rôle.

**`non_lues(request)`** — `GET /api/notifications/non_lues/` : Retourne le compteur de non-lues et les 15 dernières notifications.

**`marquer_lues(request)`** — `POST /api/notifications/marquer_lues/` : Passe toutes les notifications non lues du rôle courant en `lue=True`.

**`supprimer_toutes(request)`** — `DELETE /api/notifications/supprimer_toutes/` : Supprime toutes les notifications du rôle courant.

---

### 4.7 `api/urls.py`

Définit toutes les routes de l'API REST.

```python
router = DefaultRouter()
router.register('plats', PlatViewSet)
router.register('categories', CategorieViewSet)
router.register('ingredients', IngredientViewSet)
router.register('tables', TableViewSet)
router.register('reservations', ReservationViewSet)
router.register('commandes', CommandeViewSet)
router.register('commande-items', CommandeItemViewSet)
router.register('avis', AvisViewSet, basename='avis')
router.register('employes', EmployeViewSet)
router.register('codes-promo', CodePromoViewSet)
router.register('facturation', FacturationViewSet)
router.register('commandes-client', CommandeClientViewSet, basename='commandes-client')
router.register('notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view),
    path('register/', register_client),
    path('dashboard/', dashboard_stats),
    path('employes/creer/', creer_employe),
    path('mon-profil/', mon_profil_client),
    path('mon-profil-employe/', mon_profil_employe),
    path('changer-mot-de-passe/', changer_mot_de_passe_client),
    path('tables-disponibles/', tables_disponibles),
    path('reserver/', reserver_client),
    path('mes-reservations/', mes_reservations_client),
    path('annuler-reservation/<int:pk>/', annuler_reservation_client),
    path('reservations/<int:pk>/confirmer/', confirmer_reservation),
]
```

---

### 4.8 `seed_data.py`

Script Python à exécuter une seule fois pour peupler la base de données avec des données de démonstration.

**Contenu** :
- Création des catégories (Tajines, Couscous, Grillades, Pizzas, Sushis, Burgers, Pâtes, Desserts, Boissons, Salades…)
- Création des plats pour chaque catégorie avec images, prix et temps de préparation
- Création des ingrédients avec stocks et seuils d'alerte
- Création des tables (numérotées de 1 à 20, différentes capacités et zones)
- Création du compte gérant (`admin`/`admin123`)
- Création de comptes pour chef, serveur et caissier
- Création de quelques réservations et commandes de démonstration
- Création de quelques avis

```bash
python seed_data.py
```

---

## 5. Frontend React — fichiers et fonctions

### 5.1 `src/main.jsx`

Point d'entrée de l'application React. Monte le composant `<App />` dans le DOM, enveloppé par `<AuthProvider>` pour rendre le contexte d'authentification disponible globalement.

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
```

---

### 5.2 `src/App.jsx`

Définit l'arborescence des routes et les composants de garde.

#### `StaffRoute({ children })`
Composant de garde pour les pages staff. Vérifie que l'utilisateur est connecté et possède un rôle staff (`gerant`, `chef`, `serveur`, `caissier`). Sinon redirige vers `/login`. Enveloppe les enfants dans `<Layout>`.

#### `ClientRoute({ children })`
Composant de garde pour les pages client. Vérifie que l'utilisateur est connecté. Sinon redirige vers `/login`. Enveloppe les enfants dans `<ClientLayout>`.

**Routes définies** :
| Route | Composant | Guard |
|-------|-----------|-------|
| `/login` | `Login` | Aucun |
| `/register` | `ClientRegister` | Aucun |
| `/` | `ClientHome` | Aucun |
| `/reserver` | `ClientReserver` | Aucun |
| `/commander` | `ClientCommander` | Aucun |
| `/mon-compte` | `ClientCompte` | `ClientRoute` |
| `/dashboard` | `Dashboard` | `StaffRoute` (gerant) |
| `/commandes` | `Commandes` | `StaffRoute` |
| `/tables` | `Tables` | `StaffRoute` |
| `/menu` | `Menu` | `StaffRoute` |
| `/stock` | `Stock` | `StaffRoute` |
| `/cuisine` | `Cuisine` | `StaffRoute` (chef) |
| `/salle` | `Salle` | `StaffRoute` (serveur) |
| `/caisse` | `Caisse` | `StaffRoute` (caissier) |
| `/avis` | `Avis` | `StaffRoute` (gerant) |
| `/reservations` | `Reservations` | `StaffRoute` (gerant) |
| `/personnel` | `Personnel` | `StaffRoute` (gerant) |
| `/promos` | `Promos` | `StaffRoute` (gerant) |
| `/profil` | `Profil` | `StaffRoute` |

---

### 5.3 `src/api.js`

Configure le client HTTP Axios.

```javascript
const API = axios.create({ baseURL: 'http://localhost:8000/api' })

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Token ${token}`
  return cfg
})
```

**Intercepteur** : Avant chaque requête, lit le token depuis `localStorage` et l'injecte dans l'en-tête `Authorization: Token <token>`. Ainsi, toutes les requêtes vers l'API sont automatiquement authentifiées sans avoir à passer le token manuellement.

---

### 5.4 `src/context/AuthContext.jsx`

Gestion globale de l'état d'authentification.

#### `AuthProvider({ children })`
Fournisseur du contexte. Restaure la session depuis `localStorage` au montage.

**État** :
- `user` — objet utilisateur Django
- `role` — `'gerant'`, `'chef'`, `'serveur'`, `'caissier'`, `'client'`
- `loading` — `true` pendant la restauration de session

**`login(username, password)`** : Appelle `POST /api/login/`, stocke token/user/role dans `localStorage`, met à jour l'état.

**`logout()`** : Vide `localStorage`, remet `user` et `role` à `null`.

#### `useAuth()`
Hook personnalisé pour consommer le contexte d'authentification depuis n'importe quel composant.

#### `useNotifications()`
Hook personnalisé qui poll l'API toutes les **15 secondes** pour récupérer les notifications.

**Comportement** :
- Lance une première requête `GET /api/notifications/` au montage.
- Démarre un intervalle de 15 secondes.
- Nettoie l'intervalle au démontage (via `return () => clearInterval(t)`).

---

### 5.5 `src/components/Layout.jsx`

Sidebar de navigation pour l'interface staff.

**Fonctionnalités** :
- Repliable (64px réduit / 220px développé), basculement via bouton.
- Navigation adaptée au rôle (le chef ne voit que `/cuisine`, le serveur ne voit que `/salle`, etc.).
- Avatar avec initiales et étiquette de rôle.
- Cloche de notifications.
- Bouton de déconnexion.

---

### 5.6 `src/components/NotificationBell.jsx`

Cloche de notifications pour les employés staff.

**Comportement** :
- Affiche un badge rouge avec le compteur de notifications non lues.
- Au clic, ouvre un dropdown avec les 15 dernières notifications.
- Bouton "Tout marquer comme lu" → `POST /api/notifications/marquer_lues/`.
- Polling intégré toutes les 15 secondes via `useNotifications()`.

---

### 5.7 `src/components/ClientNotificationBell.jsx`

Version client de la cloche de notifications. Même comportement mais filtrée pour `role_cible='client'` côté backend.

---

### 5.8 Pages Staff

#### `Login.jsx`
Formulaire de connexion staff. Appelle `login()` depuis `AuthContext`, puis redirige vers la page appropriée selon le rôle (`/dashboard`, `/cuisine`, `/salle`, `/caisse`).

---

#### `Dashboard.jsx`
Tableau de bord du gérant.

**Données** : `GET /api/dashboard/`, `GET /api/commandes/`, `GET /api/ingredients/alertes/`.

**Composant `StatCard({ titre, valeur, icon, couleur, delta })`** : Carte réutilisable affichant une statistique clé avec variation optionnelle.

**Affichages** :
- 4 `StatCard` : CA du jour, nombre de commandes, taux d'occupation des tables, note moyenne.
- Graphique de surface (`AreaChart` Recharts) : CA des 7 derniers jours.
- Top 5 des plats commandés aujourd'hui.
- Tableau des dernières commandes.
- Alertes de stock avec barres de progression.

---

#### `Commandes.jsx`
Gestion des commandes en temps réel (rafraîchissement toutes les 10 secondes).

**Fonctions** :
- `fetchCommandes()` : `GET /api/commandes/?statut=<filtre>`.
- `changerStatut(id, statut)` : `PATCH /api/commandes/{id}/changer_statut/`.

**Filtres** : En attente, En préparation, Prêt, Servi, Payé, Annulée.
**Actions** : Accepter, Refuser, Marquer servi — selon le statut actuel et le rôle.
**Badge EN LIGNE** : Détecte `[COMMANDE EN LIGNE]` dans les notes.

---

#### `Tables.jsx`
Plan de salle avec grille de tables colorées.

**Fonctions** :
- `fetchTables()` : `GET /api/tables/`.
- `changerStatut(id, statut)` : `PATCH /api/tables/{id}/changer_statut/`.

**Couleurs** : Vert (libre), Orange (occupée), Bleu (réservée), Gris (fermée).

---

#### `Menu.jsx`
Gestion complète du menu (CRUD plats + filtres catégorie).

**Fonctions** :
- `fetchPlats()` : `GET /api/plats/` et `GET /api/categories/`.
- `handleSave()` : `POST` (création) ou `PATCH` (édition) `/api/plats/{id}/`.
- `handleToggleDisponible(plat)` : `PATCH /api/plats/{id}/` pour basculer `disponible`.
- `handleDelete(id)` : `DELETE /api/plats/{id}/`.

---

#### `Stock.jsx`
Gestion du stock d'ingrédients.

**Fonctions** :
- `fetchIngredients()` : `GET /api/ingredients/`.
- `handleSave()` : `PATCH /api/ingredients/{id}/` pour mettre à jour les quantités.

**Barre de progression** : Calculée avec `niveau_pct` retourné par l'API.

---

#### `Cuisine.jsx`
Interface dédiée au chef cuisinier.

**Données** : `GET /api/commandes/?statut=en_preparation` — rafraîchissement toutes les 10 secondes.

**Fonction** :
- `marquerPret(itemId)` : `PATCH /api/commande-items/{id}/marquer_pret/`.

**Affichage** : Cartes par commande avec timer (temps écoulé), articles avec quantités, bouton "Prêt" par article.

---

#### `Salle.jsx`
Interface du serveur avec deux onglets.

**Onglet 1 — Nouvelle commande** :
- `fetchTables()` : Récupère les tables libres/réservées.
- `fetchMenu()` : Récupère plats + catégories disponibles.
- `soumettreCommande()` : `POST /api/commandes/nouvelle/`.

**Onglet 2 — Réservations** :
- `fetchReservations()` : `GET /api/reservations/`.
- `creerReservation()` : `POST /api/reserver/`.
- `confirmerResa(id, statut)` : `PATCH /api/reservations/{id}/confirmer/`.

---

#### `Caisse.jsx`
Interface du caissier pour encaisser les commandes.

**Données** : `GET /api/commandes/?statut=servi`.

**Fonction** :
- `encaisser(commandeId, mode)` : `POST /api/facturation/encaisser/`.

**Modes de paiement** : Espèces, Carte, Virement.

---

#### `Avis.jsx`
Modération des avis avec visualisation de l'analyse de sentiments.

**Fonctions** :
- `fetchAvis()` : `GET /api/avis/` (le gérant voit tous les avis).
- `fetchStats()` : `GET /api/avis/stats_sentiment/`.
- `accepter(id)` : `POST /api/avis/{id}/accepter/`.
- `refuser(id)` : `POST /api/avis/{id}/refuser/`.
- `supprimer(id)` : `DELETE /api/avis/{id}/`.

**Onglets** : En attente, Acceptés, Refusés.
**Badges sentiment** : Vert (positif), Gris (neutre), Rouge (négatif) avec score de confiance.
**Panneau stats** : Barres de distribution positif/neutre/négatif.

---

#### `Reservations.jsx`
Vue complète des réservations pour le gérant.

**Fonctions** :
- `fetchAll()` : Récupère tables et réservations.
- `creerReservation()` : `POST /api/reserver/`.
- `confirmer(id, statut)` : `PATCH /api/reservations/{id}/confirmer/`.

**Affichage** : Plan de salle + tableau filtrable.

---

#### `Personnel.jsx`
Gestion des employés (gérant uniquement).

**Fonctions** :
- `fetchEmployes()` : `GET /api/employes/`.
- `creerEmploye()` : `POST /api/employes/creer/`.
- `modifierEmploye(id)` : `PATCH /api/employes/{id}/modifier/`.
- `supprimerEmploye(id)` : `DELETE /api/employes/{id}/`.

---

#### `Promos.jsx`
Gestion des codes promotionnels.

**Fonctions** :
- `fetchPromos()` : `GET /api/codes-promo/`.
- `handleSave()` : `POST` (création) ou `PATCH` (édition) `/api/codes-promo/{id}/`.
- `handleDelete(id)` : `DELETE /api/codes-promo/{id}/`.

---

#### `Profil.jsx`
Page de profil de l'employé connecté.

**Fonctions** :
- `fetchProfil()` : `GET /api/mon-profil-employe/`.
- `handleSave()` : `PATCH /api/mon-profil-employe/` (avec changement de mot de passe optionnel).

---

### 5.9 Pages Client

#### `ClientLayout.jsx`
Barre de navigation du site client.

**Contenu** : Logo, liens (Accueil, Réserver, Commander, Mon compte), cloche de notifications client, bouton connexion/déconnexion.

---

#### `ClientHome.jsx`
Page d'accueil du restaurant.

**Sections** :
- **Hero** : Diaporama automatique (3.5s) avec 3 slides, statistiques, CTAs.
- **Marquee** : Texte défilant des spécialités.
- **Stats** : Catégories, plats, note, année de création.
- **Catégories** : Grille des catégories avec images et hover.
- **Plats vedettes** : Scroll horizontal des plats populaires.
- **À propos** : Description du restaurant + 3 atouts.
- **Avis clients** : `GET /api/avis/` (avis validés uniquement).
- **Formulaire d'avis** (si connecté) : Textarea + sélection de plat + submit → `POST /api/avis/`.
- **CTA final** : Bannière d'appel à l'action.

**`fetchData()`** : Récupère plats, catégories et avis validés en parallèle.

**`soumettreAvis()`** : Soumet le commentaire, attend que BERT analyse en arrière-plan.

---

#### `ClientReserver.jsx`
Assistant de réservation en 3 étapes.

**Étape 1 — Date/Heure/Personnes** :
- Date minimum : aujourd'hui.
- Créneaux horaires prédéfinis (midi et soir).
- Nombre de personnes : boutons 1–8.

**Étape 2 — Sélection de table** :
- `fetchTables()` : `GET /api/tables-disponibles/?date_heure=X&nombre_personnes=Y`.
- Affiche les tables disponibles en grille.

**Étape 3 — Confirmation** :
- `confirmerReservation()` : `POST /api/reserver/`.

**Succès** :
- Affiche le numéro de confirmation.
- **`telechargerPDF()`** : Génère un PDF de confirmation avec les détails via manipulation DOM (CSS print).

---

#### `ClientCommander.jsx`
Interface de commande en ligne avec panier.

**`fetchMenu()`** : `GET /api/plats/?disponible=true` et `GET /api/categories/`.

**Panier** :
- `addToCart(plat)` / `removeFromCart(platId)` / `updateQty(platId, delta)` : Gestion locale du panier via `useState`.
- `validerCodePromo()` : `POST /api/codes-promo/valider/`.
- `soumettreCommande()` : `POST /api/commandes-client/passer/`.

**Filtres** : Recherche textuelle + filtres par catégorie avec compteurs.

**Succès** : Affiche le récapitulatif de commande avec détails et total.

---

#### `ClientLogin.jsx`
Formulaire de connexion client. Redirige vers `/login` (page Login staff/client partagée).

---

#### `ClientRegister.jsx`
Formulaire d'inscription client.

**`handleRegister()`** : `POST /api/register/` → connexion automatique après inscription réussie.

**Validations côté front** : Longueur username, correspondance mots de passe, email.

---

#### `ClientCompte.jsx`
Tableau de bord du compte client.

**Onglets** :
- **Profil** : `GET|PATCH /api/mon-profil/`, changement de mot de passe.
- **Réservations** : `GET /api/mes-reservations/`, annulation via `POST /api/annuler-reservation/{id}/`.
- **Commandes** : `GET /api/commandes-client/`, annulation via `POST /api/commandes-client/{id}/annuler/`.

**Points fidélité** : Affichage du solde.

---

## 6. Implémentation de l'Analyse de Sentiments BERT

### 6.1 Choix du modèle

Le modèle utilisé est **`nlptown/bert-base-multilingual-uncased-sentiment`** disponible sur HuggingFace.

**Pourquoi ce modèle ?**
- **Multilingue** : Entraîné sur des avis en français, anglais, allemand, espagnol, italien, néerlandais.
- **Adapté aux avis** : Entraîné spécifiquement sur des avis en ligne (Amazon, Yelp, TripAdvisor…).
- **Sortie en étoiles** : Retourne directement une note de 1 à 5 étoiles, parfaite pour un restaurant.
- **Facilité d'intégration** : Disponible directement via `transformers.pipeline`.

**Format de sortie brut du modèle** :
```python
[{'label': '4 stars', 'score': 0.7823}]
```

---

### 6.2 Étapes d'intégration

#### Étape 1 — Installation des dépendances
```bash
pip install transformers torch
# ou pour CPU uniquement (plus léger) :
pip install transformers torch --index-url https://download.pytorch.org/whl/cpu
```

#### Étape 2 — Création du module `restaurant/sentiment.py`
Ce fichier isole toute la logique BERT du reste du projet.

```python
_pipeline = None  # Cache du modèle (lazy loading)

def _stars_to_label(label_str):
    """Convertit "N stars" en label français."""
    stars = int(label_str.split()[0])
    if stars <= 2: return 'negatif'
    if stars == 3: return 'neutre'
    return 'positif'

def _get_pipeline():
    """Charge le modèle une seule fois."""
    global _pipeline
    if _pipeline is None:
        from transformers import pipeline as hf_pipeline
        _pipeline = hf_pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
        )
    return _pipeline

def analyser_sentiment_avec_etoiles(texte):
    """Retourne (label, score, note) pour un commentaire."""
    if not texte or not texte.strip():
        return 'neutre', 0.5, 3
    try:
        pipe = _get_pipeline()
        result = pipe(texte[:512])[0]  # Limite BERT : 512 tokens
        note = int(result['label'].split()[0])
        label = _stars_to_label(result['label'])
        return label, round(float(result['score']), 4), note
    except Exception:
        return 'neutre', 0.5, 3  # Fallback silencieux
```

#### Étape 3 — Ajout des champs BERT au modèle `Avis`
Dans `restaurant/models.py`, ajouter les champs qui vont stocker les résultats BERT :

```python
class Avis(models.Model):
    SENTIMENTS = [('positif', 'Positif'), ('neutre', 'Neutre'), ('negatif', 'Négatif')]
    # ...champs existants...
    note = models.IntegerField(null=True, blank=True)          # Note 1-5 calculée par BERT
    sentiment = models.CharField(max_length=10, choices=SENTIMENTS, null=True, blank=True)
    sentiment_score = models.FloatField(null=True, blank=True)  # Confiance 0.0-1.0
```

```bash
python manage.py makemigrations
python manage.py migrate
```

#### Étape 4 — Intégration dans `AvisViewSet.perform_create` (api/views.py)
L'analyse se fait en **thread daemon** pour ne pas bloquer la réponse HTTP :

```python
def perform_create(self, serializer):
    import threading
    # Sauvegarder d'abord avec des valeurs provisoires
    instance = serializer.save(valide=None, sentiment=None, sentiment_score=None, note=3)

    def analyse_bg():
        try:
            from restaurant.sentiment import analyser_sentiment_avec_etoiles
            label, score, note = analyser_sentiment_avec_etoiles(instance.commentaire)
            instance.sentiment = label
            instance.sentiment_score = score
            instance.note = note
            instance.save(update_fields=['sentiment', 'sentiment_score', 'note'])
        except Exception:
            pass  # Ne jamais faire planter la sauvegarde

    threading.Thread(target=analyse_bg, daemon=True).start()
```

**Pourquoi un thread ?** Le modèle BERT peut prendre 2–5 secondes à analyser un texte (surtout lors du premier appel avec chargement du modèle). Utiliser un thread daemon permet de retourner immédiatement une réponse `201 Created` au client pendant que l'analyse se fait en arrière-plan.

#### Étape 5 — Endpoint de statistiques (`stats_sentiment`)
```python
@action(detail=False, methods=['get'])
def stats_sentiment(self, request):
    qs = Avis.objects.filter(valide=True, sentiment__isnull=False)
    distribution = qs.values('sentiment').annotate(count=Count('id')).order_by('sentiment')
    avg_score = qs.aggregate(avg=Avg('sentiment_score'))['avg']
    return Response({
        'distribution': list(distribution),
        'score_moyen': round(avg_score, 4) if avg_score else None,
        'total': qs.count(),
    })
```

---

### 6.3 Flux complet de soumission d'un avis

```
Client tape un commentaire
        │
        ▼
POST /api/avis/  (commentaire, client_nom, plat optionnel)
        │
        ▼
AvisViewSet.perform_create()
        │
        ├─► Sauvegarde Avis (note=3, sentiment=None) → réponse 201 au client
        │
        └─► Thread daemon démarré
                │
                ▼
        _get_pipeline() — charge BERT si pas déjà chargé
                │
                ▼
        pipe(texte[:512]) → {'label': '4 stars', 'score': 0.7823}
                │
                ▼
        _stars_to_label('4 stars') → 'positif'
                │
                ▼
        instance.save(update_fields=['sentiment', 'sentiment_score', 'note'])
                │
                ▼
        Gérant voit l'avis avec badge 'positif' + score 78%
```

---

### 6.4 Affichage dans l'interface

Dans `Avis.jsx`, chaque carte d'avis affiche :

```jsx
<span className={`badge ${
  avis.sentiment === 'positif' ? 'badge-success' :
  avis.sentiment === 'negatif' ? 'badge-danger' : 'badge-secondary'
}`}>
  {avis.sentiment || 'En analyse...'}
  {avis.sentiment_score && ` (${(avis.sentiment_score * 100).toFixed(0)}%)`}
</span>
```

Le panneau de statistiques (`stats_sentiment`) affiche :
- 3 barres de progression (positif / neutre / négatif) avec pourcentages.
- Score de confiance moyen.
- Nombre total d'avis analysés.

Dans `ClientHome.jsx`, le formulaire d'avis précise au client :
> "La note sera attribuée automatiquement par notre système d'analyse de texte."

---

## 7. Flux métier principaux

### Commande staff (Serveur → Chef → Caissier)

```
Serveur (Salle.jsx)
  1. Sélectionne une table libre/réservée
  2. Ajoute des plats au panier
  3. Saisit un code promo (optionnel)
  4. Soumet → POST /api/commandes/nouvelle/
     ├── Commande créée (statut: en_preparation)
     └── Table → occupee

Chef (Cuisine.jsx)
  5. Voit la commande (GET /api/commandes/?statut=en_preparation)
  6. Prépare chaque plat
  7. Marque chaque item "Prêt" → PATCH /api/commande-items/{id}/marquer_pret/
     └── Quand tous prêts → Commande → pret + Notification serveur

Serveur (Commandes.jsx)
  8. Voit la notification "Commande prête"
  9. Sert la commande → PATCH /api/commandes/{id}/changer_statut/ {statut: "servi"}

Caissier (Caisse.jsx)
  10. Sélectionne le mode de paiement
  11. Encaisse → POST /api/facturation/encaisser/
      ├── Facturation créée
      ├── Commande → paye
      └── Table → libre
```

### Commande en ligne (Client → Chef → Client)

```
Client (ClientCommander.jsx)
  1. Parcourt le menu filtré
  2. Ajoute des plats au panier
  3. Entre son numéro de table + code promo
  4. Soumet → POST /api/commandes-client/passer/
     ├── Commande staff créée (note: "[COMMANDE EN LIGNE]")
     ├── CommandeClient créée
     ├── Points fidélité ajoutés
     └── Notification → serveur

Chef (Cuisine.jsx)
  5. Voit la commande avec badge "🌐 EN LIGNE"
  6. Prépare et marque prête

Client (ClientCompte.jsx)
  7. Suit le statut en temps réel (polling 15s)
  8. Voit "Prête" → se rend à la table
```

### Réservation client

```
Client (ClientReserver.jsx)
  Étape 1 : Choisit date, heure, nombre de personnes
  Étape 2 : GET /api/tables-disponibles/ → sélectionne une table
  Étape 3 : Saisit nom/email/tel → POST /api/reserver/
            ├── Réservation créée (statut: en_attente)
            ├── Table → reservee
            └── Notification → gérant + serveur

Gérant (Reservations.jsx)
  PATCH /api/reservations/{id}/confirmer/ {statut: "confirmee"}
  └── Notification → client "Réservation confirmée"

Client
  Reçoit notification dans la cloche 🔔
```

---

## 8. Référence complète des endpoints API

| Méthode | Endpoint | Auth | Rôle |
|---------|----------|------|------|
| POST | `/api/login/` | Non | Connexion staff/client |
| POST | `/api/register/` | Non | Inscription client |
| GET | `/api/dashboard/` | Oui | Statistiques tableau de bord |
| GET,PATCH | `/api/mon-profil/` | Oui | Profil client |
| GET,PATCH | `/api/mon-profil-employe/` | Oui | Profil employé |
| POST | `/api/changer-mot-de-passe/` | Oui | Changement de mot de passe |
| GET | `/api/plats/` | Non | Liste des plats (filtres: categorie, disponible) |
| POST | `/api/plats/` | Oui | Créer un plat |
| GET,PUT,PATCH,DELETE | `/api/plats/{id}/` | Mixte | CRUD plat |
| GET | `/api/categories/` | Non | Liste des catégories |
| POST,PUT,PATCH,DELETE | `/api/categories/{id}/` | Oui | CRUD catégorie |
| GET | `/api/ingredients/` | Oui | Liste des ingrédients |
| GET | `/api/ingredients/alertes/` | Oui | Ingrédients sous le seuil |
| PUT,PATCH,DELETE | `/api/ingredients/{id}/` | Oui | CRUD ingrédient |
| GET | `/api/tables/` | Oui | Liste des tables |
| PATCH | `/api/tables/{id}/changer_statut/` | Oui | Changer statut table |
| GET | `/api/reservations/` | Oui | Liste des réservations |
| PATCH | `/api/reservations/{id}/confirmer/` | Oui | Confirmer/annuler réservation |
| GET | `/api/commandes/` | Oui | Liste des commandes (filtres: statut, table) |
| POST | `/api/commandes/nouvelle/` | Oui | Créer commande staff |
| PATCH | `/api/commandes/{id}/changer_statut/` | Oui | Changer statut commande |
| GET | `/api/commande-items/` | Oui | Liste des articles |
| PATCH | `/api/commande-items/{id}/marquer_pret/` | Oui | Marquer article prêt |
| GET,POST | `/api/avis/` | Mixte | Liste/créer avis |
| POST | `/api/avis/{id}/accepter/` | Oui | Accepter avis |
| POST | `/api/avis/{id}/refuser/` | Oui | Refuser avis |
| GET | `/api/avis/stats_sentiment/` | Oui | Statistiques BERT |
| GET | `/api/employes/` | Oui | Liste des employés |
| POST | `/api/employes/creer/` | Oui (gérant) | Créer employé |
| PATCH | `/api/employes/{id}/modifier/` | Oui (gérant) | Modifier employé |
| DELETE | `/api/employes/{id}/` | Oui (gérant) | Supprimer employé |
| GET | `/api/codes-promo/` | Oui | Liste des codes promo |
| POST | `/api/codes-promo/valider/` | Non | Valider un code |
| POST,PUT,PATCH,DELETE | `/api/codes-promo/{id}/` | Oui | CRUD code promo |
| GET | `/api/facturation/` | Oui | Liste des factures |
| POST | `/api/facturation/encaisser/` | Oui (caissier) | Enregistrer paiement |
| GET | `/api/commandes-client/` | Oui | Commandes du client |
| POST | `/api/commandes-client/passer/` | Oui | Passer commande en ligne |
| POST | `/api/commandes-client/{id}/annuler/` | Oui | Annuler commande client |
| GET | `/api/notifications/` | Oui | Liste notifications |
| GET | `/api/notifications/non_lues/` | Oui | Compteur + aperçu |
| POST | `/api/notifications/marquer_lues/` | Oui | Marquer toutes comme lues |
| DELETE | `/api/notifications/supprimer_toutes/` | Oui | Supprimer toutes |
| GET | `/api/tables-disponibles/` | Non | Tables libres par créneau |
| POST | `/api/reserver/` | Non | Créer réservation |
| GET | `/api/mes-reservations/` | Oui | Réservations du client |
| POST | `/api/annuler-reservation/{id}/` | Oui | Annuler sa réservation |

---

*Documentation générée le 2026-05-31 — Projet MangerManger*

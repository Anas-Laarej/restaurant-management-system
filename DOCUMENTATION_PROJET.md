# Documentation Complète — Projet MangerManger
## ERP de Gestion de Restaurant (Django + React)

---

# PARTIE 1 — ÉTAPES DE CRÉATION DU PROJET

## Vue d'ensemble

**MangerManger** est une application web complète de gestion de restaurant construite avec :
- **Backend** : Django 4.x + Django REST Framework + SQLite
- **Frontend** : React 19 + Vite + Axios + React Router DOM + Recharts

L'application comporte deux interfaces distinctes :
1. **Interface Staff** (Gérant, Chef, Serveur, Caissier) — tableau de bord ERP
2. **Interface Client** — site vitrine avec commande et réservation en ligne

---

## Étape 1 — Mise en place de l'environnement Python

```bash
# Créer le dossier du projet
mkdir pfa
cd pfa

# Créer et activer l'environnement virtuel
python -m venv .venv
.venv\Scripts\activate          # Windows
# ou source .venv/bin/activate  # Linux/Mac

# Installer les dépendances Django
pip install django djangorestframework django-cors-headers
```

**Pourquoi un environnement virtuel ?**
Il isole les dépendances du projet des autres projets Python de la machine. Chaque projet a ses propres versions de bibliothèques sans conflits.

---

## Étape 2 — Initialisation du projet Django

```bash
# Créer le projet Django
django-admin startproject mangermanger

cd mangermanger
```

Cette commande génère automatiquement la structure de base :
```
mangermanger/
├── manage.py
└── mangermanger/
    ├── __init__.py
    ├── settings.py
    ├── urls.py
    ├── asgi.py
    └── wsgi.py
```

---

## Étape 3 — Création des applications Django

```bash
# Application "restaurant" : contient tous les modèles de données
python manage.py startapp restaurant

# Application "api" : contient les vues REST et les serializers
python manage.py startapp api
```

Chaque application a son propre dossier avec `models.py`, `views.py`, `admin.py`, etc.

---

## Étape 4 — Configuration de settings.py

Modifier `mangermanger/settings.py` pour :
- Enregistrer les nouvelles applications (`rest_framework`, `corsheaders`, `api`, `restaurant`)
- Configurer la base de données SQLite
- Activer CORS pour permettre les appels depuis React (port 5173)
- Configurer l'authentification par Token (DRF)
- Définir la langue française et le fuseau horaire Maroc
- Indiquer où se trouve le build React (dossier `frontend/`)

---

## Étape 5 — Création des modèles (restaurant/models.py)

C'est la phase la plus importante. On définit toute la structure de la base de données :

**Ordre de création des modèles (respecter les dépendances) :**

1. `Employe` — lié au User Django (OneToOne)
2. `Categorie` — catégories de plats (Entrées, Plats chauds…)
3. `Plat` — chaque plat du menu (ForeignKey vers Categorie)
4. `Ingredient` — stock de cuisine
5. `PlatIngredient` — table pivot Plat ↔ Ingredient (ManyToMany)
6. `Table` — tables physiques du restaurant
7. `Reservation` — réservations liées à une Table
8. `CodePromo` — codes de réduction
9. `Commande` — commandes staff (liées à Table, User, CodePromo)
10. `CommandeItem` — lignes d'une commande staff (ForeignKey vers Commande et Plat)
11. `Avis` — avis clients (liés à Plat et Commande)
12. `Facturation` — paiements (OneToOne vers Commande)
13. `ClientProfile` — profil client étendu (OneToOne vers User)
14. `CommandeClient` — commandes passées par les clients en ligne
15. `CommandeClientItem` — lignes des commandes clients en ligne
16. `Notification` — système de notifications temps réel

---

## Étape 6 — Création et application des migrations

```bash
# Générer les fichiers de migration à partir des modèles
python manage.py makemigrations

# Appliquer les migrations (créer les tables dans SQLite)
python manage.py migrate
```

Django analyse les modèles et génère les requêtes SQL correspondantes. Le fichier `db.sqlite3` est créé avec toutes les tables.

---

## Étape 7 — Création des Serializers (api/serializers.py)

Les serializers transforment les objets Python/Django en JSON (et vice-versa). On crée un serializer pour chaque modèle.

**Ordre de création :**
1. `UserSerializer` — utilisateur Django de base
2. `EmployeSerializer` — employé avec son User imbriqué
3. `CategorieSerializer`, `PlatSerializer`, `IngredientSerializer`
4. `TableSerializer`, `ReservationSerializer`
5. `CodePromoSerializer`
6. `CommandeItemSerializer`, `CommandeSerializer`
7. `AvisSerializer`, `FacturationSerializer`
8. `ClientProfileSerializer`
9. `CommandeClientItemSerializer`, `CommandeClientSerializer`
10. `NotificationSerializer`

---

## Étape 8 — Création des Vues API (api/views.py)

On crée les endpoints REST qui répondent aux requêtes HTTP du frontend :

**Vues de type ViewSet (CRUD complet automatique) :**
- `PlatViewSet`, `CategorieViewSet`, `IngredientViewSet`
- `TableViewSet`, `ReservationViewSet`
- `CommandeViewSet`, `CommandeItemViewSet`
- `AvisViewSet`, `EmployeViewSet`
- `CodePromoViewSet`, `FacturationViewSet`
- `CommandeClientViewSet`, `NotificationViewSet`

**Vues de type function-based (logique métier spécifique) :**
- `login_view` — authentification par token
- `register_client` — inscription client
- `dashboard_stats` — statistiques du tableau de bord
- `mon_profil_client`, `mon_profil_employe` — profils
- `reserver_client`, `tables_disponibles` — réservation en ligne
- `confirmer_reservation`, `annuler_reservation_client`
- `creer_employe` — création d'un employé par le gérant

---

## Étape 9 — Configuration des URLs (api/urls.py et mangermanger/urls.py)

**api/urls.py** : utilise le `DefaultRouter` de DRF qui génère automatiquement les URLs CRUD pour chaque ViewSet. Les routes custom (login, register…) sont ajoutées manuellement avant le router.

**mangermanger/urls.py** : route principale qui délègue `/api/` vers l'application API, et toutes les autres routes vers le frontend React (SPA).

---

## Étape 10 — Enregistrement dans l'Admin Django (restaurant/admin.py)

On enregistre tous les modèles dans l'interface d'administration Django (`/admin/`) pour pouvoir les gérer visuellement.

---

## Étape 11 — Script de données de test (seed_data.py)

Créer un script Python qui peuple la base de données avec des données réalistes :
- 5 employés (gérant, chef, 2 serveurs, caissier) + 1 admin
- 5 catégories de plats
- 12 plats du menu marocain
- 10 ingrédients en stock
- 15 tables
- 3 codes promo
- 5 avis clients

```bash
python seed_data.py
```

---

## Étape 12 — Initialisation du frontend React

```bash
cd ..   # Remonter dans le dossier pfa/
npm create vite@latest mangermanger-front -- --template react
cd mangermanger-front

# Installer les dépendances
npm install
npm install axios react-router-dom recharts
```

**Dépendances installées :**
- `axios` — client HTTP pour appeler l'API Django
- `react-router-dom` — navigation entre les pages (SPA)
- `recharts` — graphiques pour le tableau de bord

---

## Étape 13 — Configuration de l'API client (src/api.js)

Créer un fichier central qui configure Axios avec l'URL de base du backend et l'injection automatique du token d'authentification dans chaque requête.

---

## Étape 14 — Création du contexte d'authentification (src/context/AuthContext.jsx)

Créer un Context React global qui gère :
- L'état de connexion (user, role, token)
- La persistance dans localStorage
- Les fonctions `login` et `logout`
- Un hook `useNotifications` pour le polling des notifications

---

## Étape 15 — Création du composant Layout staff (src/components/Layout.jsx)

Créer la mise en page principale pour l'interface staff avec :
- Barre latérale (sidebar) avec navigation adaptée au rôle
- Menu différent selon le rôle (gérant, chef, serveur, caissier)
- Cloche de notifications
- Bouton déconnexion
- Effet de réduction de la sidebar (collapsed)

---

## Étape 16 — Création des pages staff

Créer dans l'ordre (pages les plus simples d'abord) :
1. `Login.jsx` — formulaire de connexion
2. `Dashboard.jsx` — tableau de bord avec statistiques et graphiques
3. `Menu.jsx` — gestion des plats et catégories
4. `Stock.jsx` — gestion des ingrédients et alertes
5. `Tables.jsx` — plan de salle interactif
6. `Commandes.jsx` — liste et suivi des commandes
7. `Cuisine.jsx` — interface dédiée au chef cuisinier
8. `Salle.jsx` — interface dédiée au serveur
9. `Caisse.jsx` — interface dédiée au caissier
10. `Reservations.jsx` — gestion des réservations
11. `Avis.jsx` — modération des avis clients
12. `Personnel.jsx` — gestion des employés
13. `Promos.jsx` — gestion des codes promo
14. `Profil.jsx` — profil personnel de l'employé

---

## Étape 17 — Création des pages client

Créer le layout et les pages de l'interface publique :
1. `client/ClientLayout.jsx` — barre de navigation du site client
2. `client/ClientHome.jsx` — page d'accueil avec hero, menu, avis
3. `client/ClientMenu.jsx` — menu complet avec filtres par catégorie
4. `client/ClientLogin.jsx` — connexion compte client
5. `client/ClientRegister.jsx` — inscription nouveau client
6. `client/ClientReserver.jsx` — formulaire de réservation en ligne
7. `client/ClientCommander.jsx` — panier et commande en ligne
8. `client/ClientCompte.jsx` — espace personnel (profil, historique, avis)

---

## Étape 18 — Configuration du routage (src/App.jsx)

Configurer React Router avec :
- Guards `StaffRoute` et `ClientRoute` pour protéger les pages
- Redirection intelligente selon le rôle à la racine `/`
- Toutes les routes staff et client

---

## Étape 19 — Build du frontend et intégration Django

```bash
cd mangermanger-front
npm run build
```

Copier le contenu du dossier `dist/` généré dans `mangermanger/frontend/` pour que Django puisse le servir. Django sert alors React comme application statique et gère les routes SPA via `re_path`.

---

## Étape 20 — Lancement de l'application

```bash
# Depuis le dossier mangermanger/
python manage.py runserver
```

L'application est accessible sur `http://localhost:8000`

---

---

# PARTIE 2 — EXPLICATION DES FICHIERS

## Arborescence complète du projet

```
pfa/
├── .venv/                          ← Environnement virtuel Python
├── mangermanger/                   ← Projet Django (backend)
│   ├── manage.py                   ← Utilitaire de gestion Django
│   ├── db.sqlite3                  ← Base de données SQLite
│   ├── seed_data.py                ← Script de données de test
│   ├── start.sh                    ← Script de démarrage
│   ├── mangermanger/               ← Package de configuration Django
│   │   ├── __init__.py
│   │   ├── settings.py             ← Configuration globale
│   │   ├── urls.py                 ← URLs racines
│   │   ├── asgi.py                 ← Serveur ASGI
│   │   └── wsgi.py                 ← Serveur WSGI
│   ├── restaurant/                 ← Application modèles
│   │   ├── __init__.py
│   │   ├── models.py               ← Tous les modèles de données
│   │   ├── admin.py                ← Enregistrement dans l'admin
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/             ← Fichiers de migration
│   ├── api/                        ← Application API REST
│   │   ├── __init__.py
│   │   ├── views.py                ← Vues et logique métier
│   │   ├── serializers.py          ← Sérialisation JSON
│   │   ├── urls.py                 ← Routage de l'API
│   │   ├── apps.py
│   │   └── tests.py
│   └── frontend/                   ← Build React (servi par Django)
│       ├── index.html
│       └── assets/
└── mangermanger-front/             ← Code source React (frontend)
    ├── package.json                ← Dépendances npm
    ├── vite.config.js              ← Configuration Vite
    ├── index.html                  ← Point d'entrée HTML
    └── src/
        ├── main.jsx                ← Point d'entrée React
        ├── api.js                  ← Client HTTP Axios
        ├── App.jsx                 ← Routage principal
        ├── index.css               ← Styles globaux
        ├── context/
        │   └── AuthContext.jsx     ← État d'authentification global
        ├── components/
        │   ├── Layout.jsx          ← Mise en page staff
        │   ├── NotificationBell.jsx       ← Cloche notifs staff
        │   └── ClientNotificationBell.jsx ← Cloche notifs client
        └── pages/
            ├── Login.jsx           ← Connexion staff
            ├── Dashboard.jsx       ← Tableau de bord gérant
            ├── Commandes.jsx       ← Gestion commandes
            ├── Tables.jsx          ← Plan de salle
            ├── Menu.jsx            ← Gestion menu
            ├── Stock.jsx           ← Gestion stocks
            ├── Cuisine.jsx         ← Interface chef
            ├── Salle.jsx           ← Interface serveur
            ├── Caisse.jsx          ← Interface caissier
            ├── Avis.jsx            ← Modération avis
            ├── Personnel.jsx       ← Gestion employés
            ├── Promos.jsx          ← Codes promo
            ├── Reservations.jsx    ← Réservations staff
            └── Profil.jsx          ← Profil employé
            └── client/
                ├── ClientLayout.jsx    ← Navigation site client
                ├── ClientHome.jsx      ← Page d'accueil
                ├── ClientMenu.jsx      ← Menu public
                ├── ClientLogin.jsx     ← Connexion client
                ├── ClientRegister.jsx  ← Inscription client
                ├── ClientReserver.jsx  ← Réservation en ligne
                ├── ClientCommander.jsx ← Commande en ligne
                └── ClientCompte.jsx    ← Espace personnel
```

---

## BACKEND DJANGO

---

### `manage.py`

```python
#!/usr/bin/env python
import os, sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mangermanger.settings')
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
```

**Rôle :** Point d'entrée de toutes les commandes de gestion Django.

- `os.environ.setdefault(...)` indique à Django quel fichier de configuration utiliser.
- `execute_from_command_line(sys.argv)` lit les arguments de la commande (`runserver`, `makemigrations`, `migrate`…) et les exécute.
- Exemples d'utilisation : `python manage.py runserver`, `python manage.py makemigrations`, `python manage.py migrate`.

---

### `mangermanger/settings.py`

**Rôle :** Fichier de configuration central de toute l'application Django.

```python
BASE_DIR = Path(__file__).resolve().parent.parent
```
Calcule le chemin absolu vers la racine du projet. `parent.parent` remonte de deux niveaux (de `mangermanger/mangermanger/` vers `mangermanger/`).

```python
INSTALLED_APPS = [
    ...
    'rest_framework',         # Active Django REST Framework
    'rest_framework.authtoken', # Active l'authentification par Token
    'corsheaders',            # Active la gestion CORS
    'api',                    # Notre application API
    'restaurant',             # Notre application modèles
]
```
Liste de toutes les applications actives. Django ne reconnaît une application que si elle est listée ici.

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Doit être en premier
    ...
]
```
Les middlewares sont des couches qui interceptent chaque requête/réponse. `CorsMiddleware` doit être en tête pour ajouter les en-têtes CORS avant tout traitement.

```python
TEMPLATES = [{
    'DIRS': [BASE_DIR / 'frontend'],  # Django cherche index.html ici
    ...
}]
```
Indique à Django où trouver les templates HTML. On pointe vers le dossier `frontend/` qui contient le build React.

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```
Configuration de la base de données SQLite. Le fichier `db.sqlite3` est créé automatiquement à la racine du projet Django.

```python
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Casablanca'
```
Localisation en français et fuseau horaire du Maroc (UTC+1).

```python
STATICFILES_DIRS = [
    BASE_DIR / 'frontend' / 'assets',
]
```
Django cherche les fichiers statiques (CSS, JS du build React) dans ce dossier.

```python
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
```
Autorise tous les domaines à appeler l'API (en développement). En production, il faudrait lister explicitement les domaines autorisés.

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```
Configuration de DRF :
- `TokenAuthentication` : chaque requête doit porter un header `Authorization: Token <token>`
- `IsAuthenticated` : par défaut, toutes les routes requièrent une connexion (sauf si explicitement `AllowAny`)

---

### `mangermanger/urls.py`

**Rôle :** Fichier de routage racine — décide où chaque URL est traitée.

```python
urlpatterns = [
    path('admin/', admin.site.urls),      # Interface d'administration Django
    path('api/', include('api.urls')),    # Toutes les routes /api/... → délégué à api/urls.py

    # Toutes les autres routes → index.html de React (SPA)
    re_path(r'^(?!api/|admin/|static/).*$',
            TemplateView.as_view(template_name='index.html')),
]
```

- `path('api/', ...)` : toute URL commençant par `/api/` est gérée par `api/urls.py`
- `re_path(...)` : expression régulière qui capture TOUTES les autres URLs (sauf `/api/`, `/admin/`, `/static/`) et retourne `index.html`. C'est ce qui permet à React Router de fonctionner — Django ne connaît pas les routes React, il renvoie toujours `index.html` et React prend le relais.

```python
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```
En mode développement, Django sert lui-même les fichiers statiques (CSS, JS).

---

### `restaurant/models.py`

**Rôle :** Définit toute la structure de la base de données. Chaque classe = une table SQL.

#### Modèle `Employe`
```python
class Employe(models.Model):
    ROLES = [('gerant','Gérant'), ('chef','Chef cuisinier'),
             ('serveur','Serveur'), ('caissier','Caissier')]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES, default='serveur')
    telephone = models.CharField(max_length=20, blank=True)
    actif = models.BooleanField(default=True)
    date_embauche = models.DateField(auto_now_add=True)
```
- `OneToOneField(User, ...)` : chaque employé est lié à exactement un compte Django User. `CASCADE` signifie que si le User est supprimé, l'Employe l'est aussi.
- `choices=ROLES` : Django valide que la valeur est dans la liste et génère un menu déroulant dans l'admin.
- `auto_now_add=True` : la date est automatiquement remplie à la création.

#### Modèle `Plat`
```python
class Plat(models.Model):
    nom = models.CharField(max_length=200)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    categorie = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True)
    disponible = models.BooleanField(default=True)
    temps_preparation = models.IntegerField(default=15)
```
- `DecimalField` : pour les prix, on utilise `Decimal` et non `Float` pour éviter les erreurs d'arrondi en monnaie.
- `ForeignKey(Categorie, on_delete=models.SET_NULL, null=True)` : si une catégorie est supprimée, les plats restent mais avec `categorie=NULL`.

#### Modèle `Ingredient`
```python
class Ingredient(models.Model):
    quantite_stock = models.FloatField(default=0)
    quantite_min = models.FloatField(default=1)
    plats = models.ManyToManyField(Plat, through='PlatIngredient')

    @property
    def en_alerte(self):
        return self.quantite_stock <= self.quantite_min

    @property
    def niveau_pct(self):
        return min(100, int((self.quantite_stock / (self.quantite_min * 5)) * 100))
```
- `ManyToManyField(through='PlatIngredient')` : relation N-N entre ingrédients et plats via une table intermédiaire `PlatIngredient` (qui stocke la quantité nécessaire).
- `@property` : méthode Python accessible comme un champ mais calculée dynamiquement. `en_alerte` retourne `True` si le stock est sous le seuil minimum.

#### Modèle `Commande`
```python
class Commande(models.Model):
    STATUTS = [('en_attente','En attente'), ('en_preparation','En préparation'),
               ('pret','Prêt'), ('servi','Servi'), ('paye','Payé'), ('annulee','Annulée')]

    def calculer_total(self):
        total = sum(item.sous_total for item in self.items.all())
        if self.code_promo and self.code_promo.actif:
            total = total * (1 - self.code_promo.reduction_pct / 100)
        self.montant_total = total
        self.save()
        return total
```
- `self.items.all()` : accède aux `CommandeItem` liés via le `related_name='items'` défini dans `CommandeItem`.
- La méthode `calculer_total()` additionne les sous-totaux de chaque ligne et applique la réduction du code promo.

#### Modèle `Notification`
```python
class Notification(models.Model):
    ROLES_CIBLES = [('all','Tous'), ('gerant','Gérant'), ('chef','Chef'),
                    ('serveur','Serveur'), ('caissier','Caissier'), ('client','Client')]
    type = models.CharField(max_length=30, choices=TYPES)
    role_cible = models.CharField(max_length=20, choices=ROLES_CIBLES, default='all')
    client_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    lue = models.BooleanField(default=False)
```
Les notifications sont filtrées par `role_cible` : un serveur ne voit que les notifications qui lui sont destinées (`role_cible='serveur'` ou `role_cible='all'`). Les notifications client sont liées directement au `client_user`.

---

### `restaurant/admin.py`

**Rôle :** Enregistre tous les modèles dans l'interface d'administration Django.

```python
from django.contrib import admin
from .models import *

admin.site.register(Employe)
admin.site.register(Categorie)
admin.site.register(Plat)
# ... etc
```

L'importation `from .models import *` importe tous les modèles du fichier `models.py`. Sans enregistrement, un modèle n'est pas accessible via `/admin/`.

---

### `api/serializers.py`

**Rôle :** Convertit les objets Python en JSON pour les réponses API, et le JSON en objets Python pour les requêtes.

#### `UserSerializer`
```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
```
N'expose que les champs nécessaires du User Django. Le mot de passe n'est jamais inclus.

#### `EmployeSerializer`
```python
class EmployeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)          # User imbriqué (nested)
    nom_complet = serializers.SerializerMethodField()

    def get_nom_complet(self, obj):
        return obj.user.get_full_name() or obj.user.username
```
- `user = UserSerializer(read_only=True)` : le champ `user` est lui-même sérialisé complètement (nested serializer). Ainsi, la réponse API contient l'objet user entier, pas seulement son ID.
- `SerializerMethodField()` : champ calculé côté serializer. La méthode correspondante est nommée `get_<nom_du_champ>`.

#### `CommandeSerializer`
```python
class CommandeSerializer(serializers.ModelSerializer):
    items = CommandeItemSerializer(many=True, read_only=True)
    table_numero = serializers.SerializerMethodField()
    serveur_nom = serializers.SerializerMethodField()
```
- `items = CommandeItemSerializer(many=True, read_only=True)` : la commande retourne la liste complète de ses items (lignes de commande) dans sa réponse JSON. `many=True` indique une liste.

#### `IngredientSerializer`
```python
class IngredientSerializer(serializers.ModelSerializer):
    en_alerte = serializers.ReadOnlyField()
    niveau_pct = serializers.ReadOnlyField()
```
`ReadOnlyField()` expose les propriétés Python (`@property`) comme des champs JSON en lecture seule.

---

### `api/urls.py`

**Rôle :** Configure les URLs de l'API REST.

```python
router = DefaultRouter()
router.register('plats', views.PlatViewSet)
router.register('categories', views.CategorieViewSet)
# ... tous les ViewSets
```

Le `DefaultRouter` génère automatiquement les URLs CRUD pour chaque ViewSet :
- `GET /api/plats/` → liste tous les plats
- `POST /api/plats/` → crée un plat
- `GET /api/plats/{id}/` → récupère un plat
- `PUT/PATCH /api/plats/{id}/` → modifie un plat
- `DELETE /api/plats/{id}/` → supprime un plat

```python
urlpatterns = [
    # Routes custom (en PREMIER, avant le router)
    path('login/', views.login_view, name='login'),
    path('register/', views.register_client, name='register'),
    path('dashboard/', views.dashboard_stats, name='dashboard'),
    path('reserver/', views.reserver_client, name='reserver'),
    path('reservations/<int:pk>/confirmer/', views.confirmer_reservation),
    # ...
    path('', include(router.urls)),   # Router en dernier
]
```
Les routes custom sont déclarées avant `include(router.urls)` pour éviter qu'elles soient capturées par le router.

---

### `api/views.py`

**Rôle :** Contient toute la logique métier de l'application.

#### Fonction `login_view`
```python
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        employe = getattr(user, 'employe', None)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'role': employe.role if employe else 'client',
        })
    return Response({'error': 'Identifiants invalides'}, status=400)
```
- `@api_view(['POST'])` : limite la vue aux requêtes POST uniquement.
- `@permission_classes([AllowAny])` : cette route ne requiert pas d'authentification (logique : on n'est pas encore connecté).
- `authenticate(...)` : fonction Django qui vérifie le username/password dans la base de données.
- `Token.objects.get_or_create(user=user)` : crée un token si l'utilisateur n'en a pas, ou retourne l'existant. Le `_` capture le booléen `created` qu'on ignore ici.
- `getattr(user, 'employe', None)` : essaie d'accéder à `user.employe`. Si l'utilisateur n'a pas de profil Employe (c'est un client), retourne `None` sans lever d'exception.

#### Fonction `dashboard_stats`
```python
@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now().date()
    commandes_jour = Commande.objects.filter(created_at__date=today)
    ca_jour = commandes_jour.filter(statut='paye').aggregate(total=Sum('montant_total'))['total'] or 0
    tables_occupees = Table.objects.filter(statut='occupee').count()
    note_moy = Avis.objects.aggregate(avg=Avg('note'))['avg'] or 0
    stocks_alerte = Ingredient.objects.filter(quantite_stock__lte=models.F('quantite_min')).count()
```
- `aggregate(total=Sum('montant_total'))` : calcule la somme SQL directement côté base de données (efficace).
- `models.F('quantite_min')` : référence la valeur d'un champ dans une comparaison SQL. `quantite_stock__lte=F('quantite_min')` filtre les ingrédients où `quantite_stock ≤ quantite_min`.

#### `CommandeViewSet` — action `changer_statut`
```python
@action(detail=True, methods=['patch'])
def changer_statut(self, request, pk=None):
    cmd = self.get_object()
    nouveau_statut = request.data.get('statut', cmd.statut)
    cmd.statut = nouveau_statut
    cmd.save()
    if nouveau_statut in ('paye', 'annulee') and cmd.table:
        cmd.table.statut = 'libre'
        cmd.table.save()
    if nouveau_statut == 'pret':
        creer_notification('commande_prete', ...)
```
- `@action(detail=True, ...)` : crée une route supplémentaire `/api/commandes/{id}/changer_statut/`.
- Quand une commande est payée ou annulée, la table associée est automatiquement libérée.
- Quand la commande est prête, une notification est envoyée au serveur et au gérant.

#### Fonction `creer_notification`
```python
def creer_notification(type_, titre, message, role_cible='all',
                        client_user=None, reservation=None, commande=None):
    Notification.objects.create(
        type=type_, titre=titre, message=message,
        role_cible=role_cible, client_user=client_user,
        reservation=reservation, commande=commande,
    )
```
Helper utilisé partout dans le code pour créer des notifications sans dupliquer le code d'instanciation.

#### `CommandeClientViewSet` — action `passer`
```python
@action(detail=False, methods=['post'])
def passer(self, request):
    # Cherche une table disponible automatiquement
    table = Table.objects.filter(statut__in=['libre', 'reservee']).order_by('numero').first()

    # Crée une commande "staff" invisible (vue du personnel)
    cmd_staff = Commande.objects.create(
        table=table, serveur=None,
        notes=f"[COMMANDE EN LIGNE - {request.user.get_full_name()}] {notes}",
        statut='en_attente'
    )
    # Crée également une commande "client" (vue du client)
    cmd_client = CommandeClient.objects.create(
        client=request.user, ...
    )
    # Ajoute des points fidélité
    profile.points_fidelite += max(1, int(total / 10))
```
La commande en ligne crée **deux** objets en base : une `Commande` pour le staff (visible en cuisine) et une `CommandeClient` pour le client (visible dans son espace personnel). La note `[COMMANDE EN LIGNE]` permet d'identifier les commandes en ligne côté staff.

#### Filtre de notifications par rôle
```python
def _notif_qs_pour_role(role, user, base_qs):
    if role == 'client':
        return base_qs.filter(role_cible='client', client_user=user)
    return base_qs.filter(
        models.Q(role_cible=role) | models.Q(role_cible='all')
    ).exclude(role_cible='client')
```
- Les clients ne voient QUE leurs notifications personnelles (liées à leur `user`).
- Le staff voit les notifications de son rôle ET les notifications globales (`all`), mais jamais les notifications client.

---

### `seed_data.py`

**Rôle :** Script de peuplement de la base de données avec des données réalistes.

```python
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mangermanger.settings')
django.setup()   # Initialise Django sans passer par manage.py
```
`django.setup()` est obligatoire pour utiliser les modèles Django dans un script Python ordinaire (en dehors de `manage.py`).

```python
u, _ = User.objects.get_or_create(username=uname)
```
`get_or_create()` évite les doublons : si l'utilisateur existe déjà, il est récupéré ; sinon il est créé. Le `_` capture le booléen `created` qu'on ignore.

---

## FRONTEND REACT

---

### `mangermanger-front/package.json`

**Rôle :** Manifeste du projet Node.js — liste les dépendances et les scripts.

```json
{
  "scripts": {
    "dev": "vite",           // Lance le serveur de développement (port 5173)
    "build": "vite build",   // Compile le projet pour la production
    "preview": "vite preview" // Prévisualise le build de production
  },
  "dependencies": {
    "axios": "^1.15.2",           // Client HTTP
    "react": "^19.2.5",           // Bibliothèque UI
    "react-dom": "^19.2.5",       // Rendu dans le DOM
    "react-router-dom": "^7.14.2", // Navigation SPA
    "recharts": "^3.8.1"          // Graphiques
  }
}
```

---

### `vite.config.js`

**Rôle :** Configuration du bundler Vite.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```
`@vitejs/plugin-react` active le support JSX et le Fast Refresh (rechargement instantané en développement sans perdre l'état des composants).

---

### `src/main.jsx`

**Rôle :** Point d'entrée React — monte l'application dans le DOM.

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
```
- `document.getElementById('root')` : sélectionne l'élément `<div id="root">` dans `index.html`.
- `ReactDOM.createRoot(...).render(...)` : monte l'arbre de composants React dans cet élément.
- `<React.StrictMode>` : active des avertissements supplémentaires en développement (détecte les problèmes potentiels).

---

### `src/api.js`

**Rôle :** Configuration centralisée du client HTTP Axios.

```javascript
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Token ${token}`;
  return cfg;
});

export default API;
```
- `axios.create({baseURL: ...})` : crée une instance Axios configurée. Chaque appel `API.get('/plats/')` devient automatiquement `GET http://localhost:8000/api/plats/`.
- `API.interceptors.request.use(...)` : intercepteur qui s'exécute avant CHAQUE requête. Il lit le token depuis `localStorage` et l'ajoute dans le header `Authorization`. Ainsi, tous les composants n'ont pas besoin de gérer le token manuellement — un seul endroit le fait.

---

### `src/context/AuthContext.jsx`

**Rôle :** Gestion globale de l'état d'authentification via l'API Context de React.

```jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaure la session depuis localStorage au chargement de la page
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setRole(localStorage.getItem("role"));
    }
    setLoading(false);
  }, []);
```
- `createContext(null)` : crée un contexte React. Les composants enfants peuvent lire sa valeur sans prop drilling.
- Le `useEffect` avec `[]` s'exécute une seule fois au montage et restaure la session sauvegardée dans `localStorage` (l'utilisateur reste connecté même après un rechargement de page).
- `loading = true` pendant la restauration : les guards de route attendent que la vérification soit terminée avant de rediriger.

```jsx
const login = async (username, password) => {
  const { data } = await API.post("/login/", { username, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("role", data.role);
  setUser(data.user);
  setRole(data.role);
  return data;
};

const logout = () => {
  localStorage.clear();
  setUser(null);
  setRole(null);
};
```
- `login` : appelle l'API, stocke le token et les infos utilisateur dans `localStorage` ET dans l'état React.
- `logout` : vide `localStorage` et réinitialise l'état.

```jsx
export function useNotifications() {
  const { user } = useContext(AuthContext);
  useEffect(() => {
    const fetchNotifs = async () => { ... };
    fetchNotifs();
    const t = setInterval(fetchNotifs, 15000);  // Polling toutes les 15 secondes
    return () => clearInterval(t);              // Nettoyage quand le composant est démonté
  }, [user]);
}
```
Hook personnalisé qui interroge l'API toutes les 15 secondes pour récupérer les nouvelles notifications (polling).

---

### `src/App.jsx`

**Rôle :** Configuration du routage principal de l'application.

```jsx
const STAFF_ROLES = ['gerant', 'chef', 'serveur', 'caissier'];

function StaffRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div>Chargement...</div>;
  const isStaff = user && STAFF_ROLES.includes(role);
  return isStaff ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}
```
`StaffRoute` est un composant "garde" (route guard) :
- Si `loading = true` : affiche un écran de chargement pendant la restauration de session.
- Si l'utilisateur n'est pas connecté ou n'est pas du staff : redirige vers `/login`.
- Sinon : affiche la page demandée enveloppée dans le `Layout` (sidebar + header).

```jsx
const getDefaultRoute = () => {
  if (!user) return '/client';
  const staffRoutes = { gerant: '/dashboard', chef: '/cuisine',
                        serveur: '/salle', caissier: '/caisse' };
  return staffRoutes[role] || '/client';
};
```
Redirection intelligente depuis `/` : chaque rôle a sa page par défaut.

```jsx
return (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);
```
`BrowserRouter` active le routing HTML5 (History API). `AuthProvider` enveloppe toute l'application pour que tout composant puisse accéder au contexte d'authentification.

---

### `src/components/Layout.jsx`

**Rôle :** Mise en page principale de l'interface staff avec sidebar dynamique.

```jsx
const navByRole = {
  gerant: [
    { path: '/dashboard', label: 'Tableau de bord', icon: '◈' },
    { path: '/reservations', label: 'Réservations', icon: '📅' },
    // ... tous les menus gérant
  ],
  chef: [
    { path: '/cuisine', label: 'Interface cuisine', icon: '◈' },
    { path: '/stock', label: 'Stock cuisine', icon: '◇' },
  ],
  // serveur, caissier...
};
```
Chaque rôle a ses propres liens de navigation. Un chef ne voit que `Cuisine` et `Stock`, un serveur ne voit que `Salle` et `Commandes`.

```jsx
const [collapsed, setCollapsed] = useState(false);
// ...
<aside style={{
  width: collapsed ? 64 : 220,
  transition: 'width 0.25s ease',
}}>
```
État local `collapsed` : la sidebar peut être réduite à 64px (icônes seulement) ou étendue à 220px. L'animation est gérée par la transition CSS.

```jsx
<NavLink key={item.path} to={item.path}
  style={({ isActive }) => ({
    color: isActive ? 'var(--accent)' : 'var(--text2)',
    background: isActive ? 'var(--accent-dim)' : 'transparent',
  })}
>
```
`NavLink` de React Router fournit automatiquement un objet `{ isActive }` qui indique si la route actuelle correspond au lien. On l'utilise pour appliquer des styles différents au lien actif.

---

### `src/pages/Login.jsx`

**Rôle :** Page de connexion du personnel.

```jsx
const [form, setForm] = useState({ username: "", password: "" });
const [error, setError] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();  // Empêche le rechargement de la page (comportement HTML par défaut)
  try {
    const data = await login(form.username, form.password);
    const routes = { gerant: "/dashboard", chef: "/cuisine",
                     serveur: "/salle", caissier: "/caisse" };
    navigate(routes[data.role] || "/client");
  } catch (err) {
    if (!err.response) {
      setError("Impossible de contacter le serveur...");
    } else {
      setError("Identifiants invalides.");
    }
  }
};
```
- `e.preventDefault()` : interrompt le comportement natif du formulaire HTML (qui rechargement la page).
- `!err.response` : si Axios n'a pas reçu de réponse du tout (serveur arrêté), l'erreur n'a pas de `response`. On distingue ainsi "serveur inaccessible" de "mauvais mot de passe".
- Après connexion, `navigate(...)` redirige vers la page correspondant au rôle.

---

### `src/pages/Dashboard.jsx`

**Rôle :** Tableau de bord du gérant avec statistiques en temps réel.

```jsx
useEffect(() => {
  API.get('/dashboard/').then(r => setStats(r.data)).catch(() => {});
  API.get('/commandes/?ordering=-created_at').then(r => setCommandes(...)).catch(() => {});
  API.get('/ingredients/alertes/').then(r => setStocks(r.data)).catch(() => {});
}, []);
```
3 appels API en parallèle au montage du composant. Le `.catch(() => {})` silencieux empêche les erreurs non critiques de casser l'affichage.

```jsx
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="card">
      <div style={{ fontSize: 11, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
    </div>
  );
}
```
Composant réutilisable pour afficher une carte de statistique. `{sub && ...}` : le sous-titre n'est rendu que s'il est défini (`&&` court-circuit).

```jsx
<ResponsiveContainer width="100%" height={180}>
  <AreaChart data={caData}>
    <Area type="monotone" dataKey="ca" stroke="#f97316" fill="url(#ca)" />
  </AreaChart>
</ResponsiveContainer>
```
Graphique de courbe avec Recharts. `ResponsiveContainer` adapte le graphique à la largeur du conteneur parent.

---

### `src/pages/client/ClientHome.jsx`

**Rôle :** Page d'accueil du site client — vitrine du restaurant.

```jsx
const HERO_SLIDES = [
  { emoji: "🍲", label: "Tajine poulet-citron", desc: "Notre spécialité maison" },
  { emoji: "🥘", label: "Couscous royal", desc: "7 légumes & 3 viandes" },
  { emoji: "🔥", label: "Grillades au charbon", desc: "Brochettes & Mixed grill" },
];

useEffect(() => {
  const t = setInterval(() => setSlide(i => (i + 1) % HERO_SLIDES.length), 3500);
  return () => clearInterval(t);  // Nettoyage : arrête l'intervalle à la destruction
}, []);
```
Diaporama automatique : `setInterval` change la diapositive toutes les 3,5 secondes. Le `return () => clearInterval(t)` est le nettoyage du `useEffect` — sans lui, l'intervalle continuerait à tourner même si le composant est démonté (fuite mémoire).

```jsx
const obs = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.id]: true }));
  }),
  { threshold: 0.12 }
);
```
`IntersectionObserver` : API native du navigateur qui détecte quand un élément entre dans le viewport. Quand un élément est visible à 12% (`threshold: 0.12`), il est ajouté à l'état `visible` et ses animations d'apparition se déclenchent (opacité + translation).

```jsx
{user ? (
  <Link to="/client/reserver">Réserver une table</Link>
) : (
  <Link to="/client/register">Créer un compte</Link>
)}
```
Affichage conditionnel selon l'état de connexion : les boutons changent selon que le client est connecté ou non.

---

### `src/context/AuthContext.jsx` — Hook `useNotifications`

```jsx
export function useNotifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchNotifs = async () => {
      if (!user) return;
      try {
        const r = await API.get("/notifications/");
        if (mounted) setNotifications(r.data.results || r.data);
      } catch (e) {}
    };
    fetchNotifs();
    const t = setInterval(fetchNotifs, 15000);
    return () => { mounted = false; clearInterval(t); };
  }, [user]);

  return { notifications };
}
```
- `let mounted = true` : drapeau anti-fuite mémoire. Si le composant est démonté pendant qu'une requête est en cours, `mounted = false` empêche le `setNotifications` de s'exécuter sur un composant démonté.
- Polling toutes les 15 secondes : simple alternative aux WebSockets pour un projet académique.

---

## Flux de données complet (exemple : passer une commande en ligne)

```
Client (React)
  │
  ├─ Clique "Commander" → ClientCommander.jsx
  │   ├─ Remplit le panier (state local)
  │   └─ Clique "Passer la commande"
  │       └─ API.post('/commandes-client/passer/', { items, code_promo })
  │
  │  [Token JWT dans le header Authorization via intercepteur api.js]
  │
Django (api/views.py)
  │
  ├─ CommandeClientViewSet.passer()
  │   ├─ Vérifie le code promo en base
  │   ├─ Cherche une table disponible
  │   ├─ Crée Commande (staff) avec note "[COMMANDE EN LIGNE]"
  │   ├─ Crée CommandeClient (client)
  │   ├─ Ajoute des points fidélité au ClientProfile
  │   └─ creer_notification() × 2 (chef + gérant)
  │
  └─ Retourne { commande_staff_id, table_numero, ... } → 201 Created
  │
Client (React)
  └─ Affiche confirmation avec numéro de commande
```

---

## Résumé des technologies et leur rôle

| Technologie | Rôle |
|---|---|
| **Django** | Framework web Python — gestion des modèles, vues, URLs |
| **Django REST Framework** | Création de l'API REST (ViewSets, Serializers, Tokens) |
| **django-cors-headers** | Autorise les appels cross-origin depuis React |
| **SQLite** | Base de données légère intégrée à Django |
| **React 19** | Bibliothèque UI — composants, état, effets |
| **Vite** | Bundler et serveur de développement ultra-rapide |
| **Axios** | Client HTTP pour appeler l'API Django depuis React |
| **React Router DOM** | Navigation SPA (Single Page Application) |
| **Recharts** | Graphiques dans le tableau de bord |
| **localStorage** | Persistance du token d'authentification côté navigateur |
| **Context API** | État global partagé entre tous les composants React |

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mangermanger.settings')
django.setup()

from django.contrib.auth.models import User
from restaurant.models import *

# Users
users_data = [
    ('gerant', 'Karim', 'Alaoui', 'gerant'),
    ('chef', 'Mohamed', 'Fassi', 'chef'),
    ('serveur1', 'Leila', 'Saidi', 'serveur'),
    ('serveur2', 'Youssef', 'Bennani', 'serveur'),
    ('caissier', 'Zineb', 'Ouali', 'caissier'),
]
for uname, fn, ln, role in users_data:
    u, _ = User.objects.get_or_create(username=uname)
    u.first_name = fn; u.last_name = ln
    u.set_password('pass1234'); u.save()
    Employe.objects.get_or_create(user=u, defaults={'role': role})

# Superuser
su, _ = User.objects.get_or_create(username='admin')
su.set_password('admin'); su.is_staff = True; su.is_superuser = True
su.first_name = 'Admin'; su.save()

# Categories
cats = [('Entrées', 1), ('Plats chauds', 2), ('Grillades', 3), ('Desserts', 4), ('Boissons', 5)]
cat_objs = {}
for nom, ordre in cats:
    c, _ = Categorie.objects.get_or_create(nom=nom, defaults={'ordre': ordre})
    cat_objs[nom] = c

# Plats
plats_data = [
    ('Soupe Harira', 'Soupe marocaine traditionnelle aux tomates, légumineuses et épices', 30, 'Entrées', 10),
    ('Pastilla au poulet', 'Feuilleté marocain au poulet, amandes et cannelle', 55, 'Entrées', 20),
    ('Salade maison', 'Salade fraîche aux légumes de saison, vinaigrette maison', 35, 'Entrées', 10),
    ('Tajine poulet-citron', 'Tajine traditionnel au poulet confit, citrons confits et olives', 95, 'Plats chauds', 35),
    ('Couscous royal', 'Couscous aux 7 légumes, agneau, poulet et merguez', 120, 'Plats chauds', 45),
    ('Tajine kefta', 'Boulettes de viande épicées aux tomates et œufs', 85, 'Plats chauds', 30),
    ('Brochettes de bœuf', 'Brochettes de bœuf marinées, grillées au charbon', 80, 'Grillades', 20),
    ('Mixed grill', 'Assortiment brochettes bœuf, poulet et merguez', 110, 'Grillades', 25),
    ('Crème caramel', 'Crème caramel maison à la fleur d\'oranger', 40, 'Desserts', 0),
    ('Pastilla au lait', 'Feuilleté sucré à la crème pâtissière et amandes', 45, 'Desserts', 0),
    ('Jus d\'orange frais', 'Oranges pressées minute', 25, 'Boissons', 0),
    ('Thé à la menthe', 'Thé vert à la menthe fraîche, sucre traditionnel', 20, 'Boissons', 0),
]
plat_objs = {}
for nom, desc, prix, cat, temps in plats_data:
    p, _ = Plat.objects.get_or_create(nom=nom, defaults={
        'description': desc, 'prix': prix,
        'categorie': cat_objs[cat], 'temps_preparation': temps
    })
    plat_objs[nom] = p

# Ingredients
ings = [
    ('Poulet entier', 12, 3, 'kg'),
    ('Tomates cerises', 1.5, 2, 'kg'),
    ('Huile d\'olive', 2.8, 3, 'L'),
    ('Farine', 15, 5, 'kg'),
    ('Riz', 20, 5, 'kg'),
    ('Bœuf haché', 8, 3, 'kg'),
    ('Citrons confits', 5, 2, 'kg'),
    ('Semoule', 18, 5, 'kg'),
    ('Oignons', 10, 3, 'kg'),
    ('Amandes', 4, 2, 'kg'),
]
for nom, qty, min_qty, unite in ings:
    Ingredient.objects.get_or_create(nom=nom, defaults={
        'quantite_stock': qty, 'quantite_min': min_qty, 'unite': unite
    })

# Tables
for i in range(1, 16):
    statut = 'occupee' if i in [1,3,5,7,10,12,15] else ('reservee' if i in [4,9,14] else ('fermee' if i == 11 else 'libre'))
    Table.objects.get_or_create(numero=i, defaults={'capacite': 4 if i <= 8 else 6, 'statut': statut})

# Codes promo
CodePromo.objects.get_or_create(code='BIENVENUE', defaults={'reduction_pct': 10, 'actif': True})
CodePromo.objects.get_or_create(code='FIDELITE20', defaults={'reduction_pct': 20, 'actif': True})
CodePromo.objects.get_or_create(code='WEEKEND15', defaults={'reduction_pct': 15, 'actif': True})

# Avis
avis_data = [
    ('Yasmine B.', 5, 'Tajine excellent, service rapide et très accueillant !', plat_objs['Tajine poulet-citron']),
    ('Omar T.', 4, 'Très bon couscous, un peu d\'attente mais ça vaut le coup.', plat_objs['Couscous royal']),
    ('Salma K.', 3, 'Plat correct mais présentation à améliorer.', plat_objs['Salade maison']),
    ('Rachid M.', 5, 'Meilleur restaurant du quartier, les brochettes sont incroyables !', plat_objs['Brochettes de bœuf']),
    ('Nadia F.', 4, 'Bonne ambiance, plats copieux. Je recommande la pastilla !', plat_objs['Pastilla au poulet']),
]
for nom, note, comm, plat in avis_data:
    Avis.objects.get_or_create(client_nom=nom, defaults={'note': note, 'commentaire': comm, 'plat': plat})

print("✅ Données de test créées avec succès !")
print("Comptes: gerant/pass1234, chef/pass1234, serveur1/pass1234, caissier/pass1234")

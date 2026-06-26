from django.db import models
from django.contrib.auth.models import User


class Employe(models.Model):
    ROLES = [('gerant','Gérant'),('chef','Chef cuisinier'),('serveur','Serveur'),('caissier','Caissier')]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES, default='serveur')
    telephone = models.CharField(max_length=20, blank=True)
    actif = models.BooleanField(default=True)
    date_embauche = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.get_role_display()})"


class Categorie(models.Model):
    nom = models.CharField(max_length=100)
    ordre = models.IntegerField(default=0)

    def __str__(self):
        return self.nom

    class Meta:
        ordering = ['ordre']


class Plat(models.Model):
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    categorie = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True, related_name='plats')
    disponible = models.BooleanField(default=True)
    image_url = models.URLField(blank=True)
    temps_preparation = models.IntegerField(default=15, help_text='En minutes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

    class Meta:
        ordering = ['categorie', 'nom']


class Ingredient(models.Model):
    UNITES = [('kg','Kilogramme'),('g','Gramme'),('L','Litre'),('ml','Millilitre'),('pcs','Pièce'),('boite','Boîte')]
    nom = models.CharField(max_length=100)
    quantite_stock = models.FloatField(default=0)
    quantite_min = models.FloatField(default=1, help_text='Seuil alerte')
    unite = models.CharField(max_length=10, choices=UNITES, default='kg')
    plats = models.ManyToManyField(Plat, through='PlatIngredient', related_name='ingredients')

    def __str__(self):
        return self.nom

    @property
    def en_alerte(self):
        return self.quantite_stock <= self.quantite_min

    @property
    def niveau_pct(self):
        if self.quantite_min == 0:
            return 100
        return min(100, int((self.quantite_stock / (self.quantite_min * 5)) * 100))


class PlatIngredient(models.Model):
    plat = models.ForeignKey(Plat, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantite = models.FloatField(default=1)


class Table(models.Model):
    STATUTS = [('libre','Libre'),('occupee','Occupée'),('reservee','Réservée'),('fermee','Fermée')]
    numero = models.IntegerField(unique=True)
    capacite = models.IntegerField(default=4)
    statut = models.CharField(max_length=10, choices=STATUTS, default='libre')
    zone = models.CharField(max_length=50, default='Salle principale')

    def __str__(self):
        return f"Table {self.numero}"

    class Meta:
        ordering = ['numero']


class Reservation(models.Model):
    STATUTS = [('confirmee','Confirmée'),('en_attente','En attente'),('annulee','Annulée'),('terminee','Terminée')]
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='reservations')
    client_nom = models.CharField(max_length=200)
    client_email = models.EmailField(blank=True)
    client_tel = models.CharField(max_length=20, blank=True)
    date_heure = models.DateTimeField()
    nombre_personnes = models.IntegerField(default=2)
    statut = models.CharField(max_length=15, choices=STATUTS, default='en_attente')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Résa {self.client_nom} - {self.date_heure}"


class CodePromo(models.Model):
    code = models.CharField(max_length=20, unique=True)
    reduction_pct = models.IntegerField(default=10)
    actif = models.BooleanField(default=True)
    date_expiration = models.DateField(null=True, blank=True)
    utilisations_max = models.IntegerField(default=100)
    utilisations_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.code} (-{self.reduction_pct}%)"


class Commande(models.Model):
    STATUTS = [('en_attente','En attente'),('en_preparation','En préparation'),('pret','Prêt'),('servi','Servi'),('paye','Payé'),('annulee','Annulée')]
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, related_name='commandes')
    serveur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='commandes_serveur')
    statut = models.CharField(max_length=15, choices=STATUTS, default='en_attente')
    code_promo = models.ForeignKey(CodePromo, on_delete=models.SET_NULL, null=True, blank=True)
    montant_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CMD-{self.pk:04d} Table {self.table}"

    def calculer_total(self):
        total = sum(item.sous_total for item in self.items.all())
        if self.code_promo and self.code_promo.actif:
            total = total * (1 - self.code_promo.reduction_pct / 100)
        self.montant_total = total
        self.save()
        return total


class CommandeItem(models.Model):
    STATUTS = [('en_attente','En attente'),('en_preparation','En préparation'),('pret','Prêt'),('servi','Servi')]
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='items')
    plat = models.ForeignKey(Plat, on_delete=models.CASCADE)
    quantite = models.IntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=15, choices=STATUTS, default='en_attente')
    notes = models.TextField(blank=True)

    @property
    def sous_total(self):
        return self.quantite * self.prix_unitaire


class Avis(models.Model):
    SENTIMENTS = [('positif', 'Positif'), ('neutre', 'Neutre'), ('negatif', 'Négatif')]
    client_nom = models.CharField(max_length=100)
    plat = models.ForeignKey(Plat, on_delete=models.SET_NULL, null=True, blank=True)
    note = models.IntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True)
    commentaire = models.TextField()
    commande = models.ForeignKey(Commande, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    valide = models.BooleanField(null=True, blank=True, default=None)
    sentiment = models.CharField(max_length=10, choices=SENTIMENTS, null=True, blank=True)
    sentiment_score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Avis {self.client_nom} - {self.note}★"

    class Meta:
        ordering = ['-created_at']


class Facturation(models.Model):
    MODES = [('especes','Espèces'),('carte','Carte bancaire'),('virement','Virement')]
    commande = models.OneToOneField(Commande, on_delete=models.CASCADE, related_name='facture')
    caissier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    montant_ttc = models.DecimalField(max_digits=10, decimal_places=2)
    mode_paiement = models.CharField(max_length=10, choices=MODES, default='especes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Facture CMD-{self.commande.pk:04d}"


class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    telephone = models.CharField(max_length=20, blank=True)
    date_naissance = models.DateField(null=True, blank=True)
    points_fidelite = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Client: {self.user.get_full_name() or self.user.username}"


class CommandeClient(models.Model):
    STATUTS = [('en_attente','En attente'),('confirmee','Confirmée'),('en_preparation','En préparation'),('prete','Prête'),('livree','Livrée'),('annulee','Annulée')]
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commandes_client')
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True)
    reservation = models.ForeignKey(Reservation, on_delete=models.SET_NULL, null=True, blank=True)
    commande_staff = models.OneToOneField('Commande', on_delete=models.SET_NULL, null=True, blank=True, related_name='commande_client_liee')
    statut = models.CharField(max_length=15, choices=STATUTS, default='en_attente')
    montant_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    code_promo = models.ForeignKey(CodePromo, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CmdClient-{self.pk} {self.client.username}"


class CommandeClientItem(models.Model):
    commande = models.ForeignKey(CommandeClient, on_delete=models.CASCADE, related_name='items')
    plat = models.ForeignKey(Plat, on_delete=models.CASCADE)
    quantite = models.IntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)

    @property
    def sous_total(self):
        return self.quantite * self.prix_unitaire


class Notification(models.Model):
    TYPES = [
        ('reservation', 'Réservation'),
        ('commande', 'Commande'),
        ('commande_prete', 'Commande prête'),
        ('reservation_confirmee', 'Réservation confirmée'),
        ('reservation_annulee', 'Réservation annulée'),
    ]
    ROLES_CIBLES = [
        ('all', 'Tous'),
        ('gerant', 'Gérant'),
        ('chef', 'Chef'),
        ('serveur', 'Serveur'),
        ('caissier', 'Caissier'),
        ('client', 'Client'),
    ]
    type = models.CharField(max_length=30, choices=TYPES)
    titre = models.CharField(max_length=200)
    message = models.TextField()
    role_cible = models.CharField(max_length=20, choices=ROLES_CIBLES, default='all')
    client_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    reservation = models.ForeignKey('Reservation', on_delete=models.SET_NULL, null=True, blank=True)
    commande = models.ForeignKey('Commande', on_delete=models.SET_NULL, null=True, blank=True)
    lue = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.titre}"

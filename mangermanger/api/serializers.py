from rest_framework import serializers
from django.contrib.auth.models import User
from restaurant.models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class EmployeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = Employe
        fields = '__all__'

    def get_nom_complet(self, obj):
        return obj.user.get_full_name() or obj.user.username


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'


class PlatSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.SerializerMethodField()

    class Meta:
        model = Plat
        fields = '__all__'

    def get_categorie_nom(self, obj):
        return obj.categorie.nom if obj.categorie else None


class IngredientSerializer(serializers.ModelSerializer):
    en_alerte = serializers.ReadOnlyField()
    niveau_pct = serializers.ReadOnlyField()

    class Meta:
        model = Ingredient
        fields = '__all__'


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    table_numero = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = '__all__'

    def get_table_numero(self, obj):
        return obj.table.numero if obj.table else None


class CodePromoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodePromo
        fields = '__all__'


class CommandeItemSerializer(serializers.ModelSerializer):
    plat_nom = serializers.SerializerMethodField()
    sous_total = serializers.ReadOnlyField()

    class Meta:
        model = CommandeItem
        fields = '__all__'

    def get_plat_nom(self, obj):
        return obj.plat.nom


class CommandeSerializer(serializers.ModelSerializer):
    items = CommandeItemSerializer(many=True, read_only=True)
    table_numero = serializers.SerializerMethodField()
    serveur_nom = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = '__all__'

    def get_table_numero(self, obj):
        return obj.table.numero if obj.table else None

    def get_serveur_nom(self, obj):
        return obj.serveur.get_full_name() if obj.serveur else None


class AvisSerializer(serializers.ModelSerializer):
    plat_nom = serializers.SerializerMethodField()

    class Meta:
        model = Avis
        fields = '__all__'
        read_only_fields = ['sentiment', 'sentiment_score', 'note']

    def get_plat_nom(self, obj):
        return obj.plat.nom if obj.plat else None


class FacturationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facturation
        fields = '__all__'


from restaurant.models import ClientProfile, CommandeClient, CommandeClientItem


class ClientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    nom_complet = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = ClientProfile
        fields = '__all__'

    def get_nom_complet(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_email(self, obj):
        return obj.user.email


class CommandeClientItemSerializer(serializers.ModelSerializer):
    plat_nom = serializers.SerializerMethodField()
    plat_description = serializers.SerializerMethodField()
    sous_total = serializers.ReadOnlyField()

    class Meta:
        model = CommandeClientItem
        fields = '__all__'

    def get_plat_nom(self, obj):
        return obj.plat.nom

    def get_plat_description(self, obj):
        return obj.plat.description


class CommandeClientSerializer(serializers.ModelSerializer):
    items = CommandeClientItemSerializer(many=True, read_only=True)
    client_nom = serializers.SerializerMethodField()

    class Meta:
        model = CommandeClient
        fields = '__all__'

    def get_client_nom(self, obj):
        return obj.client.get_full_name() or obj.client.username


from restaurant.models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

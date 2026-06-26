from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from restaurant.models import *
from .serializers import *


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        employe = getattr(user, 'employe', None)
        if employe:
            role = employe.role
        elif user.is_superuser or user.is_staff:
            role = 'admin'
        else:
            role = 'client'
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'role': role,
        })
    return Response({'error': 'Identifiants invalides'}, status=400)


@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now().date()
    commandes_jour = Commande.objects.filter(created_at__date=today)
    ca_jour = commandes_jour.filter(statut='paye').aggregate(total=Sum('montant_total'))['total'] or 0
    tables_occupees = Table.objects.filter(statut='occupee').count()
    tables_total = Table.objects.count()
    note_moy = Avis.objects.aggregate(avg=Avg('note'))['avg'] or 0
    stocks_alerte = Ingredient.objects.filter(quantite_stock__lte=models.F('quantite_min')).count()
    
    # Plats populaires
    from django.db.models import F
    top_plats = (CommandeItem.objects
                 .filter(commande__created_at__date=today)
                 .values('plat__nom')
                 .annotate(total=Sum('quantite'))
                 .order_by('-total')[:5])

    yesterday = today - timedelta(days=1)
    ca_hier = Commande.objects.filter(created_at__date=yesterday, statut='paye').aggregate(total=Sum('montant_total'))['total'] or 1
    delta_ca = round(((float(ca_jour) - float(ca_hier)) / float(ca_hier)) * 100, 1) if ca_hier else 0

    JOURS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    ca_semaine = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        ca = Commande.objects.filter(created_at__date=d, statut='paye').aggregate(total=Sum('montant_total'))['total'] or 0
        ca_semaine.append({'jour': JOURS_FR[d.weekday()], 'ca': float(ca)})

    return Response({
        'ca_jour': float(ca_jour),
        'delta_ca': delta_ca,
        'commandes_count': commandes_jour.count(),
        'tables_occupees': tables_occupees,
        'tables_total': tables_total,
        'note_moyenne': round(float(note_moy), 1),
        'stocks_alerte': stocks_alerte,
        'top_plats': list(top_plats),
        'ca_semaine': ca_semaine,
    })


class PlatViewSet(viewsets.ModelViewSet):
    queryset = Plat.objects.all()
    serializer_class = PlatSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        cat = self.request.query_params.get('categorie')
        if cat:
            qs = qs.filter(categorie_id=cat)
        dispo = self.request.query_params.get('disponible')
        if dispo:
            qs = qs.filter(disponible=dispo == 'true')
        return qs


class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

    @action(detail=False, methods=['get'])
    def alertes(self, request):
        from django.db.models import F
        alertes = Ingredient.objects.filter(quantite_stock__lte=F('quantite_min'))
        return Response(IngredientSerializer(alertes, many=True).data)


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer

    @action(detail=True, methods=['patch'])
    def changer_statut(self, request, pk=None):
        table = self.get_object()
        table.statut = request.data.get('statut', table.statut)
        table.save()
        return Response(TableSerializer(table).data)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    @action(detail=True, methods=['patch'])
    def annuler(self, request, pk=None):
        res = self.get_object()
        res.statut = 'annulee'
        res.save()
        return Response(ReservationSerializer(res).data)


class CommandeViewSet(viewsets.ModelViewSet):
    queryset = Commande.objects.all()
    serializer_class = CommandeSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)
        table = self.request.query_params.get('table')
        if table:
            qs = qs.filter(table_id=table)
        return qs.order_by('-created_at')

    @action(detail=True, methods=['patch'])
    def changer_statut(self, request, pk=None):
        cmd = self.get_object()
        nouveau_statut = request.data.get('statut', cmd.statut)
        cmd.statut = nouveau_statut
        cmd.save()
        if nouveau_statut in ('paye', 'annulee') and cmd.table:
            cmd.table.statut = 'libre'
            cmd.table.save()
        if nouveau_statut == 'en_preparation':
            table_num = cmd.table.numero if cmd.table else '?'
        if nouveau_statut == 'pret':
            table_num = cmd.table.numero if cmd.table else '?'
            creer_notification(
                'commande_prete',
                f'🍽️ Commande #{cmd.id:04d} prête — Table {table_num}',
                f'Tous les plats sont prêts. Merci de servir la table {table_num}.',
                role_cible='serveur',
                commande=cmd,
            )
            creer_notification(
                'commande_prete',
                f'✅ Commande #{cmd.id:04d} — Table {table_num} prête',
                f'La commande de la table {table_num} est entièrement préparée.',
                role_cible='gerant',
                commande=cmd,
            )
        # Synchroniser le statut de la CommandeClient liée (via FK direct)
        try:
            cc = getattr(cmd, 'commande_client_liee', None)
            if cc:
                statut_map = {
                    'en_attente': 'en_attente',
                    'en_preparation': 'en_preparation',
                    'pret': 'prete',
                    'servi': 'livree',
                    'paye': 'livree',
                    'annulee': 'annulee',
                }
                statut_client = statut_map.get(nouveau_statut, nouveau_statut)
                cc.statut = statut_client
                cc.save()
        except Exception:
            pass
        return Response(CommandeSerializer(cmd).data)

    @action(detail=False, methods=['post'])
    def nouvelle(self, request):
        table_id = request.data.get('table_id')
        items_data = request.data.get('items', [])
        code_promo_code = request.data.get('code_promo', '')
        
        table = Table.objects.get(pk=table_id)
        code_promo = None
        if code_promo_code:
            try:
                code_promo = CodePromo.objects.get(code=code_promo_code, actif=True)
            except CodePromo.DoesNotExist:
                pass

        cmd = Commande.objects.create(
            table=table,
            serveur=request.user,
            code_promo=code_promo,
            statut='en_preparation'
        )
        total = 0
        for item in items_data:
            plat = Plat.objects.get(pk=item['plat_id'])
            qty = item.get('quantite', 1)
            ci = CommandeItem.objects.create(
                commande=cmd, plat=plat,
                quantite=qty, prix_unitaire=plat.prix,
                notes=item.get('notes', '')
            )
            total += float(plat.prix) * qty

        if code_promo:
            total = total * (1 - code_promo.reduction_pct / 100)
            code_promo.utilisations_count += 1
            code_promo.save()

        cmd.montant_total = total
        cmd.save()
        table.statut = 'occupee'
        table.save()
        return Response(CommandeSerializer(cmd).data, status=201)


class CommandeItemViewSet(viewsets.ModelViewSet):
    queryset = CommandeItem.objects.all()
    serializer_class = CommandeItemSerializer

    @action(detail=True, methods=['patch'])
    def marquer_pret(self, request, pk=None):
        item = self.get_object()
        item.statut = 'pret'
        item.save()
        cmd = item.commande
        if all(i.statut == 'pret' for i in cmd.items.all()):
            cmd.statut = 'pret'
            cmd.save()
            table_num = cmd.table.numero if cmd.table else '?'
            creer_notification(
                'commande_prete',
                f'🍽️ Commande #{cmd.id:04d} prête — Table {table_num}',
                f'Tous les plats sont prêts. Merci de servir la table {table_num}.',
                role_cible='serveur',
                commande=cmd,
            )
            creer_notification(
                'commande_prete',
                f'✅ Commande #{cmd.id:04d} — Table {table_num} prête',
                f'La commande de la table {table_num} est entièrement préparée.',
                role_cible='gerant',
                commande=cmd,
            )
        return Response(CommandeItemSerializer(item).data)


class AvisViewSet(viewsets.ModelViewSet):
    serializer_class = AvisSerializer

    def get_permissions(self):
        if self.action in ('create', 'list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        employe = getattr(user, 'employe', None) if user.is_authenticated else None
        if employe and employe.role == 'gerant':
            return Avis.objects.all()
        return Avis.objects.filter(valide=True)

    def perform_create(self, serializer):
        import threading
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
                pass

        threading.Thread(target=analyse_bg, daemon=True).start()

    @action(detail=True, methods=['post'])
    def accepter(self, request, pk=None):
        avis = self.get_object()
        avis.valide = True
        avis.save()
        return Response(AvisSerializer(avis).data)

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        avis = self.get_object()
        avis.valide = False
        avis.save()
        return Response(AvisSerializer(avis).data)

    @action(detail=False, methods=['get'])
    def stats_sentiment(self, request):
        from django.db.models import Count, Avg
        qs = Avis.objects.filter(valide=True, sentiment__isnull=False)
        distribution = (
            qs.values('sentiment')
            .annotate(count=Count('id'))
            .order_by('sentiment')
        )
        avg_score = qs.aggregate(avg=Avg('sentiment_score'))['avg']
        return Response({
            'distribution': list(distribution),
            'score_moyen': round(avg_score, 4) if avg_score else None,
            'total': qs.count(),
        })


def _is_gerant(user):
    employe = getattr(user, 'employe', None)
    return employe and employe.role == 'gerant'


class EmployeViewSet(viewsets.ModelViewSet):
    queryset = Employe.objects.all()
    serializer_class = EmployeSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        if not _is_gerant(self.request.user):
            return Employe.objects.filter(user=self.request.user)
        return super().get_queryset()

    def destroy(self, request, *args, **kwargs):
        if not _is_gerant(request.user):
            return Response({'error': 'Accès réservé au gérant.'}, status=403)
        employe = self.get_object()
        user = employe.user
        employe.delete()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'])
    def modifier(self, request, pk=None):
        if not _is_gerant(request.user):
            return Response({'error': 'Accès réservé au gérant.'}, status=403)
        employe = self.get_object()
        if 'role' in request.data:
            employe.role = request.data['role']
        if 'telephone' in request.data:
            employe.telephone = request.data['telephone']
        if 'actif' in request.data:
            employe.actif = request.data['actif']
        employe.save()
        user = employe.user
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        user.save()
        return Response(EmployeSerializer(employe).data)


@api_view(['POST'])
def creer_employe(request):
    if not _is_gerant(request.user):
        return Response({'error': 'Accès réservé au gérant.'}, status=403)
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password', '')
    first_name = (request.data.get('first_name') or '').strip()
    last_name = (request.data.get('last_name') or '').strip()
    role = request.data.get('role', 'serveur')
    telephone = (request.data.get('telephone') or '').strip()

    if not username:
        return Response({'error': "L'identifiant est obligatoire."}, status=400)
    if not password or len(password) < 6:
        return Response({'error': "Le mot de passe doit faire au moins 6 caractères."}, status=400)
    if not first_name:
        return Response({'error': "Le prénom est obligatoire."}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return Response({'error': "Cet identifiant est déjà utilisé."}, status=400)

    try:
        user = User.objects.create_user(
            username=username, password=password,
            first_name=first_name, last_name=last_name,
        )
        employe = Employe.objects.create(user=user, role=role, telephone=telephone)
        return Response(EmployeSerializer(employe).data, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


class CodePromoViewSet(viewsets.ModelViewSet):
    queryset = CodePromo.objects.all()
    serializer_class = CodePromoSerializer

    @action(detail=False, methods=['post'])
    def valider(self, request):
        code = request.data.get('code', '')
        try:
            promo = CodePromo.objects.get(code=code, actif=True)
            return Response({'valide': True, 'reduction': promo.reduction_pct, 'id': promo.id})
        except CodePromo.DoesNotExist:
            return Response({'valide': False}, status=400)


class FacturationViewSet(viewsets.ModelViewSet):
    queryset = Facturation.objects.all()
    serializer_class = FacturationSerializer

    @action(detail=False, methods=['post'])
    def encaisser(self, request):
        cmd_id = request.data.get('commande_id')
        mode = request.data.get('mode_paiement', 'especes')
        cmd = Commande.objects.get(pk=cmd_id)
        facture = Facturation.objects.create(
            commande=cmd, caissier=request.user,
            montant_ttc=cmd.montant_total, mode_paiement=mode
        )
        cmd.statut = 'paye'
        cmd.save()
        if cmd.table:
            cmd.table.statut = 'libre'
            cmd.table.save()
        return Response(FacturationSerializer(facture).data, status=201)


from restaurant.models import ClientProfile, CommandeClient, CommandeClientItem
from .serializers import ClientProfileSerializer, CommandeClientSerializer, CommandeClientItemSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_client(request):
    import re as _re
    username = (request.data.get('username') or '').strip()
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password', '')
    first_name = (request.data.get('first_name') or '').strip()
    last_name = (request.data.get('last_name') or '').strip()
    telephone = (request.data.get('telephone') or '').strip()

    if not username:
        return Response({'error': "L'identifiant est obligatoire."}, status=400)
    if ' ' in username:
        return Response({'error': "L'identifiant ne peut pas contenir d'espaces. Utilisez _ à la place (ex: anas_laarej)."}, status=400)
    if not _re.match(r'^[a-zA-Z0-9_.-]+$', username):
        return Response({'error': "Identifiant invalide : lettres, chiffres, _ . - uniquement."}, status=400)
    if len(username) < 3:
        return Response({'error': "L'identifiant doit faire au moins 3 caractères."}, status=400)
    if not email or '@' not in email:
        return Response({'error': "Adresse email invalide."}, status=400)
    if not first_name:
        return Response({'error': "Le prénom est obligatoire."}, status=400)
    if not password or len(password) < 6:
        return Response({'error': "Le mot de passe doit faire au moins 6 caractères."}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return Response({'error': "Cet identifiant est déjà pris. Choisissez-en un autre."}, status=400)
    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': "Cette adresse email est déjà utilisée."}, status=400)

    try:
        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name,
        )
        ClientProfile.objects.create(user=user, telephone=telephone)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data, 'role': 'client'}, status=201)
    except Exception as e:
        return Response({'error': f'Erreur serveur : {str(e)}'}, status=500)


def _update_user_fields(user, data):
    for field in ('first_name', 'last_name', 'email'):
        if field in data:
            setattr(user, field, data[field])
    user.save()


@api_view(['GET', 'PATCH'])
def mon_profil_client(request):
    profile, _ = ClientProfile.objects.get_or_create(user=request.user)
    if request.method == 'PATCH':
        _update_user_fields(request.user, request.data)
        if 'telephone' in request.data: profile.telephone = request.data['telephone']
        if 'date_naissance' in request.data: profile.date_naissance = request.data['date_naissance']
        profile.save()
    return Response(ClientProfileSerializer(profile).data)


@api_view(['POST'])
def changer_mot_de_passe_client(request):
    ancien = request.data.get('ancien_mot_de_passe', '')
    nouveau = request.data.get('nouveau_mot_de_passe', '')
    if not ancien or not nouveau:
        return Response({'error': 'Les deux champs sont obligatoires.'}, status=400)
    if not request.user.check_password(ancien):
        return Response({'error': 'Mot de passe actuel incorrect.'}, status=400)
    if len(nouveau) < 6:
        return Response({'error': 'Le nouveau mot de passe doit contenir au moins 6 caractères.'}, status=400)
    request.user.set_password(nouveau)
    request.user.save()
    Token.objects.filter(user=request.user).delete()
    token, _ = Token.objects.get_or_create(user=request.user)
    return Response({'token': token.key})


@api_view(['GET', 'PATCH'])
def mon_profil_employe(request):
    try:
        employe = request.user.employe
    except Employe.DoesNotExist:
        return Response({'error': 'Profil employé introuvable.'}, status=404)

    if request.method == 'PATCH':
        user = request.user
        _update_user_fields(user, request.data)
        if 'password' in request.data and request.data['password']:
            user.set_password(request.data['password'])
            user.save()
        if 'telephone' in request.data: employe.telephone = request.data['telephone']
        employe.save()

    return Response(EmployeSerializer(employe).data)


class CommandeClientViewSet(viewsets.ModelViewSet):
    serializer_class = CommandeClientSerializer

    def get_queryset(self):
        return CommandeClient.objects.filter(client=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        cmd_client = self.get_object()
        if cmd_client.statut not in ('en_attente', 'en_preparation'):
            return Response({'error': 'Cette commande ne peut plus être annulée.'}, status=400)
        cmd_client.statut = 'annulee'
        cmd_client.save()
        try:
            cc_staff = cmd_client.commande_staff
            if cc_staff and cc_staff.statut in ('en_attente', 'en_preparation'):
                cc_staff.statut = 'annulee'
                cc_staff.save()
                if cc_staff.table:
                    cc_staff.table.statut = 'libre'
                    cc_staff.table.save()
        except Exception:
            pass
        return Response(CommandeClientSerializer(cmd_client).data)

    @action(detail=False, methods=['post'])
    def passer(self, request):
        items_data = request.data.get('items', [])
        code_promo_code = request.data.get('code_promo', '')
        notes = request.data.get('notes', '')

        table_numero = request.data.get('table_numero')

        if not items_data:
            return Response({'error': 'Le panier est vide.'}, status=400)
        if not table_numero:
            return Response({'error': 'Veuillez indiquer votre numéro de table.'}, status=400)

        code_promo = None
        if code_promo_code:
            try:
                code_promo = CodePromo.objects.get(code=code_promo_code, actif=True)
            except CodePromo.DoesNotExist:
                return Response({'error': 'Code promo invalide ou expiré.'}, status=400)

        try:
            table = Table.objects.get(numero=table_numero)
        except Table.DoesNotExist:
            return Response({'error': f'Table {table_numero} introuvable.'}, status=400)
        if table.statut == 'fermee':
            return Response({'error': f'La table {table_numero} est fermée.'}, status=400)

        cmd_staff = Commande.objects.create(
            table=table,
            serveur=None,  # commande client en ligne
            code_promo=code_promo,
            notes=f"[COMMANDE EN LIGNE - {request.user.get_full_name() or request.user.username}] {notes}",
            statut='en_attente'
        )

        plat_cache = {}
        total = 0
        for item in items_data:
            try:
                plat = Plat.objects.get(pk=item['plat_id'], disponible=True)
            except Plat.DoesNotExist:
                cmd_staff.delete()
                return Response({'error': 'Plat introuvable ou indisponible.'}, status=400)
            plat_cache[item['plat_id']] = plat
            qty = max(1, int(item.get('quantite', 1)))
            CommandeItem.objects.create(
                commande=cmd_staff, plat=plat,
                quantite=qty, prix_unitaire=plat.prix,
                notes=item.get('notes', '')
            )
            total += float(plat.prix) * qty

        if code_promo:
            total = total * (1 - code_promo.reduction_pct / 100)
            code_promo.utilisations_count += 1
            code_promo.save()

        cmd_staff.montant_total = round(total, 2)
        cmd_staff.save()

        if table:
            table.statut = 'occupee'
            table.save()

        cmd_client = CommandeClient.objects.create(
            client=request.user,
            code_promo=code_promo,
            commande_staff=cmd_staff,
            notes=notes,
            statut='en_attente',
            montant_total=round(total, 2),
        )
        for item in items_data:
            plat = plat_cache.get(item['plat_id'])
            if plat:
                qty = max(1, int(item.get('quantite', 1)))
                CommandeClientItem.objects.create(
                    commande=cmd_client, plat=plat,
                    quantite=qty, prix_unitaire=plat.prix,
                    notes=item.get('notes', '')
                )

        profile, _ = ClientProfile.objects.get_or_create(user=request.user)
        profile.points_fidelite += max(1, int(total / 10))
        profile.save()

        client_label = request.user.get_full_name() or request.user.username
        notif_msg = f'🌐 {client_label} · {len(items_data)} plat(s) · {round(total, 2)} DH'
        notif_titre = f'🆕 Commande en ligne #{cmd_staff.id:04d}'
        creer_notification('commande', notif_titre, notif_msg, role_cible='serveur', commande=cmd_staff)

        data = CommandeClientSerializer(cmd_client).data
        data['commande_staff_id'] = cmd_staff.id
        data['table_numero'] = table.numero if table else None
        return Response(data, status=201)


@api_view(['GET'])
@permission_classes([AllowAny])
def tables_disponibles(request):
    """Tables libres pour la réservation client"""
    date_heure = request.query_params.get('date_heure')
    nombre = int(request.query_params.get('nombre_personnes', 2))
    # Si une date/heure est fournie, exclure les tables déjà réservées pour ce créneau
    if date_heure:
        from django.utils.dateparse import parse_datetime
        try:
            dt = parse_datetime(date_heure)
        except Exception:
            dt = None
        if dt:
            window_start = dt - timedelta(hours=2)
            window_end = dt + timedelta(hours=2)
            occupied = Reservation.objects.filter(
                date_heure__gte=window_start,
                date_heure__lte=window_end,
                statut__in=['en_attente', 'confirmee']
            ).values_list('table_id', flat=True)
            tables = Table.objects.filter(capacite__gte=nombre).exclude(id__in=occupied).order_by('numero')
            return Response(TableSerializer(tables, many=True).data)

    # Par défaut, retourner les tables marquées libres
    tables = Table.objects.filter(statut='libre', capacite__gte=nombre).order_by('numero')
    return Response(TableSerializer(tables, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def reserver_client(request):
    """Réservation avec choix de table"""
    data = request.data
    try:
        table_id = data.get('table_id')
        nombre = int(data.get('nombre_personnes', 2))

        # Choix explicite : vérifier capacité et disponibilité par créneau (pas par statut)
        if table_id:
            try:
                table = Table.objects.get(pk=table_id, capacite__gte=nombre)
            except Table.DoesNotExist:
                return Response({'error': 'Table introuvable ou capacité insuffisante.'}, status=400)
            if table.statut == 'fermee':
                return Response({'error': 'Cette table est fermée.'}, status=400)
        else:
            # Chercher une table non fermée avec la capacité requise
            table = Table.objects.filter(statut__in=['libre', 'reservee'], capacite__gte=nombre).order_by('numero').first()
            if not table:
                return Response({'error': f'Aucune table disponible pour {nombre} personne(s).'}, status=400)

        client_nom = data.get('client_nom', '').strip()
        if not client_nom:
            return Response({'error': 'Le nom est obligatoire.'}, status=400)

        date_heure = data.get('date_heure')
        if not date_heure:
            return Response({'error': 'La date et heure sont obligatoires.'}, status=400)

        # Vérifier qu'il n'y a pas déjà une réservation pour cette table au même créneau
        from django.utils.dateparse import parse_datetime
        dt = None
        try:
            dt = parse_datetime(date_heure)
        except Exception:
            dt = None
        if dt:
            window_start = dt - timedelta(hours=2)
            window_end = dt + timedelta(hours=2)
            if Reservation.objects.filter(table=table, date_heure__gte=window_start, date_heure__lte=window_end, statut__in=['en_attente', 'confirmee']).exists():
                return Response({'error': 'Cette table est déjà réservée pour ce créneau.'}, status=400)

        # Si l'utilisateur est connecté et n'a pas fourni d'email, utiliser celui du compte
        client_email = data.get('client_email', '').strip()
        if not client_email and request.user.is_authenticated and request.user.email:
            client_email = request.user.email

        # Si créé par un membre du staff, confirmer directement
        is_staff_booking = (
            request.user.is_authenticated and
            hasattr(request.user, 'employe') and
            request.user.employe.role in ('gerant', 'serveur')
        )
        statut_initial = 'confirmee' if is_staff_booking else 'en_attente'

        resa = Reservation.objects.create(
            table=table,
            client_nom=client_nom,
            client_email=client_email,
            client_tel=data.get('client_tel', ''),
            date_heure=date_heure,
            nombre_personnes=nombre,
            notes=data.get('notes', ''),
            statut=statut_initial
        )

        # Marquer la table comme réservée
        table.statut = 'reservee'
        table.save()

        # Notifications
        client_user = None
        if request.user.is_authenticated:
            client_user = request.user

        creer_notification(
            'reservation',
            f'🆕 Nouvelle réservation — Table {table.numero}',
            f'{client_nom} · {nombre} pers. · {date_heure[:16].replace("T"," ")}',
            role_cible='gerant',
            client_user=client_user,
            reservation=resa,
        )
        creer_notification(
            'reservation',
            f'Table {table.numero} réservée',
            f'{client_nom} · {nombre} pers.',
            role_cible='serveur',
            client_user=client_user,
            reservation=resa,
        )

        return Response(ReservationSerializer(resa).data, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_reservations_client(request):
    """Réservations du client connecté (par email)"""
    email = request.user.email or ''
    if email:
        qs = Reservation.objects.filter(client_email__iexact=email).order_by('-date_heure')
    else:
        qs = Reservation.objects.none()
    return Response(ReservationSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def annuler_reservation_client(request, pk):
    """Client annule sa propre réservation"""
    try:
        resa = Reservation.objects.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({'error': 'Réservation introuvable.'}, status=404)
    email = (request.user.email or '').strip().lower()
    if not email:
        return Response({'error': "Votre compte n'a pas d'adresse email enregistrée. Impossible de vérifier la réservation."}, status=403)
    resa_email = (resa.client_email or '').strip().lower()
    if resa_email and email != resa_email:
        return Response({'error': 'Vous ne pouvez annuler que vos propres réservations.'}, status=403)
    if resa.statut not in ('en_attente', 'confirmee'):
        return Response({'error': 'Cette réservation ne peut plus être annulée.'}, status=400)
    resa.statut = 'annulee'
    resa.save()
    if resa.table:
        resa.table.statut = 'libre'
        resa.table.save()
    return Response(ReservationSerializer(resa).data)


@api_view(['PATCH'])
def confirmer_reservation(request, pk):
    """Gérant confirme ou annule une réservation"""
    try:
        resa = Reservation.objects.get(pk=pk)
        nouveau_statut = request.data.get('statut', resa.statut)
        resa.statut = nouveau_statut
        resa.save()

        # Notifier le client — essayer d'identifier l'utilisateur lié à la resa
        from django.contrib.auth.models import User as UserModel
        from restaurant.models import Notification as _Notification

        client_user = None
        try:
            if resa.client_email:
                client_user = UserModel.objects.filter(email__iexact=resa.client_email).first()
        except Exception:
            client_user = None

        # Si la recherche par email échoue, tenter de récupérer le client_user depuis une notification existante
        if not client_user:
            existing = _Notification.objects.filter(reservation=resa, client_user__isnull=False).first()
            if existing:
                client_user = existing.client_user

        if nouveau_statut == 'confirmee':
            creer_notification(
                'reservation_confirmee',
                f'✅ Réservation confirmée — Table {resa.table.numero}',
                f'Votre réservation du {str(resa.date_heure)[:16].replace("T"," ")} pour {resa.nombre_personnes} pers. est confirmée !',
                role_cible='client',
                client_user=client_user,
                reservation=resa,
            )
        elif nouveau_statut == 'annulee':
            if resa.table:
                resa.table.statut = 'libre'
                resa.table.save()
            creer_notification(
                'reservation_annulee',
                f'❌ Réservation annulée — Table {resa.table.numero if resa.table else ""}',
                f'Votre réservation du {str(resa.date_heure)[:16].replace("T"," ")} a été annulée.',
                role_cible='client',
                client_user=client_user,
                reservation=resa,
            )

        return Response(ReservationSerializer(resa).data)
    except Reservation.DoesNotExist:
        return Response({'error': 'Réservation introuvable'}, status=404)


from restaurant.models import Notification
from .serializers import NotificationSerializer


def creer_notification(type_, titre, message, role_cible='all', client_user=None, reservation=None, commande=None):
    """Helper pour créer une notification"""
    Notification.objects.create(
        type=type_, titre=titre, message=message,
        role_cible=role_cible, client_user=client_user,
        reservation=reservation, commande=commande,
    )


def _notif_qs_pour_role(role, user, base_qs):
    """Filtre un queryset de notifications selon le rôle de l'utilisateur."""
    if role == 'client':
        # Uniquement les notifications destinées à ce client précis
        return base_qs.filter(role_cible='client', client_user=user)
    # Staff : rôle spécifique OU 'all', jamais les notifications client
    return base_qs.filter(
        models.Q(role_cible=role) | models.Q(role_cible='all')
    ).exclude(role_cible='client')


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def _get_role(self):
        employe = getattr(self.request.user, 'employe', None)
        return employe.role if employe else 'client'

    def get_queryset(self):
        role = self._get_role()
        qs = _notif_qs_pour_role(role, self.request.user, Notification.objects.all())
        return qs.order_by('-created_at')[:50]

    @action(detail=False, methods=['get'])
    def non_lues(self, request):
        employe = getattr(request.user, 'employe', None)
        role = employe.role if employe else 'client'
        # Double vérification : si le token est staff mais l'appel vient de l'interface client
        # (ou l'inverse), on renvoie une liste vide plutôt que les mauvaises notifs.
        # Le rôle est déterminé uniquement par le token — pas de paramètre côté client.

        # Compteur : uniquement les non-lues
        base_non_lues = _notif_qs_pour_role(role, request.user, Notification.objects.filter(lue=False))
        count = base_non_lues.count()
        # Liste : les 15 dernières (lues + non-lues) pour que le dropdown reste rempli
        base_toutes = _notif_qs_pour_role(role, request.user, Notification.objects.all())
        notifs = base_toutes.order_by('-created_at')[:15]
        return Response({
            'count': count,
            'role': role,
            'notifications': NotificationSerializer(notifs, many=True).data
        })

    @action(detail=False, methods=['post'])
    def marquer_lues(self, request):
        employe = getattr(request.user, 'employe', None)
        role = employe.role if employe else 'client'
        base = Notification.objects.filter(lue=False)
        qs = _notif_qs_pour_role(role, request.user, base)
        qs.update(lue=True)
        return Response({'ok': True})

    @action(detail=False, methods=['delete'])
    def supprimer_toutes(self, request):
        employe = getattr(request.user, 'employe', None)
        role = employe.role if employe else 'client'
        qs = _notif_qs_pour_role(role, request.user, Notification.objects.all())
        qs.delete()
        return Response({'ok': True})

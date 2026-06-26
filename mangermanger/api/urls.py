from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('plats', views.PlatViewSet)
router.register('categories', views.CategorieViewSet)
router.register('ingredients', views.IngredientViewSet)
router.register('tables', views.TableViewSet)
router.register('reservations', views.ReservationViewSet)
router.register('commandes', views.CommandeViewSet)
router.register('commande-items', views.CommandeItemViewSet)
router.register('avis', views.AvisViewSet, basename='avis')
router.register('employes', views.EmployeViewSet)
router.register('codes-promo', views.CodePromoViewSet)
router.register('facturation', views.FacturationViewSet)
router.register('commandes-client', views.CommandeClientViewSet, basename='commandes-client')
router.register('notifications', views.NotificationViewSet, basename='notifications')

urlpatterns = [
    # Routes custom en premier pour ne pas être capturées par le router
    path('login/', views.login_view, name='login'),
    path('register/', views.register_client, name='register'),
    path('dashboard/', views.dashboard_stats, name='dashboard'),
    path('mon-profil/', views.mon_profil_client, name='mon-profil'),
    path('mon-profil-employe/', views.mon_profil_employe, name='mon-profil-employe'),
    path('reserver/', views.reserver_client, name='reserver'),
    path('tables-disponibles/', views.tables_disponibles, name='tables-disponibles'),
    path('reservations/<int:pk>/confirmer/', views.confirmer_reservation, name='confirmer-reservation'),
    path('employes/creer/', views.creer_employe, name='creer-employe'),
    path('mes-reservations/', views.mes_reservations_client, name='mes-reservations'),
    path('annuler-reservation/<int:pk>/', views.annuler_reservation_client, name='annuler-reservation-client'),
    path('changer-mot-de-passe/', views.changer_mot_de_passe_client, name='changer-mot-de-passe'),
    path('', include(router.urls)),
]

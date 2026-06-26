from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    # Toutes les routes non-API → React SPA (index.html)
    re_path(r'^(?!api/|admin/|static/).*$',
            TemplateView.as_view(template_name='index.html')),
]

# Servir les fichiers statiques en mode DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    
    
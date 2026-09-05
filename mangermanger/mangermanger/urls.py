from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from pathlib import Path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    # Fichiers du build React/Vite
    re_path(
        r'^assets/(?P<path>.*)$',
        serve,
        {'document_root': Path(settings.BASE_DIR) / 'frontend' / 'assets'}
    ),

    re_path(
        r'^images/(?P<path>.*)$',
        serve,
        {'document_root': Path(settings.BASE_DIR) / 'frontend' / 'images'}
    ),

    re_path(
        r'^favicon\.svg$',
        serve,
        {'document_root': Path(settings.BASE_DIR) / 'frontend'}
    ),

    # Toutes les routes non-API → React SPA
    re_path(
        r'^(?!api/|admin/|static/|assets/|images/|favicon\.svg$).*$',
        TemplateView.as_view(template_name='index.html')
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT
    )
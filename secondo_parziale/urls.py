from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    # Pannello di amministrazione
    path('admin/', admin.site.urls),

    path('catalog/', include('catalog.urls')),
    path('accounts/', include('accounts.urls')),
    path('me/', include('listeners.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
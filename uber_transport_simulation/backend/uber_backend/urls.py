# uber_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to the Uber backend API!")

urlpatterns = [
    path('', home),  # This will handle the root URL
    path('admin/', admin.site.urls),
    path('api/drivers/', include('drivers.urls')),  # Ensure 'api/' is the prefix here
    path('api/', include('users.urls')),  # Includes user routes
    path('api/', include('rides.urls')),
    path('api/', include('billing.urls')),
    path('api/', include('admin_panel.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

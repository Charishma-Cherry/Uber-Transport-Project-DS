# uber_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/drivers/', include('drivers.urls')),  # Ensure 'api/' is the prefix here
    path('api/', include('users.urls')),  # Includes user routes
    # Add additional routes for rides, billing, and drivers as needed
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

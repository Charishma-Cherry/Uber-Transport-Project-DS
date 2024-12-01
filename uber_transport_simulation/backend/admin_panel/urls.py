from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminViewSet

router = DefaultRouter()
router.register(r'admins', AdminViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('manage_users/', AdminViewSet.as_view({'get': 'manage_users'})),
    path('create_user/', AdminViewSet.as_view({'post': 'create_user'})),
    path('update_user/', AdminViewSet.as_view({'put': 'update_user'})),
    path('delete_user/', AdminViewSet.as_view({'delete': 'delete_user'})),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminViewSet

router = DefaultRouter()
router.register(r'admins', AdminViewSet)

urlpatterns = [
    path('', include(router.urls)),  
    #Customer Management
    path('admins/list_customers/', AdminViewSet.as_view({'get': 'list_customers'}), name='list-customers'),
    path('admins/add_customer/', AdminViewSet.as_view({'post': 'add_customer'}), name='add-customer'),
    path('admins/update_customer/<str:pk>/', AdminViewSet.as_view({'put': 'update_customer'}), name='update-customer'),
    path('admins/delete_customer/<str:pk>/', AdminViewSet.as_view({'delete': 'delete_customer'}), name='delete-customer'),
    #Driver Management
    path('admins/list_drivers/', AdminViewSet.as_view({'get': 'list_drivers'}), name='list-drivers'),
    path('admins/add_driver/', AdminViewSet.as_view({'post': 'add_driver'}), name='add-driver'),
    path('admins/update_driver/<str:pk>/', AdminViewSet.as_view({'put': 'update_driver'}), name='update-driver'),
    path('admins/delete_driver/<str:pk>/', AdminViewSet.as_view({'delete': 'delete_driver'}), name='delete-driver'),
    #Rides Management
    path('admins/list_rides/', AdminViewSet.as_view({'get': 'list_rides'}), name='list-rides'),
    # path('admins/review_ride/<str:pk>/', AdminViewSet.as_view({'get': 'review_ride'}), name='review-ride'),
    path('admins/update_ride/<str:pk>/', AdminViewSet.as_view({'put': 'update_ride'}), name='update-ride'),
    path('admins/delete_ride/<str:pk>/', AdminViewSet.as_view({'delete': 'delete_ride'}), name='delete-ride'),
]



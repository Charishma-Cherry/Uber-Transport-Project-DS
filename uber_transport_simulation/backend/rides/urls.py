from django.urls import path
from .views import RideViewSet


# Define view actions for the RideViewSet
ride_list = RideViewSet.as_view({
    'get': 'list',
    'post': 'create'
})


ride_create = RideViewSet.as_view({
    'post': 'create',
})


ride_detail = RideViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})


list_customer_rides = RideViewSet.as_view({
    'get': 'list_customer_rides'
})


list_driver_rides = RideViewSet.as_view({
    'get': 'list_driver_rides'
})


ride_statistics = RideViewSet.as_view({
    'get': 'ride_statistics'
})


update_status = RideViewSet.as_view({
    'patch': 'update_status'
})


urlpatterns = [
    # List all rides and create a new ride
    path('', ride_list, name='ride-list'),


    path('rides/', ride_create, name='ride-create'),


    # Retrieve, update, partially update, or delete a specific ride
    path('<int:pk>/', ride_detail, name='ride-detail'),


    # List all rides for a specific customer
    path('customer/<str:customer_id>/', list_customer_rides, name='customer-rides'),


    # List all rides for a specific driver
    path('driver/<str:driver_id>/', list_driver_rides, name='driver-rides'),


    # Get ride statistics by location
    path('statistics/location/', ride_statistics, name='ride-statistics'),


    # Update ride status
    path('<int:pk>/status/', update_status, name='update-status'),
]



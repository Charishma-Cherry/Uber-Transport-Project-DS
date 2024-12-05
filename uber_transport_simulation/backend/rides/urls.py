# from django.urls import path
# from .views import RideViewSet


# # Define view actions for the RideViewSet
# ride_list = RideViewSet.as_view({
#     'get': 'list',
#     'post': 'create'
# })


# ride_create = RideViewSet.as_view({
#     'post': 'create',
# })


# ride_detail = RideViewSet.as_view({
#     'get': 'retrieve',
#     'put': 'update',
#     'patch': 'partial_update',
#     'delete': 'destroy'
# })


# list_customer_rides = RideViewSet.as_view({
#     'get': 'list_customer_rides'
# })


# list_driver_rides = RideViewSet.as_view({
#     'get': 'list_driver_rides'
# })


# ride_statistics = RideViewSet.as_view({
#     'get': 'ride_statistics'
# })


# update_status = RideViewSet.as_view({
#     'patch': 'update_status'
# })

# ride_user_history = RideViewSet.as_view({
#     'get': 'ride_user_history'  # Correctly linked to the action in the RideViewSet
# })

# #--adding for driver details--- vaishnavi
# driver_rides = RideViewSet.as_view({
#     'get': 'driver_rides' # Include driver_rides action
# })

# ride_driver_completed_history = RideViewSet.as_view({
#     'get': 'driver_completed_history',
# })

# urlpatterns = [
#     # List all rides and create a new ride
#     path('', ride_list, name='ride-list'),


#     path('rides/', ride_create, name='ride-create'),


#     # Retrieve, update, partially update, or delete a specific ride
#     path('<int:pk>/', ride_detail, name='ride-detail'),


#     # List all rides for a specific customer
#     path('customer/<str:customer_id>/', list_customer_rides, name='customer-rides'),


#     # List all rides for a specific driver
#     path('driver/<str:driver_id>/', list_driver_rides, name='driver-rides'),


#     # Get ride statistics by location
#     path('statistics/location/', ride_statistics, name='ride-statistics'),


#     # Update ride status
#     path('<int:pk>/status/', update_status, name='update-status'),

#     path('user/ride-history/', ride_user_history, name='user-ride-history'),

#     path('driver-rides/', driver_rides, name='driver-rides'),  # Add the driver-rides endpoint

#     path('driver/completed-history/', ride_driver_completed_history, name='driver-completed-history'),

# ]


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

ride_user_history = RideViewSet.as_view({
    'get': 'ride_user_history'
})

driver_rides = RideViewSet.as_view({
    'get': 'driver_rides'
})

ride_driver_completed_history = RideViewSet.as_view({
    'get': 'driver_completed_history',
})
 

urlpatterns = [
    # Static routes go first
    path('driver/completed-history/', ride_driver_completed_history, name='driver-completed-history'),
    path('driver-rides/', driver_rides, name='driver-rides'),  # Add the driver-rides endpoint
    
    # Then dynamic routes
    path('driver/<str:driver_id>/', list_driver_rides, name='driver-rides'),

    # Other routes
    path('', ride_list, name='ride-list'),
    path('rides/', ride_create, name='ride-create'),
    path('<int:pk>/', ride_detail, name='ride-detail'),
    path('customer/<str:customer_id>/', list_customer_rides, name='customer-rides'),
    path('statistics/location/', ride_statistics, name='ride-statistics'),
    path('<int:pk>/status/', update_status, name='update-status'),
    path('user/ride-history/', ride_user_history, name='user-ride-history'),

]

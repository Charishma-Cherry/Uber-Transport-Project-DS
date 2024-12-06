from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminViewSet,AdminBillingViewSet

router = DefaultRouter()
router.register(r'admins', AdminViewSet)
router.register(r'billing', AdminBillingViewSet, basename='admin-billing')  # Admin-specific billing endpoints


urlpatterns = [
    path('', include(router.urls)),
    path('manage_users/', AdminViewSet.as_view({'get': 'manage_users'})),
    path('create_user/', AdminViewSet.as_view({'post': 'create_user'})),
    path('update_user/', AdminViewSet.as_view({'put': 'update_user'})),
    path('delete_user/', AdminViewSet.as_view({'delete': 'delete_user'})),
    path('billing/search/', AdminBillingViewSet.as_view({'post': 'search_bills'}), name='admin_billing_search'),
    path('billing/<int:pk>/details/', AdminBillingViewSet.as_view({'get': 'bill_details'}), name='admin_billing_details'),
    path('billing/<int:pk>/delete/', AdminBillingViewSet.as_view({'delete': 'delete_bill'}), name='admin_billing_delete'),
    path('billing/statistics/revenue-day/', AdminBillingViewSet.as_view({'get': 'statistics_revenue_per_day'}), name='admin_billing_revenue_per_day'),
    path('billing/statistics/total-rides-area/', AdminBillingViewSet.as_view({'get': 'statistics_total_rides_area'}), name='admin_billing_total_rides_area'),
    path('billing/statistics/rides-per-driver/', AdminBillingViewSet.as_view({'get': 'rides_per_driver'}), name='admin_billing_rides_per_driver'),
    path('billing/statistics/rides-per-customer/', AdminBillingViewSet.as_view({'get': 'rides_per_customer'}), name='admin_billing_rides_per_customer'),

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



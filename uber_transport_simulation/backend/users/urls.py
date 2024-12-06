from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet,user_ratings,get_user_pickup_location


router = DefaultRouter()
router.register(r'customers', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('user/ratings/', user_ratings, name='user-ratings'),
    path('user/pickup-location/', get_user_pickup_location, name='user_pickup_location'),

]
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import DriverViewSet

# router = DefaultRouter()
# router.register(r'drivers', DriverViewSet)

# urlpatterns = [
#     path('', include(router.urls)),
# ]



from django.urls import path
from .views import DriverSignupView, DriverProfileView, DriverLoginView,DriverUpdateProfileView, DriverDeleteProfileView 


urlpatterns = [
   path('signup/', DriverSignupView.as_view(), name='driver-signup'),
   path('login/', DriverLoginView.as_view(), name='driver-login'),
   path('<str:driver_id>/profile/', DriverProfileView.as_view(), name='driver-profile'),
   path('update_profile/', DriverUpdateProfileView.as_view(), name='driver-update-profile'),
   path('<str:driver_id>/delete_profile/', DriverDeleteProfileView.as_view(), name='driver-delete-profile'), 
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillingViewSet
from .views_ml import FarePredictionView

router = DefaultRouter()
router.register(r'billing', BillingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('predict_fare/', FarePredictionView.as_view(), name='predict_fare'),
]
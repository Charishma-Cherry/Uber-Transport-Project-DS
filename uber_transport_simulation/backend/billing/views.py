from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Billing
from .serializers import BillingSerializer
from django.db.models import Sum
from datetime import datetime

class BillingViewSet(viewsets.ModelViewSet):
    queryset = Billing.objects.all()
    serializer_class = BillingSerializer

    # (User) Generate Bill for a Customer for Each Ride (Billing History for Completed Rides)
    @action(detail=False, methods=['get'], url_path='history/customer/(?P<customer_id>[^/.]+)')
    def customer_billing_history(self, request, customer_id=None):
        """Returns the billing history for a specific customer."""
        queryset = Billing.objects.filter(customer__customer_id=customer_id)
        serializer = BillingSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # (Admin) Show Statistics (Revenue/Day Area Wise)
    @action(detail=False, methods=['get'], url_path='statistics/revenue/day')
    def revenue_per_day_area(self, request):
        """Shows total revenue generated per day and area."""
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        
        queryset = Billing.objects.all()
        if from_date:
            from_date = datetime.strptime(from_date, '%Y-%m-%d').date()
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            to_date = datetime.strptime(to_date, '%Y-%m-%d').date()
            queryset = queryset.filter(date__lte=to_date)

        revenue_stats = queryset.values('date', 'source_location').annotate(total_revenue=Sum('total_amount'))
        return Response(revenue_stats, status=status.HTTP_200_OK)

    # (Admin) Search for a Bill based on attributes per driver and customer
    @action(detail=False, methods=['post'], url_path='search')
    def search_billing(self, request):
        """Search for billing records based on customer ID, driver ID, or date range."""
        customer_id = request.data.get('customer_id')
        driver_id = request.data.get('driver_id')
        from_date = request.data.get('from_date')
        to_date = request.data.get('to_date')

        queryset = Billing.objects.all()
        
        if customer_id:
            queryset = queryset.filter(customer__customer_id=customer_id)
        if driver_id:
            queryset = queryset.filter(driver__driver_id=driver_id)
        if from_date:
            from_date = datetime.strptime(from_date, '%Y-%m-%d').date()
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            to_date = datetime.strptime(to_date, '%Y-%m-%d').date()
            queryset = queryset.filter(date__lte=to_date)

        serializer = BillingSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # (Admin) Display information about a bill
    def retrieve(self, request, *args, **kwargs):
        """Retrieve detailed information about a specific billing record."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        detailed_info = {
            "driver": instance.driver_id.__str__(),
            "customer": instance.customer_id.__str__(),
            "pickup_location": instance.source_location,
            "dropoff_location": instance.destination_location,
            "total_amount": instance.total_amount,
            "details": serializer.data
        }
        return Response(detailed_info, status=status.HTTP_200_OK)

    # (Driver) Summary of Driver Earnings
    @action(detail=False, methods=['get'], url_path='summary/driver/(?P<driver_id>[^/.]+)')
    def driver_earnings_summary(self, request, driver_id=None):
        """Show all bills for a specific driver and the total earnings."""
        queryset = Billing.objects.filter(driver__driver_id=driver_id)
        total_earnings = queryset.aggregate(total=Sum('total_amount'))['total'] or 0.0
        serializer = BillingSerializer(queryset, many=True)
        return Response({
            "total_earnings": total_earnings,
            "billing_records": serializer.data
        }, status=status.HTTP_200_OK)

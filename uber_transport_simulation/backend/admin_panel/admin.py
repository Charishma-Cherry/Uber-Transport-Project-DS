from django.contrib import admin
from billing.models import Billing
from .models import AdminProfile

# Register the AdminProfile model
admin.site.register(AdminProfile)

# Unregister the existing Billing model
admin.site.unregister(Billing)

# Re-register the Billing model with the custom admin class
class BillingAdmin(admin.ModelAdmin):
    list_display = (
        'billing_id',
        'date',
        'pickup_time',
        'total_amount',
        'source_location',
        'destination_location',
        'driver_name',
        'customer_name',
        'ride_display',
    )

    search_fields = [
        'billing_id',
        'driver_name',
        'customer_name',
        'source_location',
        'destination_location',
        'ride__ride_id',
    ]

    list_filter = ('date', 'source_location', 'destination_location')

    readonly_fields = [
        'billing_id',
        'date',
        'pickup_time',
        'distance_covered',
        'total_amount',
        'source_location',
        'destination_location',
        'driver_name',
        'customer_name',
        'ride_display',
    ]

    def ride_display(self, obj):
        return obj.ride.ride_id if obj.ride else "No Ride"
    ride_display.short_description = "Ride ID"

    fieldsets = (
        ("Billing Information", {
            "fields": ("billing_id", "date", "pickup_time", "total_amount")
        }),
        ("Ride Details", {
            "fields": ("ride_display", "distance_covered", "source_location", "destination_location"),
        }),
        ("Driver and Customer Details", {
            "fields": ("driver_name", "customer_name"),
        }),
    )

admin.site.register(Billing, BillingAdmin)

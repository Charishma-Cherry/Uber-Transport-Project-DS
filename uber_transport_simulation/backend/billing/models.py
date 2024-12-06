

from django.db import models
from drivers.models import Driver
from users.models import UserProfile
from rides.models import Ride
from django.core.validators import RegexValidator, MinValueValidator
import random
import logging

# Set up logging for debugging
logger = logging.getLogger(__name__)

# Validator for Billing ID
ssn_validator = RegexValidator(
    regex=r'^\d{3}-\d{2}-\d{4}$',
    message="Billing ID must be in the format 'XXX-XX-XXXX'."
)


class Billing(models.Model):
    billing_id = models.CharField(
        max_length=11,
        primary_key=True,
        unique=True,
        validators=[ssn_validator]
    )
    date = models.DateField(auto_now_add=True)
    pickup_time = models.TimeField()
    distance_covered = models.FloatField(
        validators=[MinValueValidator(0.1)]
    )
    total_amount = models.FloatField(
        validators=[MinValueValidator(0)]
    )
    source_location = models.CharField(max_length=100)
    destination_location = models.CharField(max_length=100)
    driver_id = models.ForeignKey(Driver, on_delete=models.CASCADE)
    driver_name = models.CharField(max_length=255, null=True, blank=True)  # Added for driver's name
    customer_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=255, null=True, blank=True)  # Added for customer's name
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        if self.ride:
            return f"Billing {self.billing_id} for Ride {self.ride.ride_id}"
        logger.warning(f"Billing {self.billing_id} has no associated Ride.")
        return f"Billing {self.billing_id} (No Ride Associated)"

    def save(self, *args, **kwargs):
        # Populate the driver and customer names before saving
        if self.driver_id:
            self.driver_name = f"{self.driver_id.first_name} {self.driver_id.last_name}"
        if self.customer_id:
            self.customer_name = self.customer_id.name

        # Generate a billing ID if it does not already exist
        if not self.billing_id:
            self.billing_id = self.generate_billing_id()
        
        super().save(*args, **kwargs)

    @staticmethod
    def generate_billing_id():
        """Generates a random billing ID in the format XXX-XX-XXXX"""
        first = str(random.randint(100, 999))
        second = str(random.randint(10, 99))
        third = str(random.randint(1000, 9999))
        return f"{first}-{second}-{third}"

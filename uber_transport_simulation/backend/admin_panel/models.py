from django.db import models
from django.contrib.auth.models import User
import re
import random
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator,MinValueValidator
from drivers.models import Driver
from users.models import UserProfile
from rides.models import Ride



class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    admin_id = models.CharField(max_length=11, unique=True, null=True)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    user_type = models.CharField(max_length=20, default="admin")

    def __str__(self):
        full_name = f"{self.user.first_name} {self.user.last_name}".strip()
        return f"{full_name if full_name else 'Anonymous'} ({self.admin_id})"

    class Meta:
        ordering = ['user__username']

    def save(self, *args, **kwargs):
        if not self.admin_id:
            self.admin_id = self.generate_unique_admin_id()
        super().save(*args, **kwargs)

    def clean(self):
        if not re.match(r"^\d{3}-\d{2}-\d{4}$", self.admin_id):
            raise ValidationError("Admin ID must be in the format XXX-XX-XXXX.")

    def generate_unique_admin_id(self):
        while True:
            admin_id = f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}"
            if not AdminProfile.objects.filter(admin_id=admin_id).exists():
                return admin_id

# Validator for Billing ID format
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
    driver_id = models.ForeignKey(
        Driver, 
        on_delete=models.CASCADE, 
        related_name='admin_panel_billing'  # Avoid conflict with 'billing.Billing.driver_id'
    )
    driver_name = models.CharField(max_length=255, null=True, blank=True)
    customer_id = models.ForeignKey(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name='admin_panel_billing'  # Avoid conflict with 'billing.Billing.customer_id'
    )
    customer_name = models.CharField(max_length=255, null=True, blank=True)
    ride = models.ForeignKey(
        Ride, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='admin_panel_billing'  # Avoid conflict with 'billing.Billing.ride'
    )

    def __str__(self):
        return f"Billing {self.billing_id} for Ride {self.ride.ride_id if self.ride else 'No Ride'}"

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

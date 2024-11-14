from django.db import models
from drivers.models import Driver 
from users.models import UserProfile
from django.core.validators import RegexValidator, MinValueValidator

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
    date = models.DateField()
    pickup_time = models.TimeField()
    dropoff_time = models.TimeField()
    distance_covered = models.FloatField(
        validators=[MinValueValidator(0.1)],  # Distance must be positive
        null=False,
        blank=False
    )
    total_amount = models.FloatField(
        validators=[MinValueValidator(0)],  # Amount should not be negative
        null=False,
        blank=False
    )
    source_location = models.CharField(
        max_length=100,
        null=False,
        blank=False
    )
    destination_location = models.CharField(
        max_length=100,
        null=False,
        blank=False
    )
    driver_id = models.ForeignKey(
        'drivers.Driver',  # Referenced as a string to avoid direct import
        on_delete=models.CASCADE
    )
    customer_id = models.ForeignKey(
        'users.UserProfile',  # Referenced as a string to avoid direct import
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"Billing {self.billing_id} for {self.customer_id}"

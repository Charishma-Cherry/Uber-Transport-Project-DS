from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import User

AVAILABLE_STATUS_CHOICES = [
        ('available', 'Available'),
        ('unavailable', 'Unavailable'),
    ]


class Driver(models.Model):
    # Link to Django's User model
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    
    # Driver-specific fields
    driver_id = models.CharField(
        max_length=11, 
        unique=True, 
        validators=[RegexValidator(regex=r'^\d{3}-\d{2}-\d{4}$', message="SSN must be in the format XXX-XX-XXXX")]
    )
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=20)
    zip_code = models.CharField(max_length=5)
    phone_number = models.CharField(max_length=10)
    email = models.EmailField(unique=True)
    car_number = models.CharField(max_length=7)
    car_name = models.CharField(max_length=50)
    rating = models.FloatField(default=0.0, blank=True)
    reviews = models.TextField(null=True, blank=True)
    introduction_media = models.FileField(upload_to='driver_introduction_media/', null=True, blank=True)
    rides_history = models.CharField(max_length=255, null=True, blank=True)
    #for driver willing to drive location
    location_state = models.CharField(max_length=255, null=True, blank=True)  # For location selection
    location_county = models.CharField(max_length=255, null=True, blank=True)
    location_city = models.CharField(max_length=255, null=True, blank=True)
    available_status = models.CharField(
        max_length=15,
        choices=AVAILABLE_STATUS_CHOICES,
        default='unavailable',
        help_text="Indicates whether the driver is available for rides"
    )

    # location_areas = models.TextField(null=True, blank=True)  # Comma-separated areas

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

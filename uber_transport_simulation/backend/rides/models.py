from django.db import models
from drivers.models import Driver
from users.models import User

class Ride(models.Model):
    RIDE_STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    )

    ride_id = models.AutoField(primary_key=True)  # Unique ride identifier
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rides')
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='rides', null=True, blank=True)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    pickup_datetime = models.DateTimeField()
    dropoff_datetime = models.DateTimeField(null=True, blank=True)
    distance = models.FloatField(null=True, blank=True)  # Distance covered
    status = models.CharField(max_length=10, choices=RIDE_STATUS_CHOICES, default='requested')

    def __str__(self):
        return f"Ride {self.ride_id} from {self.pickup_location} to {self.dropoff_location}"

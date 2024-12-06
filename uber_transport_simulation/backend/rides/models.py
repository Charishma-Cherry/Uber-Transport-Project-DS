from django.db import models
from drivers.models import Driver
from users.models import User
import logging
#from django.core.cache import cache

logger = logging.getLogger(__name__)



class Ride(models.Model):
   RIDE_STATUS_CHOICES = (
       ('requested', 'Requested'),
       ('ongoing', 'Ongoing'),
       ('completed', 'Completed'),
       ('canceled', 'Canceled'),
   )


   ride_id = models.AutoField(primary_key=True)  # Unique ride identifier
   customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rides')
   driver = models.ForeignKey(Driver, null=True, blank=True, on_delete=models.SET_NULL)
   customer_name = models.CharField(max_length=255, null=True, blank=True)  # Store customer name
   customer_profile_id = models.CharField(max_length=11, null=True, blank=True)  # Store customer ID
   driver_name = models.CharField(max_length=255, null=True, blank=True)  # Store driver name
   driver_unique_id = models.CharField(max_length=11, null=True, blank=True)  # Store driver ID
   pickup_location = models.CharField(max_length=255)
   dropoff_location = models.CharField(max_length=255)
   pickup_datetime = models.DateTimeField()
   dropoff_datetime = models.DateTimeField(null=True, blank=True) 
   distance = models.FloatField(null=True, blank=True)  # Distance covered
   duration = models.CharField(max_length=50, null=True, blank=True)  # Duration as a human-readable string
   fare = models.FloatField(null=True, blank=True)  # Fare calculated for the ride
   passenger_count = models.IntegerField(default=1)
   status = models.CharField(max_length=10, choices=RIDE_STATUS_CHOICES, default='requested')


   def save(self, *args, **kwargs):
       # Populate name and ID fields before saving
        if self.customer:
            self.customer_name = self.customer.profile.name
            self.customer_profile_id = self.customer.profile.customer_id
        if self.driver:
            self.driver_name = f"{self.driver.first_name} {self.driver.last_name}"
            self.driver_unique_id = self.driver.driver_id
        super().save(*args, **kwargs)

#    def save(self, *args, **kwargs):
#         super().save(*args, **kwargs)
#         logger.debug(f"Saving ride {self.ride_id}")
#         if self.customer:
#             cache.delete(f"ride_history_{self.customer.id}")
#             logger.debug(f"Invalidated cache for customer {self.customer.id}")
#         if self.driver:
#             cache.delete(f"driver_rides_{self.driver.id}")
#             logger.debug(f"Invalidated cache for driver {self.driver.id}")


   def __str__(self):
       return f"Ride {self.ride_id} from {self.pickup_location} to {self.dropoff_location}"
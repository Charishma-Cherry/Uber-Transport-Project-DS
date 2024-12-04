from django.core.management.base import BaseCommand
from faker import Faker
import random
from django.utils import timezone
from rides.models import Ride
from users.models import UserProfile
from django.contrib.auth.models import User

from drivers.models import Driver
from datetime import timedelta

faker = Faker()

class Command(BaseCommand):
    help = "Populate database with mock ride data"

    def handle(self, *args, **kwargs):
        self.create_rides(10000)

    def create_rides(self, n):
        # Fetch existing users and drivers to associate rides
        users = list(User.objects.all())  # List of UserProfile instances
        # drivers = list(Driver.objects.all())

        rides = []
        for _ in range(n):
            # Generate a future datetime (1 to 7 days ahead from now)
            future_time = timezone.now() + timedelta(days=random.randint(1, 7), hours=random.randint(1, 23), minutes=random.randint(1, 59))

            ride = Ride(
                customer=random.choice(users),  # Access the `user` field from `UserProfile` to get the User instance
                # driver=random.choice(drivers) if random.random() > 0.2 else None,  # 20% chance for unassigned drivers
                pickup_location=faker.address(),
                dropoff_location=faker.address(),
                pickup_datetime=future_time,  # Ensure the datetime is in the future
                status="requested",  # Default to 'requested'
            )
            rides.append(ride)

            if len(rides) >= 500:  # Insert rides in batches of 500
                Ride.objects.bulk_create(rides)
                self.stdout.write(f"Created {len(rides)} rides so far.")
                rides = []  # Reset for next batch

        if rides:  # Insert remaining rides
            Ride.objects.bulk_create(rides)
            self.stdout.write(f"Created {n} rides.")

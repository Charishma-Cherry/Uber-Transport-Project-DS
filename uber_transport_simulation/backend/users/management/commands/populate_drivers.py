from django.core.management.base import BaseCommand
from faker import Faker
import random
from django.db.utils import IntegrityError
from drivers.models import Driver
from django.contrib.auth.models import User  # Import the User model
import time
import csv
from django.db import transaction  # For handling transactions

faker = Faker()

class Command(BaseCommand):
    help = "Populate database with mock data for testing and export driver credentials to CSV"

    def handle(self, *args, **kwargs):
        self.create_drivers_and_export_to_csv(10000)

    def create_drivers_and_export_to_csv(self, n):
        drivers = []
        email_set = set()  # To keep track of unique emails for drivers
        common_password = 'admin'  # Set a common password for all drivers
        csv_file_path = 'drivers_credentials.csv'  # Path where CSV will be saved

        # Open the CSV file in write mode
        with open(csv_file_path, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['email', 'password'])  # Write header row

            for i in range(1, n + 1):
                self.stdout.write(f"Processing driver {i}...")  # Debug: Show progress

                # Ensure unique email
                while True:
                    email = faker.email()  # Generate a new email using faker
                    if email not in email_set:
                        email_set.add(email)
                        break

                # Ensure unique username
                username = faker.user_name()  # Generate a random username
                while User.objects.filter(username=username).exists():
                    # If the username already exists, retry with a new one
                    username = faker.user_name()
                    time.sleep(0.1)  # Optional: Sleep a bit to avoid rapid requests that might hit DB limits

                if not User.objects.filter(username=email).exists():
                    # Create the user object
                    user = User.objects.create_user(
                    username=email,  # Ensure it's unique
                    email=email,
                    password=common_password,  # Set the common password
                    )
                else:
                    continue

                


                # Create the driver object linked to the user
                driver = Driver(
                    user=user,  # Link the created user to the driver
                    driver_id=f"{random.randint(100, 999)}-{random.randint(10, 99):02}-{random.randint(1000, 9999)}",  # Create SSN format for driver_id
                    first_name=faker.first_name(),
                    last_name=faker.last_name(),
                    email=email,  # Ensure unique email
                    address=faker.address(),
                    city=faker.city(),
                    state=faker.state(),
                    zip_code=faker.zipcode(),
                    phone_number=faker.phone_number(),
                    car_number=f"{faker.random_uppercase_letter()}{faker.random_uppercase_letter()}-{faker.random_int(1000, 9999)}",
                    car_name=faker.word(),  # Replaced vehicle_make
                )
                drivers.append(driver)

                # Write email and common password to CSV file
                writer.writerow([email, common_password])

                # Insert drivers in batches of 500
                if len(drivers) >= 500:
                    try:
                        with transaction.atomic():  # Ensure batch insert is wrapped in a transaction
                            Driver.objects.bulk_create(drivers)
                            self.stdout.write(f"Created {len(drivers)} drivers so far.")
                            drivers = []  # Reset the list for the next batch
                    except IntegrityError as e:
                        self.stderr.write(f"Error creating drivers: {e}")
                        break

        # Insert remaining drivers
        if drivers:
            try:
                with transaction.atomic():  # Ensure batch insert is wrapped in a transaction
                    Driver.objects.bulk_create(drivers)
                    self.stdout.write(f"Created {n} drivers.")
            except IntegrityError as e:
                self.stderr.write(f"Error creating drivers: {e}")

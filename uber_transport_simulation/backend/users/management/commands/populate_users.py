import csv
from django.core.management.base import BaseCommand
from faker import Faker
import random
from users.models import UserProfile
from django.contrib.auth.models import User
from django.db.utils import IntegrityError

faker = Faker()

class Command(BaseCommand):
    help = "Populate database with mock data for testing and export user credentials to CSV"

    def handle(self, *args, **kwargs):
        self.create_users_and_export_to_csv(10000)

    def create_users_and_export_to_csv(self, n):
        users = []
        user_profiles = []
        username_set = set()  # To keep track of unique usernames for users
        email_set = set()  # To keep track of unique emails for users
        common_password = 'admin'  # Set a common password for all users
        csv_file_path = 'users_credentials.csv'  # Path where CSV will be saved

        # Open the CSV file in write mode
        with open(csv_file_path, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['username', 'password'])  # Write header row

            for i in range(1, n + 1):
                # Ensure unique username
                while True:
                    username = faker.user_name()  # Generate a new username using faker
                    if username not in username_set:
                        username_set.add(username)
                        break
                
                # Ensure unique email
                while True:
                    email = faker.email()  # Generate a new email using faker
                    if email not in email_set:
                        email_set.add(email)
                        break

                # Create the user
                if not User.objects.filter(username=username).exists():
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=common_password,
                    )
                else:
                    continue
              

                # Create user profile
                user_profile = UserProfile(
                    user=user,  # Link to the created user
                    customer_id=f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}",  # Unique customer ID
                    name=faker.name(),
                    phone_number=faker.phone_number(),
                    address=faker.address(),
                    city=faker.city(),
                    state=faker.state(),
                    zip_code=faker.zipcode(),
                    credit_card_details=faker.credit_card_number(),
                    date_of_birth=faker.date_of_birth(),
                )
                user_profiles.append(user_profile)

                # Write username and common password to CSV file
                writer.writerow([username, common_password])

                # Insert users and profiles in bulk every 500 entries
                if len(user_profiles) >= 500:
                    try:
                        # User.objects.bulk_create(users)
                        UserProfile.objects.bulk_create(user_profiles)
                        self.stdout.write(f"Created {len(users)} users and profiles so far.")
                        # users.clear()  # Clear the users list for the next batch
                        user_profiles.clear()  # Clear the user_profiles list for the next batch
                    except IntegrityError as e:
                        self.stderr.write(f"Error creating users or profiles: {e}")
                        break

        # Insert remaining users and profiles if any
        if user_profiles:
            try:
                # User.objects.bulk_create(users)
                UserProfile.objects.bulk_create(user_profiles)
                self.stdout.write(f"Created {n} users and their profiles.")
            except IntegrityError as e:
                self.stderr.write(f"Error creating remaining users or profiles: {e}")

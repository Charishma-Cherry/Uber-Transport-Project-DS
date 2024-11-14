from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import re
import random
from django.core.exceptions import ValidationError

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    customer_id = models.CharField(max_length=11, unique=True, null=True)
    name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    credit_card_details = models.CharField(max_length=255, blank=True, null=True)
    rating = models.FloatField(default=5.0)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    nickname = models.CharField(max_length=100, blank=True)
    user_type = models.CharField(max_length=20, default="customer")

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.customer_id})"

    class Meta:
        ordering = ['user__username']

    def save(self, *args, **kwargs):
        # Generate a unique customer_id if not already set
        if not self.customer_id:
            self.customer_id = self.generate_unique_customer_id()
        super().save(*args, **kwargs)

    def clean(self):
        # Validate customer_id format
        if not re.match(r"^\d{3}-\d{2}-\d{4}$", self.customer_id):
            raise ValidationError("Customer ID must be in the format XXX-XX-XXXX.")

    def generate_unique_customer_id(self):
        # Generate a random SSN-format ID and ensure it's unique
        while True:
            customer_id = f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}"
            if not UserProfile.objects.filter(customer_id=customer_id).exists():
                return customer_id
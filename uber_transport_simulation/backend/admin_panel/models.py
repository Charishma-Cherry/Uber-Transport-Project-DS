from django.db import models
from django.contrib.auth.models import User
import re
import random
from django.core.exceptions import ValidationError

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

from django.contrib import admin

from .models import Driver  # Import the Restaurant and Dish models

# Register the Driver model with the admin site
admin.site.register(Driver)


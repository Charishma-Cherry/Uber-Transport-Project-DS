# from django.db import models
# from django.core.validators import RegexValidator
# from django.contrib.auth.models import User


# class Driver(models.Model):
#    # Link to Django's User model
#    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
  
#    # Driver-specific fields
#    driver_id = models.CharField(
#        max_length=11,
#        unique=True,
#        validators=[RegexValidator(regex=r'^\d{3}-\d{2}-\d{4}$', message="SSN must be in the format XXX-XX-XXXX")]
#    )
#    first_name = models.CharField(max_length=50)
#    last_name = models.CharField(max_length=50)
#    address = models.CharField(max_length=255, null=True, blank=True)
#    city = models.CharField(max_length=50)
#    state = models.CharField(max_length=20)
#    zip_code = models.CharField(max_length=5)
#    phone_number = models.CharField(max_length=10)
#    email = models.EmailField(unique=True)
#    car_number = models.CharField(max_length=7)
#    car_name = models.CharField(max_length=50)
#    rating = models.FloatField(default=0.0, blank=True)
#    reviews = models.TextField(null=True, blank=True)
#    introduction_media = models.FileField(upload_to='driver_introduction_media/', null=True, blank=True)
#    rides_history = models.CharField(max_length=255, null=True, blank=True)


#    def __str__(self):
#        return f"{self.first_name} {self.last_name}"













# # # models.py
# # from django.db import models
# # from django.core.validators import RegexValidator

# # class Driver(models.Model):
# #     USER_TYPES = (('driver', 'Driver'),)
# #     user_type = models.CharField(max_length=10, choices=USER_TYPES, default='driver')

# #     ssn_validator = RegexValidator(
# #         regex=r'^\d{3}-\d{2}-\d{4}$',
# #         message="SSN must be in the format XXX-XX-XXXX"
# #     )

# #     driver_id = models.CharField(
# #         max_length=11,
# #         unique=True,
# #         validators=[ssn_validator],
# #         help_text="Format: XXX-XX-XXXX"
# #     )  # SSN format
    
# #     first_name = models.CharField(max_length=50)
# #     last_name = models.CharField(max_length=50)
# #     address = models.CharField(max_length=255)
# #     city = models.CharField(max_length=50)
# #     state = models.CharField(max_length=20)
# #     zip_code = models.CharField(max_length=10)
# #     phone_number = models.CharField(max_length=10)
# #     email = models.EmailField(unique=True)
# #     car_number = models.CharField(max_length=20,default="Unknown Car")
# #     car_name = models.CharField(max_length=20)
# #     rating = models.FloatField(default=0.0)
# #     reviews = models.TextField(null=True, blank=True)
# #     introduction_media = models.JSONField()  # Store links to images/videos
# #     rides_history = models.JSONField(null=True, blank=True)

# #     def __str__(self):
# #         return f"{self.first_name} {self.last_name}"


from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import User


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


   def __str__(self):
       return f"{self.first_name} {self.last_name}"


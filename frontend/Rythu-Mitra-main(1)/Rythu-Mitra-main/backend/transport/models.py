from django.db import models

class Transport(models.Model):
    vehicle_type = models.CharField(max_length=100)
    driver_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=100)
    available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.vehicle_type} - {self.driver_name}"

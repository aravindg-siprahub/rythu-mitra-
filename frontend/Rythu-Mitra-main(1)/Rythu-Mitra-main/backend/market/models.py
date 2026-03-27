from django.db import models

class Market(models.Model):
    crop_name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=100)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.crop_name

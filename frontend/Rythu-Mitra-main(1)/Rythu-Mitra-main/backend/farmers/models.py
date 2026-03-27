from django.db import models

class Farmer(models.Model):
    name = models.CharField(max_length=100)
    village = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.name

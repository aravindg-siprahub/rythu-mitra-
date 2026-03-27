from django.db import models

class Worker(models.Model):
    name = models.CharField(max_length=100)
    skill = models.CharField(max_length=100)
    available = models.BooleanField(default=True)
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.name

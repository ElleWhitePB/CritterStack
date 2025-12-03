from django.db import models

class Biome(models.Model):

    name = models.CharField(max_length=100)
    description = models.TextField()
    climate = models.CharField(max_length=50, default='unknown')
    peril_rating = models.CharField(max_length=50, default='unknown')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

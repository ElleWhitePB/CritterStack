from django.db import models

class Biome(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    climate = models.CharField(max_length=50, default="unknown", blank=True, null=True)
    peril_rating = models.CharField(
        max_length=50, default="unknown", blank=True, null=True
    )
    magic_level = models.CharField(
        max_length=50, default="unknown", blank=True, null=True
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

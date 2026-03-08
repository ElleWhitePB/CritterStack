from django.db import IntegrityError, transaction
from django.test import TestCase

from biomes.models import Biome


class BiomeModelTests(TestCase):
    def test_name_must_be_unique(self):
        Biome.objects.create(
            name="Forest",
            description="Dense woodland biome.",
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Biome.objects.create(
                    name="Forest",
                    description="Duplicate forest biome.",
                )
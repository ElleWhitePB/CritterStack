from django.core.management.base import BaseCommand
from biomes.models import Biome

DEFAULT_BIOMES = [
    {
        "name": "Whispering Thicket",
        "description": "Dense twisting woods where the trees gossip loudly at night.",
        "climate": "temperate",
        "magic_level": "moderate",
        "peril_rating": "mildly unsettling",
    },
    {
        "name": "Glimmerfen Marsh",
        "description": "Bioluminescent wetlands full of glowing reeds and confused frogs.",
        "climate": "humid",
        "magic_level": "high",
        "peril_rating": "squishy and questionable",
    },
    {
        "name": "Stormglass Plateau",
        "description": "A high windy mesa where lightning behaves suspiciously sentient.",
        "climate": "windy",
        "magic_level": "high",
        "peril_rating": "zap-happy",
    },
    {
        "name": "Ashdrift Dunes",
        "description": "A desert where the sand moves like it's trying to escape the sun.",
        "climate": "hot",
        "magic_level": "low",
        "peril_rating": "bring extra water",
    },
    {
        "name": "Moonshadow Glades",
        "description": "Cool twilight meadows where the shadows are not where you left them.",
        "climate": "cool",
        "magic_level": "moderate",
        "peril_rating": "dreamlike danger",
    },
]


class Command(BaseCommand):
    help = "Seeds the database with default biomes."

    def handle(self, *args, **options):
        for biome_data in DEFAULT_BIOMES:
            obj, created = Biome.objects.get_or_create(
                name=biome_data["name"],
                defaults=biome_data,
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created biome: {obj.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Skipped (already exists): {obj.name}"))

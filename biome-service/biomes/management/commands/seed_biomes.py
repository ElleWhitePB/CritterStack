from django.core.management.base import BaseCommand
from biomes.models import Biome

DEFAULT_BIOMES = [
    {
        "name": "The Whispering Wood",
        "description": "A forest so old the trees have developed opinions. Footsteps echo back slightly wrong, and the canopy rearranges itself when no one is watching.",
        "climate": "temperate",
        "magic_level": "moderate",
        "peril_rating": "unsettling but navigable",
    },
    {
        "name": "Emberfen Marsh",
        "description": "A sulfurous wetland where pockets of subterranean fire vent through the mud. The water is warm, the reeds are singed, and the frogs have developed heat tolerance.",
        "climate": "humid",
        "magic_level": "low",
        "peril_rating": "watch your step",
    },
    {
        "name": "The Hollow Peaks",
        "description": "A mountain range that is entirely hollow. The interior is a separate ecosystem of its own, including weather. The echoes are six seconds too slow.",
        "climate": "alpine",
        "magic_level": "high",
        "peril_rating": "disorienting",
    },
    {
        "name": "Gloomfall Caverns",
        "description": "A vast underground cavern system illuminated only by bioluminescent mold. Time passes at a slightly different rate here. Field reports vary wildly on how long expeditions took.",
        "climate": "subterranean",
        "magic_level": "high",
        "peril_rating": "existentially troubling",
    },
    {
        "name": "The Lumenwild Expanse",
        "description": "An open plain where ambient magical radiation has made everything faintly luminous. Visibility is excellent. Camouflage is impossible. Creatures here have adapted accordingly.",
        "climate": "arid",
        "magic_level": "extreme",
        "peril_rating": "moderate if visible",
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

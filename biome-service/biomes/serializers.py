from rest_framework import serializers
from .models import Biome


class BiomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Biome
        fields = ["id", "name", "description", "climate", "peril_rating", "magic_level", "is_active"]
        read_only_fields = ["id"]

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError("Name must be at least 3 characters.")
        if len(value) > 25:
            raise serializers.ValidationError("Name cannot be more than 25 characters.")
        if not value[0].isalpha():
            raise serializers.ValidationError("Name must start with a letter.")
        if Biome.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A biome with this name already exists.")

        return value

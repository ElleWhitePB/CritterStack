from django.test import TestCase
from biomes.models import Biome
from biomes.serializers import BiomeSerializer


class BiomeSerializerValidationTests(TestCase):

    def _valid_data(self, **overrides):
        return {"name": "Misty Hollow", "description": "A foggy place.", **overrides}

    def test_valid_data_passes(self):
        serializer = BiomeSerializer(data=self._valid_data())
        self.assertTrue(serializer.is_valid())

    def test_name_too_short_fails(self):
        serializer = BiomeSerializer(data=self._valid_data(name="AB"))
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_name_too_long_fails(self):
        serializer = BiomeSerializer(data=self._valid_data(name="A" * 51))
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_name_must_start_with_letter(self):
        serializer = BiomeSerializer(data=self._valid_data(name="123 Hollow"))
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_duplicate_name_case_insensitive_fails(self):
        Biome.objects.create(name="Misty Hollow", description="Original.")
        serializer = BiomeSerializer(data=self._valid_data(name="misty hollow"))
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_patch_with_same_name_does_not_fail_uniqueness(self):
        biome = Biome.objects.create(name="Misty Hollow", description="Original.")
        serializer = BiomeSerializer(biome, data={"description": "Updated."}, partial=True)
        self.assertTrue(serializer.is_valid())

    def test_name_is_stripped_of_whitespace(self):
        serializer = BiomeSerializer(data=self._valid_data(name="  Misty Hollow  "))
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["name"], "Misty Hollow")

    def test_description_is_required(self):
        serializer = BiomeSerializer(data={"name": "Misty Hollow"})
        self.assertFalse(serializer.is_valid())
        self.assertIn("description", serializer.errors)

    def test_id_is_read_only(self):
        serializer = BiomeSerializer(data=self._valid_data())
        serializer.is_valid()
        self.assertNotIn("id", serializer.validated_data)

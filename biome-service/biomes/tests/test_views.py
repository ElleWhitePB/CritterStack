from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from biomes.models import Biome


def make_biome(**kwargs):
    defaults = {"name": "Whispering Thicket", "description": "A quiet forest."}
    return Biome.objects.create(**{**defaults, **kwargs})


# ─── Health ────────────────────────────────────────────────────

class HealthCheckTests(APITestCase):

    def test_health_returns_ok(self):
        response = self.client.get(reverse("health"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")


# ─── GET /biomes/ ──────────────────────────────────────────────

class BiomeListTests(APITestCase):

    def setUp(self):
        self.active = make_biome(name="Whispering Thicket")
        self.inactive = make_biome(name="Dead Flats", is_active=False)

    def test_list_returns_200(self):
        response = self.client.get(reverse("biome-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_excludes_inactive_by_default(self):
        response = self.client.get(reverse("biome-list"))
        names = [b["name"] for b in response.data]
        self.assertIn("Whispering Thicket", names)
        self.assertNotIn("Dead Flats", names)

    def test_include_inactive_returns_all(self):
        response = self.client.get(reverse("biome-list"), {"include_inactive": "true"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [b["name"] for b in response.data]
        self.assertIn("Whispering Thicket", names)
        self.assertIn("Dead Flats", names)


# ─── GET /biomes/:id/ ──────────────────────────────────────────

class BiomeDetailTests(APITestCase):

    def setUp(self):
        self.biome = make_biome()

    def test_retrieve_returns_200(self):
        url = reverse("biome-detail", args=[self.biome.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.biome.name)

    def test_retrieve_nonexistent_returns_404(self):
        url = reverse("biome-detail", args=[9999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ─── POST /biomes/ ─────────────────────────────────────────────

class BiomeCreateTests(APITestCase):

    def test_create_valid_biome_returns_201(self):
        data = {"name": "Glimmerfen Marsh", "description": "A glowing swamp."}
        response = self.client.post(reverse("biome-list"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Glimmerfen Marsh")
        self.assertTrue(Biome.objects.filter(name="Glimmerfen Marsh").exists())

    def test_create_duplicate_name_returns_400(self):
        make_biome(name="Glimmerfen Marsh")
        data = {"name": "glimmerfen marsh", "description": "Duplicate."}
        response = self.client.post(reverse("biome-list"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_create_missing_description_returns_400(self):
        data = {"name": "Glimmerfen Marsh"}
        response = self.client.post(reverse("biome-list"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("description", response.data)

    def test_create_short_name_returns_400(self):
        data = {"name": "AB", "description": "Too short."}
        response = self.client.post(reverse("biome-list"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_new_biome_is_active_by_default(self):
        data = {"name": "Glimmerfen Marsh", "description": "A glowing swamp."}
        response = self.client.post(reverse("biome-list"), data, format="json")
        self.assertTrue(response.data["is_active"])


# ─── PATCH /biomes/:id/ ────────────────────────────────────────

class BiomeUpdateTests(APITestCase):

    def setUp(self):
        self.biome = make_biome()

    def test_patch_description_returns_200(self):
        url = reverse("biome-detail", args=[self.biome.pk])
        response = self.client.patch(url, {"description": "Updated."}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Updated.")

    def test_patch_is_active_toggles_field(self):
        url = reverse("biome-detail", args=[self.biome.pk])
        response = self.client.patch(url, {"is_active": False}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_active"])
        self.biome.refresh_from_db()
        self.assertFalse(self.biome.is_active)

    def test_put_is_not_allowed(self):
        url = reverse("biome-detail", args=[self.biome.pk])
        response = self.client.put(url, {"name": "New Name", "description": "."}, format="json")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


# ─── DELETE /biomes/:id/ ───────────────────────────────────────

class BiomeDeleteTests(APITestCase):

    def setUp(self):
        self.biome = make_biome()

    def test_delete_returns_204(self):
        url = reverse("biome-detail", args=[self.biome.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Biome.objects.filter(pk=self.biome.pk).exists())

    def test_delete_nonexistent_returns_404(self):
        url = reverse("biome-detail", args=[9999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_with_unlink_creatures_flag_succeeds(self):
        url = reverse("biome-detail", args=[self.biome.pk])
        response = self.client.delete(f"{url}?unlink_creatures=true")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

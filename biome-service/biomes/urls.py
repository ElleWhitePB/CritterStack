from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"biomes", views.BiomeViewSet, basename="biome")

urlpatterns = [
    path("health/", views.health_check, name="health"),
    path("", include(router.urls)),
]

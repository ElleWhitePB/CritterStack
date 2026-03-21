from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Biome
from .serializers import BiomeSerializer


@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})


class BiomeViewSet(viewsets.ModelViewSet):
    serializer_class = BiomeSerializer
    # Exclude PUT — callers should use PATCH for partial updates
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        include_inactive = self.request.query_params.get("include_inactive", "false").lower() == "true"
        queryset = Biome.objects.all()

        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        biome = self.get_object()

        if request.query_params.get("unlink_creatures", "false").lower() == "true":
            # TODO (M3+): call the creature-service API here to PATCH all creatures
            # with biome_id == biome.pk, setting biome_id to null.
            # This is intentionally a no-op until the creature <-> biome FK exists.
            pass

        biome.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

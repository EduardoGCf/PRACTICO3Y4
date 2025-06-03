from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from ..models import Genero
from ..serializers import GeneroSerializer

class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

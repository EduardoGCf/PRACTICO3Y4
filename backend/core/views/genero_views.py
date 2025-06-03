from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from ..models import Genero
from ..serializers import GeneroSerializer, LibroSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'libros']:
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=True, methods=['get'])
    def libros(self, request, pk=None):
        genero = self.get_object()
        libros = genero.libros.all()
        serializer = LibroSerializer(libros, many=True, context={'request': request})
        return Response(serializer.data)

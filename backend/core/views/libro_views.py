from django.middleware.csrf import get_token
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from ..models import Genero, Libro, Compra, ItemCompra
from ..serializers import (
    GeneroSerializer,
    LibroSerializer,
    CompraSerializer,
    ItemCompraSerializer,
    UserSerializer,
)
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

User = get_user_model()
# ---------- Libro ----------


class LibroViewSet(viewsets.ModelViewSet):
    queryset = Libro.objects.all().prefetch_related('generos')
    serializer_class = LibroSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'top_libros']:
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        generos_ids = request.data.getlist('generos_ids', [])
        mutable_data = request.data.copy()
        if 'generos_ids' in mutable_data:
            del mutable_data['generos_ids']
        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        libro = serializer.save()
        if generos_ids:
            try:
                generos_ids = [int(gid) for gid in generos_ids]
                generos = Genero.objects.filter(id__in=generos_ids)
                libro.generos.set(generos)
            except (ValueError, Genero.DoesNotExist) as e:
                return Response({'detail': 'Géneros inválidos'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(self.get_serializer(libro).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        generos_ids = request.data.getlist('generos_ids', [])
        mutable_data = request.data.copy()
        if 'generos_ids' in mutable_data:
            del mutable_data['generos_ids']
        serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        libro = serializer.save()
        if generos_ids:
            try:
                generos_ids = [int(gid) for gid in generos_ids]
                generos = Genero.objects.filter(id__in=generos_ids)
                libro.generos.set(generos)
            except (ValueError, Genero.DoesNotExist) as e:
                return Response({'detail': 'Géneros inválidos'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(self.get_serializer(libro).data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='top')
    def top_libros(self, request):
        top10 = Libro.objects.order_by('-ventas_totales')[:10]
        serializer = self.get_serializer(top10, many=True)
        return Response(serializer.data)


class LibroSerializer(serializers.ModelSerializer):
    generos = GeneroSerializer(many=True, read_only=True)

    class Meta:
        model = Libro
        fields = ['id', 'titulo', 'autor', 'precio', 'isbn', 'descripcion', 'portada', 'generos', 'ventas_totales']
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor que 0")
        return value
    def validate_isbn(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("ISBN debe tener al menos 10 caracteres")
        return value.strip()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.portada and request:
            representation['portada'] = request.build_absolute_uri(instance.portada.url)
        return representation

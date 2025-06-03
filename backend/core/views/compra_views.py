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
# ---------- Compra ----------
class CompraViewSet(viewsets.ModelViewSet):
    queryset = Compra.objects.all().select_related('usuario').prefetch_related('items__libro')
    serializer_class = CompraSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'mi_carrito', 'agregar_items', 'subir_comprobante', 'checkout']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        return Compra.objects.filter(usuario=user)


    def perform_create(self, serializer):
        user = self.request.user
        items_data = self.request.data.get('items', [])
        total = 0

        for item in items_data:
            libro_obj = Libro.objects.get(pk=item['libro_id'])
            total += libro_obj.precio * item.get('cantidad', 1)

        serializer.save(usuario=user, total=total, estado='PENDIENTE')

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='mi-carrito')
    def mi_carrito(self, request):
        user = request.user
        carrito = Compra.objects.filter(
            usuario=user,
            estado='CARRITO'
        ).first()
        if not carrito:
            carrito = Compra.objects.create(
                usuario=user,
                total=0,
                estado='CARRITO'
            )

        serializer = self.get_serializer(carrito)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='agregar-items')
    def agregar_items(self, request, pk=None):
        carrito = self.get_object()
        user = request.user

        if carrito.usuario != user and not user.is_staff:
            return Response({'detail': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        if carrito.estado != 'CARRITO':
            return Response(
                {'detail': 'Solo se pueden agregar items a carritos activos. Esta compra ya fue enviada.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        items_data = request.data.get('items', [])
        if not isinstance(items_data, list) or len(items_data) == 0:
            return Response({'detail': 'Se requieren datos de items'}, status=status.HTTP_400_BAD_REQUEST)

        for item in items_data:
            libro_id = item.get('libro_id')
            cantidad = item.get('cantidad', 1)
            try:
                libro_obj = Libro.objects.get(pk=libro_id)
            except Libro.DoesNotExist:
                return Response({'detail': f'Libro con id {libro_id} no existe'}, status=status.HTTP_400_BAD_REQUEST)
            item_existente = ItemCompra.objects.filter(compra=carrito, libro=libro_obj).first()
            if item_existente:
                item_existente.cantidad += cantidad
                item_existente.save()
            else:
                ItemCompra.objects.create(
                    compra=carrito,
                    libro=libro_obj,
                    precio_unitario=libro_obj.precio,
                    cantidad=cantidad
                )

        total_calc = sum(i.precio_unitario * i.cantidad for i in carrito.items.all())
        carrito.total = total_calc
        carrito.save()

        serializer = self.get_serializer(carrito)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='subir-comprobante')
    def subir_comprobante(self, request, pk=None):
        compra = self.get_object()
        user = request.user

        if compra.usuario != user and not user.is_staff:
            return Response({'detail': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        if compra.estado not in ['CARRITO', 'PENDIENTE']:
            return Response(
                {'detail': 'Solo se puede subir comprobante a carritos activos o compras pendientes'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        archivo = request.FILES.get('comprobante')
        if not archivo:
            return Response({'detail': 'Se requiere un archivo'}, status=status.HTTP_400_BAD_REQUEST)

        compra.comprobante = archivo
        compra.estado = 'PENDIENTE'
        compra.save()
        return Response({'detail': 'Comprobante subido correctamente'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['delete'], url_path='eliminar-item/(?P<item_id>[^/.]+)')
    def eliminar_item(self, request, pk=None, item_id=None):
        try:
            item = ItemCompra.objects.get(pk=item_id, compra_id=pk)
        except ItemCompra.DoesNotExist:
            return Response({'detail': 'Ítem no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if item.compra.usuario != request.user and not request.user.is_staff:
            return Response({'detail': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        if item.compra.estado != 'CARRITO':
            return Response(
                {'detail': 'Solo se pueden eliminar items de carritos activos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        item.delete()
        compra = item.compra
        compra.total = sum(i.precio_unitario * i.cantidad for i in compra.items.all())
        compra.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

#admin editamos el estado
    def partial_update(self, request, *args, **kwargs):
        compra = self.get_object()
        user = request.user

        if not user.is_staff:
            return Response({'detail': 'Solo admin puede cambiar estado'}, status=status.HTTP_403_FORBIDDEN)
        if compra.estado == 'CARRITO':
            return Response(
                {'detail': 'No se puede cambiar el estado de un carrito activo. Use checkout primero.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        estado_nuevo = request.data.get('estado')
        if estado_nuevo not in dict(Compra.ESTADOS):
            return Response({'detail': 'Estado inválido'}, status=status.HTTP_400_BAD_REQUEST)
        if estado_nuevo == 'CARRITO':
            return Response(
                {'detail': 'No se puede regresar una compra al estado de carrito'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        compra.estado = estado_nuevo
        compra.save()
        if estado_nuevo == 'CONFIRMADA':
            for item in compra.items.all():
                libro = item.libro
                libro.ventas_totales += item.cantidad
                libro.save()

        return super().partial_update(request, *args, **kwargs)

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Genero, Libro, Compra, ItemCompra

User = get_user_model()

class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = ['id', 'nombre']

class LibroSerializer(serializers.ModelSerializer):
    generos = GeneroSerializer(many=True, read_only=True)

    class Meta:
        model = Libro
        fields = ['id', 'titulo', 'autor', 'precio', 'isbn', 'descripcion', 'portada', 'generos', 'ventas_totales']
    def create(self, validated_data):
        generos = validated_data.pop('generos', [])
        libro = Libro.objects.create(**validated_data)
        libro.generos.set(generos)
        return libro

    def update(self, instance, validated_data):
        generos = validated_data.pop('generos', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if generos is not None:
            instance.generos.set(generos)
        return instance


class ItemCompraSerializer(serializers.ModelSerializer):
    libro = LibroSerializer(read_only=True)
    libro_id = serializers.PrimaryKeyRelatedField(
        queryset=Libro.objects.all(),
        source='libro',
        write_only=True
    )

    class Meta:
        model = ItemCompra
        fields = ['id', 'libro', 'libro_id', 'precio_unitario', 'cantidad']

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class CompraSerializer(serializers.ModelSerializer):
    items = ItemCompraSerializer(many=True)
    usuario = UserMiniSerializer(read_only=True)
    comprobante = serializers.ImageField(read_only=True)
    class Meta:
        model = Compra
        fields = ['id', 'usuario', 'fecha', 'total', 'estado', 'comprobante', 'items']
        read_only_fields = ['estado', 'fecha', 'usuario', 'total']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        compra = Compra.objects.create(**validated_data)
        for item in items_data:
            ItemCompra.objects.create(
                compra=compra,
                libro=item['libro'],
                precio_unitario=item['precio_unitario'],
                cantidad=item.get('cantidad', 1)
            )
        return compra

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']

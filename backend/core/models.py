from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

class Genero(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class Libro(models.Model):
    titulo = models.CharField(max_length=200)
    autor = models.CharField(max_length=200)
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    isbn = models.CharField(max_length=20, unique=True)
    descripcion = models.TextField()
    portada = models.ImageField(upload_to='portadas/')
    generos = models.ManyToManyField(Genero, related_name='libros')
    ventas_totales = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.titulo} - {self.autor}"

class Compra(models.Model):
    ESTADOS = [
        ('CARRITO', 'Carrito activo'),
        ('PENDIENTE', 'Pendiente de validación'),
        ('CONFIRMADA', 'Pago confirmado'),
        ('RECHAZADA', 'Pago rechazado'),
    ]
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='compras')
    fecha = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=12, choices=ESTADOS, default='CARRITO')
    comprobante = models.ImageField(upload_to='comprobantes/', null=True, blank=True)

    class Meta:
        ordering = ['-fecha_actualizacion']

    def __str__(self):
        return f"{'Carrito' if self.estado == 'CARRITO' else 'Compra'} #{self.id} - {self.usuario.username} - {self.estado}"

    @property
    def es_carrito_activo(self):
        """Determina si es un carrito activo"""
        return self.estado == 'CARRITO'

    @property
    def es_compra_enviada(self):
        """Determina si es una compra ya enviada"""
        return self.estado in ['PENDIENTE', 'CONFIRMADA', 'RECHAZADA']

class ItemCompra(models.Model):
    compra = models.ForeignKey(Compra, on_delete=models.CASCADE, related_name='items')
    libro = models.ForeignKey(Libro, on_delete=models.PROTECT)
    precio_unitario = models.DecimalField(max_digits=8, decimal_places=2)
    cantidad = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.libro.titulo} x {self.cantidad}"

    def subtotal(self):
        return self.precio_unitario * self.cantidad

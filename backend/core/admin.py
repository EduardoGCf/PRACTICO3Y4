from django.contrib import admin
from .models import User, Genero, Libro, Compra, ItemCompra

admin.site.register(User)
admin.site.register(Genero)
admin.site.register(Libro)
admin.site.register(Compra)
admin.site.register(ItemCompra)

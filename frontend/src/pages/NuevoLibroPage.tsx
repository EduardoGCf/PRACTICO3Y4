// NuevoLibroPage.tsx - Corregido
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearLibro } from '../api/libroService';
import { getGeneros } from '../api/generoService';
import type { Libro, Genero } from '../types/models';

export default function NuevoLibroPage() {
  const [form, setForm] = useState<Partial<Libro>>({
    titulo: '',
    autor: '',
    precio: '',
    descripcion: '',
    isbn: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [generosSeleccionados, setGenerosSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  // Cargar géneros al montar el componente
  useEffect(() => {
    const cargarGeneros = async () => {
      try {
        const generosData = await getGeneros();
        setGeneros(generosData);
      } catch (err) {
        console.error('Error cargando géneros:', err);
        setError('Error al cargar los géneros');
      } finally {
        setLoading(false);
      }
    };
    cargarGeneros();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFile(fileInput.files?.[0] || null);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleGeneroChange = (generoId: number) => {
    setGenerosSeleccionados(prev => {
      if (prev.includes(generoId)) {
        return prev.filter(id => id !== generoId);
      } else {
        return [...prev, generoId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones del frontend
    if (generosSeleccionados.length === 0) {
      setError('Debes seleccionar al menos un género');
      return;
    }

    if (!form.titulo?.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!form.autor?.trim()) {
      setError('El autor es requerido');
      return;
    }

    if (!form.precio || parseFloat(form.precio.toString()) <= 0) {
      setError('El precio debe ser mayor que 0');
      return;
    }

    if (!form.isbn?.trim()) {
      setError('El ISBN es requerido');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      
      // Agregar campos del libro
      data.append('titulo', form.titulo?.trim() || '');
      data.append('autor', form.autor?.trim() || '');
      data.append('precio', form.precio?.toString() || '');
      data.append('isbn', form.isbn?.trim() || '');
      data.append('descripcion', form.descripcion?.trim() || '');
      
      // Agregar géneros seleccionados
      generosSeleccionados.forEach(generoId => {
        data.append('generos_ids', generoId.toString());
      });
      
      // Agregar archivo si existe
      if (file) {
        data.append('portada', file);
      }

      console.log('Datos a enviar:');
      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }

      await crearLibro(data);
      navigate('/admin/libros');
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Response data:', err?.response?.data);
      
      if (err?.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          // Manejar errores de validación por campo
          const errorMessages = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          }
          setError(errorMessages.join('\n'));
        } else {
          setError(errorData.detail || 'Error al crear libro');
        }
      } else {
        setError('Error de conexión al crear libro');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <p>Cargando géneros...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Nuevo Libro</h2>
      {error && (
        <div className="text-red-600 mb-4 p-3 bg-red-100 rounded border border-red-300">
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          name="titulo" 
          placeholder="Título" 
          className="border p-2 rounded focus:ring-2 focus:ring-blue-500" 
          value={form.titulo || ''} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          name="autor" 
          placeholder="Autor" 
          className="border p-2 rounded focus:ring-2 focus:ring-blue-500" 
          value={form.autor || ''} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          name="precio" 
          placeholder="Precio" 
          type="number" 
          step="0.01"
          min="0.01"
          className="border p-2 rounded focus:ring-2 focus:ring-blue-500" 
          value={form.precio || ''} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          name="isbn" 
          placeholder="ISBN" 
          className="border p-2 rounded focus:ring-2 focus:ring-blue-500" 
          value={form.isbn || ''} 
          onChange={handleChange} 
          required 
        />

        {/* Selector de géneros */}
        <div className="border p-3 rounded">
          <label className="block text-sm font-medium mb-2">
            Géneros (selecciona al menos uno) *:
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {generos.map(genero => (
              <label key={genero.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={generosSeleccionados.includes(genero.id)}
                  onChange={() => handleGeneroChange(genero.id)}
                  className="rounded"
                />
                <span className="text-sm">{genero.nombre}</span>
              </label>
            ))}
          </div>
          {generosSeleccionados.length > 0 && (
            <div className="mt-2 text-sm text-green-600">
              Seleccionados: {generosSeleccionados.length} género(s)
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Portada (opcional):
          </label>
          <input 
            name="portada" 
            type="file" 
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500" 
            onChange={handleChange} 
            accept="image/*" 
          />
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {file.name}
            </div>
          )}
        </div>
        
        <textarea 
          name="descripcion" 
          placeholder="Descripción" 
          className="border p-2 rounded h-24 resize-vertical focus:ring-2 focus:ring-blue-500" 
          value={form.descripcion || ''} 
          onChange={handleChange}
        />
        
        <button 
          type="submit" 
          className="bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={submitting}
        >
          {submitting ? 'Creando...' : 'Crear Libro'}
        </button>
      </form>
    </div>
  );
}
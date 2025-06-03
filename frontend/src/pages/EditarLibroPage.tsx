
// EditarLibroPage.tsx - Corregido
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLibroById, editarLibro } from '../api/libroService';
import { getGeneros } from '../api/generoService';
import type { Libro, Genero } from '../types/models';

export default function EditarLibroPage() {
  const { id } = useParams<{ id: string }>();
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return;
      
      try {
        // Cargar géneros y libro en paralelo
        const [generosData, libro] = await Promise.all([
          getGeneros(),
          getLibroById(Number(id))
        ]);
        
        setGeneros(generosData);
        setForm(libro);
        
        // Establecer géneros seleccionados
        if (libro.generos) {
          const generosIds = libro.generos.map(g => g.id);
          setGenerosSeleccionados(generosIds);
        }
        
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [id]);

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
    if (!id) return;

    // Validaciones
    if (generosSeleccionados.length === 0) {
      setError('Debes seleccionar al menos un género');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      
      // Agregar campos del libro (excepto portada que se maneja aparte)
      Object.entries(form).forEach(([key, value]) => {
        if (key === "portada" || key === "generos") return;
        if (typeof value !== "undefined" && value !== null) {
          data.append(key, value.toString());
        }
      });
      
      // Agregar géneros seleccionados
      generosSeleccionados.forEach(generoId => {
        data.append('generos_ids', generoId.toString());
      });
      
      // Agregar archivo si se seleccionó uno nuevo
      if (file) {
        data.append('portada', file);
      }

      await editarLibro(Number(id), data);
      navigate('/admin/libros');
    } catch (err: any) {
      console.error('Error completo:', err);
      
      if (err?.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
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
          setError(errorData.detail || 'Error al editar libro');
        }
      } else {
        setError('Error de conexión al editar libro');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Editar Libro</h2>
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
            Portada:
          </label>
          <input 
            name="portada" 
            type="file" 
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500" 
            onChange={handleChange} 
            accept="image/*" 
          />
          {form.portada && typeof form.portada === 'string' && (
            <div className="mt-2">
              <img 
                src={form.portada} 
                alt="Portada actual" 
                className="w-32 h-32 object-cover rounded border"
              />
              <p className="text-sm text-gray-600 mt-1">Portada actual</p>
            </div>
          )}
          {file && (
            <div className="mt-2 text-sm text-blue-600">
              Nueva portada seleccionada: {file.name}
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
          className="bg-yellow-600 text-white p-3 rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
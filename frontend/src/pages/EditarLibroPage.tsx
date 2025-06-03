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
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [generosSeleccionados, setGenerosSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return;
      try {
        const [generosData, libro] = await Promise.all([
          getGeneros(),
          getLibroById(Number(id)),
        ]);
        setGeneros(generosData);
        setForm(libro);
        if (libro.generos) {
          setGenerosSeleccionados(libro.generos.map(g => g.id));
        }
      } catch (err) {
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
    setGenerosSeleccionados(prev =>
      prev.includes(generoId)
        ? prev.filter(id => id !== generoId)
        : [...prev, generoId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (generosSeleccionados.length === 0) {
      setError('Debes seleccionar al menos un género');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "portada" || key === "generos") return;
        if (typeof value !== "undefined" && value !== null) {
          data.append(key, value.toString());
        }
      });
      generosSeleccionados.forEach(generoId => {
        data.append('generos_ids', generoId.toString());
      });
      if (file) {
        data.append('portada', file);
      }
      await editarLibro(Number(id), data);
      navigate('/admin/libros');
    } catch (err: any) {
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-40 text-indigo-600 font-bold">
      <div className="animate-spin h-7 w-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full mr-3"></div>
      Cargando...
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-8 mt-6 bg-white rounded-2xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-extrabold mb-6 text-indigo-800 text-center">Editar Libro</h2>
      {error && (
        <div className="text-red-700 mb-4 p-3 bg-red-100 rounded-xl border border-red-200 animate-pulse text-center">
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          name="titulo"
          placeholder="Título"
          className="border border-indigo-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={form.titulo || ''}
          onChange={handleChange}
          required
        />
        <input
          name="autor"
          placeholder="Autor"
          className="border border-indigo-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          className="border border-indigo-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={form.precio || ''}
          onChange={handleChange}
          required
        />
        <input
          name="isbn"
          placeholder="ISBN"
          className="border border-indigo-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={form.isbn || ''}
          onChange={handleChange}
          required
        />
        <div className="border border-indigo-200 p-4 rounded-xl">
          <label className="block text-sm font-semibold mb-2 text-indigo-700">
            Géneros <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {generos.map(genero => (
              <label
                key={genero.id}
                className={`flex items-center gap-2 cursor-pointer hover:bg-indigo-50 p-2 rounded-lg transition
                  ${generosSeleccionados.includes(genero.id) ? "bg-indigo-50" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={generosSeleccionados.includes(genero.id)}
                  onChange={() => handleGeneroChange(genero.id)}
                  className="rounded accent-indigo-500 w-5 h-5"
                />
                <span className="text-base">{genero.nombre}</span>
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
          <label className="block text-sm font-semibold mb-2 text-indigo-700">
            Portada
          </label>
          <input
            name="portada"
            type="file"
            className="border border-indigo-200 p-2 rounded-xl w-full focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
            accept="image/*"
          />
          <div className="flex flex-row gap-4 mt-2">
            {form.portada && typeof form.portada === 'string' && (
              <div className="flex flex-col items-center">
                <img
                  src={form.portada}
                  alt="Portada actual"
                  className="w-28 h-40 object-cover rounded border shadow"
                />
                <span className="text-xs text-gray-500 mt-1">Portada actual</span>
              </div>
            )}
            {file && preview && (
              <div className="flex flex-col items-center">
                <img
                  src={preview}
                  alt="Nueva portada"
                  className="w-28 h-40 object-cover rounded border shadow"
                />
                <span className="text-xs text-green-600 mt-1">{file.name}</span>
              </div>
            )}
          </div>
        </div>
        <textarea
          name="descripcion"
          placeholder="Descripción"
          className="border border-indigo-200 p-3 rounded-xl h-28 resize-vertical focus:ring-2 focus:ring-indigo-400 text-base"
          value={form.descripcion || ''}
          onChange={handleChange}
        />
        <button
          type="submit"
          className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold p-3 rounded-xl shadow-lg transition-all text-lg
            disabled:opacity-60 disabled:cursor-not-allowed ${submitting ? "animate-pulse" : ""}
          `}
          disabled={submitting}
        >
          {submitting ? 'Guardando cambios...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}

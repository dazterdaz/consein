import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Trash2, Edit, Plus, CheckCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Artista {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
}

const Artistas: React.FC = () => {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [artistaActual, setArtistaActual] = useState<Artista | null>(null);
  const [nombre, setNombre] = useState('');
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchArtistas();
  }, []);

  const fetchArtistas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artistas')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      
      setArtistas(data || []);
    } catch (error) {
      console.error('Error al cargar artistas:', error);
      toast.error('Error al cargar la lista de artistas');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setArtistaActual(null);
    setNombre('');
    setActivo(true);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (artista: Artista) => {
    setArtistaActual(artista);
    setNombre(artista.nombre);
    setActivo(artista.activo);
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const validateForm = () => {
    if (!nombre.trim()) {
      setError('El nombre del artista es obligatorio');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (artistaActual) {
        // Actualizar artista existente
        const { error } = await supabase
          .from('artistas')
          .update({ nombre, activo })
          .eq('id', artistaActual.id);
        
        if (error) throw error;
        
        toast.success('Artista actualizado con éxito');
      } else {
        // Crear nuevo artista
        const { error } = await supabase
          .from('artistas')
          .insert([{ nombre, activo }]);
        
        if (error) throw error;
        
        toast.success('Artista creado con éxito');
      }
      
      closeModal();
      fetchArtistas();
    } catch (error) {
      console.error('Error al guardar artista:', error);
      toast.error('Error al guardar los datos del artista');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este artista?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('artistas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Artista eliminado con éxito');
      fetchArtistas();
    } catch (error) {
      console.error('Error al eliminar artista:', error);
      toast.error('Error al eliminar el artista');
    }
  };

  const toggleActivo = async (artista: Artista) => {
    try {
      const { error } = await supabase
        .from('artistas')
        .update({ activo: !artista.activo })
        .eq('id', artista.id);
      
      if (error) throw error;
      
      toast.success(`Artista ${artista.activo ? 'desactivado' : 'activado'} con éxito`);
      fetchArtistas();
    } catch (error) {
      console.error('Error al cambiar estado activo:', error);
      toast.error('Error al cambiar estado activo');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Artistas</h1>
        <button 
          onClick={openCreateModal}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Nuevo Artista
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : artistas.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No hay artistas para mostrar</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {artistas.map((artista) => (
                <tr key={artista.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{artista.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${artista.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {artista.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(artista)}
                      className="text-green-600 hover:text-green-900"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => toggleActivo(artista)}
                      className={`${artista.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      title={artista.activo ? 'Desactivar' : 'Activar'}
                    >
                      {artista.activo ? <X size={18} /> : <CheckCircle size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(artista.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Modal de Formulario */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-secondary text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {artistaActual ? 'Editar Artista' : 'Crear Nuevo Artista'}
              </h2>
              <button onClick={closeModal} className="text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Artista *
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input"
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="activo" className="text-sm">Artista Activo</label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-outline-primary mr-2"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                      {artistaActual ? 'Actualizando...' : 'Creando...'}
                    </span>
                  ) : (
                    artistaActual ? 'Actualizar Artista' : 'Crear Artista'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artistas;
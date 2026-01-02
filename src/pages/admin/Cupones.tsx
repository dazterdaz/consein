import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Edit, Search, RefreshCw, Filter, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate, formatCurrency } from '../../lib/utils';
import { useConfig } from '../../contexts/ConfigContext';

interface Cupon {
  id: string;
  codigo: string;
  socio_id: string;
  cliente_nombre: string;
  cliente_whatsapp: string;
  cliente_instagram: string;
  estado: 'descargado' | 'agendado' | 'cobrado';
  fecha_descarga: string;
  fecha_agendado: string | null;
  fecha_cobrado: string | null;
  artista_id: string | null;
  valor_tatuaje: number | null;
  socios: {
    nombre_local: string;
    codigo: string;
  };
  artistas?: {
    nombre: string;
  };
}

interface Socio {
  id: string;
  nombre_local: string;
}

interface Artista {
  id: string;
  nombre: string;
}

const Cupones: React.FC = () => {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [cuponActual, setCuponActual] = useState<Cupon | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroSocio, setFiltroSocio] = useState<string>('');
  const [filtroArtista, setFiltroArtista] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { config } = useConfig();
  
  const [formData, setFormData] = useState({
    estado: '',
    artista_id: '',
    valor_tatuaje: ''
  });

  useEffect(() => {
    fetchCupones();
    fetchSocios();
    fetchArtistas();
  }, []);

  const fetchCupones = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('cupones')
        .select(`
          *,
          socios (
            nombre_local,
            codigo
          ),
          artistas (
            nombre
          )
        `)
        .order('fecha_descarga', { ascending: false });
      
      if (error) throw error;
      
      setCupones(data || []);
    } catch (error) {
      console.error('Error al cargar cupones:', error);
      toast.error('Error al cargar la lista de cupones');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocios = async () => {
    try {
      const { data, error } = await supabase
        .from('socios')
        .select('id, nombre_local')
        .eq('activo', true)
        .order('nombre_local');
      
      if (error) throw error;
      
      setSocios(data || []);
    } catch (error) {
      console.error('Error al cargar socios:', error);
    }
  };

  const fetchArtistas = async () => {
    try {
      const { data, error } = await supabase
        .from('artistas')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      
      setArtistas(data || []);
    } catch (error) {
      console.error('Error al cargar artistas:', error);
    }
  };

  const openDetalleModal = (cupon: Cupon) => {
    setCuponActual(cupon);
    setDetalleModalOpen(true);
  };

  const openEditModal = (cupon: Cupon) => {
    setCuponActual(cupon);
    setFormData({
      estado: cupon.estado,
      artista_id: cupon.artista_id || '',
      valor_tatuaje: cupon.valor_tatuaje ? cupon.valor_tatuaje.toString() : ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCuponActual(null);
  };

  const closeDetalleModal = () => {
    setDetalleModalOpen(false);
    setCuponActual(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.estado) {
      errors.estado = 'Selecciona un estado';
    }
    
    if (formData.estado === 'agendado' && !formData.artista_id) {
      errors.artista_id = 'Selecciona un artista';
    }
    
    if (formData.estado === 'cobrado') {
      if (!formData.artista_id) {
        errors.artista_id = 'Selecciona un artista';
      }
      
      if (!formData.valor_tatuaje) {
        errors.valor_tatuaje = 'Ingresa el valor del tatuaje';
      } else if (isNaN(Number(formData.valor_tatuaje)) || Number(formData.valor_tatuaje) <= 0) {
        errors.valor_tatuaje = 'Ingresa un valor válido';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !cuponActual) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = new Date().toISOString();
      
      const updateData: any = {
        estado: formData.estado
      };
      
      // Actualizar campos según el estado
      if (formData.estado === 'agendado') {
        updateData.artista_id = formData.artista_id;
        updateData.fecha_agendado = now;
      } else if (formData.estado === 'cobrado') {
        updateData.artista_id = formData.artista_id;
        updateData.valor_tatuaje = Number(formData.valor_tatuaje);
        updateData.fecha_cobrado = now;
      }
      
      // Si cambia de cobrado a otro estado, limpiar datos
      if (cuponActual.estado === 'cobrado' && formData.estado !== 'cobrado') {
        updateData.valor_tatuaje = null;
        updateData.fecha_cobrado = null;
      }
      
      // Si cambia de agendado a descargado, limpiar datos
      if (cuponActual.estado === 'agendado' && formData.estado === 'descargado') {
        updateData.artista_id = null;
        updateData.fecha_agendado = null;
      }
      
      const { error } = await supabase
        .from('cupones')
        .update(updateData)
        .eq('id', cuponActual.id);
      
      if (error) throw error;
      
      toast.success('Cupón actualizado con éxito');
      closeModal();
      fetchCupones();
    } catch (error) {
      console.error('Error al actualizar cupón:', error);
      toast.error('Error al actualizar el cupón');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtrarCupones = () => {
    return cupones.filter(cupon => {
      // Filtrar por estado
      if (filtroEstado && cupon.estado !== filtroEstado) {
        return false;
      }
      
      // Filtrar por socio
      if (filtroSocio && cupon.socio_id !== filtroSocio) {
        return false;
      }
      
      // Filtrar por artista
      if (filtroArtista && cupon.artista_id !== filtroArtista) {
        return false;
      }
      
      // Filtrar por búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          cupon.codigo.toLowerCase().includes(query) ||
          cupon.cliente_nombre.toLowerCase().includes(query) ||
          cupon.cliente_whatsapp.toLowerCase().includes(query) ||
          cupon.socios.nombre_local.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  };

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroSocio('');
    setFiltroArtista('');
    setSearchQuery('');
  };

  // Calcular comisión según el valor del tatuaje
  const calcularComision = (valorTatuaje: number) => {
    return Math.round(valorTatuaje * ((config?.porcentaje_comision || 10) / 100));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Cupones</h1>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <label htmlFor="filtroEstado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input"
            >
              <option value="">Todos los estados</option>
              <option value="descargado">Descargado</option>
              <option value="agendado">Agendado</option>
              <option value="cobrado">Cobrado</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="filtroSocio" className="block text-sm font-medium text-gray-700 mb-1">
              Socio
            </label>
            <select
              id="filtroSocio"
              value={filtroSocio}
              onChange={(e) => setFiltroSocio(e.target.value)}
              className="input"
            >
              <option value="">Todos los socios</option>
              {socios.map((socio) => (
                <option key={socio.id} value={socio.id}>
                  {socio.nombre_local}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="filtroArtista" className="block text-sm font-medium text-gray-700 mb-1">
              Artista
            </label>
            <select
              id="filtroArtista"
              value={filtroArtista}
              onChange={(e) => setFiltroArtista(e.target.value)}
              className="input"
            >
              <option value="">Todos los artistas</option>
              {artistas.map((artista) => (
                <option key={artista.id} value={artista.id}>
                  {artista.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                id="searchQuery"
                type="text"
                placeholder="Código, cliente, socio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <button
            onClick={limpiarFiltros}
            className="text-secondary hover:text-secondary-dark flex items-center"
          >
            <Filter size={18} className="mr-1" />
            Limpiar filtros
          </button>
          
          <button
            onClick={fetchCupones}
            className="text-primary hover:text-primary-dark flex items-center"
          >
            <RefreshCw size={18} className="mr-1" />
            Actualizar
          </button>
        </div>
      </div>
      
      {/* Tabla de Cupones */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filtrarCupones().length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No hay cupones que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artista
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtrarCupones().map((cupon) => (
                  <tr key={cupon.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {cupon.codigo}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{cupon.cliente_nombre}</div>
                      <div className="text-xs text-gray-500">{cupon.cliente_whatsapp}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{cupon.socios.nombre_local}</div>
                      <div className="text-xs text-gray-500">Cód: {cupon.socios.codigo}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(cupon.fecha_descarga)}
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${cupon.estado === 'descargado' ? 'status-descargado' : 
                           cupon.estado === 'agendado' ? 'status-agendado' : 
                           'status-cobrado'}`}
                      >
                        {cupon.estado === 'descargado' ? 'Descargado' : 
                         cupon.estado === 'agendado' ? 'Agendado' : 
                         'Cobrado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {cupon.artistas?.nombre || '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openDetalleModal(cupon)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(cupon)}
                        className="text-green-600 hover:text-green-900"
                        title="Cambiar estado"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal de Edición */}
      {modalOpen && cuponActual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-secondary text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Actualizar Estado del Cupón</h2>
              <button onClick={closeModal} className="text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Código del Cupón:</p>
                <p className="font-semibold">{cuponActual.codigo}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Cliente:</p>
                <p className="font-semibold">{cuponActual.cliente_nombre}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Socio:</p>
                <p className="font-semibold">{cuponActual.socios.nombre_local}</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className={`input ${formErrors.estado ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleccionar estado</option>
                  <option value="descargado">Descargado</option>
                  <option value="agendado">Agendado</option>
                  <option value="cobrado">Cobrado</option>
                </select>
                {formErrors.estado && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.estado}</p>
                )}
              </div>
              
              {(formData.estado === 'agendado' || formData.estado === 'cobrado') && (
                <div className="mb-4">
                  <label htmlFor="artista_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Artista *
                  </label>
                  <select
                    id="artista_id"
                    name="artista_id"
                    value={formData.artista_id}
                    onChange={handleChange}
                    className={`input ${formErrors.artista_id ? 'border-red-500' : ''}`}
                  >
                    <option value="">Seleccionar artista</option>
                    {artistas.map((artista) => (
                      <option key={artista.id} value={artista.id}>
                        {artista.nombre}
                      </option>
                    ))}
                  </select>
                  {formErrors.artista_id && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.artista_id}</p>
                  )}
                </div>
              )}
              
              {formData.estado === 'cobrado' && (
                <div className="mb-4">
                  <label htmlFor="valor_tatuaje" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor del Tatuaje (CLP) *
                  </label>
                  <input
                    id="valor_tatuaje"
                    name="valor_tatuaje"
                    type="number"
                    min="0"
                    value={formData.valor_tatuaje}
                    onChange={handleChange}
                    className={`input ${formErrors.valor_tatuaje ? 'border-red-500' : ''}`}
                    placeholder="Ej: 100000"
                  />
                  {formErrors.valor_tatuaje && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.valor_tatuaje}</p>
                  )}
                  
                  {formData.valor_tatuaje && !isNaN(Number(formData.valor_tatuaje)) && Number(formData.valor_tatuaje) > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded-md">
                      <p className="text-sm text-green-700">
                        Comisión para el socio: <span className="font-semibold">
                          {formatCurrency(calcularComision(Number(formData.valor_tatuaje)))}
                        </span> ({config?.porcentaje_comision || 10}%)
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
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
                      Actualizando...
                    </span>
                  ) : (
                    'Actualizar Cupón'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de Detalles */}
      {detalleModalOpen && cuponActual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="bg-secondary text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Detalles del Cupón</h2>
              <button onClick={closeDetalleModal} className="text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Código</h3>
                  <p className="text-lg font-semibold">{cuponActual.codigo}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <p>
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${cuponActual.estado === 'descargado' ? 'status-descargado' : 
                         cuponActual.estado === 'agendado' ? 'status-agendado' : 
                         'status-cobrado'}`}
                    >
                      {cuponActual.estado === 'descargado' ? 'Descargado' : 
                       cuponActual.estado === 'agendado' ? 'Agendado' : 
                       'Cobrado'}
                    </span>
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Socio Comercial</h3>
                  <p className="text-lg font-semibold">{cuponActual.socios.nombre_local}</p>
                  <p className="text-sm text-gray-500">Código: {cuponActual.socios.codigo}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                  <p className="text-lg font-semibold">{cuponActual.cliente_nombre}</p>
                  <p className="text-sm">WhatsApp: {cuponActual.cliente_whatsapp}</p>
                  {cuponActual.cliente_instagram && (
                    <p className="text-sm">Instagram: {cuponActual.cliente_instagram}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de Descarga</h3>
                  <p>{formatDate(cuponActual.fecha_descarga)}</p>
                </div>
                
                {cuponActual.fecha_agendado && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha de Agendado</h3>
                    <p>{formatDate(cuponActual.fecha_agendado)}</p>
                  </div>
                )}
                
                {cuponActual.fecha_cobrado && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha de Cobro</h3>
                    <p>{formatDate(cuponActual.fecha_cobrado)}</p>
                  </div>
                )}
                
                {cuponActual.artistas && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Artista</h3>
                    <p className="text-lg font-semibold">{cuponActual.artistas.nombre}</p>
                  </div>
                )}
                
                {cuponActual.valor_tatuaje && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Valor del Tatuaje</h3>
                    <p className="text-lg font-semibold">{formatCurrency(cuponActual.valor_tatuaje)}</p>
                  </div>
                )}
                
                {cuponActual.valor_tatuaje && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Comisión para el Socio</h3>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(calcularComision(cuponActual.valor_tatuaje))}
                    </p>
                    <p className="text-xs text-gray-500">
                      ({config?.porcentaje_comision || 10}% del valor del tatuaje)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    closeDetalleModal();
                    openEditModal(cuponActual);
                  }}
                  className="btn btn-secondary mr-2"
                >
                  Editar Estado
                </button>
                
                <button
                  onClick={closeDetalleModal}
                  className="btn btn-primary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cupones;
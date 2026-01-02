import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, X, Search, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate, formatCurrency } from '../../lib/utils';
import { useConfig } from '../../contexts/ConfigContext';

interface Socio {
  id: string;
  nombre_local: string;
  codigo: string;
}

interface Pago {
  id: string;
  socio_id: string;
  monto: number;
  fecha_pago: string;
  notas: string | null;
  created_at: string;
  socios: {
    nombre_local: string;
    codigo: string;
  };
}

const Pagos: React.FC = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtroSocio, setFiltroSocio] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sociosGanancias, setSociosGanancias] = useState<Record<string, { total: number, pendiente: number }>>({});
  
  const { config } = useConfig();
  
  const [formData, setFormData] = useState({
    socio_id: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    notas: ''
  });

  useEffect(() => {
    fetchPagos();
    fetchSocios();
  }, []);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          *,
          socios (
            nombre_local,
            codigo
          )
        `)
        .order('fecha_pago', { ascending: false });
      
      if (error) throw error;
      
      setPagos(data || []);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      toast.error('Error al cargar la lista de pagos');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocios = async () => {
    try {
      // Obtener socios activos
      const { data, error } = await supabase
        .from('socios')
        .select('id, nombre_local, codigo')
        .eq('activo', true)
        .eq('aprobado', true)
        .order('nombre_local');
      
      if (error) throw error;
      
      setSocios(data || []);
      
      // Calcular ganancias para cada socio
      if (data) {
        await Promise.all(data.map(socio => calcularGanancias(socio.id)));
      }
    } catch (error) {
      console.error('Error al cargar socios:', error);
    }
  };

  const calcularGanancias = async (socioId: string) => {
    try {
      // Obtener cupones cobrados del socio
      const { data: cupones, error: cuponesError } = await supabase
        .from('cupones')
        .select('valor_tatuaje')
        .eq('socio_id', socioId)
        .eq('estado', 'cobrado')
        .not('valor_tatuaje', 'is', null);
      
      if (cuponesError) throw cuponesError;
      
      // Calcular ganancias totales
      const gananciasTotal = cupones?.reduce((total, cupon) => {
        const comision = calcularComision(cupon.valor_tatuaje || 0);
        return total + comision;
      }, 0) || 0;
      
      // Obtener pagos realizados al socio
      const { data: pagosRealizados, error: pagosError } = await supabase
        .from('pagos')
        .select('monto')
        .eq('socio_id', socioId);
      
      if (pagosError) throw pagosError;
      
      // Calcular total de pagos
      const totalPagos = pagosRealizados?.reduce((total, pago) => total + pago.monto, 0) || 0;
      
      // Calcular pendiente
      const pendiente = gananciasTotal - totalPagos;
      
      setSociosGanancias(prev => ({
        ...prev,
        [socioId]: { total: gananciasTotal, pendiente }
      }));
    } catch (error) {
      console.error('Error al calcular ganancias:', error);
    }
  };

  const calcularComision = (valorTatuaje: number) => {
    return Math.round(valorTatuaje * ((config?.porcentaje_comision || 10) / 100));
  };

  const openCreateModal = () => {
    setFormData({
      socio_id: '',
      monto: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      notas: ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.socio_id) {
      errors.socio_id = 'Selecciona un socio';
    }
    
    if (!formData.monto) {
      errors.monto = 'Ingresa el monto del pago';
    } else if (isNaN(Number(formData.monto)) || Number(formData.monto) <= 0) {
      errors.monto = 'Ingresa un monto válido';
    }
    
    if (!formData.fecha_pago) {
      errors.fecha_pago = 'Selecciona la fecha del pago';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('pagos').insert([
        {
          socio_id: formData.socio_id,
          monto: Number(formData.monto),
          fecha_pago: formData.fecha_pago,
          notas: formData.notas || null
        }
      ]);
      
      if (error) throw error;
      
      toast.success('Pago registrado con éxito');
      closeModal();
      fetchPagos();
      
      // Recalcular ganancias para el socio afectado
      await calcularGanancias(formData.socio_id);
    } catch (error) {
      console.error('Error al registrar pago:', error);
      toast.error('Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtrarPagos = () => {
    return pagos.filter(pago => {
      // Filtrar por socio
      if (filtroSocio && pago.socio_id !== filtroSocio) {
        return false;
      }
      
      // Filtrar por búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fechaFormateada = formatDate(pago.fecha_pago);
        
        return (
          pago.socios.nombre_local.toLowerCase().includes(query) ||
          pago.socios.codigo.toLowerCase().includes(query) ||
          fechaFormateada.includes(query) ||
          (pago.notas && pago.notas.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  };

  const limpiarFiltros = () => {
    setFiltroSocio('');
    setSearchQuery('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Pagos a Socios</h1>
        <button 
          onClick={openCreateModal}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Registrar Pago
        </button>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
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
                  {socio.nombre_local} (Cód: {socio.codigo})
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/2">
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                id="searchQuery"
                type="text"
                placeholder="Socio, fecha, notas..."
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
            onClick={fetchPagos}
            className="text-primary hover:text-primary-dark flex items-center"
          >
            <RefreshCw size={18} className="mr-1" />
            Actualizar
          </button>
        </div>
      </div>
      
      {/* Tabla de Pagos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filtrarPagos().length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No hay pagos que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtrarPagos().map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{formatDate(pago.fecha_pago)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{pago.socios.nombre_local}</div>
                      <div className="text-xs text-gray-500">Cód: {pago.socios.codigo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{formatCurrency(pago.monto)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{pago.notas || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal de Registro de Pago */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-secondary text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Registrar Pago a Socio</h2>
              <button onClick={closeModal} className="text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="socio_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Socio *
                </label>
                <select
                  id="socio_id"
                  name="socio_id"
                  value={formData.socio_id}
                  onChange={handleChange}
                  className={`input ${formErrors.socio_id ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleccionar socio</option>
                  {socios.map((socio) => (
                    <option key={socio.id} value={socio.id}>
                      {socio.nombre_local} (Cód: {socio.codigo})
                    </option>
                  ))}
                </select>
                {formErrors.socio_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.socio_id}</p>
                )}
                
                {formData.socio_id && sociosGanancias[formData.socio_id] && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      Pendiente de pago: <span className="font-semibold">
                        {formatCurrency(sociosGanancias[formData.socio_id].pendiente)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto (CLP) *
                </label>
                <input
                  id="monto"
                  name="monto"
                  type="number"
                  min="0"
                  value={formData.monto}
                  onChange={handleChange}
                  className={`input ${formErrors.monto ? 'border-red-500' : ''}`}
                  placeholder="Ej: 50000"
                />
                {formErrors.monto && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.monto}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="fecha_pago" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Pago *
                </label>
                <input
                  id="fecha_pago"
                  name="fecha_pago"
                  type="date"
                  value={formData.fecha_pago}
                  onChange={handleChange}
                  className={`input ${formErrors.fecha_pago ? 'border-red-500' : ''}`}
                />
                {formErrors.fecha_pago && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.fecha_pago}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  rows={3}
                  value={formData.notas}
                  onChange={handleChange}
                  className="input"
                  placeholder="Detalles adicionales sobre el pago..."
                ></textarea>
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
                      Registrando...
                    </span>
                  ) : (
                    'Registrar Pago'
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

export default Pagos;
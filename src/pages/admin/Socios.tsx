import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Trash2, CreditCard as Edit, Plus, Check, X, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { bancos, tiposCuenta, isValidChileanPhone, isValidRut, formatRut, formatInstagram } from '../../lib/utils';
import QRGenerator from '../../components/ui/QRGenerator';
import { generatePartnerCode, generatePIN } from '../../lib/supabase';
import { sendEmail } from '../../lib/email';

interface Socio {
  id: string;
  nombre_local: string;
  direccion: string;
  nombre_contacto: string;
  whatsapp: string;
  instagram: string;
  titular_cuenta: string;
  rut: string;
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  email: string;
  codigo: string;
  pin: string;
  logo_url: string | null;
  link: string | null;
  activo: boolean;
  aprobado: boolean;
}

// Función para convertir archivo a base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const Socios: React.FC = () => {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [socioActual, setSocioActual] = useState<Socio | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [socioQR, setSocioQR] = useState<Socio | null>(null);
  const [soloAprobados, setSoloAprobados] = useState(false);
  const [soloActivos, setSoloActivos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_local: '',
    direccion: '',
    nombre_encargado: '',
    telefono: '',
    instagram: '',
    titular_cuenta: '',
    rut: '',
    banco: '',
    tipo_cuenta: '',
    numero_cuenta: '',
    email: '',
    codigo: '',
    pin: '',
    logo_url: null as File | null,
    link: '',
    activo: true,
    aprobado: true
  });
  
  useEffect(() => {
    fetchSocios();
  }, [soloAprobados, soloActivos]);

  const fetchSocios = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('socios').select('*');
      
      if (soloAprobados) {
        query = query.eq('aprobado', true);
      }
      
      if (soloActivos) {
        query = query.eq('activo', true);
      }
      
      const { data, error } = await query.order('nombre_local', { ascending: true });
      
      if (error) throw error;
      
      setSocios(data || []);
    } catch (error) {
      console.error('Error al cargar socios:', error);
      toast.error('Error al cargar la lista de socios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else {
      let processedValue = value;

      // Formatear RUT automáticamente
      if (name === 'rut') {
        processedValue = formatRut(value);
      }

      // Formatear Instagram automáticamente
      if (name === 'instagram' && value) {
        processedValue = formatInstagram(value);
      }

      setFormData({ ...formData, [name]: processedValue });
    }

    // Limpiar error específico
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({ ...formData, logo_url: file });
    }
  };

  const openCreateModal = () => {
    // Generar código y PIN automáticamente
    setFormData({
      ...formData,
      nombre_local: '',
      direccion: '',
      nombre_encargado: '',
      telefono: '',
      instagram: '',
      titular_cuenta: '',
      rut: '',
      banco: '',
      tipo_cuenta: '',
      numero_cuenta: '',
      email: '',
      codigo: '',
      pin: generatePIN(),
      logo_url: null,
      link: '',
      activo: true,
      aprobado: true
    });
    
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (socio: Socio) => {
    setSocioActual(socio);
    setFormData({
      nombre_local: socio.nombre_local,
      direccion: socio.direccion,
      nombre_encargado: socio.nombre_contacto,
      telefono: socio.whatsapp,
      instagram: socio.instagram,
      titular_cuenta: socio.titular_cuenta,
      rut: socio.rut,
      banco: socio.banco,
      tipo_cuenta: socio.tipo_cuenta,
      numero_cuenta: socio.numero_cuenta,
      email: socio.email,
      codigo: socio.codigo,
      pin: socio.pin,
      logo_url: null,
      link: socio.link || '',
      activo: socio.activo,
      aprobado: socio.aprobado
    });

    setModalMode('edit');
    setModalOpen(true);
  };

  const openViewModal = (socio: Socio) => {
    setSocioActual(socio);
    setFormData({
      nombre_local: socio.nombre_local,
      direccion: socio.direccion,
      nombre_encargado: socio.nombre_contacto,
      telefono: socio.whatsapp,
      instagram: socio.instagram,
      titular_cuenta: socio.titular_cuenta,
      rut: socio.rut,
      banco: socio.banco,
      tipo_cuenta: socio.tipo_cuenta,
      numero_cuenta: socio.numero_cuenta,
      email: socio.email,
      codigo: socio.codigo,
      pin: socio.pin,
      logo_url: null,
      link: socio.link || '',
      activo: socio.activo,
      aprobado: socio.aprobado
    });

    setModalMode('view');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSocioActual(null);
    setFormErrors({});
  };

  const openQRModal = (socio: Socio) => {
    setSocioQR(socio);
    setQrModalOpen(true);
  };

  const closeQRModal = () => {
    setQrModalOpen(false);
    setSocioQR(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nombre_local.trim()) errors.nombre_local = 'El nombre del local es obligatorio';
    if (!formData.direccion.trim()) errors.direccion = 'La dirección es obligatoria';
    if (!formData.nombre_encargado.trim()) errors.nombre_encargado = 'El nombre del encargado es obligatorio';
    
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (!isValidChileanPhone(formData.telefono)) {
      errors.telefono = 'Ingresa un número válido en formato chileno';
    }
    
    // Instagram ya está formateado automáticamente
    
    if (!formData.titular_cuenta.trim()) errors.titular_cuenta = 'El titular de la cuenta es obligatorio';
    
    if (!formData.rut.trim()) {
      errors.rut = 'El RUT es obligatorio';
    } else if (!isValidRut(formData.rut)) {
      errors.rut = 'Ingresa un RUT válido en formato 12345678-9';
    }
    
    if (!formData.banco) errors.banco = 'Selecciona un banco';
    if (!formData.tipo_cuenta) errors.tipo_cuenta = 'Selecciona un tipo de cuenta';
    if (!formData.numero_cuenta.trim()) errors.numero_cuenta = 'El número de cuenta es obligatorio';
    
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ingresa un email válido';
    }
    
    if (formData.pin.length !== 6 || !/^\d+$/.test(formData.pin)) {
      errors.pin = 'El PIN debe tener 6 dígitos numéricos';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let codigo = formData.codigo;
      let logoPath = socioActual?.logo_url || null;

      // Si es creación, generar código único
      if (modalMode === 'create') {
        codigo = await generatePartnerCode();
      }

      // Si hay un nuevo logo, convertirlo a base64
      if (formData.logo_url) {
        try {
          const base64 = await convertFileToBase64(formData.logo_url);
          logoPath = base64;
        } catch (error) {
          console.error('Error al convertir logo:', error);
          toast.error('Error al procesar el logo');
          throw error;
        }
      }
      
      const socioData = {
        nombre_local: formData.nombre_local,
        direccion: formData.direccion,
        nombre_contacto: formData.nombre_encargado,
        whatsapp: formData.telefono,
        instagram: formData.instagram || '',
        titular_cuenta: formData.titular_cuenta,
        rut: formData.rut,
        banco: formData.banco,
        tipo_cuenta: formData.tipo_cuenta,
        numero_cuenta: formData.numero_cuenta,
        email: formData.email || '',
        codigo,
        pin: formData.pin,
        logo_url: logoPath,
        link: formData.link || null,
        activo: formData.activo,
        aprobado: formData.aprobado
      };
      
      if (modalMode === 'create') {
        // Insertar nuevo socio
        const { error } = await supabase.from('socios').insert([socioData]);
        
        if (error) throw error;
        
        toast.success('Socio creado con éxito');
      } else if (modalMode === 'edit' && socioActual) {
        // Actualizar socio existente
        const { error } = await supabase
          .from('socios')
          .update(socioData)
          .eq('id', socioActual.id);
        
        if (error) throw error;
        
        toast.success('Socio actualizado con éxito');
      }
      
      closeModal();
      fetchSocios();
    } catch (error) {
      console.error('Error al guardar socio:', error);
      toast.error('Error al guardar los datos del socio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este socio?')) {
      return;
    }
    
    try {
      const { error } = await supabase.from('socios').delete().eq('id', id);
      
      if (error) throw error;
      
      toast.success('Socio eliminado con éxito');
      fetchSocios();
    } catch (error) {
      console.error('Error al eliminar socio:', error);
      toast.error('Error al eliminar el socio');
    }
  };

  const toggleAprobado = async (socio: Socio) => {
    try {
      const { error } = await supabase
        .from('socios')
        .update({ aprobado: !socio.aprobado })
        .eq('id', socio.id);

      if (error) throw error;

      // Enviar correo si fue aprobado
      if (!socio.aprobado && socio.email) {
        await sendEmail(socio.email, 'aprobacion', {
          nombre_local: socio.nombre_local,
          codigo: socio.codigo,
          pin: socio.pin,
          nombre_contacto: socio.nombre_contacto,
          email: socio.email,
        });
      }

      toast.success(`Socio ${socio.aprobado ? 'desaprobado' : 'aprobado'} con éxito`);
      fetchSocios();
    } catch (error) {
      console.error('Error al cambiar estado de aprobación:', error);
      toast.error('Error al cambiar estado de aprobación');
    }
  };

  const toggleActivo = async (socio: Socio) => {
    try {
      const { error } = await supabase
        .from('socios')
        .update({ activo: !socio.activo })
        .eq('id', socio.id);

      if (error) throw error;

      // Enviar correo si fue activado
      if (!socio.activo && socio.email) {
        await sendEmail(socio.email, 'activacion', {
          nombre_local: socio.nombre_local,
          codigo: socio.codigo,
          pin: socio.pin,
          nombre_contacto: socio.nombre_contacto,
          email: socio.email,
        });
      }

      toast.success(`Socio ${socio.activo ? 'desactivado' : 'activado'} con éxito`);
      fetchSocios();
    } catch (error) {
      console.error('Error al cambiar estado activo:', error);
      toast.error('Error al cambiar estado activo');
    }
  };

  // Filtrar socios según la búsqueda
  const filteredSocios = socios.filter(socio =>
    socio.nombre_local.toLowerCase().includes(searchQuery.toLowerCase()) ||
    socio.nombre_contacto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    socio.codigo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Socios Comerciales</h1>
        <button 
          onClick={openCreateModal}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Nuevo Socio
        </button>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="soloAprobados"
                checked={soloAprobados}
                onChange={() => setSoloAprobados(!soloAprobados)}
                className="mr-2"
              />
              <label htmlFor="soloAprobados" className="text-sm">Solo Aprobados</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="soloActivos"
                checked={soloActivos}
                onChange={() => setSoloActivos(!soloActivos)}
                className="mr-2"
              />
              <label htmlFor="soloActivos" className="text-sm">Solo Activos</label>
            </div>
            <button 
              onClick={fetchSocios}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar socios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>
      
      {/* Lista de Socios */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredSocios.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No hay socios comerciales para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Encargado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSocios.map((socio) => (
                  <tr key={socio.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {socio.logo_url ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover"
                              src={socio.logo_url}
                              alt={socio.nombre_local}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {socio.nombre_local.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{socio.nombre_local}</div>
                          <div className="text-xs text-gray-500">{socio.direccion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{socio.nombre_contacto}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{socio.codigo}</div>
                      <div className="text-xs text-gray-500">PIN: {socio.pin}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{socio.whatsapp}</div>
                      <div className="text-xs text-blue-600">{socio.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <span 
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${socio.aprobado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {socio.aprobado ? 'Aprobado' : 'No Aprobado'}
                        </span>
                        <span 
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${socio.activo ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {socio.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openQRModal(socio)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver QR"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openViewModal(socio)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(socio)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => toggleActivo(socio)}
                        className={`${socio.activo ? 'text-orange-600 hover:text-orange-900' : 'text-blue-600 hover:text-blue-900'}`}
                        title={socio.activo ? 'Desactivar' : 'Activar'}
                      >
                        {socio.activo ? <X size={18} /> : <Check size={18} />}
                      </button>
                      <button
                        onClick={() => toggleAprobado(socio)}
                        className={`${socio.aprobado ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={socio.aprobado ? 'Desaprobar' : 'Aprobar'}
                      >
                        {socio.aprobado ? <X size={18} /> : <Check size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(socio.id)}
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
          </div>
        )}
      </div>
      
      {/* Modal de Formulario */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-secondary text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? 'Crear Nuevo Socio' : 
                 modalMode === 'edit' ? 'Editar Socio' : 'Detalles del Socio'}
              </h2>
              <button onClick={closeModal} className="text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Datos del Negocio */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-secondary">Datos del Negocio</h3>
                  </div>
                  
                  <div>
                    <label htmlFor="nombre_local" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Local Comercial *
                    </label>
                    <input
                      id="nombre_local"
                      name="nombre_local"
                      type="text"
                      className={`input ${formErrors.nombre_local ? 'border-red-500' : ''}`}
                      value={formData.nombre_local}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    {formErrors.nombre_local && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nombre_local}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      id="direccion"
                      name="direccion"
                      type="text"
                      className={`input ${formErrors.direccion ? 'border-red-500' : ''}`}
                      value={formData.direccion}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    {formErrors.direccion && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.direccion}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="nombre_encargado" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Encargado *
                    </label>
                    <input
                      id="nombre_encargado"
                      name="nombre_encargado"
                      type="text"
                      className={`input ${formErrors.nombre_encargado ? 'border-red-500' : ''}`}
                      value={formData.nombre_encargado}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    {formErrors.nombre_encargado && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nombre_encargado}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono del Encargado *
                    </label>
                    <input
                      id="telefono"
                      name="telefono"
                      type="text"
                      placeholder="+56 9 1234 5678"
                      className={`input ${formErrors.telefono ? 'border-red-500' : ''}`}
                      value={formData.telefono}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    {formErrors.telefono && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.telefono}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      id="instagram"
                      name="instagram"
                      type="text"
                      placeholder="@tu_negocio"
                      className={`input ${formErrors.instagram ? 'border-red-500' : ''}`}
                      value={formData.instagram}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    {formErrors.instagram && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.instagram}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`input ${formErrors.email ? 'border-red-500' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                      Link de tu Negocio (opcional)
                    </label>
                    <input
                      id="link"
                      name="link"
                      type="text"
                      placeholder="www.tunegocio.com o Instagram"
                      className="input"
                      value={formData.link}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  
                  {modalMode !== 'view' && (
                    <div>
                      <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                        Logo del Negocio (opcional)
                      </label>
                      <input
                        id="logo"
                        name="logo"
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-secondary file:text-white
                                  hover:file:bg-secondary-dark
                                  cursor-pointer"
                        onChange={handleFileChange}
                        disabled={modalMode === 'view'}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Formatos aceptados: JPG, PNG. Máximo 2MB.
                      </p>
                    </div>
                  )}
                  
                  {/* Datos Bancarios */}
                  <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-secondary">Datos Bancarios</h3>
                  </div>
                  
                  <div>
                    <label htmlFor="titular_cuenta" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Titular *
                    </label>
                    <input
                      id="titular_cuenta"
                      name="titular_cuenta"
                      type="text"
                      className={`input ${formErrors.titular_cuenta ? 'border-red-500' : ''}`}
                      value={formData.titular_cuenta}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    {formErrors.titular_cuenta && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.titular_cuenta}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
                      RUT *
                    </label>
                    <input
                      id="rut"
                      name="rut"
                      type="text"
                      placeholder="12345678-9"
                      className={`input ${formErrors.rut ? 'border-red-500' : ''}`}
                      value={formData.rut}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    {formErrors.rut && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.rut}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-1">
                      Banco *
                    </label>
                    <select
                      id="banco"
                      name="banco"
                      className={`input ${formErrors.banco ? 'border-red-500' : ''}`}
                      value={formData.banco}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    >
                      <option value="">Selecciona un banco</option>
                      {bancos.map((banco) => (
                        <option key={banco} value={banco}>
                          {banco}
                        </option>
                      ))}
                    </select>
                    {formErrors.banco && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.banco}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="tipo_cuenta" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Cuenta *
                    </label>
                    <select
                      id="tipo_cuenta"
                      name="tipo_cuenta"
                      className={`input ${formErrors.tipo_cuenta ? 'border-red-500' : ''}`}
                      value={formData.tipo_cuenta}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    >
                      <option value="">Selecciona un tipo</option>
                      {tiposCuenta.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                    {formErrors.tipo_cuenta && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.tipo_cuenta}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="numero_cuenta" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Cuenta *
                    </label>
                    <input
                      id="numero_cuenta"
                      name="numero_cuenta"
                      type="text"
                      className={`input ${formErrors.numero_cuenta ? 'border-red-500' : ''}`}
                      value={formData.numero_cuenta}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    {formErrors.numero_cuenta && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.numero_cuenta}</p>
                    )}
                  </div>
                  
                  {/* Datos del Sistema */}
                  <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-secondary">Datos del Sistema</h3>
                  </div>
                  
                  {modalMode === 'edit' && (
                    <div>
                      <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Socio *
                      </label>
                      <input
                        id="codigo"
                        name="codigo"
                        type="text"
                        maxLength={6}
                        className="input bg-gray-100"
                        value={formData.codigo}
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        El código es único y no se puede modificar.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                      PIN (6 dígitos) *
                    </label>
                    <input
                      id="pin"
                      name="pin"
                      type="text"
                      maxLength={6}
                      className={`input ${formErrors.pin ? 'border-red-500' : ''}`}
                      value={formData.pin}
                      onChange={handleChange}
                      disabled={modalMode === 'view'}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Este PIN permite al socio acceder a su portal.
                    </p>
                    {formErrors.pin && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.pin}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="activo"
                        name="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                        className="mr-2"
                        disabled={modalMode === 'view'}
                      />
                      <label htmlFor="activo" className="text-sm">Activo</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="aprobado"
                        name="aprobado"
                        checked={formData.aprobado}
                        onChange={(e) => setFormData({...formData, aprobado: e.target.checked})}
                        className="mr-2"
                        disabled={modalMode === 'view'}
                      />
                      <label htmlFor="aprobado" className="text-sm">Aprobado</label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-outline-primary mr-2"
                  >
                    Cancelar
                  </button>
                  
                  {modalMode !== 'view' && (
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                          {modalMode === 'create' ? 'Creando...' : 'Actualizando...'}
                        </span>
                      ) : (
                        modalMode === 'create' ? 'Crear Socio' : 'Actualizar Socio'
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal QR */}
      {qrModalOpen && socioQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-secondary text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Código QR de Socio</h2>
              <button onClick={closeQRModal} className="text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">{socioQR.nombre_local}</h3>
                <p className="text-gray-600">{socioQR.codigo}</p>
              </div>
              
              <QRGenerator 
                codigo={socioQR.codigo} 
                nombreLocal={socioQR.nombre_local} 
              />
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Los clientes pueden escanear este QR para obtener cupones referidos por este socio.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Socios;
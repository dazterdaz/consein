import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, AlertCircle, LogIn, CreditCard, FileText, ChevronRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import QRGenerator from '../../components/ui/QRGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatDate, formatCurrency } from '../../lib/utils';
import { useConfig } from '../../contexts/ConfigContext';

const PortalSocio: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    codigo: '',
    pin: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [socio, setSocio] = useState<any>(null);
  const [cupones, setCupones] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [stats, setStats] = useState({
    descargados: 0,
    agendados: 0,
    cobrados: 0,
    gananciasMes: 0,
    gananciasTotal: 0
  });
  
  const { config } = useConfig();
  const { loginSocio, logout } = useAuth();
  
  useEffect(() => {
    // Verificar si hay un socio en localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'socio') {
        fetchSocioData(user.id);
      }
    }
  }, []);

  const fetchSocioData = async (socioId: string) => {
    try {
      // Obtener datos del socio
      const { data: socioData, error: socioError } = await supabase
        .from('socios')
        .select('*')
        .eq('id', socioId)
        .single();
      
      if (socioError || !socioData) {
        throw new Error('Error al obtener datos del socio');
      }
      
      setSocio(socioData);
      
      // Obtener cupones del socio
      const { data: cuponesData, error: cuponesError } = await supabase
        .from('cupones')
        .select('*, artistas(nombre)')
        .eq('socio_id', socioId)
        .order('created_at', { ascending: false });
      
      if (cuponesError) {
        throw new Error('Error al obtener cupones');
      }
      
      setCupones(cuponesData || []);
      
      // Obtener pagos del socio
      const { data: pagosData, error: pagosError } = await supabase
        .from('pagos')
        .select('*')
        .eq('socio_id', socioId)
        .order('fecha_pago', { ascending: false });
      
      if (pagosError) {
        throw new Error('Error al obtener pagos');
      }
      
      setPagos(pagosData || []);
      
      // Calcular estadísticas
      const descargados = cuponesData?.filter(c => c.estado === 'descargado').length || 0;
      const agendados = cuponesData?.filter(c => c.estado === 'agendado').length || 0;
      const cobrados = cuponesData?.filter(c => c.estado === 'cobrado').length || 0;
      
      // Calcular ganancias del mes actual
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      
      const cuponesCobradosMes = cuponesData?.filter(c => {
        if (c.estado !== 'cobrado' || !c.fecha_cobrado || !c.valor_tatuaje) return false;
        const fechaCobrado = new Date(c.fecha_cobrado);
        return fechaCobrado >= inicioMes && fechaCobrado <= hoy;
      }) || [];
      
      const gananciasMes = cuponesCobradosMes.reduce((total, cupon) => {
        const comision = (cupon.valor_tatuaje || 0) * ((config?.porcentaje_comision || 10) / 100);
        return total + comision;
      }, 0);
      
      // Calcular ganancias totales
      const cuponesCobradosTotal = cuponesData?.filter(c => 
        c.estado === 'cobrado' && c.valor_tatuaje
      ) || [];
      
      const gananciasTotal = cuponesCobradosTotal.reduce((total, cupon) => {
        const comision = (cupon.valor_tatuaje || 0) * ((config?.porcentaje_comision || 10) / 100);
        return total + comision;
      }, 0);
      
      setStats({
        descargados,
        agendados,
        cobrados,
        gananciasMes,
        gananciasTotal
      });
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos. Inténtalo de nuevo.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.codigo.trim()) {
      errors.codigo = 'El código es obligatorio';
    }
    
    if (!formData.pin.trim()) {
      errors.pin = 'El PIN es obligatorio';
    } else if (formData.pin.length !== 6 || !/^\d+$/.test(formData.pin)) {
      errors.pin = 'El PIN debe tener 6 dígitos numéricos';
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
      const result = await loginSocio(formData.codigo, formData.pin);
      
      if (result.success && result.socioId) {
        setIsLogin(false);
        await fetchSocioData(result.socioId);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsLogin(true);
    setSocio(null);
    setCupones([]);
    setPagos([]);
  };

  // Calcular ganancias pendientes (total - pagos realizados)
  const calcularGananciasPendientes = () => {
    const totalPagos = pagos.reduce((total, pago) => total + pago.monto, 0);
    return stats.gananciasTotal - totalPagos;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          {isLogin || !socio ? (
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-secondary text-white p-6">
                <h1 className="text-2xl font-bold">Portal de Socios</h1>
                <p className="mt-2">
                  Accede para ver tus estadísticas y ganancias.
                </p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Socio
                      </label>
                      <input
                        id="codigo"
                        name="codigo"
                        type="text"
                        placeholder="Código de 6 caracteres"
                        className={`input ${formErrors.codigo ? 'border-red-500' : ''}`}
                        value={formData.codigo}
                        onChange={handleChange}
                      />
                      {formErrors.codigo && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.codigo}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                        PIN
                      </label>
                      <input
                        id="pin"
                        name="pin"
                        type="password"
                        placeholder="PIN de 6 dígitos"
                        className={`input ${formErrors.pin ? 'border-red-500' : ''}`}
                        value={formData.pin}
                        onChange={handleChange}
                      />
                      {formErrors.pin && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.pin}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                          Accediendo...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <LogIn size={18} className="mr-2" />
                          Acceder
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="bg-secondary text-white p-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{socio.nombre_local}</h1>
                    <button
                      onClick={handleLogout}
                      className="btn bg-white text-secondary hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4 text-secondary">Tu Código QR</h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <QRGenerator 
                          codigo={socio.codigo} 
                          nombreLocal={socio.nombre_local} 
                        />
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        Comparte este código QR en tu local para que tus clientes puedan obtener cupones.
                      </p>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4 text-secondary">Resumen</h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-accent-light rounded-lg p-4 text-center">
                          <p className="text-sm font-medium text-accent-dark">Descargados</p>
                          <p className="text-3xl font-bold text-accent">{stats.descargados}</p>
                        </div>
                        
                        <div className="bg-secondary-light rounded-lg p-4 text-center">
                          <p className="text-sm font-medium text-secondary-dark">Agendados</p>
                          <p className="text-3xl font-bold text-secondary">{stats.agendados}</p>
                        </div>
                        
                        <div className="bg-primary-light rounded-lg p-4 text-center">
                          <p className="text-sm font-medium text-primary-dark">Cobrados</p>
                          <p className="text-3xl font-bold text-primary">{stats.cobrados}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold mb-2 flex items-center">
                          <CreditCard size={18} className="mr-2 text-secondary" />
                          Ganancias del Mes
                        </h3>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(stats.gananciasMes)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-2 flex items-center">
                          <CreditCard size={18} className="mr-2 text-secondary" />
                          Ganancias Pendientes
                        </h3>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(calcularGananciasPendientes())}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Historial de Cupones */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-secondary text-white p-4">
                    <h2 className="text-xl font-semibold flex items-center">
                      <FileText size={18} className="mr-2" />
                      Historial de Cupones
                    </h2>
                  </div>
                  
                  <div className="p-4">
                    {cupones.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">
                        No hay cupones registrados todavía.
                      </p>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {cupones.map((cupon) => (
                              <tr key={cupon.id}>
                                <td className="px-4 py-3 text-sm">
                                  {cupon.codigo}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {cupon.cliente_nombre}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {formatDate(cupon.fecha_descarga)}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`
                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${cupon.estado === 'descargado' ? 'status-descargado' : 
                                      cupon.estado === 'agendado' ? 'status-agendado' : 
                                      'status-cobrado'}
                                  `}>
                                    {cupon.estado === 'descargado' ? 'Descargado' : 
                                     cupon.estado === 'agendado' ? 'Agendado' : 
                                     'Cobrado'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Historial de Pagos */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-primary text-white p-4">
                    <h2 className="text-xl font-semibold flex items-center">
                      <CreditCard size={18} className="mr-2" />
                      Historial de Pagos
                    </h2>
                  </div>
                  
                  <div className="p-4">
                    {pagos.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">
                        No hay pagos registrados todavía.
                      </p>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Monto
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Notas
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {pagos.map((pago) => (
                              <tr key={pago.id}>
                                <td className="px-4 py-3 text-sm">
                                  {formatDate(pago.fecha_pago)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-primary">
                                  {formatCurrency(pago.monto)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {pago.notas || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PortalSocio;
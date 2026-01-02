import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CuponGenerator from '../../components/ui/CuponGenerator';
import { getSocioByCode, createCupon } from '../../lib/database';
import { generateCouponCode } from '../../lib/utils';
import { isValidChileanPhone } from '../../lib/utils';

const CuponPage: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  
  const [socio, setSocio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cuponCreado, setCuponCreado] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    instagram: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cuponData, setCuponData] = useState<any>(null);

  useEffect(() => {
    const fetchSocio = async () => {
      try {
        // Verificar que el código corresponde a un socio activo y aprobado
        const data = await getSocioByCode(codigo || '');
        
        if (!data || !data.activo || !data.aprobado) {
          setError('El código de socio no es válido o no está activo');
          return;
        }
        
        setSocio(data);
      } catch (err) {
        console.error('Error al buscar socio:', err);
        setError('Error al cargar los datos. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (codigo) {
      fetchSocio();
    } else {
      setError('Código de socio no proporcionado');
      setLoading(false);
    }
  }, [codigo]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'El número de WhatsApp es obligatorio';
    } else if (!isValidChileanPhone(formData.whatsapp)) {
      errors.whatsapp = 'Ingresa un número válido en formato chileno';
    }
    
    if (formData.instagram && !formData.instagram.startsWith('@')) {
      errors.instagram = 'El Instagram debe comenzar con @';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error al modificar campo
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generar código único para el cupón
      const codigoCupon = generateCouponCode();
      const fechaActual = new Date().toISOString();
      
      // Guardar cupón en la base de datos
      await createCupon({
        codigo: codigoCupon,
        socio_id: socio.id,
        cliente_nombre: formData.nombre,
        cliente_whatsapp: formData.whatsapp,
        cliente_instagram: formData.instagram,
        estado: 'descargado',
        fecha_descarga: new Date(fechaActual),
        fecha_agendado: null,
        fecha_cobrado: null,
        artista_id: null,
        valor_tatuaje: null
      });
      
      // Guardar datos del cupón para mostrarlo
      setCuponData({
        codigo: codigoCupon,
        nombreCliente: formData.nombre,
        nombreLocal: socio.nombre_local,
        fechaDescarga: fechaActual
      });
      
      setCuponCreado(true);
      toast.success('¡Cupón generado con éxito!');
    } catch (err) {
      console.error('Error al crear cupón:', err);
      toast.error('Error al generar el cupón. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-red-500 mb-4">
                <AlertCircle size={48} className="mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-secondary">Código no válido</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {!cuponCreado ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-secondary text-white p-6">
                  <h1 className="text-2xl font-bold">Obtén tu Cupón de Descuento</h1>
                  <p className="mt-2">
                    Recomendado por: <span className="font-semibold">{socio.nombre_local}</span>
                  </p>
                </div>
                
                <div className="p-6">
                  <p className="mb-6 text-gray-700">
                    Completa tus datos para recibir un cupón de descuento para tu próximo tatuaje.
                  </p>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                          Tu Nombre Completo *
                        </label>
                        <input
                          id="nombre"
                          name="nombre"
                          type="text"
                          className={`input ${formErrors.nombre ? 'border-red-500' : ''}`}
                          value={formData.nombre}
                          onChange={handleChange}
                        />
                        {formErrors.nombre && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.nombre}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                          Tu Número de WhatsApp *
                        </label>
                        <input
                          id="whatsapp"
                          name="whatsapp"
                          type="text"
                          placeholder="+56 9 1234 5678"
                          className={`input ${formErrors.whatsapp ? 'border-red-500' : ''}`}
                          value={formData.whatsapp}
                          onChange={handleChange}
                        />
                        {formErrors.whatsapp && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.whatsapp}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                          Tu Instagram (opcional)
                        </label>
                        <input
                          id="instagram"
                          name="instagram"
                          type="text"
                          placeholder="@tu_usuario"
                          className={`input ${formErrors.instagram ? 'border-red-500' : ''}`}
                          value={formData.instagram}
                          onChange={handleChange}
                        />
                        {formErrors.instagram && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.instagram}</p>
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
                            Generando Cupón...
                          </span>
                        ) : (
                          'Generar mi Cupón'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold mb-6 text-center text-secondary">
                  ¡Tu cupón está listo!
                </h2>
                
                <CuponGenerator
                  codigo={cuponData.codigo}
                  nombreCliente={cuponData.nombreCliente}
                  nombreLocal={cuponData.nombreLocal}
                  fechaDescarga={cuponData.fechaDescarga}
                />
                
                <div className="mt-10 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">Instrucciones:</h3>
                  <ol className="list-decimal list-inside text-blue-700 space-y-2">
                    <li>Descarga el cupón o toma una captura de pantalla.</li>
                    <li>Preséntalo al momento de agendar tu tatuaje.</li>
                    <li>El cupón es de un solo uso y personal.</li>
                  </ol>
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => navigate('/')}
                    className="btn btn-secondary"
                  >
                    Volver al Inicio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CuponPage;
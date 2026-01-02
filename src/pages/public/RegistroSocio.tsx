import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { generatePartnerCode } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { bancos, tiposCuenta, isValidChileanPhone, isValidRut, formatRut, formatInstagram } from '../../lib/utils';
import { generatePIN } from '../../lib/utils';
import { sendEmail } from '../../lib/email';

// Función para convertir archivo a base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const RegistroSocio: React.FC = () => {
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
    pin: generatePIN(),
    logo_url: null as File | null,
    link: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones básicas
    if (!formData.nombre_local.trim()) newErrors.nombre_local = 'El nombre del local es obligatorio';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';
    if (!formData.nombre_encargado.trim()) newErrors.nombre_encargado = 'El nombre del encargado es obligatorio';
    
    // Validación de teléfono chileno
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!isValidChileanPhone(formData.telefono)) {
      newErrors.telefono = 'Ingresa un número válido en formato chileno (ej: +56 9 1234 5678)';
    }
    
    // Validación de Instagram (opcional) - ya está formateado automáticamente
    
    // Validaciones de cuenta bancaria
    if (!formData.titular_cuenta.trim()) newErrors.titular_cuenta = 'El titular de la cuenta es obligatorio';
    
    // Validación de RUT chileno
    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es obligatorio';
    } else if (!isValidRut(formData.rut)) {
      newErrors.rut = 'Ingresa un RUT válido en formato 12345678-9';
    }
    
    if (!formData.banco) newErrors.banco = 'Selecciona un banco';
    if (!formData.tipo_cuenta) newErrors.tipo_cuenta = 'Selecciona un tipo de cuenta';
    if (!formData.numero_cuenta.trim()) newErrors.numero_cuenta = 'El número de cuenta es obligatorio';
    
    // Validación de email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }
    
    // Validación de PIN (opcional, ya que se genera automáticamente)
    if (formData.pin.length !== 6 || !/^\d+$/.test(formData.pin)) {
      newErrors.pin = 'El PIN debe tener 6 dígitos numéricos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

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

    // Limpiar error específico al modificar un campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({ ...formData, logo_url: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generar código único para el socio
      const codigo = await generatePartnerCode();

      // Convertir logo a base64 si existe
      let logoBase64 = null;
      if (formData.logo_url) {
        try {
          logoBase64 = await convertFileToBase64(formData.logo_url);
        } catch (error) {
          console.error('Error al convertir logo:', error);
          toast.error('Error al procesar el logo');
        }
      }

      // Guardar datos del socio en la base de datos
      const { error } = await supabase.from('socios').insert([{
        codigo,
        nombre_local: formData.nombre_local,
        direccion: formData.direccion,
        nombre_contacto: formData.nombre_encargado,
        whatsapp: formData.telefono,
        instagram: formData.instagram,
        titular_cuenta: formData.titular_cuenta,
        rut: formData.rut,
        banco: formData.banco,
        tipo_cuenta: formData.tipo_cuenta,
        numero_cuenta: formData.numero_cuenta,
        email: formData.email,
        pin: formData.pin,
        logo_url: logoBase64,
        link: formData.link || null,
        activo: false,
        aprobado: false // Requiere aprobación del administrador
      }]);

      if (error) throw error;

      // Enviar correo de registro
      if (formData.email) {
        await sendEmail(formData.email, 'registro', {
          nombre_local: formData.nombre_local,
          codigo,
          pin: formData.pin,
          nombre_contacto: formData.nombre_encargado,
          email: formData.email,
        });
      }

      setIsSuccess(true);
      toast.success('Registro enviado con éxito');
    } catch (error) {
      console.error('Error al registrar socio:', error);
      toast.error('Error al enviar el registro. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          {isSuccess ? (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-secondary">¡Solicitud Enviada!</h2>
              <p className="text-lg mb-6">
                Tu solicitud para ser socio comercial ha sido enviada con éxito. 
                Nos comunicaremos contigo a la brevedad para validar tus datos y activar tu cuenta.
              </p>
              <p className="text-gray-600 mb-8">
                Mientras tanto, te recomendamos revisar los beneficios y términos de nuestro programa de socios.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="btn btn-primary"
              >
                Volver al Inicio
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-secondary text-white p-6">
                <h1 className="text-2xl font-bold">Registro de Socio Comercial</h1>
                <p className="mt-2">
                  Completa el formulario para unirte a nuestra red de socios y comenzar a generar ingresos adicionales.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Datos del Negocio */}
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-secondary">Datos del Negocio</h2>
                  </div>
                  
                  <div>
                    <label htmlFor="nombre_local" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Local Comercial *
                    </label>
                    <input
                      id="nombre_local"
                      name="nombre_local"
                      type="text"
                      className={`input ${errors.nombre_local ? 'border-red-500' : ''}`}
                      value={formData.nombre_local}
                      onChange={handleChange}
                    />
                    {errors.nombre_local && (
                      <p className="mt-1 text-sm text-red-600">{errors.nombre_local}</p>
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
                      className={`input ${errors.direccion ? 'border-red-500' : ''}`}
                      value={formData.direccion}
                      onChange={handleChange}
                    />
                    {errors.direccion && (
                      <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
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
                      className={`input ${errors.nombre_encargado ? 'border-red-500' : ''}`}
                      value={formData.nombre_encargado}
                      onChange={handleChange}
                    />
                    {errors.nombre_encargado && (
                      <p className="mt-1 text-sm text-red-600">{errors.nombre_encargado}</p>
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
                      className={`input ${errors.telefono ? 'border-red-500' : ''}`}
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                    {errors.telefono && (
                      <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram (opcional)
                    </label>
                    <input
                      id="instagram"
                      name="instagram"
                      type="text"
                      placeholder="tu_negocio o @tu_negocio"
                      className={`input ${errors.instagram ? 'border-red-500' : ''}`}
                      value={formData.instagram}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Puedes escribir con o sin @, se formateará automáticamente
                    </p>
                    {errors.instagram && (
                      <p className="mt-1 text-sm text-red-600">{errors.instagram}</p>
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
                      className={`input ${errors.email ? 'border-red-500' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
                    />
                  </div>
                  
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
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Formatos aceptados: JPG, PNG. Máximo 2MB.
                    </p>
                  </div>
                  
                  {/* Datos Bancarios */}
                  <div className="md:col-span-2 mt-6">
                    <h2 className="text-xl font-semibold mb-4 text-secondary">Datos Bancarios</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Estos datos serán utilizados para transferir tus comisiones.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="titular_cuenta" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Titular *
                    </label>
                    <input
                      id="titular_cuenta"
                      name="titular_cuenta"
                      type="text"
                      className={`input ${errors.titular_cuenta ? 'border-red-500' : ''}`}
                      value={formData.titular_cuenta}
                      onChange={handleChange}
                    />
                    {errors.titular_cuenta && (
                      <p className="mt-1 text-sm text-red-600">{errors.titular_cuenta}</p>
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
                      placeholder="11.111.111-1 o 111111111"
                      className={`input ${errors.rut ? 'border-red-500' : ''}`}
                      value={formData.rut}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Se formateará automáticamente al formato 11.111.111-1
                    </p>
                    {errors.rut && (
                      <p className="mt-1 text-sm text-red-600">{errors.rut}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-1">
                      Banco *
                    </label>
                    <select
                      id="banco"
                      name="banco"
                      className={`input ${errors.banco ? 'border-red-500' : ''}`}
                      value={formData.banco}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona un banco</option>
                      {bancos.map((banco) => (
                        <option key={banco} value={banco}>
                          {banco}
                        </option>
                      ))}
                    </select>
                    {errors.banco && (
                      <p className="mt-1 text-sm text-red-600">{errors.banco}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="tipo_cuenta" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Cuenta *
                    </label>
                    <select
                      id="tipo_cuenta"
                      name="tipo_cuenta"
                      className={`input ${errors.tipo_cuenta ? 'border-red-500' : ''}`}
                      value={formData.tipo_cuenta}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona un tipo</option>
                      {tiposCuenta.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                    {errors.tipo_cuenta && (
                      <p className="mt-1 text-sm text-red-600">{errors.tipo_cuenta}</p>
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
                      className={`input ${errors.numero_cuenta ? 'border-red-500' : ''}`}
                      value={formData.numero_cuenta}
                      onChange={handleChange}
                    />
                    {errors.numero_cuenta && (
                      <p className="mt-1 text-sm text-red-600">{errors.numero_cuenta}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                      PIN (6 dígitos) *
                    </label>
                    <input
                      id="pin"
                      name="pin"
                      type="text"
                      maxLength={6}
                      className={`input ${errors.pin ? 'border-red-500' : ''}`}
                      value={formData.pin}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Este PIN te permitirá acceder a tu portal de socio. Puedes conservar el generado automáticamente o cambiarlo.
                    </p>
                    {errors.pin && (
                      <p className="mt-1 text-sm text-red-600">{errors.pin}</p>
                    )}
                  </div>
                </div>
                
                {/* Nota informativa */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg flex items-start">
                  <AlertCircle size={20} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium">Importante:</p>
                    <p className="text-blue-700 text-sm">
                      Tu solicitud será revisada por nuestro equipo. Una vez aprobada, recibirás un correo con los pasos a seguir.
                    </p>
                  </div>
                </div>
                
                {/* Botón de envío */}
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Solicitud'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegistroSocio;
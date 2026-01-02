import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Save, Upload, Trash2 } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';
import { supabase } from '../../lib/supabase';

const Configuracion: React.FC = () => {
  const { config, loading: configLoading, updateConfig } = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_sitio: '',
    logo_url: null as File | null,
    footer_texto1: '',
    footer_texto2: '',
    footer_texto3: '',
    footer_texto4: '',
    porcentaje_comision: 10
  });
  
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        nombre_sitio: config.nombre_sitio,
        logo_url: null,
        footer_texto1: config.footer_texto1,
        footer_texto2: config.footer_texto2,
        footer_texto3: config.footer_texto3,
        footer_texto4: config.footer_texto4,
        porcentaje_comision: config.porcentaje_comision
      });
      
      if (config.logo_url) {
        setPreviewLogo(config.logo_url);
      }
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({ ...formData, logo_url: file });
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset remove flag
      setRemoveLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo_url: null });
    setPreviewLogo(null);
    setRemoveLogo(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config) return;
    
    setIsLoading(true);
    
    try {
      let logoPath = config.logo_url;
      
      // Si se quiere eliminar el logo
      if (removeLogo) {
        logoPath = null;
      }
      // Si hay un nuevo logo, subirlo
      else if (formData.logo_url) {
        const fileExt = formData.logo_url.name.split('.').pop();
        const fileName = `site_logo_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('site')
          .upload(`logos/${fileName}`, formData.logo_url);
        
        if (uploadError) {
          throw new Error('Error al subir el logo');
        }
        
        logoPath = uploadData.path;
      }
      
      const updatedConfig = {
        nombre_sitio: formData.nombre_sitio,
        logo_url: logoPath,
        footer_texto1: formData.footer_texto1,
        footer_texto2: formData.footer_texto2,
        footer_texto3: formData.footer_texto3,
        footer_texto4: formData.footer_texto4,
        porcentaje_comision: formData.porcentaje_comision
      };
      
      const result = await updateConfig(updatedConfig);
      
      if (result.success) {
        toast.success('Configuración actualizada con éxito');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración del Sistema</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuración General */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-secondary">Configuración General</h2>
            </div>
            
            <div>
              <label htmlFor="nombre_sitio" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Sitio
              </label>
              <input
                id="nombre_sitio"
                name="nombre_sitio"
                type="text"
                value={formData.nombre_sitio}
                onChange={handleChange}
                className="input"
              />
            </div>
            
            <div>
              <label htmlFor="porcentaje_comision" className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje de Comisión (%)
              </label>
              <input
                id="porcentaje_comision"
                name="porcentaje_comision"
                type="number"
                min="1"
                max="100"
                value={formData.porcentaje_comision}
                onChange={handleChange}
                className="input"
              />
              <p className="mt-1 text-xs text-gray-500">
                Este porcentaje se aplicará al valor de cada tatuaje para calcular la comisión del socio.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo del Sitio
              </label>
              
              <div className="flex items-start space-x-4">
                <div>
                  {previewLogo ? (
                    <div className="relative">
                      <img 
                        src={previewLogo} 
                        alt="Logo Preview" 
                        className="w-32 h-32 object-contain border rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute top-1 right-1 bg-red-100 text-red-600 p-1 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Sin logo</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="block w-full text-sm text-gray-500 
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-secondary file:text-white
                                hover:file:bg-secondary-dark
                                cursor-pointer">
                    <div className="flex items-center">
                      <Upload size={16} className="mr-2" />
                      <span>Subir nuevo logo</span>
                    </div>
                    <input
                      type="file"
                      id="logo"
                      name="logo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Formatos aceptados: JPG, PNG. Máximo 2MB.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Configuración del Footer */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-secondary">Textos del Footer</h2>
            </div>
            
            <div>
              <label htmlFor="footer_texto1" className="block text-sm font-medium text-gray-700 mb-1">
                Texto 1
              </label>
              <input
                id="footer_texto1"
                name="footer_texto1"
                type="text"
                value={formData.footer_texto1}
                onChange={handleChange}
                className="input"
                placeholder="© 2025 Sistema de Referidos"
              />
            </div>
            
            <div>
              <label htmlFor="footer_texto2" className="block text-sm font-medium text-gray-700 mb-1">
                Texto 2
              </label>
              <input
                id="footer_texto2"
                name="footer_texto2"
                type="text"
                value={formData.footer_texto2}
                onChange={handleChange}
                className="input"
                placeholder="Versión: 1.7"
              />
            </div>
            
            <div>
              <label htmlFor="footer_texto3" className="block text-sm font-medium text-gray-700 mb-1">
                Texto 3
              </label>
              <input
                id="footer_texto3"
                name="footer_texto3"
                type="text"
                value={formData.footer_texto3}
                onChange={handleChange}
                className="input"
                placeholder="Por: Daz The Line"
              />
            </div>
            
            <div>
              <label htmlFor="footer_texto4" className="block text-sm font-medium text-gray-700 mb-1">
                Texto 4 (Link)
              </label>
              <input
                id="footer_texto4"
                name="footer_texto4"
                type="text"
                value={formData.footer_texto4}
                onChange={handleChange}
                className="input"
                placeholder="Ver detalles: www.daz.cl"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save size={18} className="mr-2" />
                  Guardar Configuración
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Configuracion;
import { supabase } from './supabase';

export const sendEmail = async (
  to: string,
  templateType: 'registro' | 'aprobacion' | 'activacion',
  variables: Record<string, string>
): Promise<boolean> => {
  try {
    // Obtener plantilla
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('tipo', templateType)
      .eq('activo', true)
      .maybeSingle();

    if (templateError || !template) {
      console.error('Plantilla no encontrada:', templateError);
      return false;
    }

    // Reemplazar variables en asunto y contenido
    let asunto = template.asunto;
    let contenido = template.contenido;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      asunto = asunto.replace(regex, value);
      contenido = contenido.replace(regex, value);
    });

    // Enviar correo mediante edge function
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to,
        subject: asunto,
        html: contenido,
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }
};

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Función para formatear fechas
export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'dd/MM/yyyy', { locale: es });
};

// Función para formatear fechas con hora
export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
};

// Función para formatear montos como pesos chilenos
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

// Validar número de teléfono chileno
export const isValidChileanPhone = (phone: string): boolean => {
  // Formato: +56 9 XXXX XXXX o 9 XXXX XXXX
  const phoneRegex = /^(\+?56)?(\s?)(9)(\s?)[0-9]{4}(\s?)[0-9]{4}$/;
  return phoneRegex.test(phone);
};

// Formatear RUT chileno: acepta 111111111, 11.111.111-1, 11111111-1
// y siempre devuelve formato 11.111.111-1
export const formatRut = (rut: string): string => {
  // Remover todo excepto números y K
  let cleaned = rut.replace(/[^0-9kK]/g, '');

  if (cleaned.length === 0) return '';

  // Separar cuerpo y dígito verificador
  let body = cleaned.slice(0, -1);
  let dv = cleaned.slice(-1).toUpperCase();

  // Si el body está vacío, retornar el dígito verificador solo
  if (body.length === 0) return dv;

  // Formatear el cuerpo con puntos
  let formattedBody = '';
  let counter = 0;

  for (let i = body.length - 1; i >= 0; i--) {
    if (counter === 3) {
      formattedBody = '.' + formattedBody;
      counter = 0;
    }
    formattedBody = body[i] + formattedBody;
    counter++;
  }

  return `${formattedBody}-${dv}`;
};

// Validar RUT chileno
export const isValidRut = (rut: string): boolean => {
  // Limpiar el RUT de puntos y guiones
  const cleaned = rut.replace(/[^0-9kK]/g, '');

  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  let dv = cleaned.slice(-1).toUpperCase();

  if (!/^\d+$/.test(body)) return false;

  const rut_num = parseInt(body, 10);

  let m = 0;
  let s = 1;
  for (let i = rut_num; i > 0; i = Math.floor(i / 10)) {
    s = (s + (i % 10) * (9 - m++ % 6)) % 11;
  }

  const calculatedDv = s > 0 ? String(s - 1) : 'K';

  return calculatedDv === dv;
};

// Normalizar Instagram: acepta con o sin @, siempre devuelve con @
export const formatInstagram = (instagram: string): string => {
  if (!instagram) return '';

  // Remover espacios
  let cleaned = instagram.trim();

  // Si ya tiene @, retornar tal cual
  if (cleaned.startsWith('@')) return cleaned;

  // Si no tiene @, agregarlo
  return `@${cleaned}`;
};

// Lista de bancos chilenos
export const bancos = [
  'Banco de Chile',
  'Banco Santander',
  'Banco Estado',
  'Banco BCI',
  'Banco Scotiabank',
  'Banco Itaú',
  'Banco Security',
  'Banco Falabella',
  'Banco Ripley',
  'Banco Consorcio',
  'Banco Internacional',
  'Banco BICE',
  'Banco Edwards Citi',
  'Banco BTG Pactual',
  'Coopeuch'
];

// Lista de tipos de cuenta
export const tiposCuenta = [
  'Cuenta Corriente',
  'Cuenta Vista',
  'Cuenta RUT',
  'Cuenta de Ahorro',
  'Cuenta Chequera Electrónica'
];

// Calcular comisiones según el valor del tatuaje y el porcentaje configurado
export const calcularComision = (valorTatuaje: number, porcentajeComision: number): number => {
  return Math.round(valorTatuaje * (porcentajeComision / 100));
};

// Función para generar un PIN numérico de 6 dígitos
export const generatePIN = (): string => {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  return pin;
};

// Función para generar un código de cupón único
export const generateCouponCode = (): string => {
  const timestamp = Date.now().toString(36);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CPN-${randomChars}-${timestamp.substring(timestamp.length - 4)}`;
};
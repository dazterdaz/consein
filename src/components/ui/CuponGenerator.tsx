import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Scissors } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface CuponGeneratorProps {
  codigo: string;
  nombreCliente: string;
  nombreLocal: string;
  fechaDescarga: string;
}

const CuponGenerator: React.FC<CuponGeneratorProps> = ({ 
  codigo, 
  nombreCliente, 
  nombreLocal,
  fechaDescarga
}) => {
  const cuponRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cuponRef.current) return;

    try {
      const canvas = await html2canvas(cuponRef.current);
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Cupon-${codigo}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el cupón:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={cuponRef}
        className="w-full max-w-md bg-white border-4 border-dashed border-primary rounded-lg overflow-hidden"
      >
        <div className="bg-primary text-white p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Cupón de Descuento</h3>
          <Scissors size={24} />
        </div>
        
        <div className="p-6">
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500">Recomendado por</p>
            <p className="text-lg font-bold text-secondary">{nombreLocal}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500">Cliente:</p>
            <p className="font-medium">{nombreCliente}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500">Código único:</p>
            <p className="font-bold text-primary">{codigo}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500">Fecha de emisión:</p>
            <p>{formatDate(fechaDescarga)}</p>
          </div>
          
          <div className="text-center mt-6 p-3 bg-secondary-light rounded-lg">
            <p className="text-secondary-dark font-medium">¡Presenta este cupón al agendar tu tatuaje!</p>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 text-center text-sm text-gray-500">
          <p>Este cupón es de un solo uso y no es transferible.</p>
          <p>Válido para tatuajes con cita previa.</p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="mt-6 btn btn-primary"
      >
        <Download size={18} className="mr-1" />
        Descargar Cupón
      </button>
    </div>
  );
};

export default CuponGenerator;
import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

interface QRGeneratorProps {
  codigo: string;
  nombreLocal: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ codigo, nombreLocal }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrValue = `${window.location.origin}/cupon/${codigo}`;

  const handleDownload = async () => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current);
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QR-${nombreLocal.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el código QR:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={qrRef}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-secondary">{nombreLocal}</h3>
          <p className="text-sm text-gray-600">Código: {codigo}</p>
        </div>
        
        <div className="flex justify-center mb-4">
          <QRCode
            value={qrValue}
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>
        
        <p className="text-center text-sm text-gray-600">Escanea para obtener tu cupón</p>
      </div>

      <button
        onClick={handleDownload}
        className="mt-4 btn btn-primary"
      >
        <Download size={18} className="mr-1" />
        Descargar QR
      </button>
    </div>
  );
};

export default QRGenerator;
import React from 'react';
import { useConfig } from '../../contexts/ConfigContext';

const Footer: React.FC = () => {
  const { config, loading } = useConfig();

  if (loading || !config) {
    return (
      <footer className="bg-secondary text-white py-4">
        <div className="container mx-auto px-4">
          <p className="text-center">Cargando...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-secondary text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <p className="text-lg font-semibold">{config.footer_texto1}</p>
            <p className="text-sm mt-1">{config.footer_texto2}</p>
          </div>
          <div>
            <p className="text-sm">{config.footer_texto3}</p>
            <p className="text-sm mt-1">
              <a 
                href={config.footer_texto4.includes('www') ? 
                  (config.footer_texto4.includes('http') ? config.footer_texto4 : `https://${config.footer_texto4}`) : 
                  config.footer_texto4
                }
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent transition-colors"
              >
                {config.footer_texto4}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
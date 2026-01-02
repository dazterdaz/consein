import React from 'react';
import Slider from 'react-slick';
import { ExternalLink } from 'lucide-react';
import { getSocios, Socio } from '../../lib/database';

const PartnerCarousel: React.FC = () => {
  const [socios, setSocios] = React.useState<Socio[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSocios = async () => {
      try {
        const data = await getSocios({ activo: true, aprobado: true });
        setSocios(data);
      } catch (error) {
        // Error manejado silenciosamente en getSocios
        setSocios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSocios();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (socios.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500">No hay socios comerciales disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8 text-secondary">Nuestros Socios Comerciales</h2>
        
        <Slider {...settings}>
          {socios.map((socio) => (
            <div key={socio.id} className="px-3">
              <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl hover:scale-105">
                {/* Logo en formato 1:1 */}
                <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                  {socio.logo_url ? (
                    <img
                      src={socio.logo_url}
                      alt={socio.nombre_local}
                      className="w-full h-full object-cover"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-500">
                        {socio.nombre_local.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Nombre del socio */}
                <h3 className="font-bold text-center text-gray-800 mb-2 text-lg">
                  {socio.nombre_local}
                </h3>

                {/* Link opcional */}
                {socio.link && (
                  <a
                    href={socio.link.startsWith('http') ? socio.link : `https://${socio.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-primary hover:text-primary-dark transition-colors"
                  >
                    <ExternalLink size={16} className="mr-1" />
                    <span className="text-sm font-medium">Visitar sitio</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default PartnerCarousel;
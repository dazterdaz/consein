import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, DollarSign, BadgePercent, TrendingUp, Clock, Shield, Award } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PartnerCarousel from '../../components/ui/PartnerCarousel';
import { getConfig } from '../../lib/database';

const LandingPage: React.FC = () => {
  const [porcentajeComision, setPorcentajeComision] = useState<number>(10);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await getConfig();
      if (config && config.porcentaje_comision) {
        setPorcentajeComision(config.porcentaje_comision);
      }
    };
    loadConfig();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section - Mejorado */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 md:py-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
              backgroundSize: '100px 100px'
            }}></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-primary/20 border border-primary/30 rounded-full mb-6 animate-pulse">
                <Award className="mr-2" size={18} />
                <span className="text-sm font-semibold">Programa de Socios Exclusivo</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Genera <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Ingresos Extra</span> con tu Negocio
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                Únete a nuestra red de socios comerciales y gana comisiones por cada cliente que refieras. Sin inversión inicial, sin complicaciones.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <Link
                  to="/registro-socio"
                  className="btn bg-primary hover:bg-primary-dark text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  Únete Ahora
                </Link>
                <Link
                  to="/portal-socio"
                  className="btn bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200"
                >
                  Portal de Socios
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8 border-t border-white/10">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{porcentajeComision}%</div>
                  <div className="text-sm text-gray-400">Comisión por Referido</div>
                </div>
                <div className="text-center border-l border-r border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">$0</div>
                  <div className="text-sm text-gray-400">Inversión Inicial</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-sm text-gray-400">Portal Disponible</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ¿Cómo funciona? - Mejorado */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">¿Cómo Funciona?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Empieza a generar ingresos en 3 simples pasos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Paso 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    1
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Users className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">Regístrate Gratis</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Completa el formulario con los datos de tu negocio. Recibirás tu código único y QR personalizado al instante.
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    2
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BadgePercent className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">Comparte tu Código</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Muestra el código QR en tu local o compártelo por redes sociales. Tus clientes obtienen descuentos exclusivos.
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    3
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <DollarSign className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">Recibe Comisiones</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Por cada cliente referido que complete un tatuaje, recibes tu comisión. Simple, rápido y transparente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios - Mejorado */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Beneficios Exclusivos</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Diseñado para maximizar tus ganancias sin complicaciones
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                {
                  icon: <DollarSign size={28} />,
                  title: "Sin Inversión",
                  desc: "Cero costos iniciales. Empieza a ganar desde el primer día sin riesgo."
                },
                {
                  icon: <TrendingUp size={28} />,
                  title: "Comisiones Altas",
                  desc: `Gana hasta ${porcentajeComision}% por cada referido que se convierta en cliente.`
                },
                {
                  icon: <Clock size={28} />,
                  title: "Portal 24/7",
                  desc: "Accede a estadísticas y ganancias en tiempo real desde cualquier lugar."
                },
                {
                  icon: <Shield size={28} />,
                  title: "Pagos Seguros",
                  desc: "Transferencias directas a tu cuenta bancaria de forma segura."
                },
                {
                  icon: <Users size={28} />,
                  title: "Red de Socios",
                  desc: "Únete a una comunidad de negocios exitosos que confían en nosotros."
                },
                {
                  icon: <BadgePercent size={28} />,
                  title: "Descuentos para Clientes",
                  desc: "Tus clientes obtienen beneficios exclusivos al usar tu código."
                },
                {
                  icon: <Award size={28} />,
                  title: "Visibilidad",
                  desc: "Tu negocio aparece en nuestra web aumentando tu exposición."
                },
                {
                  icon: <CheckCircle size={28} />,
                  title: "Fácil de Usar",
                  desc: "Sistema intuitivo. No necesitas conocimientos técnicos."
                }
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-primary mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Socios Comerciales */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Nuestros Socios Comerciales</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Negocios que confían en nosotros y generan ingresos extra
              </p>
            </div>
            <PartnerCarousel />
          </div>
        </section>

        {/* CTA Final - Mejorado */}
        <section className="relative py-24 bg-gradient-to-r from-primary via-primary-dark to-secondary text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20px 20px, white 1%, transparent 0%), radial-gradient(circle at 60px 60px, white 1%, transparent 0%)',
              backgroundSize: '80px 80px'
            }}></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para Empezar a Ganar?</h2>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 text-white/90">
              Únete hoy mismo y comienza a generar ingresos extra para tu negocio sin ninguna inversión.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/registro-socio"
                className="btn bg-white text-primary hover:bg-gray-100 px-10 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Registrarme Gratis Ahora
              </Link>
              <Link
                to="/portal-socio"
                className="btn bg-transparent border-2 border-white hover:bg-white/10 text-white px-10 py-4 text-lg font-semibold rounded-xl transition-all duration-200"
              >
                Acceso para Socios
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Users, CreditCard, CheckSquare, Scissors, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSocios: 0,
    totalCupones: 0,
    totalArtistas: 0,
    gananciasGeneradas: 0
  });
  
  const [topSocios, setTopSocios] = useState<any[]>([]);
  const [topArtistas, setTopArtistas] = useState<any[]>([]);
  const [estadosCupones, setEstadosCupones] = useState({
    descargados: 0,
    agendados: 0,
    cobrados: 0
  });
  
  const [datosGraficoMensual, setDatosGraficoMensual] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener cantidad de socios activos
      const { count: sociosCount } = await supabase
        .from('socios')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
        .eq('aprobado', true);
      
      // Obtener cantidad de cupones
      const { count: cuponesCount } = await supabase
        .from('cupones')
        .select('*', { count: 'exact', head: true });
      
      // Obtener cantidad de artistas
      const { count: artistasCount } = await supabase
        .from('artistas')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);
      
      // Obtener estados de cupones
      const { data: cuponesData } = await supabase
        .from('cupones')
        .select('estado');
      
      const descargados = cuponesData?.filter(c => c.estado === 'descargado').length || 0;
      const agendados = cuponesData?.filter(c => c.estado === 'agendado').length || 0;
      const cobrados = cuponesData?.filter(c => c.estado === 'cobrado').length || 0;
      
      setEstadosCupones({
        descargados,
        agendados,
        cobrados
      });
      
      // Obtener cupones cobrados para calcular ganancias
      const { data: cuponesCobrados } = await supabase
        .from('cupones')
        .select('valor_tatuaje')
        .eq('estado', 'cobrado');
      
      const gananciasGeneradas = cuponesCobrados?.reduce((total, cupon) => 
        total + (cupon.valor_tatuaje || 0), 0) || 0;
      
      // Obtener top socios con más cupones cobrados
      const { data: sociosData } = await supabase
        .from('cupones')
        .select(`
          socio_id,
          socios!inner(nombre_local)
        `)
        .eq('estado', 'cobrado');
      
      const sociosCounts: Record<string, { id: string; nombre: string; count: number }> = {};
      
      sociosData?.forEach(cupon => {
        const socioId = cupon.socio_id;
        const socioNombre = cupon.socios.nombre_local;
        
        if (!sociosCounts[socioId]) {
          sociosCounts[socioId] = { id: socioId, nombre: socioNombre, count: 0 };
        }
        
        sociosCounts[socioId].count += 1;
      });
      
      const topSociosArray = Object.values(sociosCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Obtener top artistas con más cupones cobrados
      const { data: artistasData } = await supabase
        .from('cupones')
        .select(`
          artista_id,
          artistas!inner(nombre)
        `)
        .eq('estado', 'cobrado')
        .not('artista_id', 'is', null);
      
      const artistasCounts: Record<string, { id: string; nombre: string; count: number }> = {};
      
      artistasData?.forEach(cupon => {
        const artistaId = cupon.artista_id!;
        const artistaNombre = cupon.artistas.nombre;
        
        if (!artistasCounts[artistaId]) {
          artistasCounts[artistaId] = { id: artistaId, nombre: artistaNombre, count: 0 };
        }
        
        artistasCounts[artistaId].count += 1;
      });
      
      const topArtistasArray = Object.values(artistasCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Preparar datos para el gráfico mensual
      const ultimosMeses = getUltimosMeses(6);
      const datosPorMes: Record<string, { descargas: number; cobrados: number }> = {};
      
      ultimosMeses.forEach(mes => {
        datosPorMes[mes] = { descargas: 0, cobrados: 0 };
      });
      
      // Obtener datos de descargas por mes
      const { data: descargasPorMes } = await supabase
        .from('cupones')
        .select('fecha_descarga');
      
      descargasPorMes?.forEach(cupon => {
        const fecha = new Date(cupon.fecha_descarga);
        const mes = fecha.toLocaleString('es-ES', { month: 'short', year: '2-digit' });
        
        if (datosPorMes[mes]) {
          datosPorMes[mes].descargas += 1;
        }
      });
      
      // Obtener datos de cobrados por mes
      const { data: cobradosPorMes } = await supabase
        .from('cupones')
        .select('fecha_cobrado')
        .eq('estado', 'cobrado');
      
      cobradosPorMes?.forEach(cupon => {
        if (cupon.fecha_cobrado) {
          const fecha = new Date(cupon.fecha_cobrado);
          const mes = fecha.toLocaleString('es-ES', { month: 'short', year: '2-digit' });
          
          if (datosPorMes[mes]) {
            datosPorMes[mes].cobrados += 1;
          }
        }
      });
      
      const graficoMensual = {
        labels: Object.keys(datosPorMes),
        datasets: [
          {
            label: 'Cupones Descargados',
            data: Object.values(datosPorMes).map(d => d.descargas),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Cupones Cobrados',
            data: Object.values(datosPorMes).map(d => d.cobrados),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      };
      
      setDatosGraficoMensual(graficoMensual);
      setTopSocios(topSociosArray);
      setTopArtistas(topArtistasArray);
      setStats({
        totalSocios: sociosCount || 0,
        totalCupones: cuponesCount || 0,
        totalArtistas: artistasCount || 0,
        gananciasGeneradas
      });
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener los últimos N meses en formato "mes año"
  const getUltimosMeses = (n: number) => {
    const meses = [];
    const fechaActual = new Date();
    
    for (let i = 0; i < n; i++) {
      const fecha = new Date();
      fecha.setMonth(fechaActual.getMonth() - i);
      meses.unshift(fecha.toLocaleString('es-ES', { month: 'short', year: '2-digit' }));
    }
    
    return meses;
  };

  // Configuración para el gráfico de pie
  const datosEstadosCupones = {
    labels: ['Descargados', 'Agendados', 'Cobrados'],
    datasets: [
      {
        data: [estadosCupones.descargados, estadosCupones.agendados, estadosCupones.cobrados],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mr-4">
            <Users className="text-primary" size={24} />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Socios Activos</p>
            <p className="text-2xl font-bold">{stats.totalSocios}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-secondary-light flex items-center justify-center mr-4">
            <Scissors className="text-secondary" size={24} />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total Cupones</p>
            <p className="text-2xl font-bold">{stats.totalCupones}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center mr-4">
            <CheckSquare className="text-accent" size={24} />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Artistas Activos</p>
            <p className="text-2xl font-bold">{stats.totalArtistas}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
            <CreditCard className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Ingresos Generados</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.gananciasGeneradas)}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Tendencia Mensual */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2 text-secondary" />
            Tendencia Mensual
          </h2>
          {datosGraficoMensual && <Bar data={datosGraficoMensual} />}
        </div>
        
        {/* Gráfico de Estados de Cupones */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Scissors size={20} className="mr-2 text-primary" />
            Estados de Cupones
          </h2>
          <Pie data={datosEstadosCupones} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Socios */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Top Socios Comerciales</h2>
          
          {topSocios.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay datos suficientes</p>
          ) : (
            <div className="space-y-4">
              {topSocios.map((socio, index) => (
                <div key={socio.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary font-medium">{index + 1}</span>
                    </div>
                    <span className="font-medium">{socio.nombre}</span>
                  </div>
                  <div className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm font-medium">
                    {socio.count} cupones
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Top Artistas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Top Artistas</h2>
          
          {topArtistas.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay datos suficientes</p>
          ) : (
            <div className="space-y-4">
              {topArtistas.map((artista, index) => (
                <div key={artista.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-secondary-light rounded-full flex items-center justify-center mr-3">
                      <span className="text-secondary font-medium">{index + 1}</span>
                    </div>
                    <span className="font-medium">{artista.nombre}</span>
                  </div>
                  <div className="bg-secondary-light text-secondary-dark px-3 py-1 rounded-full text-sm font-medium">
                    {artista.count} tatuajes
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MicroRegionData, FilterOptions, EIXOS_NAMES } from '@/types/dashboard';
import { NavigationMenu } from '@/components/dashboard/NavigationMenu';
import { Filters } from '@/components/dashboard/Filters';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { DashboardRadarChart } from '@/components/dashboard/RadarChart';
import { BarChartComponent } from '@/components/dashboard/BarChartComponent';
import { PopulationChartComponent } from '@/components/dashboard/PopulationChartComponent';
import { EixosTable } from '@/components/dashboard/EixosTable';
import { RecommendationsPanel } from '@/components/dashboard/RecommendationsPanel';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { AdvancedAnalysis } from '@/components/dashboard/AdvancedAnalysis';
import { HelpButton } from '@/components/ui/help-button';
import { calculateMedians } from '@/data/mockData';
import { toast } from 'sonner';
import { useExcelData } from '@/hooks/useExcelData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { HelpCircle, X, Home, ArrowUp, Download, Settings, Target } from 'lucide-react';
import { useEffect } from 'react';

const GUIDE_STORAGE_KEY = 'mrh-guide-dismissed';

function UserGuideModal({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-blue-200 bg-white shadow-lg shadow-blue-100">
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 p-2 sm:p-3 relative">
          <div className="flex items-center justify-center gap-1 mb-1">
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
            <span className="text-base sm:text-lg font-bold text-blue-900 drop-shadow-sm flex items-center gap-1">
              Radar do Núcleo de Saúde Digital-MG
              <img src="/logo_sus_digital-removebg-preview.png" alt="Logo Micro-Region Insights Hub" className="inline-block w-6 h-6 sm:w-7 sm:h-7 align-middle" />
            </span>
          </div>
          <button onClick={() => setOpen(false)} className="fixed sm:absolute top-2 right-2 sm:top-3 sm:right-3 z-50 bg-white/80 rounded-full p-1 shadow hover:bg-blue-100 text-blue-900 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"><X size={18} /></button>
          <div className="text-blue-900 text-[13px] sm:text-xs mb-2 text-center">
            <span className="font-semibold">Transforme dados em ação!</span> Descubra o potencial digital das microrregiões com insights práticos, comparativos e recomendações personalizadas. Aqui você vai além do básico: mergulhe nos dados, encontre oportunidades e lidere a transformação digital da sua região.
          </div>
          <ol className="space-y-1 text-blue-900 text-[13px] sm:text-xs">
            <li className="flex items-start gap-1"><span className="text-blue-600 text-base">🔎</span> <span><b>Filtre e compare:</b> Selecione rapidamente a <b>macrorregião</b> e <b>microrregião</b> de interesse. Veja como sua região se posiciona frente às demais.</span></li>
            <li className="flex items-start gap-1"><span className="text-green-600 text-base">📊</span> <span><b>Explore indicadores-chave:</b> Analise população, maturidade digital e classificação em cards dinâmicos. Passe o mouse para detalhes extras.</span></li>
            <li className="flex items-start gap-1"><span className="text-yellow-500 text-base">📈</span> <span><b>Visualize tendências:</b> Use gráficos interativos para identificar forças, fraquezas e oportunidades. O radar revela padrões, o ranking mostra quem lidera e a tabela detalha cada eixo.</span></li>
            <li className="flex items-start gap-1"><span className="text-pink-500 text-base">💡</span> <span><b>Aja com recomendações:</b> Receba sugestões automáticas e práticas para acelerar a transformação digital da sua microrregião.</span></li>
            <li className="flex items-start gap-1"><span className="text-indigo-500 text-base">📄</span> <span><b>Compartilhe resultados:</b> Exporte relatórios em PDF e leve os insights para reuniões, planejamentos e decisões estratégicas.</span></li>
          </ol>
          <button className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold py-1.5 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition-all text-xs sm:text-sm" onClick={() => setOpen(false)}>
            🚀 Explorar Dashboard
          </button>
          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-blue-100 rounded-lg border border-blue-200 text-blue-800 text-[11px] sm:text-xs">
            <b>Dicas rápidas:</b>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Passe o mouse nos gráficos para ver explicações e insights extras.</li>
              <li>Clique em uma microrregião no ranking para mergulhar nos detalhes.</li>
              <li>Reabra este guia a qualquer momento pelo botão <HelpCircle className="inline h-4 w-4" /> no topo.</li>
            </ul>
          </div>
          <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-blue-700 text-center">
            Dúvidas? Fale com o suporte ou consulte o manual completo.<br/>
            <a href="mailto:suporte@microregionhub.com" className="underline text-blue-900">suporte@microregionhub.com</a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Index = () => {
  const { data, loading, error, dataSource, refreshData } = useExcelData();
  const [selectedMicroregiao, setSelectedMicroregiao] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [activeSection, setActiveSection] = useState('overview');
  const [guideOpen, setGuideOpen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calcular medianas dos eixos
  const medians = useMemo(() => calculateMedians(data), [data]);

  // Encontrar dados da microrregião selecionada
  const selectedData = useMemo(() => {
    return data.find(item => item.microrregiao === selectedMicroregiao);
  }, [selectedMicroregiao, data]);

  // Filtrar dados baseado nos filtros ativos
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return (!filters.macrorregiao || item.macrorregiao === filters.macrorregiao) &&
             (!filters.classificacao_inmsd || item.classificacao_inmsd === filters.classificacao_inmsd);
    });
  }, [data, filters]);

  const handleMicroregiaoChange = (microrregiao: string) => {
    setSelectedMicroregiao(microrregiao);
    if (microrregiao) {
      toast.success(`Microrregião selecionada: ${microrregiao}`);
    }
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    // Limpar microrregião selecionada se não estiver nos dados filtrados
    if (selectedMicroregiao && !filteredData.find(item => item.microrregiao === selectedMicroregiao)) {
      setSelectedMicroregiao('');
    }
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    // Scroll suave para a seção
    const element = document.querySelector(`[data-section="${section}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigateToRecommendations = (eixoIndex: number) => {
    setActiveSection('recomendacoes');
    setTimeout(() => {
      const element = document.querySelector(`#eixo-${eixoIndex + 1}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-blue-900 mb-2">Carregando Dashboard</h2>
          <p className="text-blue-700">Preparando sua análise de maturidade digital...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-red-900 mb-2">Erro ao Carregar Dados</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={refreshData} className="bg-red-600 hover:bg-red-700">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Menu de Navegação Superior */}
      <NavigationMenu activeSection={activeSection} onNavigate={handleNavigate} />



      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Filters
          data={data}
          selectedMicroregiao={selectedMicroregiao}
          filters={filters}
          onMicroregiaoChange={handleMicroregiaoChange}
          onFiltersChange={handleFiltersChange}
          selectedData={selectedData}
        />

        {/* Seções do Dashboard */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <StatsOverview data={data} selectedData={selectedData} macroFiltro={filters.macrorregiao} />
            {selectedData ? (
              <>
                <DashboardRadarChart
                  data={selectedData}
                  medians={medians}
                  onNavigateToRecommendations={handleNavigateToRecommendations}
                />
                <BarChartComponent
                  data={filteredData}
                  selectedMicroregiao={selectedMicroregiao}
                  macroFiltro={filters.macrorregiao}
                />
                <PopulationChartComponent
                  data={filteredData}
                  selectedMicroregiao={selectedMicroregiao}
                />
                <EixosTable data={selectedData} medians={medians} />
                <RecommendationsPanel data={selectedData} />
                <ExecutiveDashboard
                  data={data}
                  selectedMicroregiao={selectedMicroregiao}
                  medians={medians}
                />
                <AdvancedAnalysis
                  data={data}
                  selectedMicroregiao={selectedMicroregiao}
                  medians={medians}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                  <div className="text-blue-600 text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">
                    Selecione uma Microrregião
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Use os filtros acima para escolher uma microrregião e visualizar todos os dados do dashboard.
                  </p>
                  <div className="text-sm text-blue-600">
                    💡 <strong>Dica:</strong> Você pode filtrar por macrorregião ou classificação para encontrar a região desejada.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'radar' && (
          selectedData ? (
            <DashboardRadarChart
              data={selectedData}
              medians={medians}
              onNavigateToRecommendations={handleNavigateToRecommendations}
            />
          ) : (
            <div className="text-center py-12">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-blue-600 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Selecione uma Microrregião</h3>
                <p className="text-blue-700">Para visualizar o gráfico radar, selecione uma microrregião nos filtros.</p>
              </div>
            </div>
          )
        )}

        {activeSection === 'barras' && (
          <BarChartComponent
            data={filteredData}
            selectedMicroregiao={selectedMicroregiao}
            macroFiltro={filters.macrorregiao}
          />
        )}

        {activeSection === 'populacao' && (
          <PopulationChartComponent
            data={filteredData}
            selectedMicroregiao={selectedMicroregiao}
          />
        )}

        {activeSection === 'tabela' && (
          selectedData ? (
            <EixosTable data={selectedData} medians={medians} />
          ) : (
            <div className="text-center py-12">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-blue-600 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Selecione uma Microrregião</h3>
                <p className="text-blue-700">Para visualizar a tabela de eixos, selecione uma microrregião nos filtros.</p>
              </div>
            </div>
          )
        )}

        {activeSection === 'recomendacoes' && (
          selectedData ? (
            <RecommendationsPanel data={selectedData} />
          ) : (
            <div className="text-center py-12">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-blue-600 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Selecione uma Microrregião</h3>
                <p className="text-blue-700">Para visualizar as recomendações, selecione uma microrregião nos filtros.</p>
              </div>
            </div>
          )
        )}

        {activeSection === 'executivo' && (
          selectedData ? (
            <ExecutiveDashboard
              data={data}
              selectedMicroregiao={selectedMicroregiao}
              medians={medians}
            />
          ) : (
            <div className="text-center py-12">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-blue-600 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Selecione uma Microrregião</h3>
                <p className="text-blue-700">Para visualizar o dashboard executivo, selecione uma microrregião nos filtros.</p>
              </div>
            </div>
          )
        )}

        {activeSection === 'analise-avancada' && (
          selectedData ? (
            <AdvancedAnalysis
              data={data}
              selectedMicroregiao={selectedMicroregiao}
              medians={medians}
            />
          ) : (
            <div className="text-center py-12">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-blue-600 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Selecione uma Microrregião</h3>
                <p className="text-blue-700">Para visualizar a análise avançada, selecione uma microrregião nos filtros.</p>
              </div>
            </div>
          )
        )}
      </main>

      {/* Botão de Configurações */}
      <Button
        size="icon"
        className="fixed bottom-6 left-6 w-14 h-14 rounded-full shadow-lg bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-200 transition-all duration-300 hover:scale-110 z-50"
        onClick={() => setGuideOpen(true)}
      >
        <Settings className="w-6 h-6" />
      </Button>

      {/* Botão de Ajuda */}
      <HelpButton />

      {/* Botão Voltar ao Topo */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-20 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-40 transition-all duration-300 hover:scale-110"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}

      {/* Modal de Boas-vindas */}
      <UserGuideModal open={guideOpen} setOpen={setGuideOpen} />
    </div>
  );
};

export default Index;

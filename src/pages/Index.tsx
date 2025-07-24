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
import { HelpCircle, X, ChevronRight, Home, ArrowUp, Download, Settings, Target } from 'lucide-react';
import { useEffect } from 'react';

const GUIDE_STORAGE_KEY = 'mrh-guide-dismissed';

function UserGuideModal({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-blue-200 bg-white shadow-lg shadow-blue-100">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 relative">
          <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-blue-900 hover:text-blue-600"><X size={22} /></button>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-blue-900 mb-2">
              <HelpCircle className="h-7 w-7 text-blue-700" />
              Bem-vindo ao Micro-Region Insights Hub!
            </DialogTitle>
            <DialogDescription className="text-blue-900 text-lg mb-4">
              Seu painel de inteligência para maturidade digital das microrregiões.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-4 text-blue-900 text-base">
            <li>
              <b>1. Selecione a Região:</b> Use os filtros no topo para escolher a <b>Macrorregião</b> e depois a <b>Microrregião</b> que deseja analisar.
            </li>
            <li>
              <b>2. Explore os Indicadores:</b> Veja cards com <b>população</b>, <b>índice de maturidade</b> e <b>classificação</b>. Passe o mouse para mais detalhes.
            </li>
            <li>
              <b>3. Analise os Gráficos:</b> O <b>Radar</b> mostra forças e fraquezas por eixo. O <b>Ranking</b> compara todas as microrregiões. A <b>Tabela</b> detalha cada eixo.
            </li>
            <li>
              <b>4. Veja Recomendações:</b> Receba dicas automáticas para evoluir em cada eixo de maturidade digital.
            </li>
            <li>
              <b>5. Exporte Relatórios:</b> Gere um PDF completo do dashboard para compartilhar ou arquivar.
            </li>
          </ol>
          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200 text-blue-800 text-sm">
            <b>Dicas rápidas:</b>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Passe o mouse nos gráficos para ver explicações.</li>
              <li>Clique em uma microrregião no ranking para analisá-la.</li>
              <li>Use o botão <HelpCircle className="inline h-4 w-4" /> no topo para reabrir este guia a qualquer momento.</li>
            </ul>
          </div>
          <div className="mt-4 text-xs text-blue-700 text-center">
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

  // Breadcrumbs dinâmicos
  const getBreadcrumbs = () => {
    const sections = [
      { id: 'overview', label: 'Visão Geral', icon: Home },
      { id: 'radar', label: 'Gráfico Radar', icon: Target },
      { id: 'barras', label: 'Gráfico Barras', icon: Target },
      { id: 'populacao', label: 'População', icon: Target },
      { id: 'tabela', label: 'Tabela Eixos', icon: Target },
      { id: 'recomendacoes', label: 'Recomendações', icon: Target },
      { id: 'executivo', label: 'Dashboard Executivo', icon: Target },
      { id: 'analise-avancada', label: 'Análise Avançada', icon: Target },
    ];
    
    const currentSection = sections.find(s => s.id === activeSection);
    
    // Se estamos na seção overview, mostrar apenas "Dashboard"
    if (activeSection === 'overview') {
      return [{ label: 'Dashboard', icon: Home, id: 'dashboard-home' }];
    }
    
    // Para outras seções, mostrar "Dashboard > Seção Atual"
    return [
      { label: 'Dashboard', icon: Home, id: 'dashboard-home' },
      ...(currentSection ? [{ label: currentSection.label, icon: currentSection.icon, id: currentSection.id }] : [])
    ];
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

      {/* Breadcrumbs Modernos */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-24 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm">
            {getBreadcrumbs().map((item, index) => (
              <div key={item.id} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 text-blue-400 mx-2" />}
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200 ${
                    index === getBreadcrumbs().length - 1
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

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

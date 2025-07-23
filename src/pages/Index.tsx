import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Filters } from '@/components/dashboard/Filters';
import { DashboardRadarChart } from '@/components/dashboard/RadarChart';
import { DashboardBarChart } from '@/components/dashboard/BarChart';
import { EixosTable } from '@/components/dashboard/EixosTable';
import { PopulationChart } from '@/components/dashboard/PopulationChart';
import { RecommendationsPanel } from '@/components/dashboard/RecommendationsPanel';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { AdvancedAnalysis } from '@/components/dashboard/AdvancedAnalysis';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { DataUpload } from '@/components/dashboard/DataUpload';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { NavigationMenu } from '@/components/dashboard/NavigationMenu';
import { HelpButton } from '@/components/ui/help-button';
import { Button } from '@/components/ui/button';
import { Menu, Moon, Sun, RefreshCw } from 'lucide-react';
import { calculateMedians } from '@/data/mockData';
import { FilterOptions } from '@/types/dashboard';
import { toast } from 'sonner';
import { useExcelData } from '@/hooks/useExcelData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle, X } from 'lucide-react';
import { useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const GUIDE_STORAGE_KEY = 'mrh-guide-dismissed';
const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="filtros"]',
    content: 'Use os filtros para selecionar macrorregião, microrregião e classificação.',
    title: 'Filtros de Seleção',
    disableBeacon: true,
  },
  {
    target: '[data-tour="menu"]',
    content: 'Navegue entre as principais áreas do dashboard por aqui.',
    title: 'Menu de Navegação',
  },
  {
    target: '[data-tour="estatisticas"]',
    content: 'Veja um resumo geral das microrregiões analisadas.',
    title: 'Estatísticas Gerais',
  },
  {
    target: '[data-tour="radar"]',
    content: 'Visualize a maturidade por eixo no gráfico radar.',
    title: 'Gráfico Radar',
  },
  {
    target: '[data-tour="barras"]',
    content: 'Compare o índice geral de maturidade entre microrregiões.',
    title: 'Gráfico de Barras',
  },
  {
    target: '[data-tour="eixos"]',
    content: 'Veja o detalhamento por eixo de maturidade.',
    title: 'Tabela de Eixos',
  },
  {
    target: '[data-tour="populacao"]',
    content: 'Veja a distribuição populacional das microrregiões.',
    title: 'Gráfico de População',
  },
  {
    target: '[data-tour="recomendacoes"]',
    content: 'Confira recomendações específicas para cada eixo.',
    title: 'Recomendações',
  },
  {
    target: '[data-tour="olho"]',
    content: 'Use este botão para minimizar ou expandir qualquer bloco do dashboard.',
    title: 'Botão de Olho',
  },
];

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
          </DialogHeader>
          <p className="text-blue-900 text-lg mb-4">Seu painel de inteligência para maturidade digital das microrregiões.</p>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(true);
  // Adicionar hooks de tour aqui
  const [runTour, setRunTour] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem(GUIDE_STORAGE_KEY)) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      localStorage.setItem(GUIDE_STORAGE_KEY, '1');
    }
  };

  // Atualizar microrregião selecionada quando os dados carregarem
  useMemo(() => {
    if (data.length > 0 && !selectedMicroregiao) {
      setSelectedMicroregiao(data[0].microrregiao);
    }
  }, [data, selectedMicroregiao]);

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
  }, [filters, data]);

  const handleMicroregiaoChange = (microrregiao: string) => {
    setSelectedMicroregiao(microrregiao);
    toast.success(`Microrregião selecionada: ${microrregiao}`, {
      className: 'bg-blue-600 text-white'
    });
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Se a microrregião selecionada não estiver mais nos dados filtrados, selecionar a primeira disponível
    const filtered = data.filter(item => {
      return (!newFilters.macrorregiao || item.macrorregiao === newFilters.macrorregiao) &&
             (!newFilters.classificacao_inmsd || item.classificacao_inmsd === newFilters.classificacao_inmsd);
    });
    
    if (filtered.length > 0 && !filtered.find(item => item.microrregiao === selectedMicroregiao)) {
      setSelectedMicroregiao(filtered[0].microrregiao);
    }
  };

  const handleNavigate = (section: string) => {
    console.log('Navegando para seção:', section);
    setActiveSection(section);
    
    // Scroll suave para a seção
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        console.log('Elemento encontrado, fazendo scroll para:', section);
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.log('Elemento não encontrado para seção:', section);
      }
    }, 100);
  };

  // Função para navegar para recomendações específicas de eixos
  const handleNavigateToRecommendations = (eixoIndex: number) => {
    console.log('Navegando para recomendações do eixo:', eixoIndex + 1);
    setActiveSection('recomendacoes');
    // Scroll para a seção de recomendações
    setTimeout(() => {
      const element = document.getElementById('recomendacoes');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        
        // Após um pequeno delay, destacar o eixo específico
        setTimeout(() => {
          const eixoElement = document.getElementById(`eixo-${eixoIndex + 1}`);
          console.log('Procurando elemento com ID:', `eixo-${eixoIndex + 1}`, 'Encontrado:', !!eixoElement);
          if (eixoElement) {
            eixoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Adicionar destaque visual temporário
            eixoElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
            setTimeout(() => {
              eixoElement.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
            }, 3000);
          }
        }, 500);
      }
    }, 100);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Detectar seção ativa baseada no scroll
  const handleScroll = () => {
    const sections = ['filtros', 'overview', 'radar', 'barras', 'populacao', 'tabela', 'recomendacoes', 'executivo', 'analise-avancada'];
    const scrollPosition = window.scrollY + 100;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;
        
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    }
  };

  // Adicionar listener de scroll
  useMemo(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calcular margem dinâmica baseada no estado do sidebar
  const getSidebarMargin = () => {
    if (showSidebar) return 'ml-72'; // Mobile com sidebar aberto
    if (sidebarCollapsed) return 'sm:ml-14'; // Desktop com sidebar colapsado
    return 'sm:ml-14 lg:ml-72'; // Desktop com sidebar expandido
  };

  if (!selectedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Carregando dados...</h1>
          <p className="text-muted-foreground">Por favor, aguarde enquanto carregamos as informações.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserGuideModal open={guideOpen} setOpen={setGuideOpen} />
      <div className="fixed top-4 right-4 z-50">
        <button onClick={() => setGuideOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Ajuda</span>
        </button>
      </div>
      <Joyride
        steps={TOUR_STEPS}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        locale={{ last: 'Finalizar', skip: 'Pular', next: 'Próximo', back: 'Voltar' }}
        callback={handleJoyrideCallback}
        styles={{ options: { zIndex: 9999 } }}
      />
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setRunTour(true)}
        aria-label="Ajuda"
        data-tour="ajuda"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
      <div className="min-h-screen bg-dashboard-bg">
      {/* Navigation Menu Fixo */}
      <NavigationMenu
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Sidebar */}
      <Sidebar 
        onNavigate={handleNavigate} 
        activeSection={activeSection}
        showMobile={showSidebar}
        onCloseMobile={() => setShowSidebar(false)}
        onCollapseChange={setSidebarCollapsed}
      />
      
      {/* Botões de controle móvel */}
      <div className="fixed top-20 left-4 z-50 lg:hidden flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white shadow-md border"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="bg-white shadow-md border"
          title={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Header Simplificado */}
      <header className={`bg-dashboard-header shadow-sm border-b border-border transition-all duration-300 ${getSidebarMargin()}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {loading ? 'Carregando...' : `${data.length} microrregiões • ${filteredData.length} exibidas`}
                </div>
                {dataSource === 'excel' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Dados do Excel</span>
                  </div>
                )}
                {dataSource === 'mock' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-600 font-medium">Dados de Exemplo</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshData}
                  disabled={loading}
                  className="text-xs"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${getSidebarMargin()}`}>
        <div id="dashboard-content" className="max-w-6xl mx-auto">
        {/* Filtros */}
        <div id="filtros" className="mb-16" data-tour="filtros">
          <Filters
            data={filteredData}
            selectedMicroregiao={selectedMicroregiao}
            filters={filters}
            onMicroregiaoChange={handleMicroregiaoChange}
            onFiltersChange={handleFiltersChange}
            selectedData={selectedData}
          />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Cabeçalho da Microrregião */}
        <div className="mb-16">
          <DashboardHeader 
            data={selectedData} 
            allData={data} 
            onMicroregiaoChange={handleMicroregiaoChange}
          />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Estatísticas Gerais */}
        <div id="overview" className="mb-16" data-tour="estatisticas">
          <StatsOverview data={filteredData} selectedData={selectedData} macroFiltro={filters.macrorregiao} />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Gráfico Radar */}
        <div id="radar" className="bg-card rounded-lg border border-border p-6 mb-16" data-tour="radar">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Gráfico de Radar</h2>
            <p className="text-sm text-muted-foreground">Comparação por Eixos de Maturidade</p>
          </div>
          <DashboardRadarChart 
            data={selectedData} 
            medians={medians}
            onNavigateToRecommendations={handleNavigateToRecommendations}
          />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Gráfico de Barras */}
        <div id="barras" className="bg-card rounded-lg border border-border p-6 mb-16" data-tour="barras">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Gráfico de Barras</h2>
            <p className="text-sm text-muted-foreground">Comparação entre Microrregiões</p>
          </div>
          <DashboardBarChart data={filteredData} selectedMicroregiao={selectedMicroregiao} macroFiltro={filters.macrorregiao} />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Tabela de Eixos */}
        <div id="tabela" className="mb-16" data-tour="eixos">
          <EixosTable data={selectedData} medians={medians} />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Gráfico de População */}
        <div id="populacao" className="bg-card rounded-lg border border-border p-6 mb-16" data-tour="populacao">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Gráfico de População</h2>
            <p className="text-sm text-muted-foreground">Distribuição Populacional</p>
          </div>
          <PopulationChart data={filteredData} selectedMicroregiao={selectedMicroregiao} />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Recomendações por Eixo */}
        <div id="recomendacoes" className="mb-16" data-tour="recomendacoes">
          <RecommendationsPanel data={selectedData} />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Dashboard Executivo Resumido */}
        <div id="executivo" className="mb-16">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Dashboard Executivo</h2>
            <p className="text-sm text-muted-foreground">Visão estratégica e resumida da maturidade digital</p>
          </div>
          <ExecutiveDashboard 
            data={filteredData} 
            selectedMicroregiao={selectedMicroregiao}
            medians={medians}
          />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Análise Avançada */}
        <div id="analise-avancada" className="mb-16">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Análise Avançada</h2>
            <button
              className="ml-2 p-1 rounded hover:bg-muted transition-colors"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-label={showAdvanced ? 'Minimizar bloco' : 'Expandir bloco'}
              type="button"
            >
              {showAdvanced ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-primary" />}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">Comparação detalhada entre microrregiões</p>
          <div className={showAdvanced ? '' : 'hidden'}>
            <AdvancedAnalysis 
              data={filteredData} 
              selectedMicroregiao={selectedMicroregiao}
              medians={medians}
            />
          </div>
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Upload de Dados */}
        <div>
          <DataUpload onDataUpdate={(newData) => {
            // Resetar para a primeira microrregião dos novos dados
            if (newData.length > 0) {
              setSelectedMicroregiao(newData[0].microrregiao);
            }
            setFilters({});
          }} />
        </div>
        </div>
      </main>

      {/* Botão de Ajuda Flutuante */}
      <HelpButton />

      {/* Footer */}
      <footer className={`bg-dashboard-header border-t border-border mt-12 transition-all duration-300 ${getSidebarMargin()}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-sm text-muted-foreground">
              <p>Painel de Maturidade Digital • Sistema desenvolvido para análise regional</p>
              <p className="mt-1">Para atualizar os dados, substitua o arquivo Excel mantendo a estrutura das colunas</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;

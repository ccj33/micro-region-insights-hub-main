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
import { Menu, Moon, Sun } from 'lucide-react';
import { mockData, calculateMedians } from '@/data/mockData';
import { FilterOptions } from '@/types/dashboard';
import { toast } from 'sonner';

const Index = () => {
  const [data, setData] = useState(mockData);
  const [selectedMicroregiao, setSelectedMicroregiao] = useState(data[0]?.microrregiao || '');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
             (!filters.regional_saude || item.regional_saude === filters.regional_saude) &&
             (!filters.classificacao_inmsd || item.classificacao_inmsd === filters.classificacao_inmsd);
    });
  }, [filters, data]);

  const handleMicroregiaoChange = (microrregiao: string) => {
    setSelectedMicroregiao(microrregiao);
    toast.success(`Microrregião selecionada: ${microrregiao}`);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Se a microrregião selecionada não estiver mais nos dados filtrados, selecionar a primeira disponível
    const filtered = data.filter(item => {
      return (!newFilters.macrorregiao || item.macrorregiao === newFilters.macrorregiao) &&
             (!newFilters.regional_saude || item.regional_saude === newFilters.regional_saude) &&
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
              <div className="text-sm text-muted-foreground">
                {data.length} microrregiões • {filteredData.length} exibidas
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${getSidebarMargin()}`}>
        <div className="max-w-6xl mx-auto">
        {/* Filtros */}
        <div id="filtros" className="mb-16">
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
        <div id="overview" className="mb-16">
          <StatsOverview data={filteredData} selectedData={selectedData} />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Gráfico Radar */}
        <div id="radar" className="bg-card rounded-lg border border-border p-6 mb-16">
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
        <div id="barras" className="bg-card rounded-lg border border-border p-6 mb-16">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Gráfico de Barras</h2>
            <p className="text-sm text-muted-foreground">Comparação entre Microrregiões</p>
          </div>
          <DashboardBarChart data={filteredData} selectedMicroregiao={selectedMicroregiao} />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Tabela de Eixos */}
        <div id="tabela" className="mb-16">
          <EixosTable data={selectedData} medians={medians} />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Gráfico de População */}
        <div id="populacao" className="bg-card rounded-lg border border-border p-6 mb-16">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Gráfico de População</h2>
            <p className="text-sm text-muted-foreground">Distribuição Populacional</p>
          </div>
          <PopulationChart data={filteredData} selectedMicroregiao={selectedMicroregiao} />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Recomendações por Eixo */}
        <div id="recomendacoes" className="mb-16">
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
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Análise Avançada</h2>
            <p className="text-sm text-muted-foreground">Comparação detalhada entre microrregiões</p>
          </div>
          <AdvancedAnalysis 
            data={filteredData} 
            selectedMicroregiao={selectedMicroregiao}
            medians={medians}
          />
        </div>

        {/* Separador Visual */}
        <div className="border-t border-border/50 my-16"></div>

        {/* Upload de Dados */}
        <div>
          <DataUpload onDataUpdate={(newData) => {
            setData(newData);
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
  );
};

export default Index;

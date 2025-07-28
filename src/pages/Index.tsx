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
import React from 'react'; // Added missing import for React
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DistribuicaoINMSD } from '@/components/dashboard/DistribuicaoINMSD';
import { Menu, Filter } from 'lucide-react'; // Importar ícones
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer'; // Importar Drawer com mais componentes

const GUIDE_STORAGE_KEY = 'mrh-guide-dismissed';

const joyrideSteps: Step[] = [
  {
    target: 'body',
    content: ( 
      <div className="text-center p-2">
        <img src="/logo_sus_digital-removebg-preview.png" alt="AlexSUS" className="w-16 h-16 mx-auto mb-2 rounded-full shadow-lg" />
        <h2 className="text-2xl font-extrabold text-blue-700 mb-1">Bem-vindo ao Radar NSD!</h2>
        <p className="text-base text-slate-800">Sou o AlexSUS, seu guia digital. Vou te mostrar como extrair o máximo de insights desta ferramenta. Vamos começar? 🚀</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="filtros"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">1. Comece pelos Filtros</h3>
        <p className="text-slate-800">Este é o seu ponto de partida. Use esses controles para selecionar a <strong>Macrorregião</strong> e depois a <strong>Microrregião</strong> que deseja analisar.</p>
        <p className="mt-2 text-sm text-blue-800 bg-blue-50 p-2 rounded-md"><strong>Dica:</strong> A análise começa de verdade após escolher uma microrregião!</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-overview"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">2. Navegue pelas Seções</h3>
        <p className="text-slate-800">Use este menu para explorar as diferentes áreas de análise. Você está na <strong>Visão Geral</strong>, o resumo inicial.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-populacao"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">População</h3>
        <p className="text-slate-800">Acesse dados demográficos e compare o tamanho das microrregiões para entender o impacto das ações.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-barras"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Ranking de Maturidade</h3>
        <p className="text-slate-800">Veja o ranking completo das microrregiões ordenadas pelo Índice Geral de Maturidade Digital.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-radar"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Análise por Eixos</h3>
        <p className="text-slate-800">Visualize forças e fraquezas em cada um dos 7 eixos de maturidade digital de forma gráfica.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-executivo"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Dashboard Executivo</h3>
        <p className="text-slate-800">Acesse KPIs, pontos fortes, oportunidades e recomendações estratégicas para tomada de decisão.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-tabela"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Detalhamento por Eixos</h3>
        <p className="text-slate-800">Veja o desempenho detalhado de cada um dos 7 eixos de maturidade digital em formato tabular.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-recomendacoes"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Recomendações</h3>
        <p className="text-slate-800">Encontre um plano de ação detalhado para cada eixo, com sugestões específicas para evolução da maturidade digital.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-analise-avancada"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Análise Avançada</h3>
        <p className="text-slate-800">Compare duas microrregiões lado a lado e identifique diferenças específicas em cada eixo de maturidade.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="distribuicao-inmsd"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Distribuição e Desempenho</h3>
        <p className="text-slate-800">Este painel mostra como as microrregiões da macrorregião selecionada se distribuem entre os níveis de maturidade (Emergente, Em Evolução, Avançado) e destaca a de <strong>melhor desempenho</strong>.</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="barras"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Ranking de Maturidade</h3>
        <p className="text-slate-800">Este gráfico de barras ordena todas as microrregiões da macrorregião selecionada pelo <strong>Índice Geral de Maturidade</strong>, permitindo uma comparação visual rápida.</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="scroll-top"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">⬆️ Voltar ao Topo</h3>
        <p className="text-slate-800">Este botão azul no <strong>canto inferior direito</strong> faz você subir rapidamente para o início da página. Útil quando você está explorando muitos dados!</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#faq-fab',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">❓ Dúvidas? Consulte o FAQ</h3>
        <p className="text-slate-800">Este botão vermelho no <strong>canto inferior direito</strong> abre o Dicionário e Perguntas Frequentes. Encontre explicações sobre termos técnicos e tire suas dúvidas!</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="configuracoes"]',
    content: (
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 mb-2">⚙️ Revise o Tour Quando Quiser</h3>
        <p className="text-slate-800">Este botão azul no <strong>canto inferior esquerdo</strong> permite que você reviva este tour a qualquer momento. Clique nele para relembrar como usar a ferramenta!</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: 'body',
    content: (
      <div className="text-center p-2">
        <h2 className="text-2xl font-extrabold text-blue-700 mb-2">Exploração Concluída!</h2>
        <p className="text-base text-slate-800">Você aprendeu o básico para navegar no Radar NSD. Explore à vontade e, se precisar, clique na engrenagem ⚙️ no canto inferior para rever este guia.</p>
        <p className="mt-3 text-lg font-semibold text-blue-800">Boas análises!</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
];

function UserGuideModal({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) {
  const steps = [
    {
      title: 'Bem-vindo ao Radar Digital!',
      emoji: '👋',
      content: (
        <>
          <div className="text-blue-900 text-center text-base sm:text-lg font-bold mb-2 flex flex-col items-center gap-2">
            <span>Descubra o potencial digital da sua região!</span>
            <img src="/logo_sus_digital-removebg-preview.png" alt="Logo Micro-Region Insights Hub" className="inline-block w-10 h-10 sm:w-12 sm:h-12 align-middle mx-auto" />
          </div>
          <div className="text-blue-800 text-sm sm:text-base text-center mb-2">
            Este painel mostra, de forma simples, onde sua microrregião está bem e onde pode melhorar no mundo digital.
          </div>
        </>
      )
    },
    {
      title: 'Filtre e Compare',
      emoji: '🔎',
      content: (
        <div className="text-blue-900 text-sm sm:text-base text-center">
          <b>Escolha a macrorregião e microrregião</b> que deseja analisar.<br />
          Veja como sua região se compara com as outras.
        </div>
      )
    },
    {
      title: 'Veja os Indicadores',
      emoji: '📊',
      content: (
        <div className="text-blue-900 text-sm sm:text-base text-center">
          <b>População, maturidade digital e classificação</b> aparecem em cartões coloridos.<br />
          <span className="text-blue-700">Passe o mouse</span> para ver detalhes extras!
        </div>
      )
    },
    {
      title: 'Explore os Gráficos',
      emoji: '📈',
      content: (
        <div className="text-blue-900 text-sm sm:text-base text-center">
          <b>Radar</b> mostra forças e fraquezas.<br />
          <b>Barras</b> mostram o ranking.<br />
          <b>Tabela</b> detalha cada área.
        </div>
      )
    },
    {
      title: 'Receba Recomendações',
      emoji: '💡',
      content: (
        <div className="text-blue-900 text-sm sm:text-base text-center">
          <b>Dicas automáticas</b> para melhorar cada área.<br />
          Veja o que fazer para avançar!
        </div>
      )
    },
    {
      title: 'Compartilhe Resultados',
      emoji: '📄',
      content: (
        <div className="text-blue-900 text-sm sm:text-base text-center">
          <b>Exporte relatórios em PDF</b> para reuniões e decisões.<br />
          Fácil de salvar e compartilhar.
        </div>
      )
    },
    {
      title: 'Dúvidas? Consulte o FAQ!',
      emoji: '❓',
      content: (
        <div className="text-blue-900 text-sm sm:text-base text-center">
          <b>Tem alguma dúvida?</b> Clique no botão abaixo para abrir o Dicionário e Perguntas Frequentes.<br />
          <span className="text-blue-700">Tudo explicado de forma simples!</span>
        </div>
      )
    },
  ];
  const [step, setStep] = useState(0);
  // Lembrar se já viu o guia
  React.useEffect(() => {
    if (open) {
      localStorage.setItem('mrh-guide-dismissed', '1');
    }
  }, [open]);
  // Abrir FAQ externo
  const openFAQ = () => {
    const helpBtn = document.querySelector('[data-tour="ajuda"]') as HTMLElement;
    if (helpBtn) helpBtn.click();
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-blue-200 bg-white shadow-lg shadow-blue-100 animate-fade-in-up">
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 sm:p-6 relative min-h-[340px] flex flex-col justify-between">
          <button onClick={() => setOpen(false)} className="absolute top-3 right-3 z-50 bg-white/80 rounded-full p-1 shadow hover:bg-blue-100 text-blue-900 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"><X size={20} /></button>
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl sm:text-5xl mb-1 drop-shadow">{steps[step].emoji}</div>
            <div className="font-bold text-blue-900 text-lg sm:text-xl mb-1 text-center">{steps[step].title}</div>
            <div className="w-full">{steps[step].content}</div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-center gap-1 mb-2">
              {steps.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-600' : 'bg-blue-200'} transition-all`} />
              ))}
            </div>
            <div className="flex gap-2 justify-between">
              <button
                className="flex-1 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 transition-all text-xs sm:text-sm disabled:opacity-50"
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
              >Voltar</button>
              {step === steps.length - 1 ? (
                <button
                  className="flex-1 py-2 rounded-lg bg-pink-600 text-white font-semibold shadow hover:bg-pink-700 transition-all text-xs sm:text-sm"
                  onClick={openFAQ}
                >Abrir FAQ</button>
              ) : (
                <button
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all text-xs sm:text-sm"
                  onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                >Próximo</button>
              )}
            </div>
            {step === steps.length - 2 && (
              <button
                className="mt-2 w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition-all text-xs sm:text-sm"
                onClick={() => setOpen(false)}
              >🚀 Explorar Dashboard</button>
            )}
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
  const [runTour, setRunTour] = useState(() => !localStorage.getItem(GUIDE_STORAGE_KEY));
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [selectedEixoIndex, setSelectedEixoIndex] = useState(0);

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

  const handleFiltersOpenChange = (open: boolean) => {
    setIsFiltersOpen(open);
    // Fecha o menu FAB se a gaveta de filtros for aberta
    if (open) {
      setIsFabMenuOpen(false);
    }
  };

  const handleFabMenuToggle = () => {
    // Fecha a gaveta de filtros se o menu FAB for aberto
    if (isFiltersOpen) {
      setIsFiltersOpen(false);
    }
    setIsFabMenuOpen(!isFabMenuOpen);
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
    setSelectedEixoIndex(eixoIndex);
    setActiveSection('recomendacoes');
    setTimeout(() => {
      const element = document.querySelector(`#eixo-${eixoIndex + 1}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback: tentar novamente após mais tempo
        setTimeout(() => {
          const elementRetry = document.querySelector(`#eixo-${eixoIndex + 1}`);
          if (elementRetry) {
            elementRetry.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
    }, 200); // Aumentado de 100ms para 200ms
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (["finished", "skipped"].includes(status)) {
      setRunTour(false);
      localStorage.setItem(GUIDE_STORAGE_KEY, '1');
    }
  };

  // Macroregião ativa
  const macroAtiva = filters.macrorregiao ? filters.macrorregiao : 'Todas as macrorregiões';

  // Contagem por classificação INMSD
  const classificationCounts = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      const key = item?.classificacao_inmsd ?? 'Desconhecido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [filteredData]);

  // Melhor desempenho
  const topPerformer = useMemo(() => {
    return filteredData.reduce((best, current) => {
      const currentMaturity = current?.indice_geral ? parseFloat(String(current.indice_geral).replace(',', '.')) : 0;
      const bestMaturity = best?.indice_geral ? parseFloat(String(best.indice_geral).replace(',', '.')) : 0;
      return currentMaturity > bestMaturity ? current : best;
    }, filteredData[0]);
  }, [filteredData]);

  // Controle de exibição do bloco
  const [showDistribuicao, setShowDistribuicao] = useState(true);


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
      <Joyride
        steps={joyrideSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          skip: 'Pular Guia',
        }}
        styles={{
          options: {
            zIndex: 9999,
            primaryColor: '#2563eb',
            textColor: '#1e293b',
            arrowColor: '#fff',
          },
        }}
        callback={handleJoyrideCallback}
      />
      {/* Menu de Navegação Superior */}
      <NavigationMenu activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Botão de Filtros para Mobile */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Drawer open={isFiltersOpen} onOpenChange={handleFiltersOpenChange}>
          <DrawerTrigger asChild>
            <Button size="icon" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Filter className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Filtros de Análise</DrawerTitle>
              <DrawerDescription>
                Selecione os filtros para refinar os dados exibidos no dashboard.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto">
              <Filters
                data={data}
                selectedMicroregiao={selectedMicroregiao}
                filters={filters}
                onMicroregiaoChange={(microrregiao) => {
                  handleMicroregiaoChange(microrregiao);
                  // Opcional: fechar ao selecionar, mas vamos manter aberto para múltiplos filtros
                  // setIsFiltersOpen(false); 
                }}
                onFiltersChange={handleFiltersChange}
                selectedData={selectedData}
              />
            </div>
            <DrawerFooter>
              <Button onClick={() => setIsFiltersOpen(false)}>Ver Resultados</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8 flex gap-8">
        {/* Filtros - Visível apenas em telas grandes */}
        <aside className="hidden lg:block w-1/4 xl:w-1/5 sticky top-20 self-start">
          <div data-tour="filtros">
            <Filters
              data={data}
              selectedMicroregiao={selectedMicroregiao}
              filters={filters}
              onMicroregiaoChange={handleMicroregiaoChange}
              onFiltersChange={handleFiltersChange}
              selectedData={selectedData}
            />
          </div>
        </aside>

        {/* Conteúdo do Dashboard */}
        <div className="flex-1 min-w-0">
          {/* Cabeçalho detalhado da microrregião - só na aba Geral */}
          {activeSection === 'overview' && selectedData && (
            <div className="mb-8">
              <DashboardHeader data={selectedData} allData={data} />
            </div>
          )}

          {/* Seções do Dashboard */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div data-tour="cards-overview">
                <StatsOverview data={data} selectedData={selectedData} macroFiltro={filters.macrorregiao} />
              </div>
              <div data-tour="populacao">
                <PopulationChartComponent
                  data={filteredData}
                  selectedMicroregiao={selectedMicroregiao}
                />
              </div>
              <div className="w-full h-0.5 bg-gray-200 my-6 rounded-full" />
              <DistribuicaoINMSD
                showDistribuicao={showDistribuicao}
                macroAtiva={macroAtiva}
                classificationCounts={classificationCounts}
                filteredData={filteredData}
                topPerformer={topPerformer}
              />
              <div className="mt-8" />
              <div data-tour="barras">
                <BarChartComponent
                  data={filteredData}
                  selectedMicroregiao={selectedMicroregiao}
                  macroFiltro={filters.macrorregiao}
                />
              </div>
              <div className="mt-12" />
              {selectedData ? (
                <>
                  <div data-tour="radar">
                    <DashboardRadarChart
                      data={selectedData}
                      medians={medians}
                      onNavigateToRecommendations={handleNavigateToRecommendations}
                    />
                  </div>
                  <ExecutiveDashboard
                    data={data}
                    selectedMicroregiao={selectedMicroregiao}
                    medians={medians}
                  />
                  <div data-tour="tabela-eixos">
                    <EixosTable data={selectedData} medians={medians} />
                  </div>
                  <div data-tour="recomendacoes">
                    <RecommendationsPanel data={selectedData} initialEixoIndex={selectedEixoIndex} />
                  </div>
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
              <div data-tour="radar">
                <DashboardRadarChart
                  data={selectedData}
                  medians={medians}
                  onNavigateToRecommendations={handleNavigateToRecommendations}
                />
              </div>
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
            <div data-tour="barras">
              <BarChartComponent
                data={filteredData}
                selectedMicroregiao={selectedMicroregiao}
                macroFiltro={filters.macrorregiao}
              />
            </div>
          )}

          {activeSection === 'populacao' && (
            <div data-tour="populacao">
              <PopulationChartComponent
                data={filteredData}
                selectedMicroregiao={selectedMicroregiao}
              />
            </div>
          )}

          {activeSection === 'tabela' && (
            selectedData ? (
              <div data-tour="tabela-eixos">
                <EixosTable data={selectedData} medians={medians} />
              </div>
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
              <div data-tour="recomendacoes">
                <RecommendationsPanel data={selectedData} initialEixoIndex={selectedEixoIndex} />
              </div>
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
        </div>
      </main>

      {/* Menu de Ações Flutuantes (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        {/* Botões secundários que aparecem quando o menu está aberto */}
        {isFabMenuOpen && (
          <>
            {showScrollTop && (
              <Button
                data-tour="scroll-top"
                onClick={scrollToTop}
                size="icon"
                className="w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 animate-fade-in-up"
              >
                <ArrowUp className="w-6 h-6" />
              </Button>
            )}
            <HelpButton />
          </>
        )}
        {/* Botão principal que abre/fecha o menu */}
        <Button
          data-tour="configuracoes"
          size="icon"
          className="w-16 h-16 rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-2 border-blue-400 transition-all duration-300 hover:scale-110 z-50 hover:shadow-2xl"
          onClick={handleFabMenuToggle}
        >
          <Settings className={`w-7 h-7 transition-transform duration-300 ${isFabMenuOpen ? 'rotate-90' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default Index;

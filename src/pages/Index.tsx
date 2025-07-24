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

const GUIDE_STORAGE_KEY = 'mrh-guide-dismissed';

const joyrideSteps: Step[] = [
  {
    target: 'body',
    content: ( 
      <div className="flex items-center gap-3">
        <span style={{fontSize: 32}}>🤖</span>
        <div>
          <b>Olá! Eu sou o DigiBot</b> <br/>
          Bem-vindo ao Radar do Núcleo de Saúde Digital!<br/>
          Vou te mostrar como navegar por aqui. Vamos juntos? 🚀
        </div>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="menu-overview"]',
    content: <span>🏠 <b>Geral:</b> Aqui você vê um resumo completo da sua microrregião.</span>,
    title: 'Menu: Geral',
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-radar"]',
    content: <span>📊 <b>Radar:</b> Veja forças e fraquezas em cada área avaliada.</span>,
    title: 'Menu: Radar',
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-barras"]',
    content: <span>📈 <b>Barras:</b> Compare o ranking das microrregiões.</span>,
    title: 'Menu: Barras',
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-populacao"]',
    content: <span>👥 <b>População:</b> Veja quantas pessoas vivem em cada região.</span>,
    title: 'Menu: População',
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-tabela"]',
    content: <span>📋 <b>Eixos:</b> Detalhe de cada área avaliada.</span>,
    title: 'Menu: Eixos',
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-recomendacoes"]',
    content: <span>💡 <b>Recomendações:</b> Dicas práticas para melhorar sua microrregião.</span>,
    title: 'Menu: Recomendações',
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-executivo"]',
    content: <span>🎯 <b>Executivo:</b> Visão estratégica para gestores.</span>,
    title: 'Menu: Executivo',
    placement: 'bottom',
  },
  {
    target: '[data-tour="menu-analise-avancada"]',
    content: <span>📊 <b>Avançada:</b> Compare regiões em detalhes.</span>,
    title: 'Menu: Avançada',
    placement: 'bottom',
  },
  {
    target: '[data-tour="filtros"]',
    content: <span>🔎 <b>Filtros:</b> Selecione a macrorregião e microrregião que deseja analisar.</span>,
    title: 'Filtros',
    placement: 'bottom',
  },
  {
    target: '[data-tour="cards-overview"]',
    content: <span>📦 <b>Indicadores:</b> Veja os principais números da sua microrregião.</span>,
    title: 'Indicadores',
    placement: 'bottom',
  },
  {
    target: '[data-tour="radar"]',
    content: <span>🕸️ <b>Radar:</b> Visualize forças e fraquezas de forma gráfica.</span>,
    title: 'Gráfico Radar',
    placement: 'top',
  },
  {
    target: '[data-tour="barras"]',
    content: <span>📊 <b>Barras:</b> Veja o ranking das microrregiões.</span>,
    title: 'Gráfico Barras',
    placement: 'top',
  },
  {
    target: '[data-tour="populacao"]',
    content: <span>👥 <b>População:</b> Compare o tamanho das regiões.</span>,
    title: 'População',
    placement: 'top',
  },
  {
    target: '[data-tour="tabela-eixos"]',
    content: <span>📋 <b>Tabela:</b> Detalhe de cada eixo avaliado.</span>,
    title: 'Tabela de Eixos',
    placement: 'top',
  },
  {
    target: '[data-tour="recomendacoes"]',
    content: <span>💡 <b>Recomendações:</b> Veja dicas práticas para evoluir.</span>,
    title: 'Recomendações',
    placement: 'top',
  },
  {
    target: '#faq-fab',
    content: <span>❓ <b>FAQ:</b> Este botão vermelho no <b>canto inferior direito</b> abre o Dicionário e Perguntas Frequentes. Clique sempre que tiver dúvidas!</span>,
    title: 'Ajuda e FAQ',
    placement: 'top',
  },
  {
    target: '[data-tour="scroll-top"]',
    content: <span>⬆️ <b>Voltar ao Topo:</b> Este botão azul no <b>canto inferior direito</b> faz você subir rapidamente para o início da página.</span>,
    title: 'Voltar ao Topo',
    placement: 'top',
  },
  {
    target: 'body',
    content: (
      <div className="flex items-center gap-3">
        <span style={{fontSize: 32}}>🤖</span>
        <div>
          Pronto! Agora você já sabe navegar pelo Radar NSDIGI.<br/>
          Sempre que quiser, clique na engrenagem para rever este tour.<br/>
          Conte comigo para ajudar! 💙
        </div>
      </div>
    ),
    placement: 'center',
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

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (["finished", "skipped"].includes(status)) {
      setRunTour(false);
      localStorage.setItem(GUIDE_STORAGE_KEY, '1');
    }
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



      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
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

        {/* Seções do Dashboard */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div data-tour="cards-overview">
              <StatsOverview data={data} selectedData={selectedData} macroFiltro={filters.macrorregiao} />
            </div>
            {selectedData ? (
              <>
                <div data-tour="radar">
                  <DashboardRadarChart
                    data={selectedData}
                    medians={medians}
                    onNavigateToRecommendations={handleNavigateToRecommendations}
                  />
                </div>
                <div data-tour="barras">
                  <BarChartComponent
                    data={filteredData}
                    selectedMicroregiao={selectedMicroregiao}
                    macroFiltro={filters.macrorregiao}
                  />
                </div>
                <div data-tour="populacao">
                  <PopulationChartComponent
                    data={filteredData}
                    selectedMicroregiao={selectedMicroregiao}
                  />
                </div>
                <div data-tour="tabela-eixos">
                  <EixosTable data={selectedData} medians={medians} />
                </div>
                <div data-tour="recomendacoes">
                  <RecommendationsPanel data={selectedData} />
                </div>
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
              <RecommendationsPanel data={selectedData} />
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
      </main>

      {/* Botão de Configurações */}
      <Button
        size="icon"
        className="fixed bottom-6 left-6 w-14 h-14 rounded-full shadow-lg bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-200 transition-all duration-300 hover:scale-110 z-50"
        onClick={() => setRunTour(true)}
      >
        <Settings className="w-6 h-6" />
      </Button>

      {/* Botão de Ajuda */}
      <div data-tour="faq">
        <HelpButton />
      </div>

      {/* Botão Voltar ao Topo */}
      {showScrollTop && (
        <Button
          data-tour="scroll-top"
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-20 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-40 transition-all duration-300 hover:scale-110"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
};

export default Index;

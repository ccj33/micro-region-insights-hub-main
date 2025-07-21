import { useState, useMemo } from 'react';
import { DashboardBarChart } from '@/components/dashboard/BarChart';
import { Filters } from '@/components/dashboard/Filters';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { mockData } from '@/data/mockData';
import { FilterOptions } from '@/types/dashboard';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BarChartPage = () => {
  const [data, setData] = useState(mockData);
  const [selectedMicroregiao, setSelectedMicroregiao] = useState<string>(mockData[0].microrregiao);
  const [filters, setFilters] = useState<FilterOptions>({});

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
    
    const filtered = data.filter(item => {
      return (!newFilters.macrorregiao || item.macrorregiao === newFilters.macrorregiao) &&
             (!newFilters.regional_saude || item.regional_saude === newFilters.regional_saude) &&
             (!newFilters.classificacao_inmsd || item.classificacao_inmsd === newFilters.classificacao_inmsd);
    });
    
    if (filtered.length > 0 && !filtered.find(item => item.microrregiao === selectedMicroregiao)) {
      setSelectedMicroregiao(filtered[0].microrregiao);
    }
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
      {/* Header */}
      <header className="bg-dashboard-header shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Gráfico de Barras - Maturidade Digital
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Comparação entre Microrregiões
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {data.length} microrregiões • {filteredData.length} exibidas
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filtros */}
        <Filters
          data={filteredData}
          selectedMicroregiao={selectedMicroregiao}
          filters={filters}
          onMicroregiaoChange={handleMicroregiaoChange}
          onFiltersChange={handleFiltersChange}
          selectedData={selectedData}
        />

        {/* Cabeçalho da Microrregião */}
        <DashboardHeader data={selectedData} />

        {/* Gráfico de Barras em Tela Cheia */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Comparação de Maturidade Digital por Microrregião
            </h2>
            <p className="text-sm text-muted-foreground">
              Ranking das microrregiões por pontuação total de maturidade
            </p>
          </div>
          <div className="w-full h-[600px]">
            <DashboardBarChart data={filteredData} selectedMicroregiao={selectedMicroregiao} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dashboard-header border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Gráfico de Barras - Maturidade Digital • Ranking comparativo entre regiões</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BarChartPage; 
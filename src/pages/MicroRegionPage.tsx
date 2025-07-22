import { useParams } from "react-router-dom";
import { microTokens } from "@/data/microTokens";
import { useExcelData } from "@/hooks/useExcelData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import { DashboardRadarChart } from "@/components/dashboard/RadarChart";
import { DashboardBarChart } from "@/components/dashboard/BarChart";
import { PopulationChart } from "@/components/dashboard/PopulationChart";
import { EixosTable } from "@/components/dashboard/EixosTable";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { AdvancedAnalysis } from "@/components/dashboard/AdvancedAnalysis";

const MicroRegionPage = () => {
  const { token } = useParams();
  const { data, loading, error } = useExcelData();
  const microName = token && microTokens[token];

  if (!microName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso negado</h1>
          <p className="text-muted-foreground">Token inválido ou microrregião não encontrada.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Carregando dados...</h1>
          <p className="text-muted-foreground">Por favor, aguarde enquanto carregamos as informações.</p>
        </div>
      </div>
    );
  }

  const selectedData = data.find(item => item.microrregiao === microName);
  if (!selectedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Microrregião não encontrada</h1>
          <p className="text-muted-foreground">Não há dados para esta microrregião.</p>
        </div>
      </div>
    );
  }

  // Filtrar apenas os dados da microrregião
  const filteredData = data.filter(item => item.microrregiao === microName);

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader data={selectedData} allData={data} />
        <div className="my-12">
          <StatsOverview data={filteredData} selectedData={selectedData} macroFiltro={selectedData.macrorregiao} />
        </div>
        <div className="my-12">
          <DashboardRadarChart data={selectedData} medians={{}} />
        </div>
        <div className="my-12">
          <DashboardBarChart data={filteredData} selectedMicroregiao={microName} macroFiltro={selectedData.macrorregiao} />
        </div>
        <div className="my-12">
          <PopulationChart data={filteredData} selectedMicroregiao={microName} />
        </div>
        <div className="my-12">
          <EixosTable data={selectedData} medians={{}} />
        </div>
        <div className="my-12">
          <RecommendationsPanel data={selectedData} />
        </div>
        <div className="my-12">
          <ExecutiveDashboard data={filteredData} selectedMicroregiao={microName} medians={{}} />
        </div>
        <div className="my-12">
          <AdvancedAnalysis data={filteredData} selectedMicroregiao={microName} medians={{}} />
        </div>
      </div>
    </div>
  );
};

export default MicroRegionPage; 
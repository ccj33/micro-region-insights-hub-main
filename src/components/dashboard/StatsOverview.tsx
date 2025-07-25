import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MicroRegionData } from "@/types/dashboard";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin,
  BarChart3,
  Target,
  Eye,
  EyeOff
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { EstatisticasGerais } from "./EstatisticasGerais";
import { DistribuicaoINMSD } from "./DistribuicaoINMSD";

interface StatsOverviewProps {
  data: MicroRegionData[];
  selectedData: MicroRegionData;
  macroFiltro?: string;
}

export function StatsOverview({ data, selectedData, macroFiltro }: StatsOverviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showDistribuicao, setShowDistribuicao] = useState(true);

  // Debug: verificar props recebidas
  // console.log('StatsOverview - Props:', {
  //   totalData: data?.length,
  //   macroFiltro,
  //   selectedData: selectedData?.microrregiao
  // });

  useEffect(() => {
    // Simular carregamento dos dados
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [data, selectedData]);

  // Calcular estatísticas gerais
  if (!data || data.length === 0 || !selectedData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Dados insuficientes para exibir as estatísticas.
      </div>
    );
  }

  const filteredData = macroFiltro && macroFiltro !== 'Todas as macrorregiões'
    ? data.filter(item => item.macrorregiao === macroFiltro)
    : data;

  const totalPopulation = filteredData.reduce((sum, item) => {
    const pop = item?.populacao ? parseInt(String(item.populacao).replace(/\./g, '')) : 0;
    return sum + pop;
  }, 0);

  const averageMaturity = filteredData.reduce((sum, item) => {
    const ind = item?.indice_geral ? parseFloat(String(item.indice_geral).replace(',', '.')) : 0;
    return sum + ind;
  }, 0) / (filteredData.length || 1);

  const selectedMaturity = selectedData?.indice_geral ? parseFloat(String(selectedData.indice_geral).replace(',', '.')) : 0;
  const isAboveAverage = selectedMaturity > averageMaturity;

  const classificationCounts = filteredData.reduce((acc, item) => {
    const key = item?.classificacao_inmsd ?? 'Desconhecido';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPerformer = filteredData.reduce((best, current) => {
    const currentMaturity = current?.indice_geral ? parseFloat(String(current.indice_geral).replace(',', '.')) : 0;
    const bestMaturity = best?.indice_geral ? parseFloat(String(best.indice_geral).replace(',', '.')) : 0;
    return currentMaturity > bestMaturity ? current : best;
  });

  const selectedRanking = filteredData
    .sort((a, b) => {
      const aVal = a?.indice_geral ? parseFloat(String(a.indice_geral).replace(',', '.')) : 0;
      const bVal = b?.indice_geral ? parseFloat(String(b.indice_geral).replace(',', '.')) : 0;
      return bVal - aVal;
    })
    .findIndex(item => item?.microrregiao === selectedData?.microrregiao) + 1;

  // Macroregião ativa
  const macroAtiva = macroFiltro ? macroFiltro : 'Todas as macrorregiões';

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div data-section="overview" className="space-y-6">
      <EstatisticasGerais
        showStats={showStats}
        setShowStats={setShowStats}
        macroAtiva={macroAtiva}
        filteredData={filteredData}
        totalPopulation={totalPopulation}
        selectedMaturity={selectedMaturity}
        isAboveAverage={isAboveAverage}
        macroFiltro={macroFiltro}
        averageMaturity={averageMaturity}
        selectedData={selectedData}
        selectedRanking={selectedRanking}
      />
    </div>
  );
}
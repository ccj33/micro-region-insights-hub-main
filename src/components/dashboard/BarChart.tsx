import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { MicroRegionData } from "@/types/dashboard";
import { TrendingUp } from "lucide-react";
import { Suspense, lazy, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load do componente de gráfico
const LazyBarChartComponent = lazy(() => import('./BarChartComponent').then(module => ({ default: module.BarChartComponent })));

interface DashboardBarChartProps {
  data: MicroRegionData[];
  selectedMicroregiao: string;
  macroFiltro?: string;
}

// Skeleton loading component
function BarChartSkeleton() {
  return (
    <div className="w-full h-[350px] sm:h-[400px] md:h-[450px] flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-32 h-32 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function DashboardBarChart({ data, selectedMicroregiao, macroFiltro }: DashboardBarChartProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleChartLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm" data-chart="bar">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Comparação do Índice Geral de Maturidade
        </h3>
        <p className="text-sm text-muted-foreground">
          Ranking das microrregiões por índice de maturidade digital
        </p>
      </div>
      
      <div className="h-[350px] sm:h-[400px] md:h-[450px] w-full">
        <Suspense fallback={<BarChartSkeleton />}>
          <LazyBarChartComponent 
            data={data}
            selectedMicroregiao={selectedMicroregiao}
            macroFiltro={macroFiltro}
            onLoad={handleChartLoad}
          />
        </Suspense>
      </div>
      
      {!isLoaded && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground text-center">
            <p>Carregando comparação de maturidade...</p>
          </div>
        </div>
      )}

    </div>
  );
}
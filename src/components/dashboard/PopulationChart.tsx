import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { MicroRegionData } from "@/types/dashboard";
import { Users, MapPin } from "lucide-react";
import { Suspense, lazy, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load do componente de gráfico
const LazyPopulationChartComponent = lazy(() => import('./PopulationChartComponent').then(module => ({ default: module.PopulationChartComponent })));

interface PopulationChartProps {
  data: MicroRegionData[];
  selectedMicroregiao?: string;
}

// Skeleton loading component
function PopulationChartSkeleton() {
  return (
    <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-32 h-32 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function PopulationChart({ data, selectedMicroregiao }: PopulationChartProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleChartLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm" data-chart="population">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Distribuição por Faixa Populacional
        </h3>
        <p className="text-sm text-muted-foreground">
          Categorização das microrregiões por tamanho populacional
        </p>
      </div>
      
      <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
        <Suspense fallback={<PopulationChartSkeleton />}>
          <LazyPopulationChartComponent 
            data={data}
            selectedMicroregiao={selectedMicroregiao}
            onLoad={handleChartLoad}
          />
        </Suspense>
      </div>

      {!isLoaded && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground text-center">
            <p>Carregando distribuição populacional...</p>
          </div>
        </div>
      )}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MicroRegionData } from "@/types/dashboard";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin,
  BarChart3,
  Target
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface StatsOverviewProps {
  data: MicroRegionData[];
  selectedData: MicroRegionData;
}

export function StatsOverview({ data, selectedData }: StatsOverviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simular carregamento dos dados
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [data, selectedData]);

  // Calcular estatísticas gerais
  const totalPopulation = data.reduce((sum, item) => {
    return sum + parseInt(String(item.populacao).replace(/\./g, ''));
  }, 0);

  const averageMaturity = data.reduce((sum, item) => {
    return sum + parseFloat(String(item.indice_geral).replace(',', '.'));
  }, 0) / data.length;

  const selectedMaturity = parseFloat(String(selectedData.indice_geral).replace(',', '.'));
  const isAboveAverage = selectedMaturity > averageMaturity;

  const classificationCounts = data.reduce((acc, item) => {
    acc[item.classificacao_inmsd] = (acc[item.classificacao_inmsd] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPerformer = data.reduce((best, current) => {
    const currentMaturity = parseFloat(String(current.indice_geral).replace(',', '.'));
    const bestMaturity = parseFloat(String(best.indice_geral).replace(',', '.'));
    return currentMaturity > bestMaturity ? current : best;
  });

  const selectedRanking = data
    .sort((a, b) => parseFloat(String(b.indice_geral).replace(',', '.')) - parseFloat(String(a.indice_geral).replace(',', '.')))
    .findIndex(item => item.microrregiao === selectedData.microrregiao) + 1;

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {/* Total de Microrregiões */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Microrregiões
          </CardTitle>
          <MapPin className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{data.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Microrregiões analisadas
          </p>
        </CardContent>
      </Card>

      {/* População Total */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            População Total
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {totalPopulation.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Habitantes das microrregiões analisadas
          </p>
        </CardContent>
      </Card>

      {/* Maturidade Média */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Maturidade Média Geral
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-foreground">
              {averageMaturity.toFixed(3)}
            </div>
            {isAboveAverage ? (
              <Badge className="bg-success text-success-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Acima da Média
              </Badge>
            ) : (
              <Badge className="bg-error text-error-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Abaixo da Média
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sua microrregião: <strong>{selectedMaturity.toFixed(3)}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            Média de <strong>todas as microrregiões</strong> analisadas
          </p>
        </CardContent>
      </Card>

      {/* Ranking da Região */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Posição no Ranking
          </CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {selectedRanking}º
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            de <strong>{data.length}</strong> microrregiões analisadas
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>1º</strong> = melhor maturidade digital
          </p>
        </CardContent>
      </Card>

      {/* Distribuição por Classificação */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribuição por Classificação INMSD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(classificationCounts).map(([classification, count]) => (
              <div key={classification} className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-2">{count}</div>
                <div className="text-sm font-medium text-muted-foreground">{classification}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {((count / data.length) * 100).toFixed(1)}% das microrregiões
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-sm">
              <span className="font-medium text-foreground">Melhor Desempenho:</span>
              <span className="ml-2 text-primary font-semibold">{topPerformer.microrregiao}</span>
              <span className="ml-2 text-muted-foreground">
                (<strong>{parseFloat(String(topPerformer.indice_geral).replace(',', '.')).toFixed(3)}</strong>)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
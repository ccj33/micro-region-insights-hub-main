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

interface StatsOverviewProps {
  data: MicroRegionData[];
  selectedData: MicroRegionData;
  macroFiltro?: string;
}

export function StatsOverview({ data, selectedData, macroFiltro }: StatsOverviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showDistribuicao, setShowDistribuicao] = useState(true);

  useEffect(() => {
    // Simular carregamento dos dados
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [data, selectedData]);

  // Calcular estatísticas gerais
  const filteredData = macroFiltro && macroFiltro !== 'Todas as macrorregiões'
    ? data.filter(item => item.macrorregiao === macroFiltro)
    : data;

  const totalPopulation = filteredData.reduce((sum, item) => {
    return sum + parseInt(String(item.populacao).replace(/\./g, ''));
  }, 0);

  const averageMaturity = filteredData.reduce((sum, item) => {
    return sum + parseFloat(String(item.indice_geral).replace(',', '.'));
  }, 0) / filteredData.length;

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
    <div data-section="stats">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-full flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Estatísticas Gerais</h2>
          <button className="ml-2 p-1 rounded hover:bg-muted transition-colors" onClick={() => setShowStats(v => !v)} aria-label={showStats ? 'Ocultar bloco' : 'Mostrar bloco'} type="button">
            {showStats ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-primary" />}
          </button>
        </div>
        {showStats && (
          <>
            {/* Total de Microrregiões */}
            <Card className="shadow-lg border border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Microrregiões
                </CardTitle>
                <MapPin className="h-4 w-4 text-primary" />
              </CardHeader>
              <div className="text-xs text-muted-foreground mb-2 ml-4"><em>Macrorregião selecionada:</em> <strong>{macroAtiva}</strong></div>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-3">{data.length}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Microrregiões analisadas
                </p>
              </CardContent>
            </Card>

            {/* População Total */}
            <Card className="shadow-lg border border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  População Total
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <div className="text-xs text-muted-foreground mb-2 ml-4"><em>Macrorregião selecionada:</em> <strong>{macroAtiva}</strong></div>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-3">
                  {totalPopulation.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Habitantes das microrregiões analisadas
                </p>
              </CardContent>
            </Card>

            {/* Maturidade Média */}
            <Card className="shadow-lg border border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Maturidade Média Geral
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <div className="text-xs text-muted-foreground mb-2 ml-4"><em>Macrorregião selecionada:</em> <strong>{macroAtiva}</strong></div>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-2xl font-bold text-foreground">
                    {selectedMaturity.toFixed(2)}
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
                <p className="text-xs text-muted-foreground mt-2">
                  Valor da sua microrregião destacado acima
                </p>
                <p className="text-xs text-muted-foreground">
                  {macroFiltro === 'Todas as macrorregiões'
                    ? <>Média de <strong>todas as macrorregiões</strong>: {averageMaturity.toFixed(2)}</>
                    : <>Média da macrorregião <strong>{macroFiltro}</strong>: {averageMaturity.toFixed(2)}</>
                  }
                </p>
              </CardContent>
            </Card>

            {/* Ranking da Região */}
            <Card className="shadow-lg border border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Posição no Ranking
                </CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <div className="text-xs text-primary font-medium mb-2 ml-4">
                <em>Microrregião:</em> <strong>{selectedData.microrregiao}</strong>
              </div>
              <div className="text-xs text-muted-foreground mb-2 ml-4">
                <em>Macrorregião selecionada:</em> <strong>{macroAtiva}</strong>
              </div>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-2">
                  {selectedRanking}º
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  de <strong>{data.length}</strong> microrregiões analisadas
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      {showDistribuicao && (
        <Card className="shadow-lg border border-gray-200 bg-white md:col-span-2 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Distribuição por Classificação INMSD</CardTitle>
            <button className="ml-2 p-1 rounded hover:bg-muted transition-colors" onClick={() => setShowDistribuicao(v => !v)} aria-label={showDistribuicao ? 'Ocultar bloco' : 'Mostrar bloco'} type="button">
              {showDistribuicao ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-primary" />}
            </button>
          </CardHeader>
          {showDistribuicao && (
            <>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card da macrorregião selecionada */}
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground mb-1">Macrorregião selecionada</div>
                    <div className="text-lg font-bold text-black">{macroAtiva}</div>
                  </div>
                  {Object.entries(classificationCounts).map(([classification, count], idx) => {
                    const filteredMicros = filteredData.filter(item => item.classificacao_inmsd === classification);
                    const filteredCount = filteredMicros.length;
                    return (
                      <Tooltip key={classification}>
                        <TooltipTrigger asChild>
                          <div className="text-center p-4 bg-muted/30 rounded-lg cursor-pointer">
                            <div className="text-2xl font-bold text-foreground mb-2">{filteredCount}</div>
                            <div className="text-sm font-medium text-muted-foreground">{classification}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {filteredCount} de {filteredData.length} microrregiões ({((filteredCount / filteredData.length) * 100).toFixed(1)}%)
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="max-h-48 w-64 overflow-y-auto text-xs whitespace-pre-line">
                          {filteredMicros.length > 0
                            ? filteredMicros.map(m => `• ${m.microrregiao}`).join("\n")
                            : "Nenhuma microrregião nesta categoria"}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-sm">
                    <span className="font-medium text-foreground">Melhor Desempenho:</span>
                    <span className="ml-2 text-primary font-semibold">{topPerformer.microrregiao}</span>
                    <span className="ml-2 text-muted-foreground">
                      (<strong>{parseFloat(String(topPerformer.indice_geral).replace(',', '.')).toFixed(3)}</strong>)
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      Macrorregião: <b>{topPerformer.macrorregiao || 'Todas as macrorregiões'}</b>
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-900 bg-blue-50 rounded p-2">
                    <b>O que significam os cartões acima?</b><br/>
                    Cada cartão mostra quantas microrregiões estão em cada nível de maturidade digital:<br/>
                    <b>Em Evolução</b> indica regiões que estão avançando, mas ainda têm pontos a desenvolver.<br/>
                    <b>Emergente</b> são regiões que estão começando sua jornada digital.<br/>
                    Quanto mais microrregiões em "Em Evolução" ou "Avançado", melhor o cenário geral.
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
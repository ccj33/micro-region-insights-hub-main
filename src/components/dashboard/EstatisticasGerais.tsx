import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Eye, EyeOff, MapPin, Users, BarChart3, TrendingUp, TrendingDown, Badge, Target } from "lucide-react";

export function EstatisticasGerais({
  showStats,
  setShowStats,
  macroAtiva,
  filteredData,
  totalPopulation,
  selectedMaturity,
  isAboveAverage,
  macroFiltro,
  averageMaturity,
  selectedData,
  selectedRanking
}: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="col-span-full flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Estatísticas Gerais</h2>
        <button className="ml-2 p-1 rounded hover:bg-muted transition-colors" onClick={() => setShowStats((v: boolean) => !v)} aria-label={showStats ? 'Ocultar bloco' : 'Mostrar bloco'} type="button">
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
              <div className="text-2xl font-bold text-foreground mb-3">{filteredData.length}</div>
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
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-md">
                    <TrendingUp className="h-4 w-4" />
                    Acima da Média
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-md">
                    <TrendingDown className="h-4 w-4" />
                    Abaixo da Média
                  </span>
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
                de <strong>{filteredData.length}</strong> microrregiões analisadas
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 
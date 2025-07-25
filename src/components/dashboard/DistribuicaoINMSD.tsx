import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

export function DistribuicaoINMSD({
  showDistribuicao,
  macroAtiva,
  classificationCounts,
  filteredData,
  topPerformer
}: any) {
  if (!showDistribuicao) return null;
  return (
    <Card className="shadow-lg border border-gray-200 bg-white md:col-span-2 lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Distribuição por Classificação INMSD</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card da macrorregião selecionada */}
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground mb-1">Macrorregião selecionada</div>
            <div className="text-lg font-bold text-black">{macroAtiva}</div>
          </div>
          {Object.entries(classificationCounts).map(([classification, count]: any, idx: number) => {
            const filteredMicros = filteredData.filter((item: any) => item.classificacao_inmsd === classification);
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
                    ? filteredMicros.map((m: any) => `• ${m.microrregiao}`).join("\n")
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
    </Card>
  );
} 
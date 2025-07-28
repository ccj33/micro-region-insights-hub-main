import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { getStatusAppearance, StatusLevel } from "@/lib/statusUtils";
import { Trophy, Info, Map } from "lucide-react";

const classificationOrder: StatusLevel[] = ['Avançado', 'Em Evolução', 'Emergente'];

export function DistribuicaoINMSD({
  showDistribuicao,
  macroAtiva,
  classificationCounts,
  filteredData,
  topPerformer
}: any) {
  if (!showDistribuicao) return null;

  const getClassificationStatus = (classification: string): StatusLevel => {
    const lowerCaseClass = classification.toLowerCase();
    if (lowerCaseClass.includes('avançado') || lowerCaseClass.includes('consolidado')) return 'Avançado';
    if (lowerCaseClass.includes('em evolução')) return 'Em Evolução';
    if (lowerCaseClass.includes('emergente')) return 'Emergente';
    return 'Padrão';
  };

  const sortedClassifications = classificationOrder.map(level => {
    const originalClassification = Object.keys(classificationCounts).find(c => getClassificationStatus(c) === level);
    return {
      level: level,
      count: originalClassification ? classificationCounts[originalClassification] : 0,
      originalName: originalClassification || level,
    };
  });

  return (
    <Card className="shadow-sm border-gray-200 bg-white md:col-span-2 lg:col-span-4" data-tour="distribuicao-inmsd">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Distribuição por Classificação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card da macrorregião selecionada */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
            <Map className="h-6 w-6 text-slate-500 mb-2" />
            <div className="text-xs text-muted-foreground mb-1">Macrorregião Ativa</div>
            <div className="text-lg font-bold text-slate-800">{macroAtiva}</div>
          </div>

          {sortedClassifications.map(({ level, count, originalName }) => {
            const appearance = getStatusAppearance(level);
            const Icon = appearance.icon;
            const filteredMicros = filteredData.filter((item: any) => getClassificationStatus(item.classificacao_inmsd) === level);
            
            return (
              <Tooltip key={level}>
                <TooltipTrigger asChild>
                  <div className={`p-4 rounded-lg bg-white border border-slate-200 border-t-4 ${appearance.borderColor} flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5`}>
                    <div className="flex items-center justify-between mb-2">
                       <h3 className={`text-sm font-semibold ${appearance.textColor}`}>{level}</h3>
                       <Icon className={`h-5 w-5 ${appearance.textColor}`} />
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${appearance.textColor}`}>{count}</div>
                      <div className={`text-xs ${appearance.textColor}/80`}>
                        {count} de {filteredData.length} ({((count / filteredData.length) * 100 || 0).toFixed(1)}%)
                      </div>
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

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Melhor Desempenho */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h3 className="text-md font-semibold text-slate-800">Melhor Desempenho</h3>
            </div>
            {topPerformer ? (
              <div>
                <span className="text-primary font-bold">{topPerformer.microrregiao}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  (Índice: {parseFloat(String(topPerformer.indice_geral).replace(',', '.')).toFixed(3)})
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Macrorregião: {topPerformer.macrorregiao || 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Não há dados de desempenho.</p>
            )}
          </div>

          {/* O que significam os cartões */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
             <div className="flex items-center gap-3 mb-2">
              <Info className="h-6 w-6 text-blue-600" />
              <h3 className="text-md font-semibold text-slate-800">Entendendo os Níveis</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada nível representa o estágio da jornada de transformação digital da microrregião:
              <br/>• <strong className="text-green-700">Avançado:</strong> Liderança e maturidade digital consolidada.
              <br/>• <strong className="text-blue-700">Em Evolução:</strong> Progresso notável com áreas para aprimorar.
              <br/>• <strong className="text-yellow-700">Emergente:</strong> Potencial de crescimento em estágio inicial.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
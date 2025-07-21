import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { MicroRegionData, EIXOS_NAMES } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Download } from "lucide-react";
import { useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RadarChartComponent } from './RadarChartComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RadarChartProps {
  data: MicroRegionData;
  medians: Record<string, number>;
  onNavigateToRecommendations?: (eixoIndex: number) => void;
  onLoad?: () => void;
}

// Skeleton para loading
const RadarChartSkeleton = () => (
  <div className="h-[350px] sm:h-[400px] md:h-[450px] w-full mb-4">
    <Skeleton className="w-full h-full" />
  </div>
);

export function DashboardRadarChart({ data, medians, onNavigateToRecommendations, onLoad }: RadarChartProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredEixo, setHoveredEixo] = useState<number | null>(null);

  const handleChartLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const exportChartAsImage = () => {
    // Capturar apenas o gráfico radar puro
    const chartElement = document.querySelector('.recharts-wrapper');
    if (chartElement) {
      // Usar html2canvas para capturar o gráfico
      import('html2canvas').then((html2canvas) => {
        html2canvas.default(chartElement as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: chartElement.scrollWidth,
          height: chartElement.scrollHeight
        }).then((canvas) => {
          // Criar canvas com nome da microrregião
          const finalCanvas = document.createElement('canvas');
          const ctx = finalCanvas.getContext('2d');
          const padding = 20;
          const titleHeight = 40;
          
          finalCanvas.width = canvas.width + (padding * 2);
          finalCanvas.height = canvas.height + padding + titleHeight;
          
          if (ctx) {
            // Fundo branco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            
            // Adicionar nome da microrregião
            ctx.fillStyle = '#1e40af';
            ctx.font = 'bold 18px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(data.microrregiao, finalCanvas.width / 2, 25);
            
            // Adicionar o gráfico
            ctx.drawImage(canvas, padding, titleHeight);
            
            // Criar link de download
            const link = document.createElement('a');
            link.download = `grafico-radar-${data.microrregiao.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = finalCanvas.toDataURL('image/png', 1.0);
            link.click();
          }
        });
      }).catch((error) => {
        console.error('Erro ao exportar gráfico:', error);
        alert('Erro ao exportar gráfico. Tente novamente.');
      });
    } else {
      alert('Gráfico não encontrado. Aguarde o carregamento completo.');
    }
  };

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm" data-chart="radar">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Análise de Maturidade por Eixos</h3>
            <p className="text-sm text-muted-foreground">
              Comparação dos eixos da microrregião selecionada com referências de maturidade
            </p>
          </div>
        </div>
        
        {/* Nome da microrregião com destaque */}
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {data.microrregiao}
          </div>
          <div className="text-sm text-muted-foreground">
            Microrregião Selecionada
          </div>
        </div>
      </div>

      {/* Botão de exportar */}
      <div className="mb-4 flex justify-end">
        <Button 
          onClick={exportChartAsImage}
          className="export-button bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Gráfico
        </Button>
      </div>

      {/* Caixinhas dos eixos clicáveis - ANTES do gráfico */}
      {isLoaded && (
        <div className="mb-4">
          <div className="axis-cards grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-3">
            {EIXOS_NAMES.map((nome, index) => {
              const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
              const valor = parseFloat(String(data[eixoKey]).replace(',', '.'));
              const mediana = medians[eixoKey] || 0;
              const diferenca = valor - mediana;
              
              let statusColor = 'bg-gray-200 text-gray-700';
              let statusText = 'Na Mediana';
              let statusIcon = '=' as string;
              
              if (diferenca > 0.1) {
                statusColor = 'bg-green-500 text-white';
                statusText = 'Acima da Média';
                statusIcon = '↑';
              } else if (diferenca < -0.1) {
                statusColor = 'bg-red-500 text-white';
                statusText = 'Abaixo da Média';
                statusIcon = '↓';
              } else {
                statusColor = 'bg-gray-100 text-gray-800';
                statusText = 'Na Média';
                statusIcon = '=';
              }

              return (
                <button
                  key={index}
                  onClick={() => onNavigateToRecommendations?.(index)}
                  onMouseEnter={() => setHoveredEixo(index)}
                  onMouseLeave={() => setHoveredEixo(null)}
                  className={`p-3 rounded-lg border-2 border-transparent hover:border-primary ${statusColor} hover:shadow-lg`}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold mb-1">Eixo {index + 1}</div>
                    <div className="text-xs opacity-90">{nome}</div>
                    <div className="text-xs font-bold mt-1">{valor.toFixed(3)}</div>
                    <div className="text-xs opacity-75 flex items-center justify-center gap-1">
                      <span>{statusIcon}</span>
                      <span>{statusText}</span>
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      Mediana: {mediana.toFixed(3)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-primary font-medium text-center">
              💡 <strong>Passe o mouse nas caixinhas</strong> para destacar o eixo no gráfico • <strong>Clique</strong> para ver recomendações
            </p>
          </div>
        </div>
      )}
      
      <div className="h-[350px] sm:h-[400px] md:h-[450px] w-full mb-4">
        <Suspense fallback={<RadarChartSkeleton />}>
          <RadarChartComponent 
            data={data}
            medians={medians}
            onNavigateToRecommendations={onNavigateToRecommendations}
            onLoad={handleChartLoad}
            hoveredEixo={hoveredEixo}
            setHoveredEixo={setHoveredEixo}
          />
        </Suspense>
      </div>

      {/* Legenda */}
      <div className="legend mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 shadow-sm">
        <h4 className="font-bold text-blue-900 text-lg mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Legenda do Gráfico
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-blue-900">Microrregião</span>
              <div className="text-xs text-blue-600">({data.microrregiao})</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-green-600 border-2 border-white shadow-md flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-green-900">Mediana Geral</span>
              <div className="text-xs text-green-600">Comparação</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-red-900">Emergente</span>
              <div className="text-xs text-red-600">(20% - 0.2)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-yellow-500 border-2 border-white shadow-md flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-orange-900">Em Evolução</span>
              <div className="text-xs text-orange-600">(50% - 0.5)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-200 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-md flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-emerald-900">Avançado</span>
              <div className="text-xs text-emerald-600">(80% - 0.8)</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
            <span className="text-blue-600">💡</span>
            <strong>Dica:</strong> As linhas pontilhadas são níveis de referência. A microrregião selecionada aparece em azul, 
            e a mediana geral em verde para comparação.
          </p>
        </div>
      </div>

      {/* Guia de interpretação */}
      <div className="interpretation-guide mt-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100 shadow-sm">
        <h4 className="font-bold text-indigo-900 text-lg mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          Como interpretar este gráfico
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-semibold text-blue-900">Azul:</span>
              <span className="text-blue-700">Microrregião selecionada</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="font-semibold text-green-900">Verde:</span>
              <span className="text-green-700">Mediana de todas as microrregiões</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-semibold text-red-900">Vermelho pontilhado:</span>
              <span className="text-red-700">Nível Emergente (0.2)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-orange-200">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-semibold text-orange-900">Laranja pontilhado:</span>
              <span className="text-orange-700">Nível Em Evolução (0.5)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-emerald-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-emerald-900">Verde pontilhado:</span>
              <span className="text-emerald-700">Nível Avançado (0.8)</span>
            </div>
          </div>
        </div>
      </div>
      
      {!isLoaded && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground text-center">
            <p>Carregando análise de maturidade...</p>
          </div>
        </div>
      )}
    </div>
  );
}
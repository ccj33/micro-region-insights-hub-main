import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { MicroRegionData, EIXOS_NAMES } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Download, Eye, EyeOff } from "lucide-react";
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
  const [showRadar, setShowRadar] = useState(true);

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
    <div data-section="radar" className="bg-card rounded-lg border p-4 sm:p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Análise por Eixos</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comparativo da microrregião e medianas
              </p>
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-lg sm:text-xl font-bold text-primary">
            {data.microrregiao}
          </div>
        </div>
      </div>

      {/* Legenda Estática */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm mb-4 p-2 bg-muted rounded-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Microrregião Selecionada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Mediana dos Eixos</span>
        </div>
      </div>

      {/* Botão de exportar e visibilidade */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button 
          onClick={() => setShowRadar(v => !v)}
          variant="outline"
          size="sm"
          aria-label={showRadar ? 'Ocultar gráfico' : 'Mostrar gráfico'}
        >
          {showRadar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button 
          onClick={exportChartAsImage}
          className="export-button bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Caixinhas dos eixos clicáveis */}
      {isLoaded && (
        <div className="mb-4">
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg mb-3">
            <p className="text-xs text-primary font-medium text-center">
              💡 <strong>Dica:</strong> Clique em um eixo para ver as recomendações.
            </p>
          </div>
          <div className="axis-cards grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {EIXOS_NAMES.map((nome, index) => {
              const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
              const valor = parseFloat(String(data[eixoKey]).replace(',', '.'));
              const mediana = medians[eixoKey] || 0;
              const diferenca = valor - mediana;
              
              let statusColor = 'bg-gray-100 text-gray-800 border-gray-200';
              let statusText = 'Na Mediana';
              let statusIcon = '=';
              
              if (diferenca > 0.1) {
                statusColor = 'bg-green-100 text-green-700 border-green-300';
                statusText = 'Acima da Mediana';
                statusIcon = '↑';
              } else if (diferenca < -0.1) {
                statusColor = 'bg-yellow-50 text-yellow-600 border-yellow-200';
                statusText = 'Abaixo da Mediana';
                statusIcon = '↓';
              }
              
              return (
                <button
                  key={index}
                  onClick={() => onNavigateToRecommendations?.(index)}
                  onMouseEnter={() => setHoveredEixo(index)}
                  onMouseLeave={() => setHoveredEixo(null)}
                  className={`p-2 text-center rounded-lg border-2 border-transparent hover:border-primary ${statusColor} hover:shadow-md transition-all`}
                >
                  <div className="text-xs font-bold">Eixo {index + 1}</div>
                  <div className="text-xs opacity-90 leading-tight my-1">{nome}</div>
                  <div className="text-sm font-bold text-primary">{valor.toFixed(2)}</div>
                  <div className="text-xs opacity-70 text-muted-foreground">
                    (Mediana: {mediana.toFixed(2)})
                  </div>
                  <div className="text-xs mt-1 flex items-center justify-center gap-1">
                    <span className="font-bold">{statusIcon}</span>
                    <span className="text-xs">{statusText}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {showRadar && (
        <div className="w-full h-[300px] sm:h-[450px]">
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
      )}

      {/* Fonte ABNT */}
      <div className="pt-2 text-right w-full">
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          Fonte: Ministério da Saúde/SEIDIGI
        </span>
      </div>
    </div>
  );
}
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
    <div data-section="radar" className="bg-card rounded-lg border p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Análise de Maturidade por Eixos</h3>
            <button className="ml-2 p-1 rounded hover:bg-muted transition-colors" onClick={() => setShowRadar(v => !v)} aria-label={showRadar ? 'Ocultar bloco' : 'Mostrar bloco'} type="button">
              {showRadar ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-primary" />}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Comparação dos eixos da microrregião selecionada com referências de maturidade
          </p>
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
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg mb-3">
            <p className="text-xs text-primary font-medium text-center">
              💡 <strong>Passe o mouse nas caixinhas</strong> para destacar o eixo no gráfico • <strong>Clique</strong> para ver recomendações
            </p>
          </div>
          <div className="axis-cards grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-3">
            {EIXOS_NAMES.map((nome, index) => {
              const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
              const valor = parseFloat(String(data[eixoKey]).replace(',', '.'));
              const mediana = medians[eixoKey] || 0;
              const diferenca = valor - mediana;
              
              let statusColor = 'bg-gray-200 text-gray-700';
              let statusText = 'Na Mediana';
              let statusIcon = '=' as string;
              
              // Trocar statusColor para azul/cinza
              if (diferenca > 0.1) {
                statusColor = 'bg-green-100 text-green-700 border-green-300';
                statusText = 'Acima da Mediana';
                statusIcon = '↑';
              } else if (diferenca < -0.1) {
                statusColor = 'bg-yellow-50 text-yellow-600 border-yellow-200';
                statusText = 'Oportunidade de melhoria em relação à mediana';
                statusIcon = '↓';
              } else {
                statusColor = 'bg-gray-100 text-gray-800';
                statusText = 'Na Mediana';
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
                    <div className="text-xs font-bold mt-1">{valor.toFixed(2)}</div>
                    <div className="text-xs opacity-75 flex items-center justify-center gap-1">
                      <span>{statusIcon}</span>
                      <span>{statusText}</span>
                    </div>
                    <div className="text-xs opacity-60 mt-1 text-gray-500">
                      Mediana: {mediana.toFixed(2)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {showRadar && (
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
      )}

      {!isLoaded && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground text-center">
            <p>Carregando análise de maturidade...</p>
          </div>
        </div>
      )}
      {/* Fonte ABNT */}
      <div className="pt-2 text-right w-full">
        <span style={{ fontSize: '11px', color: '#64748b' }}>
          Fonte: BRASIL. Ministério da Saúde. Secretaria de Informação e Saúde Digital. Disponível em: <a href="https://www.gov.br/saude/pt-br/composicao/seidigi" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>https://www.gov.br/saude/pt-br/composicao/seidigi</a>.
        </span>
      </div>
    </div>
  );
}
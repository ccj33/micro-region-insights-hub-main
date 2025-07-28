import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { MicroRegionData } from "@/types/dashboard";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface BarChartComponentProps {
  data: MicroRegionData[];
  selectedMicroregiao: string;
  macroFiltro?: string;
  onLoad?: () => void;
}

export function BarChartComponent({ data, selectedMicroregiao, macroFiltro, onLoad }: BarChartComponentProps) {
  useEffect(() => {
    // Simular carregamento do gráfico
    const timer = setTimeout(() => {
      onLoad?.();
    }, 300);

    return () => clearTimeout(timer);
  }, [onLoad]);

  // Debug: verificar se há dados
  // console.log('BarChartComponent - Dados recebidos:', data?.length, 'Microrregião selecionada:', selectedMicroregiao);
  // console.log('BarChartComponent - Primeiros dados:', data?.slice(0, 3));

  const chartData = data
    .map(item => {
      // Tratamento robusto do índice geral
      let indice = 0;
      if (item.indice_geral) {
        const cleanValue = String(item.indice_geral).replace(/[,]/g, '.').replace(/[^\d.]/g, '');
        indice = parseFloat(cleanValue) || 0;
      }
      
      return {
        microrregiao: item.microrregiao,
        indice: indice,
        isSelected: item.microrregiao === selectedMicroregiao
      };
    })
    .filter(item => item.indice > 0) // Filtrar apenas itens com índice válido
    .sort((a, b) => b.indice - a.indice);

  // Verificar se há dados para exibir
  if (!chartData || chartData.length === 0) {
    return (
      <div data-section="barras" className="bg-card rounded-lg border p-6 shadow-sm" style={{ width: '100%', height: '500px', position: 'relative' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-blue-600 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Nenhum Dado Disponível</h3>
            <p className="text-blue-700">Não há dados para exibir no gráfico de barras.</p>
            <p className="text-sm text-blue-600 mt-2">Verifique os filtros aplicados.</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isSelected = data.isSelected;
      
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-xl">
          <div className="mb-3">
            <h4 className="font-semibold text-foreground text-base mb-1">{label}</h4>
            {isSelected && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                Microrregião Selecionada
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Índice de Maturidade:</span>
              <span className="text-lg font-bold text-primary">
                {payload[0].value.toFixed(3)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Classificação:</span>
              <span className="text-sm font-medium text-foreground">
                {getClassificationLevel(payload[0].value)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Percentual:</span>
              <span className="text-sm font-medium text-foreground">
                {(payload[0].value * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              💡 {isSelected ? 'Microrregião atualmente selecionada' : 'Clique para selecionar esta microrregião'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getClassificationLevel = (value: number) => {
    if (value > 0.66) return 'Avançado';
    if (value > 0.33) return 'Em Evolução';
    return 'Emergente';
  };

  return (
    <div data-section="barras" className="bg-card rounded-lg border p-4 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-foreground">Ranking de Maturidade Digital</h2>
        {macroFiltro && (
          <p className="text-xs sm:text-sm text-muted-foreground">Macrorregião: {macroFiltro}</p>
        )}
      </div>

      {/* Legenda Estática */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm mb-4 p-2 bg-muted rounded-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-yellow-400 border border-yellow-500"></div>
          <span>Microrregião Selecionada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500 border border-blue-600"></div>
          <span>Outras Microrregiões</span>
        </div>
      </div>

      <div className="w-full h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="microrregiao" 
              hide={true}
            />
            <YAxis 
              domain={[0, 1]}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="indice" 
              radius={[2, 2, 0, 0]}
              stroke="hsl(var(--border))"
              strokeWidth={1}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isSelected ? 'hsl(45, 95%, 55%)' : 'hsl(220, 85%, 60%)'}
                  stroke={entry.isSelected ? 'hsl(45, 90%, 45%)' : 'hsl(220, 90%, 50%)'}
                  strokeWidth={entry.isSelected ? 1 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="pt-2 text-right w-full">
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          Fonte: Ministério da Saúde/SEIDIGI
        </span>
      </div>
    </div>
  );
} 
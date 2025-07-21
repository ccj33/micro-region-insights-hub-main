import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { MicroRegionData } from "@/types/dashboard";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface BarChartComponentProps {
  data: MicroRegionData[];
  selectedMicroregiao: string;
  onLoad?: () => void;
}

export function BarChartComponent({ data, selectedMicroregiao, onLoad }: BarChartComponentProps) {
  useEffect(() => {
    // Simular carregamento do gráfico
    const timer = setTimeout(() => {
      onLoad?.();
    }, 300);

    return () => clearTimeout(timer);
  }, [onLoad]);

  const chartData = data
    .map(item => ({
      microrregiao: item.microrregiao,
      indice: parseFloat(String(item.indice_geral).replace(',', '.')),
      isSelected: item.microrregiao === selectedMicroregiao
    }))
    .sort((a, b) => b.indice - a.indice);

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
    if (value >= 0.8) return 'Consolidado';
    if (value >= 0.5) return 'Em Evolução';
    if (value >= 0.2) return 'Emergente';
    return 'Inicial';
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey="microrregiao" 
          hide={true}
        />
        <YAxis 
          domain={[0, 1]}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="indice" 
          radius={[4, 4, 0, 0]}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.isSelected ? 'hsl(45, 100%, 50%)' : 'hsl(220, 80%, 50%)'}
              stroke={entry.isSelected ? 'hsl(45, 90%, 40%)' : 'hsl(220, 90%, 40%)'}
              strokeWidth={entry.isSelected ? 2 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
} 
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
    if (value >= 0.8) return 'Avançado';
    if (value >= 0.5) return 'Em Evolução';
    if (value >= 0.2) return 'Emergente';
    return 'Emergente';
  };

  return (
    <div data-section="bar" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {selectedMicroregiao && (
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '6px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontWeight: 600, fontSize: 16, color: '#1e3a8a', textAlign: 'center' }}>
          {selectedMicroregiao}
          <div style={{ fontWeight: 400, fontSize: 13, color: '#666', marginTop: 2 }}>
            Macrorregião: <strong>{macroFiltro || 'Todas'}</strong>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', top: 24, right: 8, zIndex: 9, background: 'rgba(255,255,255,0.92)', borderRadius: 6, padding: '6px 10px 6px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', fontSize: 12, color: '#444', textAlign: 'left', minWidth: 200, maxWidth: 260 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 2, background: '#3b82f6', border: '1px solid #2563eb' }}></span>
              <span style={{ fontWeight: 500, color: '#222', fontSize: 11 }}>Outras Microrregiões</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 2, background: '#fde047', border: '1px solid #facc15' }}></span>
              <span style={{ fontWeight: 500, color: '#222', fontSize: 11 }}>Microrregião Selecionada</span>
            </span>
          </div>
          <div style={{ fontWeight: 500, color: '#eab308', marginBottom: 1, fontSize: 11 }}>Dica:</div>
          <div style={{ fontSize: 11, color: '#444', lineHeight: 1.2 }}>
            Quanto mais alta a barra, melhor.<br />
            A barra amarela é a selecionada.
          </div>
        </div>
      </div>
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
    </div>
  );
} 
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
  console.log('BarChartComponent - Dados recebidos:', data?.length, 'Microrregião selecionada:', selectedMicroregiao);
  console.log('BarChartComponent - Primeiros dados:', data?.slice(0, 3));

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
    if (value >= 0.8) return 'Avançado';
    if (value >= 0.5) return 'Em Evolução';
    if (value >= 0.2) return 'Emergente';
    return 'Emergente';
  };

  return (
    <div data-section="barras" className="bg-card rounded-lg border p-6 shadow-sm" style={{ width: '100%', height: '500px', position: 'relative' }}>
      {selectedMicroregiao && (
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '6px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontWeight: 600, fontSize: 16, color: '#1e3a8a', textAlign: 'center' }}>
          {selectedMicroregiao}
          <div style={{ fontWeight: 400, fontSize: 13, color: '#666', marginTop: 2 }}>
            Macrorregião: <strong>{macroFiltro || 'Todas'}</strong>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', top: 24, right: 8, zIndex: 9, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12, color: '#444', textAlign: 'left', minWidth: 220, maxWidth: 280, border: '1px solid rgba(0,0,0,0.1)' }}>
        <div>
          <div style={{ fontWeight: 600, color: '#1e3a8a', marginBottom: 8, fontSize: 13, textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>
            Legenda do Ranking
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#3b82f6', border: '2px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}></span>
              <span style={{ fontWeight: 500, color: '#222', fontSize: 11 }}>Outras Microrregiões</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#fde047', border: '2px solid #facc15', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}></span>
              <span style={{ fontWeight: 500, color: '#222', fontSize: 11 }}>Microrregião Selecionada</span>
            </span>
          </div>
          <div style={{ fontWeight: 600, color: '#eab308', marginBottom: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            💡 Dica:
          </div>
          <div style={{ fontSize: 11, color: '#444', lineHeight: 1.3 }}>
            Quanto mais alta a barra, melhor a maturidade digital.<br />
            A barra amarela representa sua microrregião selecionada.
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
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
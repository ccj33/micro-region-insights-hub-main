import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { MicroRegionData } from "@/types/dashboard";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface PopulationChartComponentProps {
  data: MicroRegionData[];
  selectedMicroregiao?: string;
  onLoad?: () => void;
}

export function PopulationChartComponent({ data, selectedMicroregiao, onLoad }: PopulationChartComponentProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    // Simular carregamento do gráfico
    const timer = setTimeout(() => {
      onLoad?.();
    }, 400);

    return () => clearTimeout(timer);
  }, [onLoad]);

  // Categorizar por faixas de população
  const categorizePopulation = (pop: number) => {
    if (pop < 30000) return 'Pequena (< 30 mil)';
    if (pop < 60000) return 'Média (30 mil a 60 mil)';
    if (pop < 100000) return 'Grande (60 mil a 100 mil)';
    return 'Muito Grande (> 100 mil)';
  };

  const chartData = data.reduce((acc, item) => {
    const population = parseInt(String(item.populacao).replace(/\./g, ''));
    const category = categorizePopulation(population);
    
    const existing = acc.find(item => item.category === category);
    if (existing) {
      existing.count += 1;
      existing.totalPop += population;
      existing.microrregioes.push(item.microrregiao);
    } else {
      acc.push({
        category,
        count: 1,
        totalPop: population,
        microrregioes: [item.microrregiao]
      });
    }
    return acc;
  }, [] as Array<{ category: string; count: number; totalPop: number; microrregioes: string[] }>);

  // Encontrar a microrregião selecionada
  const selectedData = selectedMicroregiao ? data.find(item => item.microrregiao === selectedMicroregiao) : null;
  const selectedCategory = selectedData ? categorizePopulation(parseInt(String(selectedData.populacao).replace(/\./g, ''))) : null;

  // Cores fixas para cada categoria, alinhadas com a legenda
  const CATEGORY_COLORS: Record<string, string> = {
    'Pequena (< 30 mil)': '#e5e7eb', // cinza claro
    'Média (30 mil a 60 mil)': '#10b981', // verde vibrante
    'Grande (60 mil a 100 mil)': '#8b5cf6', // roxo vibrante
    'Muito Grande (> 100 mil)': '#1e40af', // azul escuro
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.category}</p>
          <p className="text-primary">Microrregiões: {data.count}</p>
          <p className="text-muted-foreground text-sm">
            Pop. Total: {data.totalPop.toLocaleString('pt-BR')}
          </p>
          {selectedMicroregiao && data.microrregioes.includes(selectedMicroregiao) && (
            <p className="text-primary text-sm mt-1">
              ✓ Inclui {selectedMicroregiao}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Ordem fixa das categorias
  const POPULATION_ORDER = [
    'Pequena (< 30 mil)',
    'Média (30 mil a 60 mil)',
    'Grande (60 mil a 100 mil)',
    'Muito Grande (> 100 mil)'
  ];

  // Preparar dados para o gráfico de pirâmide, já ordenados
  const pyramidData = POPULATION_ORDER
    .map(category => {
      const item = chartData.find(i => i.category === category);
      return item
        ? {
            category: item.category,
            count: item.count,
            percent: Math.round((item.count / data.length) * 100),
            isSelected: selectedCategory === item.category
          }
        : null;
    })
    .filter(Boolean);

  return (
    <div data-section="population" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {selectedMicroregiao && selectedData && (
        <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '6px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontWeight: 600, fontSize: 16, color: '#1e3a8a', textAlign: 'center' }}>
          {selectedMicroregiao}
          <div style={{ fontWeight: 400, fontSize: 13, color: '#666', marginTop: 2 }}>
            Macrorregião: <strong>{selectedData.macrorregiao || 'Todas'}</strong>
          </div>
        </div>
      )}
      {/* Legenda customizada dentro do gráfico */}
      <div style={{ position: 'absolute', top: 30, right: 40, zIndex: 10, background: 'rgba(255,255,255,0.85)', borderRadius: 8, padding: '6px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontSize: '12px', minWidth: 160 }}>
        <ul className="space-y-1 text-xs">
          {POPULATION_ORDER.map((category, idx) => {
            const entry = pyramidData.find(e => e.category === category);
            if (!entry) return null;
            return (
              <li key={category} className="flex items-center gap-2">
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: CATEGORY_COLORS[category] || '#bdbdbd', border: entry.isSelected ? '2px solid #1e3a8a' : '1px solid #ccc' }}></span>
                <span className={entry.isSelected ? 'font-semibold text-blue-900' : ''} style={{ fontSize: '12px' }}>
                  {entry.isSelected && <span role="img" aria-label="pin">📍</span>}
                  {category}
                  {entry.isSelected && <span className="ml-1 text-xs text-blue-900">(Sua microrregião)</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={pyramidData}
          layout="vertical"
          margin={{ top: 30, right: 60, left: 40, bottom: 20 }}
          barCategoryGap={20}
        >
          <XAxis type="number" hide domain={[0, Math.max(...pyramidData.map(d => d.count)) * 1.1]} />
          <YAxis type="category" dataKey="category" tick={{ fontSize: 13 }} width={120} />
          <Tooltip
            cursor={{ fill: 'rgba(30,58,138,0.07)' }}
            formatter={(value, name, props) => [`${value} microrregiões (${props.payload.percent}%)`, '']}
          />
          <Bar dataKey="count" radius={6} onMouseLeave={() => setHoveredBar(null)}>
            {pyramidData.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={
                  hoveredBar === idx
                    ? CATEGORY_COLORS[entry.category] || '#bdbdbd'
                    : CATEGORY_COLORS[entry.category] || '#bdbdbd'
                }
                onMouseEnter={() => setHoveredBar(idx)}
                style={{
                  opacity: entry.isSelected ? 0.9 : 1,
                  stroke: entry.isSelected ? '#1e3a8a' : 'none',
                  strokeWidth: entry.isSelected ? 2 : 0
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 
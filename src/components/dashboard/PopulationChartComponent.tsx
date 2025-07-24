import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';
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

  // Nova paleta de cores suaves
  const CATEGORY_COLORS: Record<string, string> = {
    'Pequena (< 30 mil)': '#cbd5e1', // cinza-azulado
    'Média (30 mil a 60 mil)': '#38bdf8', // azul claro
    'Grande (60 mil a 100 mil)': '#a78bfa', // lilás
    'Muito Grande (> 100 mil)': '#0ea5e9', // azul vibrante
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
    <div data-section="populacao" className="bg-card rounded-lg border p-6 shadow-lg" style={{ width: '100%', height: '100%', position: 'relative', minHeight: 400 }}>
      {selectedMicroregiao && selectedData && (
        <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '6px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontWeight: 600, fontSize: 16, color: '#1e3a8a', textAlign: 'center' }}>
          {selectedMicroregiao}
          <div style={{ fontWeight: 400, fontSize: 13, color: '#666', marginTop: 2 }}>
            Macrorregião: <strong>{selectedData.macrorregiao || 'Todas'}</strong>
          </div>
        </div>
      )}
      {/* Legenda integrada ao card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 mt-2">
        <div className="font-semibold text-blue-900 text-base">Distribuição Populacional</div>
        <ul className="flex flex-wrap gap-4 text-xs">
          {POPULATION_ORDER.map((category, idx) => {
            const entry = pyramidData.find(e => e.category === category);
            if (!entry) return null;
            return (
              <li key={category} className="flex items-center gap-2">
                <span style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  background: CATEGORY_COLORS[category] || '#bdbdbd',
                  border: entry.isSelected ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                  boxShadow: entry.isSelected ? '0 2px 8px #0ea5e955' : '0 1px 3px rgba(0,0,0,0.08)'
                }}></span>
                <span className={entry.isSelected ? 'font-bold text-sky-700' : 'text-gray-700'} style={{ fontSize: '12px' }}>
                  {entry.isSelected && <span role="img" aria-label="pin" style={{ marginRight: 4 }}>📍</span>}
                  {category}
                  {entry.isSelected && <span className="ml-1 text-xs text-sky-700 font-medium">(Sua microrregião)</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={pyramidData}
          layout="vertical"
          margin={{ top: 10, right: 60, left: 40, bottom: 10 }}
          barCategoryGap={32}
        >
          <XAxis type="number" hide domain={[0, Math.max(...pyramidData.map(d => d.count)) * 1.1]} />
          <YAxis type="category" dataKey="category" tick={{ fontSize: 13 }} width={120} />
          <Tooltip
            cursor={{ fill: 'rgba(14,165,233,0.07)' }}
            content={<CustomTooltip />}
            formatter={(value, name, props) => [`${value} microrregiões (${props.payload.percent}%)`, '']}
          />
          <Bar dataKey="count" radius={10} onMouseLeave={() => setHoveredBar(null)}>
            <LabelList dataKey="count" position="right" formatter={(v:number) => `${v} microrreg.`} fill="#0f172a" fontSize={13} fontWeight={700} />
            {pyramidData.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={CATEGORY_COLORS[entry.category] || '#bdbdbd'}
                onMouseEnter={() => setHoveredBar(idx)}
                style={{
                  opacity: entry.isSelected ? 0.95 : 1,
                  stroke: entry.isSelected ? '#0ea5e9' : 'none',
                  strokeWidth: entry.isSelected ? 3 : 0,
                  filter: entry.isSelected ? 'drop-shadow(0 2px 8px #0ea5e955)' : 'drop-shadow(0 1px 3px #64748b22)'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 
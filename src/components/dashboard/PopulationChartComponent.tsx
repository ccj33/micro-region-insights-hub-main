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
            Pop. Total: {typeof data.totalPop === 'number' ? data.totalPop.toLocaleString('pt-BR') : '-'}
          </p>
          {selectedMicroregiao && Array.isArray(data.microrregioes) && data.microrregioes.includes(selectedMicroregiao) && (
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
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '6px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontWeight: 600, fontSize: 16, color: '#1e3a8a', textAlign: 'center' }}>
          <div style={{ fontWeight: 400, fontSize: 13, color: '#666', marginBottom: 2 }}>
            Macrorregião: <strong>{selectedData.macrorregiao || 'Todas'}</strong>
          </div>
          <div style={{ fontWeight: 600, fontSize: 16, color: '#1e3a8a' }}>{selectedMicroregiao}</div>
        </div>
      )}
      {/* Legenda compacta */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 mb-2 mt-2">
        <ul className="flex flex-wrap gap-2 text-xs sm:justify-end justify-center">
          {POPULATION_ORDER.map((category, idx) => {
            const entry = pyramidData.find(e => e.category === category);
            if (!entry) return null;
            return (
              <li key={category} className="flex items-center gap-1">
                <span style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: CATEGORY_COLORS[category] || '#bdbdbd',
                  border: entry.isSelected ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                  boxShadow: entry.isSelected ? '0 1px 4px #0ea5e955' : '0 1px 2px rgba(0,0,0,0.08)'
                }}></span>
                <span className={entry.isSelected ? 'font-bold text-sky-700' : 'text-gray-700'} style={{ fontSize: '11px' }}>
                  {category}
                  {entry.isSelected && <span className="ml-1 text-xs text-sky-700 font-medium">(Sua microrregião)</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="font-semibold text-blue-900 text-base mb-2">Distribuição Populacional</div>
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
            <LabelList 
              dataKey="count" 
              position="right" 
              content={(props) => {
                const { x, y, value, index } = props;
                const entry = pyramidData[index];
                if (!entry) return null;
                const xNum = typeof x === 'number' ? x : 0;
                const yNum = typeof y === 'number' ? y : 0;
                if (entry.isSelected) {
                  return (
                    <g>
                      <rect
                        x={xNum + 4}
                        y={yNum - 6}
                        width={120}
                        height={32}
                        rx={6}
                        fill="#fff"
                        opacity={0.92}
                      />
                      <text
                        x={xNum + 12}
                        y={yNum + 8}
                        fill="#0ea5e9"
                        fontWeight={900}
                        fontSize={15}
                      >
                        {value} microrreg.
                      </text>
                      <text
                        x={xNum + 12}
                        y={yNum + 24}
                        fill="#0ea5e9"
                        fontWeight={700}
                        fontSize={12}
                      >
                        (Sua microrregião)
                      </text>
                    </g>
                  );
                }
                return (
                  <text
                    x={xNum + 8}
                    y={yNum + 10}
                    fill="#0f172a"
                    fontWeight={700}
                    fontSize={13}
                  >
                    {value} microrreg.
                  </text>
                );
              }}
            />
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
      <div className="pt-2 text-right w-full">
        <span style={{ fontSize: '11px', color: '#64748b' }}>
          Fonte: BRASIL. Instituto Brasileiro de Geografia e Estatística – IBGE. Censo Demográfico 2022. Disponível em: <a href="https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html</a>.
        </span>
      </div>
    </div>
  );
}

export default PopulationChartComponent;
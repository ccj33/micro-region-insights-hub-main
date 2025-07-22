import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { MicroRegionData, EIXOS_NAMES } from "@/types/dashboard";
import { useState, useEffect } from "react";

interface RadarChartComponentProps {
  data: MicroRegionData;
  medians: Record<string, number>;
  onNavigateToRecommendations?: (eixoIndex: number) => void;
  onLoad?: () => void;
  hoveredEixo?: number | null;
  setHoveredEixo?: (index: number | null) => void;
}

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Reorganizar payload para a ordem desejada
    const reorderedPayload = payload.sort((a: any, b: any) => {
      const order = {
        'Microrregião': 1,
        'Mediana Geral': 2,
        'Emergente': 3,
        'Em Evolução': 4,
        'Avançado': 5
      };
      return (order[a.name as keyof typeof order] || 999) - (order[b.name as keyof typeof order] || 999);
    });

    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow-lg max-w-xs">
        <p className="font-bold text-blue-800 text-sm mb-3 border-b border-blue-200 pb-2">{label}</p>
        
        <div className="space-y-2 text-xs">
          {reorderedPayload.map((entry: any, index: number) => {
            let description = '';
            let colorClass = '';
            
            // Definir descrições e cores baseadas no nome da série
            switch(entry.name) {
              case 'Microrregião':
                description = 'Valor atual da microrregião selecionada';
                colorClass = 'text-blue-600 font-bold';
                break;
              case 'Mediana Geral':
                description = 'Valor médio de todas as microrregiões';
                colorClass = 'text-green-700 font-bold';
                break;
              case 'Emergente':
                description = 'Nível básico de maturidade (0-30%)';
                colorClass = 'text-red-600';
                break;
              case 'Em Evolução':
                description = 'Nível intermediário (31-70%)';
                colorClass = 'text-yellow-600';
                break;
              case 'Avançado':
                description = 'Nível alto de maturidade (71-100%)';
                colorClass = 'text-green-600';
                break;
              default:
                description = '';
                colorClass = 'text-gray-700';
            }
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium">{entry.name}:</span>
                  </span>
                  <span className={`font-semibold ${colorClass}`}>
                    {(entry.value * 100).toFixed(1)}%
                  </span>
                </div>
                {description && (
                  <div className="text-gray-600 text-xs ml-5">
                    {description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function RadarChartComponent({ data, medians, onNavigateToRecommendations, onLoad, hoveredEixo, setHoveredEixo }: RadarChartComponentProps) {
  const [currentHoveredEixo, setCurrentHoveredEixo] = useState<number | null>(null);
  // Usar o hoveredEixo externo se fornecido, senão usar o interno
  const currentSetHoveredEixo = setHoveredEixo || setCurrentHoveredEixo;
  const currentHoveredEixoValue = hoveredEixo !== undefined ? hoveredEixo : currentHoveredEixo;

  // Chamar onLoad quando o componente montar
  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Preparar dados do gráfico com tratamento robusto
  const chartData = EIXOS_NAMES.map((nome, index) => {
    const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
    const valorRaw = data[eixoKey];
    
    // Tratamento robusto dos valores
    let valor = 0;
    if (valorRaw !== undefined && valorRaw !== null) {
      if (typeof valorRaw === 'string') {
        // Remove vírgulas e converte para número
        const cleanValue = valorRaw.replace(/[,]/g, '.');
        valor = parseFloat(cleanValue) || 0;
      } else if (typeof valorRaw === 'number') {
        valor = valorRaw;
      }
    }
    
    const mediana = medians[eixoKey] || 0;
    
    return {
      eixo: `Eixo ${index + 1} - ${nome}`,
      'Microrregião': valor,
      'Mediana Geral': mediana,
      'Emergente': 0.2,
      'Em Evolução': 0.5,
      'Avançado': 0.8,
    };
  });

  // Dados modificados que só mostram o ponto específico do eixo
  const modifiedData = chartData.map((item, index) => {
    if (index === currentHoveredEixoValue) {
      return item;
    }
    return {
      ...item,
      'Microrregião': 0,
      'Mediana Geral': item['Mediana Geral'], // Manter mediana sempre visível
      'Emergente': item['Emergente'], // Manter linhas pontilhadas sempre visíveis
      'Em Evolução': item['Em Evolução'], // Manter linhas pontilhadas sempre visíveis
      'Avançado': item['Avançado'], // Manter linhas pontilhadas sempre visíveis
    };
  });

  // Navegação para recomendações
  const handleEixoClick = (eixoIndex: number) => {
    if (onNavigateToRecommendations) {
      onNavigateToRecommendations(eixoIndex);
    }
  };

  // Componente personalizado para os pontos clicáveis
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    return (
      <g>
        {/* Círculo de fundo para hover */}
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="transparent"
          className="cursor-pointer"
          onMouseEnter={(e) => {
            e.currentTarget.style.fill = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.r = '12';
            currentSetHoveredEixo(index);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.fill = 'transparent';
            e.currentTarget.style.r = '8';
            currentSetHoveredEixo(null);
          }}
          onClick={() => handleEixoClick(index)}
        />
        {/* Ponto principal - apenas azul sem amarelo */}
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="hsl(var(--chart-primary))"
          stroke="hsl(var(--background))"
          strokeWidth={2}
          className="cursor-pointer"
          onClick={() => handleEixoClick(index)}
        />
      </g>
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Legenda customizada dentro do gráfico */}
      <div className="absolute top-4 right-4 bg-white/90 rounded-lg shadow-md p-3 z-10 text-xs flex flex-col gap-2 border border-blue-100">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span>Microrregião</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
          <span>Mediana Geral</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-red-500 border-dashed inline-block" />
          <span>Emergente (0.2)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-blue-500 border-dashed inline-block" />
          <span>Em Evolução (0.5)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-emerald-500 border-dashed inline-block" />
          <span>Avançado (0.8)</span>
        </div>
      </div>
      <div
      >
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart 
            data={currentHoveredEixoValue !== null ? modifiedData : chartData} 
            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
          >
            <Tooltip content={<CustomTooltip />} />
            <PolarGrid 
              stroke="hsl(var(--border))" 
              strokeWidth={1}
              className="opacity-50"
            />
            <PolarAngleAxis 
              dataKey="eixo" 
              tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
              className="text-xs"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 1]} 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickCount={6}
            />
            {/* Linhas de referência com cor dinâmica */}
            <Radar
              name="Emergente"
              dataKey="Emergente"
              stroke="hsl(0, 70%, 50%)"
              fill="transparent"
              strokeWidth={0.3}
              strokeDasharray="1 1"
              dot={{ r: 0.5, fill: "hsl(0, 70%, 50%)" }}
            />
            <Radar
              name="Em Evolução"
              dataKey="Em Evolução"
              stroke="hsl(45, 100%, 50%)"
              fill="transparent"
              strokeWidth={0.3}
              strokeDasharray="1 1"
              dot={{ r: 0.5, fill: "hsl(45, 100%, 50%)" }}
            />
            <Radar
              name="Avançado"
              dataKey="Avançado"
              stroke="hsl(120, 70%, 40%)"
              fill="transparent"
              strokeWidth={0.3}
              strokeDasharray="1 1"
              dot={{ r: 0.5, fill: "hsl(120, 70%, 40%)" }}
            />
            {/* Dados principais */}
            <Radar
              name="Microrregião"
              dataKey="Microrregião"
              stroke="hsl(220, 80%, 50%)"
              fill="hsl(220, 80%, 50%)"
              fillOpacity={0.3}
              strokeWidth={4}
              dot={<CustomDot />}
            />
            
            {/* Mediana Geral */}
            <Radar
              name="Mediana Geral"
              dataKey="Mediana Geral"
              stroke="hsl(160, 70%, 40%)"
              fill="transparent"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(160, 70%, 40%)" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 
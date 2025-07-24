import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { MicroRegionData, EIXOS_NAMES } from "@/types/dashboard";
import { useState, useEffect } from "react";
import React from "react";

interface RadarChartComponentProps {
  data: MicroRegionData;
  medians: Record<string, number>;
  onNavigateToRecommendations?: (eixoIndex: number) => void;
  onLoad?: () => void;
  hoveredEixo?: number | null;
  setHoveredEixo?: (index: number | null) => void;
}

// Tooltip personalizado inteligente
const CustomTooltip = (props: any) => {
  const { active, payload, label, coordinate, chartWidth, chartHeight } = props;
  if (active && payload && payload.length && coordinate) {
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

    // Tamanho do tooltip
    const TOOLTIP_WIDTH = 320;
    const TOOLTIP_HEIGHT = 220;
    // Posição do mouse
    let x = coordinate.x;
    let y = coordinate.y;
    // Ajuste para não sair da tela
    const padding = 16;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    // Preferir direita/abaixo, mas ajustar se necessário
    if (x + TOOLTIP_WIDTH + padding > winW) x = winW - TOOLTIP_WIDTH - padding;
    if (y + TOOLTIP_HEIGHT + padding > winH) y = winH - TOOLTIP_HEIGHT - padding;
    if (x < padding) x = padding;
    if (y < padding) y = padding;

    return (
      <div
        className="bg-white border border-gray-200 rounded-lg p-4 shadow-xl max-w-xs"
        style={{
          position: 'fixed',
          left: x,
          top: y,
          zIndex: 9999,
          pointerEvents: 'none',
          width: TOOLTIP_WIDTH,
          maxWidth: '95vw',
          minWidth: 220,
        }}
      >
        <p className="font-bold text-gray-800 text-sm mb-3 border-b border-gray-200 pb-2">{label}</p>
        <div className="space-y-3 text-xs">
          {reorderedPayload.map((entry: any, index: number) => {
            let description = '';
            let colorClass = '';
            let icon = '';
            switch(entry.name) {
              case 'Microrregião':
                description = 'Valor atual da microrregião selecionada';
                colorClass = 'text-blue-600 font-bold';
                icon = '📍';
                break;
              case 'Mediana Geral':
                description = 'Valor médio de todas as microrregiões';
                colorClass = 'text-green-700 font-bold';
                icon = '📊';
                break;
              case 'Emergente':
                description = 'Nível básico de maturidade (≤ 0,33)';
                colorClass = 'text-red-600';
                icon = '🌱';
                break;
              case 'Em Evolução':
                description = 'Nível intermediário (0,33 - 0,66)';
                colorClass = 'text-yellow-600';
                icon = '📈';
                break;
              case 'Avançado':
                description = 'Nível alto de maturidade (> 0,66)';
                colorClass = 'text-green-600';
                icon = '🚀';
                break;
              default:
                description = '';
                colorClass = 'text-gray-700';
                icon = '•';
            }
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-2">{icon}</span>
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium">{entry.name}:</span>
                  </span>
                  <span className={`font-semibold ${colorClass}`}>
                    {entry.value.toFixed(2)}
                  </span>
                </div>
                {description && (
                  <div className="text-gray-600 text-xs ml-7">
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
      'Emergente': 0.33,
      'Em Evolução': 0.66,
      'Avançado': 1.0,
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

  // Função para calcular a posição ideal do tooltip
  const getTooltipPosition = (eixoIndex: number | null) => {
    // Posições relativas para 7 eixos (ajuste conforme necessário)
    // 0: topo, 1-2: direita, 3: baixo, 4-5: esquerda, 6: topo-esquerda
    if (eixoIndex === null) return undefined;
    const positions = [
      { x: 200, y: 60 },    // Eixo 1 (topo)
      { x: 370, y: 120 },   // Eixo 2 (direita superior)
      { x: 370, y: 260 },   // Eixo 3 (direita inferior)
      { x: 200, y: 340 },   // Eixo 4 (baixo)
      { x: 40, y: 260 },    // Eixo 5 (esquerda inferior)
      { x: 40, y: 120 },    // Eixo 6 (esquerda superior)
      { x: 120, y: 60 },    // Eixo 7 (topo-esquerda)
    ];
    return positions[eixoIndex] || { x: 200, y: 60 };
  };

  return (
    <div className="relative w-full h-full">
      {/* Legenda customizada dentro do gráfico */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10 text-xs border border-gray-200 min-w-[180px]">
        <div className="font-semibold text-gray-800 mb-3 text-center border-b border-gray-200 pb-2">
          Legenda do Gráfico
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-sm" />
            <span className="font-medium">Microrregião</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block shadow-sm" />
            <span className="font-medium">Mediana Geral</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-red-400 border-dashed inline-block" />
            <span>Emergente (≤ 0,33)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-yellow-500 border-dashed inline-block" />
            <span>Em Evolução (0,33 - 0,66)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-green-500 border-dashed inline-block" />
            <span>Avançado ({'>'} 0,66)</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart 
          data={currentHoveredEixoValue !== null ? modifiedData : chartData} 
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        >
            <Tooltip 
              content={<CustomTooltip />} 
            />
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
              stroke="#ef4444"
              fill="transparent"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={{ r: 1, fill: "#ef4444" }}
            />
            <Radar
              name="Em Evolução"
              dataKey="Em Evolução"
              stroke="#eab308"
              fill="transparent"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={{ r: 1, fill: "#eab308" }}
            />
            <Radar
              name="Avançado"
              dataKey="Avançado"
              stroke="#22c55e"
              fill="transparent"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={{ r: 1, fill: "#22c55e" }}
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
    );
} 
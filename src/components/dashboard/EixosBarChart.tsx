import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { EIXOS_NAMES } from "@/types/dashboard";
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface EixosBarChartProps {
  eixosValues: number[];
  microrregiao: string;
}

const getBarColor = (value: number) => {
  if (value > 0.66) return '#22c55e'; // Verde para Avançado
  if (value > 0.33) return '#3b82f6'; // Azul para Em Evolução
  return '#f97316'; // Laranja para Emergente
};

// Componente para renderizar o label customizado na barra
const CustomBarLabel = (props: any) => {
  const { x, y, width, value, payload } = props;
  
  // Verificação de segurança
  if (payload === undefined || value === undefined) {
    return null;
  }

  const { status } = payload;

  // Posição do texto e do indicador
  const textAnchorX = x + width + 15;
  const textY = y + 12;

  let indicator = null;
  if (status === 'best') {
    indicator = <circle cx={textAnchorX + 48} cy={textY - 4} r="5" fill="#22c55e" />;
  } else if (status === 'worst') {
    indicator = <circle cx={textAnchorX + 48} cy={textY - 4} r="5" fill="#facc15" />;
  }

  return (
    <g>
      <text x={textAnchorX} y={textY} fill="#333" textAnchor="start" fontSize={13} fontWeight="bold">
        {`${value.toFixed(1)}%`}
      </text>
      {indicator}
    </g>
  );
};

export function EixosBarChart({ eixosValues, microrregiao }: EixosBarChartProps) {
  const chartData = useMemo(() => {
    const data = EIXOS_NAMES.map((nome, index) => ({
      name: `Eixo ${index + 1}`,
      value: eixosValues[index] * 100,
      label: nome,
    })).sort((a, b) => b.value - a.value);

    // Adiciona status de 'best' e 'worst'
    return data.map((item, index) => {
      let status;
      // O melhor é o primeiro (após ordenar)
      if (index === 0) {
        status = 'best';
      }
      // Os 3 piores são os últimos
      if (index >= data.length - 3 && status !== 'best') {
        status = 'worst';
      }
      return { ...item, status, displayLabel: `${item.name}: ${item.label}` };
    });
  }, [eixosValues]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold">Análise por Eixos</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Visualização do desempenho de cada eixo para a microrregião de {microrregiao}.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 120, left: 120, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
              <YAxis 
                type="category" 
                dataKey="displayLabel" 
                width={220}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Pontuação"]}
                labelFormatter={(label) => <span className="font-bold">{label}</span>}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                <LabelList 
                  dataKey="value" 
                  position="right"
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  style={{ fontSize: 12, fontWeight: 'bold', fill: '#333' }}
                />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value / 100)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col items-center justify-center mt-4 space-y-2">
          {/* Legenda */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
              <span>Avançado (66%+)</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
              <span>Em Evolução (33-66%)</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-orange-500 mr-2"></span>
              <span>Emergente (0-33%)</span>
            </div>
          </div>
          {/* Fonte */}
          <p className="text-center text-xs text-muted-foreground italic pt-2">
            Fonte: Ministério da Saúde/SEIDIGI
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 
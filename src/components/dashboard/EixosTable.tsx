import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MicroRegionData, EIXOS_NAMES } from "@/types/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3 } from "lucide-react";
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface EixosTableProps {
  data: MicroRegionData;
  medians: Record<string, number>;
}

export function EixosTable({ data, medians }: EixosTableProps) {
  const tableData = EIXOS_NAMES.map((nome, index) => {
    const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
    const valor = parseFloat(String(data[eixoKey]).replace(',', '.'));
    const mediana = medians[eixoKey] || 0;
    const diferenca = valor - mediana;
    
    return {
      eixo: nome,
      valor: valor,
      mediana: mediana,
      diferenca: diferenca,
      performance: diferenca > 0.1 ? 'superior' : diferenca < -0.1 ? 'inferior' : 'média'
    };
  });

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'superior':
        return <Badge className="bg-green-600 text-white border-2 border-green-700">Acima da Mediana</Badge>;
      case 'inferior':
        return <Badge className="bg-red-600 text-white border-2 border-red-700">Abaixo da Mediana</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white border-2 border-gray-700">Na Mediana</Badge>;
    }
  };

  const getProgressBar = (valor: number) => {
    const percentage = valor * 100;
    
    // Definir cores e ícones baseados no nível de progresso
    let progressColor = 'bg-gray-400';
    let progressIcon = '🌱';
    let progressText = 'Iniciando';
    let progressDescription = 'Primeiros passos';
    
    if (percentage >= 80) {
      progressColor = 'bg-green-500';
      progressIcon = '🚀';
      progressText = 'Excelente';
      progressDescription = 'Nível avançado';
    } else if (percentage >= 60) {
      progressColor = 'bg-blue-500';
      progressIcon = '⚡';
      progressText = 'Bom';
      progressDescription = 'Bem desenvolvido';
    } else if (percentage >= 40) {
      progressColor = 'bg-yellow-500';
      progressIcon = '📈';
      progressText = 'Em Crescimento';
      progressDescription = 'Em desenvolvimento';
    } else if (percentage >= 20) {
      progressColor = 'bg-orange-500';
      progressIcon = '🌿';
      progressText = 'Básico';
      progressDescription = 'Estrutura inicial';
    } else {
      progressColor = 'bg-red-500';
      progressIcon = '🌱';
      progressText = 'Iniciando';
      progressDescription = 'Primeiros passos';
    }
    
    return (
      <div className="space-y-2">
        {/* Barra de progresso visual */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-1 min-w-[60px]">
            <span className="text-lg">{progressIcon}</span>
            <span className="text-xs font-bold text-gray-700">
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>
        
        {/* Informação adicional */}
        <div className="text-xs text-gray-600">
          <span className="font-medium">{progressText}</span>
          <span className="ml-1">• {progressDescription}</span>
        </div>
      </div>
    );
  };

  const [showEixos, setShowEixos] = useState(true);

  return (
    <div data-section="tabela">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
      <CardHeader className="pb-4 flex items-center gap-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Detalhamento por Eixos de Maturidade
        </CardTitle>
        <button className="ml-2 p-1 rounded hover:bg-muted transition-colors" onClick={() => setShowEixos(v => !v)} aria-label={showEixos ? 'Ocultar bloco' : 'Mostrar bloco'} type="button">
          {showEixos ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-primary" />}
        </button>
      </CardHeader>
      {showEixos && (
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[800px] sm:min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Eixo</TableHead>
                    <TableHead className="text-center">Valor</TableHead>
                    <TableHead className="text-center">Mediana</TableHead>
                    <TableHead className="text-center">Diferença</TableHead>
                    <TableHead className="text-center">Progresso</TableHead>
                    <TableHead className="text-center">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div>
                          <div className="text-sm font-semibold">{row.eixo}</div>
                          <div className="text-xs text-muted-foreground">Eixo {index + 1}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-lg font-bold text-primary">
                          {row.valor.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm text-muted-foreground">
                          {row.mediana.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-mono text-sm ${
                          row.diferenca > 0 ? 'text-success' : 
                          row.diferenca < 0 ? 'text-error' : 'text-muted-foreground'
                        }`}>
                          {row.diferenca > 0 ? '+' : ''}{row.diferenca.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getProgressBar(row.valor)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPerformanceBadge(row.performance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              📊 Como Interpretar o Progresso
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Nível Iniciando */}
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-1">🌱</div>
                <div className="font-semibold text-red-600 text-sm">Iniciando</div>
                <div className="text-xs text-gray-600">0-19%</div>
                <div className="text-xs text-gray-500 mt-1">Primeiros passos</div>
              </div>
              
              {/* Nível Básico */}
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-1">🌿</div>
                <div className="font-semibold text-orange-600 text-sm">Básico</div>
                <div className="text-xs text-gray-600">20-39%</div>
                <div className="text-xs text-gray-500 mt-1">Estrutura inicial</div>
              </div>
              
              {/* Nível Em Crescimento */}
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-1">📈</div>
                <div className="font-semibold text-yellow-600 text-sm">Em Crescimento</div>
                <div className="text-xs text-gray-600">40-59%</div>
                <div className="text-xs text-gray-500 mt-1">Em desenvolvimento</div>
              </div>
              
              {/* Nível Bom */}
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-1">⚡</div>
                <div className="font-semibold text-blue-600 text-sm">Bom</div>
                <div className="text-xs text-gray-600">60-79%</div>
                <div className="text-xs text-gray-500 mt-1">Bem desenvolvido</div>
              </div>
              
              {/* Nível Excelente */}
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-1">🚀</div>
                <div className="font-semibold text-green-600 text-sm">Excelente</div>
                <div className="text-xs text-gray-600">80-100%</div>
                <div className="text-xs text-gray-500 mt-1">Nível avançado</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>💡 Dica:</strong> Quanto mais próximo de 100%, mais maduro e desenvolvido está o eixo. 
                Valores acima de 80% indicam excelência, enquanto valores abaixo de 20% precisam de atenção prioritária.
              </div>
            </div>
            
            {/* Explicação da diferença entre Progresso e Performance */}
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                🎯 Diferença entre Progresso e Performance
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📊</span>
                    <span className="font-semibold text-green-700">Progresso</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>O que é:</strong> Nível de desenvolvimento do eixo (0-100%)
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <strong>Exemplo:</strong> 67% = bem desenvolvido, mas ainda pode melhorar
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <strong>Foco:</strong> Maturidade interna da microrregião
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🏆</span>
                    <span className="font-semibold text-green-700">Performance</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>O que é:</strong> Comparação com outras microrregiões
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <strong>Exemplo:</strong> "Acima da Mediana" = melhor que a maioria
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <strong>Foco:</strong> Posicionamento competitivo
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                <strong>🔍 Exemplo prático:</strong> Um eixo com 30% de progresso pode estar "Acima da Mediana" 
                se outras microrregiões tiverem apenas 20%. Ou um eixo com 80% pode estar "Abaixo da Mediana" 
                se outras tiverem 90%.
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
    </div>
  );
}
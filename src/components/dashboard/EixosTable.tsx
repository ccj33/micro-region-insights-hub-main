import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MicroRegionData, EIXOS_NAMES } from "@/types/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Eye, EyeOff, List, GalleryHorizontal, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface EixosTableProps {
  data: MicroRegionData;
  medians: Record<string, number>;
}

export function EixosTable({ data, medians }: EixosTableProps) {
  // Estados para controle da visualização
  const [viewMode, setViewMode] = useState<'list' | 'carousel'>('carousel');
  const [currentEixoIndex, setCurrentEixoIndex] = useState(0);

  // Funções de navegação do carrossel
  const handleNext = () => {
    setCurrentEixoIndex((prev) => (prev + 1) % EIXOS_NAMES.length);
  };

  const handlePrevious = () => {
    setCurrentEixoIndex((prev) => (prev - 1 + EIXOS_NAMES.length) % EIXOS_NAMES.length);
  };

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

  // Cálculo do resumo visual
  const resumo = tableData.reduce(
    (acc, row) => {
      if (row.performance === 'superior') acc.acima++;
      else if (row.performance === 'inferior') acc.abaixo++;
      else acc.mediana++;
      return acc;
    },
    { acima: 0, mediana: 0, abaixo: 0 }
  );

  // Legendas simples para tooltips
  const legendas = {
    eixo: 'Nome do eixo avaliado.',
    valor: 'Nota da sua região neste eixo (0 a 1).',
    mediana: 'Valor mediano das regiões analisadas.',
    diferenca: 'Quanto sua região está acima ou abaixo da mediana.',
    progresso: 'A porcentagem indica o quanto sua região já avançou neste eixo, de 0 a 100%. Quanto maior, mais desenvolvido está o tema na sua região.',
    performance: 'Comparação com a mediana nacional.'
  };

  const getPerformanceBadge = (performance: string) => {
    let label = '';
    let color = '';
    let tooltip = '';
    switch (performance) {
      case 'superior':
        label = 'Acima da Mediana';
        color = 'bg-green-600 text-white border-2 border-green-700';
        tooltip = 'Sua região está acima da mediana nacional neste eixo.';
        break;
      case 'inferior':
        label = 'Abaixo da Mediana';
        color = 'bg-orange-400 text-white border-2 border-orange-500';
        tooltip = 'Sua região está abaixo da mediana nacional neste eixo.';
        break;
      default:
        label = 'Na Mediana';
        color = 'bg-gray-600 text-white border-2 border-gray-700';
        tooltip = 'Sua região está na mediana nacional neste eixo.';
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} aria-label={label}>
              <Badge className={color}>{label}</Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
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
      progressColor = 'bg-yellow-400';
      progressIcon = '📈';
      progressText = 'Em Crescimento';
      progressDescription = 'Em desenvolvimento';
    } else if (percentage >= 20) {
      progressColor = 'bg-orange-400';
      progressIcon = '🌿';
      progressText = 'Básico';
      progressDescription = 'Estrutura inicial';
    } else {
      progressColor = 'bg-orange-400';
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

  // Função para renderizar uma linha da tabela
  const renderTableRow = (row: any, index: number) => (
    <TableRow key={index} className="hover:bg-muted/50">
      <TableCell className="font-medium">
        <div>
          <div className="text-headline font-semibold">{row.eixo}</div>
          <div className="text-caption-small text-muted-foreground">Eixo {index + 1}</div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className="text-mono text-lg font-bold text-primary">
          {row.valor.toFixed(2)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="text-mono text-sm text-muted-foreground">
          {row.mediana.toFixed(2)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className={`font-mono text-sm flex items-center justify-center gap-1 ${
          row.diferenca > 0 ? 'text-green-700' : 
          row.diferenca < 0 ? 'text-orange-500' : 'text-gray-500'
        }`}>
          {row.diferenca > 0 && <span aria-label="positivo" role="img">▲</span>}
          {row.diferenca < 0 && <span aria-label="negativo" role="img">▼</span>}
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
  );

  return (
    <div data-section="tabela">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
        <CardHeader className="pb-6">
          {/* Resumo visual no topo */}
          <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-base font-medium">
              <span className="flex items-center gap-1 text-green-700 bg-green-100 rounded-full px-3 py-1"><span aria-label="Acima" role="img">🌳</span> {resumo.acima} acima da mediana</span>
              <span className="flex items-center gap-1 text-blue-700 bg-blue-100 rounded-full px-3 py-1"><span aria-label="Na mediana" role="img">🌿</span> {resumo.mediana} na mediana</span>
              <span className="flex items-center gap-1 text-orange-700 bg-orange-100 rounded-full px-3 py-1"><span aria-label="Abaixo" role="img">🌱</span> {resumo.abaixo} abaixo da mediana</span>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Detalhamento por Eixos de Maturidade
              </CardTitle>
              <button className="ml-2 p-1 rounded hover:bg-muted transition-colors" onClick={() => setShowEixos(v => !v)} aria-label={showEixos ? 'Ocultar bloco' : 'Mostrar bloco'} type="button">
                {showEixos ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-primary" />}
              </button>
            </div>
            
            {/* Seletor de Visualização */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Modo de Visualização</span>
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(value) => value && setViewMode(value as 'list' | 'carousel')}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-md border-2 border-primary/20"
              >
                <ToggleGroupItem 
                  value="list" 
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 py-2 rounded-md transition-all duration-200"
                  aria-label="Visualização em lista"
                >
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span className="text-sm font-medium">Lista</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="carousel" 
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 py-2 rounded-md transition-all duration-200"
                  aria-label="Visualização em carrossel"
                >
                  <div className="flex items-center gap-2">
                    <GalleryHorizontal className="h-4 w-4" />
                    <span className="text-sm font-medium">Carrossel</span>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </CardHeader>
        {showEixos && (
          <CardContent>
            <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4" />
              <AlertTitle>Como Navegar</AlertTitle>
              <AlertDescription>
                <p>
                  Use as <strong className="font-semibold">setas</strong> para navegar entre os 7 eixos no modo <strong className="font-semibold">Carrossel</strong>,
                  ou alterne para o modo <strong className="font-semibold">Lista</strong> para ver todos de uma vez.
                </p>
                <p className="mt-2">
                  <strong>As porcentagens</strong> indicam o quanto sua região já avançou em cada eixo. Quanto mais próximo de 100%, mais perto está de atingir os objetivos propostos para aquele tema.
                </p>
              </AlertDescription>
            </Alert>
            {/* Renderização baseada no modo de visualização */}
            {viewMode === 'list' ? (
              <TooltipProvider>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[800px] sm:min-w-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">
                          <div className="flex items-center gap-1">
                            Eixo
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} aria-label="Legenda eixo"><Info className="h-4 w-4 text-blue-500 cursor-pointer" /></span>
                              </TooltipTrigger>
                              <TooltipContent>{legendas.eixo}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            Valor
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} aria-label="Legenda valor"><Info className="h-4 w-4 text-blue-500 cursor-pointer" /></span>
                              </TooltipTrigger>
                              <TooltipContent>{legendas.valor}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            Mediana
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} aria-label="Legenda mediana"><Info className="h-4 w-4 text-blue-500 cursor-pointer" /></span>
                              </TooltipTrigger>
                              <TooltipContent>{legendas.mediana}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            Diferença
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} aria-label="Legenda diferença"><Info className="h-4 w-4 text-blue-500 cursor-pointer" /></span>
                              </TooltipTrigger>
                              <TooltipContent>{legendas.diferenca}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            Progresso
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} aria-label="Legenda progresso"><Info className="h-4 w-4 text-blue-500 cursor-pointer" /></span>
                              </TooltipTrigger>
                              <TooltipContent>{legendas.progresso}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            Performance
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0} aria-label="Legenda performance"><Info className="h-4 w-4 text-blue-500 cursor-pointer" /></span>
                              </TooltipTrigger>
                              <TooltipContent>{legendas.performance}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((row, index) => renderTableRow(row, index))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              </TooltipProvider>
            ) : (
              // Visualização em Carrossel
              <div className="relative">
                {/* Contador */}
                <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <span className="text-sm font-semibold text-primary">
                    Eixo <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center justify-center">{currentEixoIndex + 1}</span> de {EIXOS_NAMES.length}
                  </span>
                </div>
              </div>
                
                {/* Navegação */}
                <div className="flex items-center gap-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevious}
                    className="flex-shrink-0 h-12 w-12 shadow-md hover:shadow-lg transition-all duration-200 border-blue-500"
                    aria-label="Eixo anterior"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <div className="flex-1">
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
                            {renderTableRow(tableData[currentEixoIndex], currentEixoIndex)}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    className="flex-shrink-0 h-12 w-12 shadow-md hover:shadow-lg transition-all duration-200 border-blue-500"
                    aria-label="Próximo eixo"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { MicroRegionData, EIXOS_NAMES } from "@/types/dashboard";
import { TrendingUp, TrendingDown, Minus, Target, Users, BarChart3, Award } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface AdvancedAnalysisProps {
  data: MicroRegionData[];
  selectedMicroregiao: string;
  medians: Record<string, number>;
}

// Tooltip personalizado para comparação
const ComparisonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Ordenar os itens conforme solicitado
    const order = [
      'Selecionada',
      'Comparação',
      'Mediana',
      'Emergente',
      'Em Evolução',
      'Avançado',
    ];
    // Mapear para facilitar acesso ao valor
    const payloadMap = Object.fromEntries(payload.map((entry: any) => [entry.name, entry]));
    const ponto = payload[0]?.payload;
    return (
      <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-lg max-w-xs">
        <p className="font-bold text-blue-800 text-sm mb-3 border-b border-blue-200 pb-2">{label}</p>
        <div className="space-y-2 text-xs">
          {order.map((name) => {
            const entry = payloadMap[name];
            if (!entry) return null;
            let displayName = name;
            if (name === 'Selecionada') displayName = ponto?.microrregiaoSelecionada || name;
            if (name === 'Comparação') displayName = ponto?.microrregiaoComparacao || name;
            return (
              <div key={name} className="flex items-center justify-between">
                <span className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium">{displayName}:</span>
                </span>
                <span className="font-semibold text-blue-600">
                  {Number(entry.value).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function AdvancedAnalysis({ data, selectedMicroregiao, medians }: AdvancedAnalysisProps) {
  const [comparisonRegion, setComparisonRegion] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<'radar' | 'bar' | 'summary'>('radar');

  // Dados da microrregião selecionada
  const selectedData = useMemo(() => {
    return data.find(item => item.microrregiao === selectedMicroregiao);
  }, [selectedMicroregiao, data]);

  // Dados da região de comparação
  const comparisonData = useMemo(() => {
    return data.find(item => item.microrregiao === comparisonRegion);
  }, [comparisonRegion, data]);

  // Lista de microrregiões disponíveis para comparação
  const availableRegions = useMemo(() => {
    return data
      .filter(item => item.microrregiao !== selectedMicroregiao)
      .map(item => ({
        value: item.microrregiao,
        label: item.microrregiao,
        indice: parseFloat(String(item.indice_geral).replace(',', '.'))
      }))
      .sort((a, b) => b.indice - a.indice);
  }, [data, selectedMicroregiao]);

  // Preparar dados para gráficos
  const chartData = useMemo(() => {
    if (!selectedData) return [];

    return EIXOS_NAMES.map((nome, index) => {
      const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
      const selectedValue = parseFloat(String(selectedData[eixoKey]).replace(',', '.'));
      const comparisonValue = comparisonData ? parseFloat(String(comparisonData[eixoKey]).replace(',', '.')) : 0;
      const medianValue = medians[eixoKey] || 0;

      return {
        eixo: `Eixo ${index + 1}`,
        nome,
        'Selecionada': selectedValue,
        'Comparação': comparisonData ? comparisonValue : 0,
        'Mediana': medianValue,
        'Emergente': 0.33,
        'Em Evolução': 0.66,
        'Avançado': 1.0,
        microrregiaoSelecionada: selectedData.microrregiao,
        microrregiaoComparacao: comparisonData?.microrregiao || '',
      };
    });
  }, [selectedData, comparisonData, medians]);

  // Calcular estatísticas comparativas
  const comparisonStats = useMemo(() => {
    if (!selectedData || !comparisonData) return null;

    const selectedIndice = parseFloat(String(selectedData.indice_geral).replace(',', '.'));
    const comparisonIndice = parseFloat(String(comparisonData.indice_geral).replace(',', '.'));
    const difference = selectedIndice - comparisonIndice;
    const percentageDiff = ((difference / comparisonIndice) * 100);

    return {
      selectedIndice,
      comparisonIndice,
      difference,
      percentageDiff,
      isBetter: difference > 0,
      status: difference > 0.1 ? 'superior' : difference < -0.1 ? 'inferior' : 'similar'
    };
  }, [selectedData, comparisonData]);

  // Análise por eixos
  const eixosAnalysis = useMemo(() => {
    if (!selectedData || !comparisonData) return [];

    return EIXOS_NAMES.map((nome, index) => {
      const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
      const selectedValue = parseFloat(String(selectedData[eixoKey]).replace(',', '.'));
      const comparisonValue = parseFloat(String(comparisonData[eixoKey]).replace(',', '.'));
      const difference = selectedValue - comparisonValue;
      const percentageDiff = ((difference / comparisonValue) * 100);

      return {
        eixo: index + 1,
        nome,
        selectedValue,
        comparisonValue,
        difference,
        percentageDiff,
        status: difference > 0.1 ? 'superior' : difference < -0.1 ? 'inferior' : 'similar'
      };
    });
  }, [selectedData, comparisonData]);

  if (!selectedData) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Selecione uma microrregião para análise avançada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div data-section="analise-avancada" className="space-y-6">
      {/* Cabeçalho da Análise */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-blue-900">Análise Avançada</CardTitle>
                <p className="text-blue-700 text-sm">Comparação detalhada entre microrregiões</p>
              </div>
            </div>
            <Badge className="bg-blue-500 text-white">
              {selectedData.microrregiao}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Controles de Análise */}
      <Card data-tour="comparacao-controles">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Região para Comparação</label>
              <Select value={comparisonRegion} onValueChange={setComparisonRegion}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Selecione uma região" />
                </SelectTrigger>
                <SelectContent>
                  {availableRegions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{region.label} — INMSD: {region.indice.toFixed(3)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Análise</label>
              <Select value={analysisType} onValueChange={(value: 'radar' | 'bar' | 'summary') => setAnalysisType(value)}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radar">Gráfico Radar</SelectItem>
                  <SelectItem value="bar">Gráfico de Barras</SelectItem>
                  <SelectItem value="summary">Resumo Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => setComparisonRegion('')}
                variant="outline"
                className="w-full bg-white border-gray-200 hover:bg-gray-50"
                disabled={!comparisonRegion}
              >
                Limpar Comparação
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da Análise */}
      {comparisonRegion && comparisonData ? (
        <>
          {/* Estatísticas Comparativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Comparação Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Compare o índice de maturidade digital (INMSD) entre as microrregiões selecionadas. A diferença mostra quanto a região selecionada está acima ou abaixo da comparação.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour="comparacao-eixos">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {(comparisonStats?.selectedIndice).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-700">INMSD Selecionada</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <b className="text-blue-700 font-semibold">{selectedData.microrregiao}</b>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {(comparisonStats?.comparisonIndice).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-700">INMSD Comparação</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <b className="text-blue-700 font-semibold">{comparisonData.microrregiao}</b>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${comparisonStats?.isBetter ? 'text-green-600' : comparisonStats?.difference < 0 ? 'text-yellow-600' : 'text-purple-900'}`}>
                    {comparisonStats?.isBetter ? (
                      <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                    ) : comparisonStats?.difference < 0 ? (
                      <TrendingDown className="h-5 w-5 text-yellow-600 mr-3" />
                    ) : (
                      <Minus className="h-5 w-5 text-gray-600 mr-3" />
                    )}
                    {Math.abs(comparisonStats?.percentageDiff || 0).toFixed(2)}%
                  </div>
                  <div className={`text-sm mt-1 ${comparisonStats?.isBetter ? 'text-green-600' : comparisonStats?.difference < 0 ? 'text-yellow-600' : 'text-purple-900'}`}>Diferença</div>
                  <div className="text-xs text-gray-700 mt-1 text-center">
                    {comparisonStats?.isBetter ? 'Maior' : comparisonStats?.difference < 0 ? 'Menor' : 'Igual'}
                  </div>
                  <div className="text-xs text-gray-700 mt-2 text-center leading-snug max-w-[90%]">
                    <b className="text-blue-700 font-semibold">{selectedData.microrregiao}</b> em comparação com <b className="text-blue-700 font-semibold">{comparisonData.microrregiao}</b>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos */}
          {analysisType === 'radar' && (
            <Card>
              <CardHeader>
                <CardTitle>Comparação por Eixos - Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData}>
                      <PolarGrid stroke="hsl(var(--border))" strokeWidth={1} />
                      <PolarAngleAxis 
                        dataKey="nome" // Usar nome completo do eixo
                        tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 1]} 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip content={<ComparisonTooltip />} />
                      
                      {/* Linhas de referência */}
                      <Radar
                        name="Emergente"
                        dataKey="Emergente"
                        stroke="#eab308"
                        fill="transparent"
                        strokeWidth={0.5}
                        strokeDasharray="2 2"
                      />
                      <Radar
                        name="Em Evolução"
                        dataKey="Em Evolução"
                        stroke="#3b82f6"
                        fill="transparent"
                        strokeWidth={0.5}
                        strokeDasharray="2 2"
                      />
                      <Radar
                        name="Avançado"
                        dataKey="Avançado"
                        stroke="#10b981"
                        fill="transparent"
                        strokeWidth={0.5}
                        strokeDasharray="2 2"
                      />
                      
                      {/* Dados principais */}
                      <Radar
                        name="Selecionada"
                        dataKey="Selecionada"
                        stroke="#2563eb"
                        fill="#2563eb22"
                        strokeWidth={2}
                        dot
                      />
                      <Radar
                        name="Comparação"
                        dataKey="Comparação"
                        stroke="#22c55e"
                        fill="#22c55e22"
                        strokeWidth={2}
                        dot
                      />
                      <Radar
                        name="Mediana"
                        dataKey="Mediana"
                        stroke="#a21caf"
                        fill="transparent"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-4 items-center justify-center text-sm">
                  <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded bg-[#2563eb]"></span>{selectedData?.microrregiao || 'Selecionada'}</span>
                  <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded bg-[#22c55e]"></span>{comparisonData?.microrregiao || 'Comparação'}</span>
                  <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded bg-[#a21caf]"></span>Mediana: <b>{chartData[0]?.Mediana?.toFixed(2)}</b></span>
                  <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded border border-[#eab308] bg-transparent"></span>Emergente: <b>{'≤ 0,33'}</b></span>
                  <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded border border-[#3b82f6] bg-transparent"></span>Em Evolução: <b>{'0,33 - 0,66'}</b></span>
                  <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded border border-[#10b981] bg-transparent"></span>Avançado: <b>{'>'} 0,66</b></span>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisType === 'bar' && (
            <Card>
              <CardHeader>
                <CardTitle>Comparação por Eixos - Barras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="eixo" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        domain={[0, 1]}
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip content={<ComparisonTooltip />} />
                      <Bar dataKey="Selecionada" fill="hsl(220, 80%, 50%)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Comparação" fill="hsl(160, 70%, 40%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-4 items-center justify-center text-sm">
                  <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded bg-[hsl(220,80%,50%)]"></span>{selectedData?.microrregiao || 'Selecionada'}</span>
                  <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded bg-[hsl(160,70%,40%)]"></span>{comparisonData?.microrregiao || 'Comparação'}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisType === 'summary' && (
            <Accordion type="multiple" defaultValue={["resumo", "eixos"]} className="mb-6">
              <AccordionItem value="resumo">
                <AccordionTrigger>Resumo Executivo</AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Resumo Executivo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Análise por Eixos */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4">Análise Detalhada por Eixos</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {eixosAnalysis.map((eixo) => {
                              const statusConfig = {
                                superior: { label: 'Superior', color: 'bg-green-100 text-green-800 border-green-200' },
                                inferior: { label: 'Inferior', color: 'bg-red-100 text-red-800 border-red-200' },
                                similar: { label: 'Similar', color: 'bg-slate-100 text-slate-800 border-slate-200' },
                              };
                              const currentStatus = statusConfig[eixo.status as keyof typeof statusConfig];
                              
                              return (
                                <div 
                                  key={eixo.eixo}
                                  className="p-4 rounded-lg border bg-white shadow-sm"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-semibold text-slate-700">Eixo {eixo.eixo}</h5>
                                    <Badge 
                                      className={`${currentStatus.color} border`}
                                    >
                                      {currentStatus.label}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{eixo.nome}</p>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">{selectedData.microrregiao}:</span>
                                      <span className="font-bold text-slate-800">{eixo.selectedValue.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">{comparisonData.microrregiao}:</span>
                                      <span className="font-bold text-slate-800">{eixo.comparisonValue.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                                      <span className="font-semibold text-slate-600">Diferença:</span>
                                      <span className={`font-bold ${
                                        eixo.difference > 0 ? 'text-green-600' : 
                                        eixo.difference < 0 ? 'text-red-600' : 'text-slate-600'
                                      }`}>
                                        {eixo.difference > 0 ? '+' : ''}{(eixo.difference * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Recomendações */}
                        <div className="mt-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
                          <h4 className="font-semibold text-lg mb-4 text-blue-900">Recomendações Estratégicas</h4>
                          <div className="space-y-3">
                            {comparisonStats?.status === 'superior' ? (
                              <div className="flex items-start gap-3">
                                <div className="p-1 bg-green-100 rounded-full mt-1">
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-green-900">Posição de Liderança</p>
                                  <p className="text-sm text-green-700">
                                    {selectedData.microrregiao} apresenta maturidade superior à {comparisonData.microrregiao}. 
                                    Considere compartilhar boas práticas e estabelecer parcerias de cooperação.
                                  </p>
                                </div>
                              </div>
                            ) : comparisonStats?.status === 'inferior' ? (
                              <div className="flex items-start gap-3">
                                <div className="p-1 bg-red-100 rounded-full mt-1">
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-red-900">Oportunidades de Melhoria</p>
                                  <p className="text-sm text-red-700">
                                    {selectedData.microrregiao} pode se beneficiar das práticas implementadas em {comparisonData.microrregiao}. 
                                    Foque nos eixos com maior diferença negativa.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-3">
                                <div className="p-1 bg-gray-100 rounded-full mt-1">
                                  <Minus className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Níveis Similares</p>
                                  <p className="text-sm text-gray-700">
                                    Ambas as microrregiões apresentam maturidade similar. 
                                    Considere colaboração mútua para acelerar o desenvolvimento.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="eixos">
                <AccordionTrigger>Análise Detalhada por Eixos</AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Análise Detalhada por Eixos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={chartData}>
                            <PolarGrid stroke="hsl(var(--border))" strokeWidth={1} />
                            <PolarAngleAxis 
                              dataKey="nome" // Usar nome completo do eixo
                              tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                            />
                            <PolarRadiusAxis 
                              angle={90} 
                              domain={[0, 1]} 
                              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip content={<ComparisonTooltip />} />
                            
                            {/* Linhas de referência */}
                            <Radar
                              name="Emergente"
                              dataKey="Emergente"
                              stroke="#eab308"
                              fill="transparent"
                              strokeWidth={0.5}
                              strokeDasharray="2 2"
                            />
                            <Radar
                              name="Em Evolução"
                              dataKey="Em Evolução"
                              stroke="#3b82f6"
                              fill="transparent"
                              strokeWidth={0.5}
                              strokeDasharray="2 2"
                            />
                            <Radar
                              name="Avançado"
                              dataKey="Avançado"
                              stroke="#10b981"
                              fill="transparent"
                              strokeWidth={0.5}
                              strokeDasharray="2 2"
                            />
                            
                            {/* Dados principais */}
                            <Radar
                              name="Selecionada"
                              dataKey="Selecionada"
                              stroke="#2563eb"
                              fill="#2563eb22"
                              strokeWidth={2}
                              dot
                            />
                            <Radar
                              name="Comparação"
                              dataKey="Comparação"
                              stroke="#22c55e"
                              fill="#22c55e22"
                              strokeWidth={2}
                              dot
                            />
                            <Radar
                              name="Mediana"
                              dataKey="Mediana"
                              stroke="#a21caf"
                              fill="transparent"
                              strokeWidth={2}
                              strokeDasharray="4 2"
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-4 items-center justify-center text-sm">
                        <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded bg-[#2563eb]"></span>Selecionada</span>
                        <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded bg-[#22c55e]"></span>Comparação</span>
                        <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded bg-[#a21caf]"></span>Mediana</span>
                        <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded border border-[#eab308] bg-transparent"></span>Emergente</span>
                        <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded border border-[#3b82f6] bg-transparent"></span>Em Evolução</span>
                        <span className="flex items-center gap-2"><span className="inline-block w-4 h-2 rounded border border-[#10b981] bg-transparent"></span>Avançado</span>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Selecione uma Região para Comparação</h3>
              <p className="text-muted-foreground text-sm">
                Escolha uma microrregião da lista acima para iniciar a análise comparativa detalhada.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MicroRegionData, EIXOS_NAMES } from "@/types/dashboard";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  MapPin,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';

interface ExecutiveDashboardProps {
  data: MicroRegionData[];
  selectedMicroregiao: string;
  medians: Record<string, number>;
}

export function ExecutiveDashboard({ data, selectedMicroregiao, medians }: ExecutiveDashboardProps) {
  // Dados da microrregião selecionada
  const selectedData = useMemo(() => {
    return data.find(item => item.microrregiao === selectedMicroregiao);
  }, [selectedMicroregiao, data]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    if (!selectedData) return null;

    const indiceGeral = parseFloat(String(selectedData.indice_geral).replace(',', '.'));
    
    // Calcular valores dos eixos
    const eixosValues = EIXOS_NAMES.map((_, index) => {
      const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
      return parseFloat(String(selectedData[eixoKey]).replace(',', '.'));
    });

    // Análise por níveis de maturidade
    const emergente = eixosValues.filter(v => v < 0.3).length;
    const emEvolucao = eixosValues.filter(v => v >= 0.3 && v < 0.7).length;
    const avancado = eixosValues.filter(v => v >= 0.7).length;

    // Eixos com maior e menor pontuação
    const maxEixo = eixosValues.indexOf(Math.max(...eixosValues));
    const minEixo = eixosValues.indexOf(Math.min(...eixosValues));

    // Comparação com mediana
    const eixosAcimaMedia = eixosValues.filter((valor, index) => {
      const eixoKey = `eixo_${index + 1}` as keyof MicroRegionData;
      return valor > (medians[eixoKey] || 0);
    }).length;

    return {
      indiceGeral,
      eixosValues,
      emergente,
      emEvolucao,
      avancado,
      maxEixo,
      minEixo,
      eixosAcimaMedia,
      totalEixos: EIXOS_NAMES.length
    };
  }, [selectedData, medians]);

  // Classificação geral
  const getClassification = (indice: number) => {
    if (indice >= 0.8) return { text: 'Avançado', color: 'bg-green-500', icon: Award };
    if (indice >= 0.5) return { text: 'Em Evolução', color: 'bg-yellow-500', icon: Clock };
    if (indice >= 0.2) return { text: 'Emergente', color: 'bg-orange-500', icon: AlertTriangle };
    return { text: 'Emergente', color: 'bg-orange-500', icon: AlertTriangle };
  };

  // Status de cada eixo
  const getEixoStatus = (valor: number) => {
    if (valor >= 0.8) return { status: 'Avançado', color: 'text-green-600', bg: 'bg-green-50' };
    if (valor >= 0.5) return { status: 'Em Evolução', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (valor >= 0.2) return { status: 'Emergente', color: 'text-yellow-700', bg: 'bg-yellow-50' };
    return { status: 'Emergente', color: 'text-yellow-700', bg: 'bg-yellow-50' };
  };

  const [showResumo, setShowResumo] = useState(true);
  const [showKPIs, setShowKPIs] = useState(true);

  if (!selectedData || !stats) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Selecione uma microrregião para visualizar o dashboard executivo</p>
        </CardContent>
      </Card>
    );
  }

  const classification = getClassification(stats.indiceGeral);
  const ClassificationIcon = classification.icon;

  return (
    <div data-section="executive">
      {/* Cabeçalho Executivo */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-600 rounded-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl text-slate-900">Dashboard Executivo</CardTitle>
                <button className="ml-2 p-1 rounded hover:bg-muted transition-colors" onClick={() => setShowKPIs(v => !v)} aria-label={showKPIs ? 'Ocultar bloco' : 'Mostrar bloco'} type="button">
                  {showKPIs ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-primary" />}
                </button>
              </div>
              <p className="text-slate-600">Visão estratégica da maturidade digital</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                {selectedData.microrregiao}
              </div>
              <Badge className={`${classification.color} text-white mt-2`}>
                <ClassificationIcon className="h-3 w-3 mr-1" />
                {classification.text}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {showKPIs && (
        // KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Índice Geral */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black">Índice Geral</span>
              <BarChart3 className="h-5 w-5 text-black" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-black">{(stats.indiceGeral * 100).toFixed(1)}%</span>
            </div>
            <Progress value={stats.indiceGeral * 100} className="h-2 bg-gray-100" />
          </CardContent>
        </Card>
        {/* Eixos Avançados */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black">Eixos Avançados</span>
              <Award className="h-5 w-5 text-black" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-black">{stats.avancado}/7</span>
            </div>
            <span className="text-xs text-black">{((stats.avancado / stats.totalEixos) * 100).toFixed(0)}% dos eixos</span>
          </CardContent>
        </Card>
          {/* Acima da Mediana */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-black">Acima da Mediana</span>
              <TrendingUp className="h-5 w-5 text-black" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-black">{stats.eixosAcimaMedia}/7</span>
            </div>
            <span className="text-xs text-black">{((stats.eixosAcimaMedia / stats.totalEixos) * 100).toFixed(0)}% dos eixos</span>
          </CardContent>
        </Card>
        {/* Em Evolução */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black">Em Evolução</span>
              <Activity className="h-5 w-5 text-black" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-black">{stats.emEvolucao}/7</span>
            </div>
            <span className="text-xs text-black">{((stats.emEvolucao / stats.totalEixos) * 100).toFixed(0)}% dos eixos</span>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Análise por Eixos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Análise Detalhada por Eixos
          </CardTitle>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed bg-blue-50 rounded-md p-3 border border-blue-100">
            <span className="font-semibold text-blue-900">Como interpretar as porcentagens?</span><br/>
            Cada valor mostra o quanto sua microrregião avançou em cada eixo (0% a 100%).<br/>
            <strong>Quanto mais próximo de 100%, mais próximo do ideal para o município.</strong><br/>
            <strong>A "Mediana" é o valor central das microrregiões (50% estão acima, 50% abaixo).</strong><br/>
            <span className="block mt-1 italic text-blue-800">Obs: O cálculo original vai de 0 a 1, mas é exibido em porcentagem para facilitar. <b>Exemplo: 0.25 vira 25%.</b></span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EIXOS_NAMES.map((nome, index) => {
              const valor = stats.eixosValues[index];
              const status = getEixoStatus(valor);
              const isMax = index === stats.maxEixo;
              const isMin = index === stats.minEixo;
              const mediana = medians[`eixo_${index + 1}` as keyof typeof medians] || 0;
              const isAcimaMedia = valor > mediana;

              return (
                <div 
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Eixo {index + 1}</h4>
                    <div className="flex items-center gap-1">
                      {isMax && <Badge className="border border-green-400 text-green-600 bg-white text-xs">Melhor</Badge>}
                      {isMin && <Badge className="border border-red-400 text-red-600 bg-white text-xs">Atenção</Badge>}
                      {isAcimaMedia && !isMax && (
                        <Badge className="border border-blue-400 text-blue-600 bg-white text-xs">↑</Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3">{nome}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Pontuação:</span>
                      <span className={`font-bold ${status.color}`}>
                        {(valor * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <Progress 
                      value={valor * 100} 
                      className="h-2 bg-gray-100"
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs border ${status.color} border-current bg-white`}
                        style={{ background: 'white' }}
                      >
                        {status.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Mediana:</span>
                      <span className="text-xs font-medium text-gray-500">
                        {(mediana * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <Card className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
        <CardHeader className="pb-4 flex items-center gap-2">
          <CardTitle className="text-slate-800 text-xl">Resumo Executivo</CardTitle>
          <button className="ml-2 p-1 rounded hover:bg-muted transition-colors" onClick={() => setShowResumo(v => !v)} aria-label={showResumo ? 'Ocultar bloco' : 'Mostrar bloco'} type="button">
            {showResumo ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-primary" />}
          </button>
        </CardHeader>
        {showResumo && (
          <CardContent className="space-y-6">
            {/* Indicadores Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Award className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Maturidade Geral</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{(stats.indiceGeral * 100).toFixed(0)}%</div>
                <div className="text-xs text-slate-500 mt-1">
                  {stats.indiceGeral >= 0.8 ? 'Nível Avançado' : 
                   stats.indiceGeral >= 0.5 ? 'Nível Intermediário' : 'Nível Emergente'}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Eixos Acima da Mediana</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{stats.eixosAcimaMedia}</div>
                <div className="text-xs text-slate-500 mt-1">de {stats.totalEixos} eixos</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-yellow-100 rounded-lg">
                    <Target className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Prioridade</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{stats.emergente}</div>
                <div className="text-xs text-slate-500 mt-1">eixos emergentes</div>
              </div>
            </div>
            
            {/* Análise Detalhada */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pontos Fortes */}
              <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800">Pontos Fortes</h4>
                </div>
                <div className="space-y-3">
                  {stats.avancado > 0 ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="p-1 bg-green-200 rounded-full">
                        <Award className="h-3 w-3 text-green-700" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-green-800">{stats.avancado} eixo(s) em nível avançado</div>
                        <div className="text-xs text-green-600">Excelência em transformação digital</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 italic">Nenhum eixo em nível avançado identificado</div>
                  )}
                  
                  {stats.eixosAcimaMedia > stats.totalEixos / 2 && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="p-1 bg-green-200 rounded-full">
                        <TrendingUp className="h-3 w-3 text-green-700" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-green-800">Maioria dos eixos acima da mediana</div>
                        <div className="text-xs text-green-600">Desempenho superior à média regional</div>
                      </div>
                  </div>
                )}
                  
                  {stats.indiceGeral >= 0.5 && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="p-1 bg-green-200 rounded-full">
                        <BarChart3 className="h-3 w-3 text-green-700" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-green-800">Índice geral intermediário ou superior</div>
                        <div className="text-xs text-green-600">Base sólida para crescimento</div>
                      </div>
                  </div>
                )}
                </div>
              </div>
              
              {/* Oportunidades de Melhoria */}
              <div className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800">Oportunidades de Melhoria</h4>
                </div>
                <div className="space-y-3">
                  {stats.emergente > 0 ? (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="p-1 bg-orange-200 rounded-full">
                        <Clock className="h-3 w-3 text-orange-700" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-orange-800">{stats.emergente} eixo(s) em nível emergente</div>
                        <div className="text-xs text-orange-600">Necessitam de desenvolvimento prioritário</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-green-600 font-medium">Todos os eixos em níveis adequados!</div>
                  )}
                  
                  {stats.eixosAcimaMedia < stats.totalEixos / 2 && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="p-1 bg-orange-200 rounded-full">
                        <TrendingDown className="h-3 w-3 text-orange-700" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-orange-800">Maioria dos eixos abaixo da mediana</div>
                        <div className="text-xs text-orange-600">Oportunidade de crescimento significativo</div>
                      </div>
                    </div>
                  )}
                  
                  {stats.indiceGeral < 0.3 && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="p-1 bg-orange-200 rounded-full">
                        <Target className="h-3 w-3 text-orange-700" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-orange-800">Índice geral em nível emergente</div>
                        <div className="text-xs text-orange-600">Foco em desenvolvimento estrutural</div>
                      </div>
                  </div>
                )}
                </div>
              </div>
            </div>
            
            {/* Recomendação Estratégica */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-slate-800 text-lg">Recomendação Estratégica</h4>
          </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {stats.indiceGeral >= 0.8 ? (
                    `�� <strong>${selectedData.microrregiao}</strong> demonstra <strong>maturidade digital avançada</strong>. 
                    Recomendamos focar na <strong>manutenção da excelência</strong> e <strong>compartilhamento de boas práticas</strong> 
                    com outras regiões para fortalecer o ecossistema digital regional.`
                  ) : stats.indiceGeral >= 0.5 ? (
                    `🚀 <strong>${selectedData.microrregiao}</strong> está em <strong>processo de evolução digital</strong>. 
                    Priorize o desenvolvimento dos <strong>${stats.emergente} eixos emergentes</strong> e fortaleça as áreas 
                    já em desenvolvimento para acelerar a transformação digital.`
                  ) : (
                    `🌱 <strong>${selectedData.microrregiao}</strong> está <strong>iniciando sua jornada de transformação digital</strong>. 
                    Desenvolva um <strong>plano estruturado</strong> focando nos <strong>eixos críticos primeiro</strong> 
                    e estabeleça uma base sólida para crescimento futuro.`
              )}
            </p>
              </div>
          </div>
        </CardContent>
        )}
      </Card>
    </div>
  );
} 
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
  Activity
} from 'lucide-react';

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
    if (indice >= 0.8) return { text: 'Consolidado', color: 'bg-green-500', icon: Award };
    if (indice >= 0.5) return { text: 'Em Evolução', color: 'bg-yellow-500', icon: Clock };
    if (indice >= 0.2) return { text: 'Emergente', color: 'bg-orange-500', icon: AlertTriangle };
    return { text: 'Inicial', color: 'bg-red-500', icon: AlertTriangle };
  };

  // Status de cada eixo
  const getEixoStatus = (valor: number) => {
    if (valor >= 0.8) return { status: 'Avançado', color: 'text-green-600', bg: 'bg-green-50' };
    if (valor >= 0.5) return { status: 'Em Evolução', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (valor >= 0.2) return { status: 'Emergente', color: 'text-gray-600', bg: 'bg-gray-50' };
    return { status: 'Inicial', color: 'text-red-600', bg: 'bg-red-50' };
  };

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
              <div>
                <CardTitle className="text-2xl text-slate-900">Dashboard Executivo</CardTitle>
                <p className="text-slate-600">Visão estratégica da maturidade digital</p>
              </div>
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

      {/* KPIs Principais */}
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
        {/* Acima da Média */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black">Acima da Média</span>
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

      {/* Análise por Eixos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Análise Detalhada por Eixos
          </CardTitle>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed bg-blue-50 rounded-md p-3 border border-blue-100">
            <span className="font-semibold text-blue-900">Como ler as porcentagens?</span><br/>
            Cada valor mostra o quanto sua microrregião avançou em cada eixo (0% a 100%).<br/>
            A “Média” é a média das microrregiões.<br/>
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
                      {isMin && <Badge className="border border-red-400 text-red-600 bg-white text-xs">Crítico</Badge>}
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
                      <span className="text-xs text-gray-500">Média:</span>
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
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100">
        <CardHeader>
          <CardTitle className="text-indigo-900">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-indigo-900 mb-3">Pontos Fortes</h4>
              <div className="space-y-2">
                {stats.avancado > 0 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">{stats.avancado} eixo(s) em nível avançado</span>
                  </div>
                )}
                {stats.eixosAcimaMedia > stats.totalEixos / 2 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Maioria dos eixos acima da média</span>
                  </div>
                )}
                {stats.indiceGeral >= 0.5 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">Índice geral em nível intermediário ou superior</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-indigo-900 mb-3">Oportunidades de Melhoria</h4>
              <div className="space-y-2">
                {stats.emergente > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{stats.emergente} eixo(s) em nível emergente</span>
                  </div>
                )}
                {stats.eixosAcimaMedia < stats.totalEixos / 2 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">Maioria dos eixos abaixo da média</span>
                  </div>
                )}
                {stats.indiceGeral < 0.3 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Índice geral em nível inicial</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-2">Recomendação Estratégica</h4>
            <p className="text-sm text-indigo-700">
              {stats.indiceGeral >= 0.7 ? (
                `${selectedData.microrregiao} demonstra maturidade digital consolidada. 
                Foque em manter a excelência e compartilhar boas práticas com outras regiões.`
              ) : stats.indiceGeral >= 0.4 ? (
                `${selectedData.microrregiao} está em processo de evolução digital. 
                Priorize os eixos emergentes e fortaleça as áreas já em desenvolvimento.`
              ) : (
                `${selectedData.microrregiao} está iniciando sua jornada de transformação digital. 
                Desenvolva um plano estruturado focando nos eixos críticos primeiro.`
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
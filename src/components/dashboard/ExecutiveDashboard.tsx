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
    if (valor >= 0.5) return { status: 'Em Evolução', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (valor >= 0.2) return { status: 'Emergente', color: 'text-orange-600', bg: 'bg-orange-50' };
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
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Índice Geral</p>
                <p className="text-3xl font-bold text-blue-900">
                  {(stats.indiceGeral * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <Progress value={stats.indiceGeral * 100} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Eixos Avançados</p>
                <p className="text-3xl font-bold text-green-900">
                  {stats.avancado}/{stats.totalEixos}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-green-700 mt-2">
              {((stats.avancado / stats.totalEixos) * 100).toFixed(0)}% dos eixos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Acima da Média</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {stats.eixosAcimaMedia}/{stats.totalEixos}
                </p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              {((stats.eixosAcimaMedia / stats.totalEixos) * 100).toFixed(0)}% dos eixos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Em Evolução</p>
                <p className="text-3xl font-bold text-purple-900">
                  {stats.emEvolucao}/{stats.totalEixos}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-purple-700 mt-2">
              {((stats.emEvolucao / stats.totalEixos) * 100).toFixed(0)}% dos eixos
            </p>
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
                  className={`p-4 rounded-lg border-2 ${
                    isMax ? 'bg-green-50 border-green-300 ring-2 ring-green-200' :
                    isMin ? 'bg-red-50 border-red-300 ring-2 ring-red-200' :
                    `${status.bg} border-gray-200`
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Eixo {index + 1}</h4>
                    <div className="flex items-center gap-1">
                      {isMax && <Badge className="bg-green-500 text-white text-xs">Melhor</Badge>}
                      {isMin && <Badge className="bg-red-500 text-white text-xs">Crítico</Badge>}
                      {isAcimaMedia && !isMax && (
                        <Badge className="bg-blue-500 text-white text-xs">↑</Badge>
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
                      className="h-2"
                      style={{
                        '--progress-background': status.color.replace('text-', 'bg-')
                      } as React.CSSProperties}
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${status.color} border-current`}
                      >
                        {status.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Média:</span>
                      <span className="text-xs font-medium">
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
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{stats.emergente} eixo(s) em nível emergente</span>
                  </div>
                )}
                {stats.eixosAcimaMedia < stats.totalEixos / 2 && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">Maioria dos eixos abaixo da média</span>
                  </div>
                )}
                {stats.indiceGeral < 0.3 && (
                  <div className="flex items-center gap-2 text-orange-700">
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
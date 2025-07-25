import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MicroRegionData } from "@/types/dashboard";
import { MapPin, Target, User, Mail, Users, BarChart3 } from "lucide-react";

interface DashboardHeaderProps {
  data: MicroRegionData;
  allData?: MicroRegionData[]; // Dados completos para mostrar outras microrregiões
  onMicroregiaoChange?: (microrregiao: string) => void; // Função para trocar microrregião
}

export function DashboardHeader({ data, allData, onMicroregiaoChange }: DashboardHeaderProps) {
  const getClassificationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'avancado':
        return 'bg-success text-success-foreground';
      case 'em evolução':
        return 'bg-warning text-warning-foreground';
      case 'emergente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getIDHColor = (idh: string) => {
    const valor = parseFloat(String(idh).replace(',', '.'));
    if (valor >= 0.8) return 'bg-success text-success-foreground';
    if (valor >= 0.7) return 'bg-chart-tertiary text-foreground';
    if (valor >= 0.6) return 'bg-warning text-warning-foreground';
    return 'bg-yellow-100 text-yellow-800';
  };

  // Filtrar microrregiões da mesma macrorregião
  const microrregioesDaMacro = allData?.filter(item => 
    item.macrorregiao === data.macrorregiao && 
    item.microrregiao !== data.microrregiao
  ) || [];

  return (
    <>
      <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-dashboard-header to-primary-light">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Identificação Principal */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-title font-bold text-foreground">{data.microrregiao}</h1>
                {/* Removido o Badge de classificação */}
                {/* <Badge className={getClassificationColor(data.classificacao_inmsd)}>
                  {data.classificacao_inmsd}
                </Badge> */}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-caption font-medium">Macrorregião:</span>
                  <span className="text-body-small">{data.macrorregiao}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-caption font-medium">Regional de Saúde:</span>
                  <span className="text-body-small">{data.regional_saude}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">População:</span>
                  <span>{parseInt(String(data.populacao).replace(/\./g, '')).toLocaleString('pt-BR')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="font-medium">IDH:</span>
                  <Badge className={getIDHColor(data.idh_valor)}>
                    {data.idh_completo}
                  </Badge>
                </div>
              </div>
              
              {/* Status INMSD e Pontuação Geral */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status INMSD:</span>
                  <span>{data.classificacao_inmsd || <span className="text-muted-foreground">Não informado</span>}</span>
                </div>
                {/* Removido: Pontuação Geral */}
                {/* <div className="flex items-center gap-2">
                  <span className="font-medium">Pontuação Geral:</span>
                  <span>{data.pontuacao_geral || <span className="text-muted-foreground">Não informado</span>}</span>
                </div> */}
              </div>
              
              {/* Ponto Focal */}
              <div className="pt-3 border-t border-border/50">
                <div className="text-sm">
                  <span className="font-medium text-foreground">Ponto Focal Central:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-body-small">{data.analista}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-body-small text-primary hover:underline">{data.email_analista}</span>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium text-foreground">Ponto(s) Focal(is):</span>
                    <div className="mt-1">{data.ponto_focal}</div>
                    <div className="text-primary text-xs mt-1">{data.email_ponto_focal}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Métricas Principais */}
            <div className="space-y-4">
              <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">
                  {parseFloat(String(data.indice_geral).replace(',', '.')).toFixed(2)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Índice Geral de Maturidade Digital
                </div>
              </div>
              
              <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                <div className="text-lg font-semibold text-foreground mb-2">
                  {data.macro_micro}
                </div>
                <div className="text-xs text-muted-foreground">
                  Classificação Administrativa
                </div>
              </div>
            </div>
          </div>
          
          {/* Municípios */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="text-sm">
              <span className="font-medium text-foreground">Municípios da Microrregião:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.municipios.split(', ').map((municipio, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {municipio.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outras Microrregiões da Macrorregião */}
      {microrregioesDaMacro.length > 0 && (
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-muted/50 to-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Outras Microrregiões da Macrorregião {data.macrorregiao}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {microrregioesDaMacro.length} microrregiões disponíveis para análise
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {microrregioesDaMacro.map((microrregiao, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-md transition-shadow cursor-pointer border border-border/50"
                  onClick={() => onMicroregiaoChange?.(microrregiao.microrregiao)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground text-sm">{microrregiao.microrregiao}</h4>
                      <Badge className={getClassificationColor(microrregiao.classificacao_inmsd)}>
                        {microrregiao.classificacao_inmsd}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Índice:</span>
                        <span className="font-medium text-foreground">
                          {parseFloat(String(microrregiao.indice_geral).replace(',', '.')).toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>População:</span>
                        <span>{parseInt(String(microrregiao.populacao).replace(/\./g, '')).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Regional:</span>
                        <span className="truncate">{microrregiao.regional_saude}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
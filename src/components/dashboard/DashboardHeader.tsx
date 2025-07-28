import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MicroRegionData } from "@/types/dashboard";
import { MapPin, Target, User, Mail, Users, BarChart3 } from "lucide-react";
import { getStatusAppearance, StatusLevel } from "@/lib/statusUtils";

interface DashboardHeaderProps {
  data: MicroRegionData;
  allData?: MicroRegionData[]; // Dados completos para mostrar outras microrregiões
  onMicroregiaoChange?: (microrregiao: string) => void; // Função para trocar microrregião
}

export function DashboardHeader({ data, allData, onMicroregiaoChange }: DashboardHeaderProps) {
  const getClassificationStatus = (classification: string): StatusLevel => {
    const lowerCaseClass = classification.toLowerCase();
    if (lowerCaseClass.includes('avançado') || lowerCaseClass.includes('consolidado')) return 'Avançado';
    if (lowerCaseClass.includes('em evolução')) return 'Em Evolução';
    if (lowerCaseClass.includes('emergente')) return 'Emergente';
    return 'Padrão';
  };

  const getIDHStatus = (idh: string): StatusLevel => {
    const valor = parseFloat(String(idh).replace(',', '.'));
    if (valor > 0.7) return 'Avançado';
    if (valor > 0.5) return 'Em Evolução';
    return 'Emergente';
  };

  // Filtrar microrregiões da mesma macrorregião
  const microrregioesDaMacro = allData?.filter(item => 
    item.macrorregiao === data.macrorregiao && 
    item.microrregiao !== data.microrregiao
  ) || [];

  return (
    <>
      <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-primary/5" data-tour="header-detalhes">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Identificação Principal */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{data.microrregiao}</h1>
                <Badge 
                  className={`${getStatusAppearance(getClassificationStatus(data.classificacao_inmsd)).bgColor} ${getStatusAppearance(getClassificationStatus(data.classificacao_inmsd)).textColor} border-none`}
                >
                  {data.classificacao_inmsd}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Macrorregião:</span>
                  <span className="text-body-small">{data.macrorregiao}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Regional de Saúde:</span>
                  <span className="text-foreground font-medium">{data.regional_saude}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">População:</span>
                  <span className="text-foreground font-medium">{parseInt(String(data.populacao).replace(/\./g, '')).toLocaleString('pt-BR')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">IDH:</span>
                  <Badge className={`${getStatusAppearance(getIDHStatus(data.idh_valor)).bgColor} ${getStatusAppearance(getIDHStatus(data.idh_valor)).textColor} border-none`}>
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
              <div className="pt-4 border-t">
                <div className="text-sm">
                  <h3 className="font-semibold text-foreground mb-2">Ponto Focal Central</h3>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary/80" />
                      <span>{data.analista}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary/80" />
                      <a href={`mailto:${data.email_analista}`} className="text-primary hover:underline">{data.email_analista}</a>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-foreground">Ponto(s) Focal(is) Local(is):</h4>
                    <p className="text-muted-foreground mt-1">{data.ponto_focal}</p>
                    <p className="text-primary text-xs mt-1">{data.email_ponto_focal}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Métricas Principais */}
            <div className="space-y-4">
              <Card className="text-center p-4 border-primary/20">
                <div className="text-4xl font-bold text-primary mb-1">
                  {parseFloat(String(data.indice_geral).replace(',', '.')).toFixed(2)}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Índice Geral de Maturidade Digital
                </p>
              </Card>
              
              <Card className="text-center p-4">
                <div className="text-xl font-semibold text-foreground mb-1">
                  {data.macro_micro}
                </div>
                <p className="text-xs text-muted-foreground">
                  Classificação Administrativa
                </p>
              </Card>
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
        <Card className="mb-6 shadow-md border bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Outras Microrregiões em {data.macrorregiao}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {microrregioesDaMacro.length} outras microrregiões disponíveis para análise.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {microrregioesDaMacro.map((microrregiao, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border group"
                  onClick={() => onMicroregiaoChange?.(microrregiao.microrregiao)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">{microrregiao.microrregiao}</h4>
                      <Badge variant="outline" className={`${getStatusAppearance(getClassificationStatus(microrregiao.classificacao_inmsd)).bgColor} ${getStatusAppearance(getClassificationStatus(microrregiao.classificacao_inmsd)).textColor} border-none`}>
                        {microrregiao.classificacao_inmsd}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Índice Geral:</span>
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
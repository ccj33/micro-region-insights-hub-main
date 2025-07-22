export interface MicroRegionData {
  macrorregiao: string;
  microrregiao: string;
  regional_saude: string;
  analista: string;
  indice_geral: string;
  eixo_1: string;
  eixo_2: string;
  eixo_3: string;
  eixo_4: string;
  eixo_5: string;
  eixo_6: string;
  eixo_7: string;
  idh_completo: string;
  idh_valor: string;
  idh_classificacao: string;
  populacao: string;
  classificacao_inmsd: string;
  email_analista: string;
  ponto_focal: string;
  email_ponto_focal: string;
  municipios: string;
  macro_micro: string;
  status_inmsd: string;
  pontuacao_geral: string;
  situacao_eixo_1: string;
  recomendacao_eixo_1: string;
  ferramenta_eixo_1: string;
  situacao_eixo_2: string;
  recomendacao_eixo_2: string;
  ferramenta_eixo_2: string;
  situacao_eixo_3: string;
  recomendacao_eixo_3: string;
  ferramenta_eixo_3: string;
  situacao_eixo_4: string;
  recomendacao_eixo_4: string;
  ferramenta_eixo_4: string;
  situacao_eixo_5: string;
  recomendacao_eixo_5: string;
  ferramenta_eixo_5: string;
  situacao_eixo_6: string;
  recomendacao_eixo_6: string;
  ferramenta_eixo_6: string;
  situacao_eixo_7: string;
  recomendacao_eixo_7: string;
  ferramenta_eixo_7: string;
}

export interface EixoData {
  nome: string;
  valor: number;
  situacao: string;
  recomendacao: string;
  ferramenta: string;
}

export interface FilterOptions {
  macrorregiao?: string;
  classificacao_inmsd?: string;
}

export const EIXOS_NAMES = [
  "Gestão e Governança",
  "Infraestrutura e Conectividade", 
  "Sistemas e Dados",
  "Capacitação e Desenvolvimento",
  "Serviços Digitais",
  "Interoperabilidade",
  "Segurança e Privacidade"
];
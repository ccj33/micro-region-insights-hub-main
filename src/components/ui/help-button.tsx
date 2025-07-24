import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, X, BookOpen, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HelpButtonProps {
  className?: string;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    question: "O que é este sistema?",
    answer: "Este é um painel que mostra como está o desenvolvimento digital da sua região. Ele avalia 7 áreas diferentes e mostra onde você está bem e onde precisa melhorar.",
    category: "Conceitos Gerais",
    tags: ["sistema", "explicação", "simples", "introdução"]
  },
  {
    question: "O que significa 'Maturidade Digital'?",
    answer: "Maturidade Digital é o quanto sua região está preparada para usar tecnologia. Quanto mais madura, melhor ela usa computadores, internet e sistemas digitais.",
    category: "Conceitos Gerais",
    tags: ["maturidade", "digital", "tecnologia", "preparação"]
  },
  {
    question: "O que são os 'Eixos'?",
    answer: "Eixos são as 7 áreas que avaliamos: 1) Gestão, 2) Internet e Conectividade, 3) Sistemas de Computador, 4) Treinamento das Pessoas, 5) Serviços Online, 6) Troca de Informações, 7) Segurança dos Dados.",
    category: "Eixos",
    tags: ["eixos", "áreas", "avaliação", "7 categorias"]
  },
  {
    question: "Como entender as cores nos gráficos?",
    answer: "Vermelho = Precisa melhorar muito (0-30%), Amarelo = Está melhorando (40-60%), Verde = Está bem (70-100%). Quanto mais verde, melhor!",
    category: "Interpretação",
    tags: ["cores", "vermelho", "amarelo", "verde", "fácil"]
  },
  {
    question: "O que é uma 'Microrregião'?",
    answer: "É um grupo de cidades próximas que trabalham juntas. Como se fosse uma 'família' de municípios que compartilham recursos e serviços.",
    category: "Conceitos Gerais",
    tags: ["microrregião", "cidades", "grupo", "família"]
  },
  {
    question: "Como funciona o Gráfico de Radar?",
    answer: "Imagine uma teia de aranha! Cada ponta representa uma área (eixo). Se a linha está mais próxima do centro = precisa melhorar. Se está mais longe = está bem. A linha azul é sua região, a cinza é a média geral.",
    category: "Gráficos",
    tags: ["radar", "teia", "aranha", "visual", "fácil"]
  },
  {
    question: "Como entender o Gráfico de Barras?",
    answer: "Cada barra é uma região diferente. A mais alta = melhor colocada. A mais baixa = precisa melhorar. Sua região fica destacada para você ver onde está no ranking.",
    category: "Gráficos",
    tags: ["barras", "ranking", "posição", "comparação", "fácil"]
  },
  {
    question: "Para que serve o Gráfico de População?",
    answer: "Mostra quantas pessoas vivem em cada região. Regiões com mais pessoas precisam de mais atenção, porque afetam mais gente quando melhoram ou pioram.",
    category: "Gráficos",
    tags: ["população", "pessoas", "impacto", "importância"]
  },
  {
    question: "O que são as 'Recomendações'?",
    answer: "São dicas práticas de como melhorar cada área. Como um 'manual de instruções' que diz o que fazer para ficar melhor em cada eixo.",
    category: "Recomendações",
    tags: ["recomendações", "dicas", "melhorias", "manual"]
  },
  {
    question: "Como usar os Filtros?",
    answer: "Os filtros ajudam você a ver só as regiões que interessam. Por exemplo: só regiões com muita gente, ou só regiões pobres, ou só de uma área específica.",
    category: "Funcionalidades",
    tags: ["filtros", "seleção", "organização", "busca"]
  },
  {
    question: "O que significa 'IDH'?",
    answer: "IDH = Índice de Desenvolvimento Humano. É um número que mostra se a região tem boa saúde, educação e renda. Quanto maior, melhor a qualidade de vida.",
    category: "Conceitos Gerais",
    tags: ["IDH", "desenvolvimento", "humano", "qualidade", "vida"]
  },
  {
    question: "Como baixar o relatório em PDF?",
    answer: "Clique no botão 'Baixar Relatório PDF' no final da página. Ele vai criar um documento com todas as informações da sua região para você salvar ou imprimir.",
    category: "Funcionalidades",
    tags: ["PDF", "download", "relatório", "salvar", "imprimir"]
  },
  {
    question: "O que é 'Interoperabilidade'?",
    answer: "É quando diferentes sistemas conseguem 'conversar' entre si. Como quando você consegue abrir um arquivo do Word no Google Docs - eles se entendem!",
    category: "Eixos",
    tags: ["interoperabilidade", "sistemas", "conversa", "compatibilidade"]
  },
  {
    question: "Por que as cores mudam nos gráficos?",
    answer: "As cores mudam automaticamente baseado nos números. É como um semáforo: vermelho = pare e melhore, amarelo = atenção, verde = pode seguir!",
    category: "Interpretação",
    tags: ["cores", "semáforo", "automático", "números"]
  },
  {
    question: "O que fazer se minha região está vermelha?",
    answer: "Não se preocupe! Vermelho só significa que há espaço para melhorar. Veja as recomendações no final da página - elas mostram exatamente o que fazer para melhorar.",
    category: "Interpretação",
    tags: ["vermelho", "melhorar", "recomendações", "ação"]
  },
  // --- NOVAS PERGUNTAS E RESPOSTAS --- //
  {
    question: "O que é o Dashboard Executivo?",
    answer: "É uma visão estratégica que mostra os principais indicadores da sua microrregião, pontos fortes, oportunidades de melhoria e recomendações para gestores.",
    category: "Funcionalidades",
    tags: ["dashboard executivo", "estratégia", "indicadores", "gestores"]
  },
  {
    question: "O que é Análise Avançada?",
    answer: "Permite comparar sua microrregião com outra, ver gráficos detalhados e um resumo executivo para decisões rápidas.",
    category: "Funcionalidades",
    tags: ["análise avançada", "comparação", "gráficos", "resumo executivo"]
  },
  {
    question: "Como funcionam os filtros?",
    answer: "Você pode escolher macrorregião, microrregião e classificação para ver só os dados que interessam. Isso ajuda a comparar regiões parecidas.",
    category: "Funcionalidades",
    tags: ["filtros", "macrorregião", "microrregião", "classificação"]
  },
  {
    question: "Como funciona a exportação em PDF?",
    answer: "Clique em ‘Baixar Relatório PDF’, escolha as seções que deseja e salve o arquivo para compartilhar ou imprimir.",
    category: "Funcionalidades",
    tags: ["PDF", "exportar", "relatório", "compartilhar"]
  },
  {
    question: "O que significa INMSD?",
    answer: "É o Índice de Maturidade em Saúde Digital, que mostra o quanto sua região está avançada no uso de tecnologia na saúde.",
    category: "Conceitos Gerais",
    tags: ["INMSD", "índice", "maturidade", "saúde digital"]
  },
  {
    question: "O que é Mediana?",
    answer: "É o valor do meio: metade das regiões está acima, metade está abaixo. Serve para comparar sua região com a média.",
    category: "Conceitos Gerais",
    tags: ["mediana", "comparação", "média"]
  },
  {
    question: "O que são os níveis ‘Emergente’, ‘Em Evolução’ e ‘Avançado’?",
    answer: "São faixas de maturidade digital. ‘Emergente’ está começando, ‘Em Evolução’ está melhorando, ‘Avançado’ já é referência.",
    category: "Conceitos Gerais",
    tags: ["emergente", "em evolução", "avançado", "níveis"]
  },
  {
    question: "Qual a diferença entre Progresso e Performance?",
    answer: "Progresso mostra o quanto sua região avançou em cada área. Performance compara sua região com as outras.",
    category: "Interpretação",
    tags: ["progresso", "performance", "diferença", "comparação"]
  },
  {
    question: "O que é Ranking?",
    answer: "É a posição da sua microrregião em relação às demais, do melhor para o pior índice.",
    category: "Interpretação",
    tags: ["ranking", "posição", "comparação"]
  },
  {
    question: "O que é Ferramenta Sugerida?",
    answer: "É uma dica de solução ou recurso que pode ajudar sua região a melhorar naquele eixo.",
    category: "Funcionalidades",
    tags: ["ferramenta sugerida", "solução", "recurso", "dica"]
  },
  {
    question: "O que é Situação Atual?",
    answer: "É um diagnóstico simples de como está sua região em cada área avaliada.",
    category: "Funcionalidades",
    tags: ["situação atual", "diagnóstico", "avaliação"]
  },
  {
    question: "O que é LGPD?",
    answer: "É a Lei Geral de Proteção de Dados, que protege as informações pessoais dos cidadãos.",
    category: "Conceitos Gerais",
    tags: ["LGPD", "proteção de dados", "lei"]
  },
  {
    question: "O que é Macrorregião e Microrregião?",
    answer: "Macrorregião é uma área grande, formada por várias microrregiões. Microrregião é um grupo de cidades próximas que trabalham juntas.",
    category: "Conceitos Gerais",
    tags: ["macrorregião", "microrregião", "divisão territorial"]
  },
  {
    question: "O que é Interoperabilidade?",
    answer: "É quando diferentes sistemas conseguem trocar informações entre si, facilitando o trabalho.",
    category: "Eixos",
    tags: ["interoperabilidade", "sistemas", "troca de informações"]
  },
  {
    question: "Como saber se minha região está bem?",
    answer: "Veja as cores dos gráficos e o ranking. Verde é bom, amarelo está melhorando, vermelho precisa de atenção.",
    category: "Interpretação",
    tags: ["cores", "ranking", "avaliação"]
  },
  {
    question: "O que fazer se minha região está vermelha?",
    answer: "Veja as recomendações no painel. Elas mostram o que pode ser feito para melhorar.",
    category: "Recomendações",
    tags: ["vermelho", "recomendações", "melhorar"]
  },
  {
    question: "Como interpretar a tabela de eixos?",
    answer: "Cada linha mostra um eixo (área avaliada), o valor da sua região, a mediana e se está acima ou abaixo da média.",
    category: "Interpretação",
    tags: ["tabela de eixos", "mediana", "comparação"]
  },
  {
    question: "O que significa ‘Progresso’ na tabela de eixos?",
    answer: "É o quanto sua região avançou naquele eixo, de 0% a 100%. Quanto mais próximo de 100%, melhor.",
    category: "Interpretação",
    tags: ["progresso", "tabela de eixos", "porcentagem"]
  },
  {
    question: "O que significa ‘Performance’ na tabela de eixos?",
    answer: "Mostra se sua região está acima, na média ou abaixo das outras microrregiões naquele eixo.",
    category: "Interpretação",
    tags: ["performance", "tabela de eixos", "comparação"]
  },
  {
    question: "Como comparar minha microrregião com outra?",
    answer: "Use a Análise Avançada para escolher outra microrregião e ver gráficos comparativos e um resumo executivo.",
    category: "Funcionalidades",
    tags: ["comparação", "análise avançada", "microrregião"]
  },
  {
    question: "O que é ‘Resumo Executivo’?",
    answer: "É um resumo simples dos pontos fortes, oportunidades de melhoria e recomendações para sua microrregião.",
    category: "Funcionalidades",
    tags: ["resumo executivo", "recomendações", "pontos fortes"]
  },
  {
    question: "O que é ‘Classificação INMSD’?",
    answer: "É a categoria em que sua microrregião se encontra de acordo com o índice de maturidade digital: Emergente, Em Evolução ou Avançado.",
    category: "Conceitos Gerais",
    tags: ["classificação", "INMSD", "maturidade"]
  },
  {
    question: "O que é ‘Ferramenta Sugerida’ nas recomendações?",
    answer: "É uma sugestão de solução, plataforma ou recurso que pode ajudar sua microrregião a evoluir naquele eixo.",
    category: "Recomendações",
    tags: ["ferramenta sugerida", "recurso", "solução"]
  },
  {
    question: "Como usar as recomendações do painel?",
    answer: "Leia as recomendações de cada eixo e siga as dicas práticas para melhorar a maturidade digital da sua microrregião.",
    category: "Recomendações",
    tags: ["recomendações", "dicas", "melhorias"]
  },
  {
    question: "O que é ‘Situação Atual’ nas recomendações?",
    answer: "É um resumo do estágio atual da sua microrregião em cada eixo, para você saber onde focar.",
    category: "Recomendações",
    tags: ["situação atual", "diagnóstico", "eixo"]
  },
  {
    question: "O que é ‘Exportar PDF’?",
    answer: "É a função que permite baixar um relatório completo da sua microrregião para compartilhar ou imprimir.",
    category: "Funcionalidades",
    tags: ["exportar", "PDF", "relatório"]
  },
  {
    question: "O que é ‘Legenda do Ranking’?",
    answer: "É uma explicação das cores e símbolos usados no gráfico de barras para mostrar a posição das microrregiões.",
    category: "Interpretação",
    tags: ["legenda", "ranking", "gráfico de barras"]
  },
  {
    question: "O que é ‘Índice Geral’?",
    answer: "É o valor principal que mostra o nível de maturidade digital da sua microrregião, de 0% a 100%.",
    category: "Conceitos Gerais",
    tags: ["índice geral", "maturidade", "porcentagem"]
  },
  {
    question: "O que é ‘Eixo’ no contexto do painel?",
    answer: "É uma das 7 áreas avaliadas para medir a maturidade digital da microrregião.",
    category: "Eixos",
    tags: ["eixo", "área", "avaliação"]
  },
  {
    question: "Como saber se estou acima ou abaixo da mediana?",
    answer: "Veja a coluna ‘Performance’ na tabela de eixos. Se estiver ‘Acima da Mediana’, sua região está melhor que a maioria naquele eixo.",
    category: "Interpretação",
    tags: ["mediana", "performance", "comparação"]
  },
  {
    question: "O que é ‘Resumo Executivo’ na Análise Avançada?",
    answer: "É um relatório simples que mostra onde sua microrregião está melhor, onde pode melhorar e recomendações estratégicas.",
    category: "Funcionalidades",
    tags: ["resumo executivo", "análise avançada", "relatório"]
  },
  {
    question: "O que é ‘Comparação Geral’ na Análise Avançada?",
    answer: "É a comparação direta do índice de maturidade digital entre duas microrregiões.",
    category: "Funcionalidades",
    tags: ["comparação geral", "análise avançada", "índice"]
  },
  {
    question: "O que é ‘Emergente 1’, ‘Emergente 2’, ‘Em Evolução 1’, ‘Em Evolução 2’ nos eixos?",
    answer: "São subdivisões dos níveis de maturidade, para mostrar com mais detalhe o estágio da sua microrregião em cada eixo.",
    category: "Eixos",
    tags: ["emergente 1", "emergente 2", "em evolução 1", "em evolução 2", "níveis"]
  },
  {
    question: "O que é ‘Ferramenta’ nas recomendações?",
    answer: "É uma plataforma, sistema ou recurso sugerido para ajudar sua microrregião a evoluir naquele eixo.",
    category: "Recomendações",
    tags: ["ferramenta", "recurso", "sugestão"]
  },
  {
    question: "Como interpretar as cores dos gráficos?",
    answer: "Verde significa bom, amarelo está melhorando, vermelho precisa de atenção. Quanto mais verde, melhor!",
    category: "Interpretação",
    tags: ["cores", "gráficos", "interpretação"]
  },
];

export function HelpButton({ className }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  const categories = ["Todas", ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Todas" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleButtonClick = () => {
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          onClick={handleButtonClick}
          className="fixed bottom-6 right-6 z-40 transition-all duration-300 hover:scale-110 hover:shadow-xl"
          style={{
            width: 56,
            height: 56,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
          aria-label="Ajuda"
          data-tour="faq"
          id="faq-fab"
        >
          <svg width="56" height="56" viewBox="0 0 56 56">
            <polygon points="28,6 54,50 2,50" fill="#e11d48" />
            <text x="28" y="40" textAnchor="middle" fontSize="32" fill="#fff" fontWeight="bold" fontFamily="Segoe UI, Arial Rounded MT Bold, Verdana, sans-serif" dominantBaseline="middle">?</text>
          </svg>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-2xl rounded-2xl border-blue-200">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2 mb-2">
            <img src="/logo_sus_digital-removebg-preview.png" alt="AlexSUS" style={{width: 56, height: 56, borderRadius: '50%', boxShadow: '0 2px 12px #2563eb33'}} />
            <DialogTitle className="flex items-center gap-2 text-2xl text-blue-700 font-extrabold drop-shadow text-center">
              <span>FAQ & Dicionário do AlexSUS</span>
            </DialogTitle>
            <DialogDescription className="text-blue-900 text-base text-center font-medium">
              Tire suas dúvidas sobre maturidade digital em saúde. Pesquise ou clique nas perguntas para ver respostas simples e diretas!
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex flex-col h-full min-h-0">
          {/* Barra de pesquisa */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar termos, conceitos ou perguntas..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-lg"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todas");
              }}
              className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-base"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>

          {/* Filtros por categoria */}
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1 text-base ${selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Resultados */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[500px]">
            {filteredFAQ.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <img src="/logo_sus_digital-removebg-preview.png" alt="AlexSUS" className="mx-auto mb-4" style={{width: 48, height: 48}} />
                <p className="text-lg font-medium">Nenhum resultado encontrado</p>
                <p className="text-base">Tente usar termos diferentes ou verificar a categoria selecionada</p>
              </div>
            ) : (
              filteredFAQ.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-2xl p-5 bg-white shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600 text-2xl">🤖</span>
                    <h3 className="font-bold text-lg text-blue-800 flex-1">{item.question}</h3>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-blue-900 text-base leading-relaxed mb-1">
                    {item.answer}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="outline"
                        className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Estatísticas */}
          <div className="border-t pt-4 mt-4 text-base text-gray-500">
            <p>
              Mostrando {filteredFAQ.length} de {faqData.length} itens
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
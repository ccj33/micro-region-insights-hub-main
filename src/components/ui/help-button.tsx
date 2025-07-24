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
  }
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-blue-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Dicionário e FAQ - Maturidade Digital
          </DialogTitle>
          <DialogDescription>
            Consulte termos, conceitos e perguntas frequentes sobre maturidade digital em saúde. Use a pesquisa para encontrar informações específicas.
          </DialogDescription>
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
                className="pl-10 bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todas");
              }}
              className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
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
                className={`cursor-pointer ${
                  selectedCategory === category 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "hover:bg-blue-50"
                }`}
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
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                <p className="text-lg font-medium">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente usar termos diferentes ou verificar a categoria selecionada</p>
              </div>
            ) : (
              filteredFAQ.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 pr-4">
                      {item.question}
                    </h3>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">
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
          <div className="border-t pt-4 mt-4 text-sm text-gray-500">
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
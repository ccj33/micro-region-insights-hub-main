import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, BarChart3, PieChart, Users, Table, FileText, Upload, ArrowUp, Menu, X, Target, TrendingUp } from 'lucide-react';

interface NavigationMenuProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const sections = [
  { id: 'overview', label: 'Visão Geral', icon: Home },
  { id: 'radar', label: 'Gráfico Radar', icon: PieChart },
  { id: 'barras', label: 'Gráfico Barras', icon: BarChart3 },
  { id: 'populacao', label: 'População', icon: Users },
  { id: 'tabela', label: 'Tabela Eixos', icon: Table },
  { id: 'recomendacoes', label: 'Recomendações', icon: FileText },
  { id: 'executivo', label: 'Dashboard Executivo', icon: Target },
  { id: 'analise-avancada', label: 'Análise Avançada', icon: TrendingUp },
  { id: 'upload', label: 'Upload Dados', icon: Upload },
];

export function NavigationMenu({ activeSection, onNavigate }: NavigationMenuProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBreadcrumbPath = () => {
    const currentSection = sections.find(s => s.id === activeSection);
    return [
      { label: 'Dashboard', icon: Home },
      ...(currentSection ? [{ label: currentSection.label, icon: currentSection.icon }] : [])
    ];
  };

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    setShowMobileMenu(false); // Fecha o menu mobile após navegação
  };

  return (
    <>
      {/* Menu de Navegação Fixo */}
      <div className="sticky top-0 z-50 bg-blue-50 border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 w-full">
            {/* Logo/Título */}
            <div className="flex-shrink-0 flex items-center pl-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo%20sus%20digital.png" alt="SUS Digital SES-MG" className="h-10 w-auto" />
              </div>
              <h1 className="text-lg font-semibold text-blue-900 ml-2">Radar NSDIGI</h1>
            </div>
            {/* Menu Centralizado */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-4">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleNavigate(section.id)}
                      className={`flex flex-col items-center justify-center py-2 px-2 rounded transition-colors duration-200 cursor-pointer ${activeSection === section.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50 text-blue-700'}`}
                      style={{ minWidth: 64 }}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-xs leading-tight">{section.label.split(' ')[1] || section.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Espaço à direita para balancear */}
            <div className="flex-shrink-0 w-40" />
          </div>
        </div>

        {/* Botão Hambúrguer - Mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-2 text-blue-700 hover:bg-blue-100"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Menu Mobile Dropdown */}
        {showMobileMenu && (
          <div className="lg:hidden bg-white border-t border-blue-200 shadow-lg">
            <div className="container mx-auto px-4 py-2">
              {/* Removido: Breadcrumbs Mobile */}
              {/* Removido: <div className="mb-3 pb-2 border-b border-blue-100"> ... </div> */}
              {/* Menu Items Mobile */}
              <div className="grid grid-cols-3 gap-2 justify-center">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNavigate(section.id)}
                      className={`h-12 flex flex-col items-center justify-center space-y-1 ${
                        activeSection === section.id 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "text-blue-700 border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{section.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botão Voltar ao Topo */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-40 transition-all duration-300 hover:scale-110"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}
    </>
  );
} 
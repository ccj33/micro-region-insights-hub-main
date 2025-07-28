import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MicroRegionData, FilterOptions } from "@/types/dashboard";
import { Filter, MapPin, Building, Target, Check, ChevronsUpDown, Search, Database } from "lucide-react";
import { DownloadPDF } from "./DownloadPDF";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDataCache } from "@/hooks/useDataCache";
import { Input } from "@/components/ui/input";

interface FiltersProps {
  data: MicroRegionData[];
  selectedMicroregiao: string;
  filters: FilterOptions;
  onMicroregiaoChange: (microrregiao: string) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  selectedData: MicroRegionData;
}

export function Filters({ 
  data, 
  selectedMicroregiao, 
  filters, 
  onMicroregiaoChange, 
  onFiltersChange,
  selectedData
}: FiltersProps) {
  
  const [openMacro, setOpenMacro] = useState(false);
  const [openRegional, setOpenRegional] = useState(false);
  const [openMicroregiao, setOpenMicroregiao] = useState(false);
  
  // Usar o hook de cache de dados
  const {
    filteredData: cachedFilteredData,
    isLoading,
    searchTerm,
    setSearchTerm,
    clearCache,
    cacheStats
  } = useDataCache(data, filters);

  const uniqueValues = {
    macrorregioes: Array.from(new Set(data.map(item => item.macrorregiao))).sort(),
    regionaisSaude: Array.from(new Set(data.map(item => item.regional_saude))).sort(),
    classificacoes: Array.from(new Set(data.map(item => item.classificacao_inmsd))).sort()
  };

  // Garante que, se nenhum filtro está aplicado, todas as microrregiões aparecem
  const filteredMicroregioes = (!filters.macrorregiao && !filters.classificacao_inmsd && !searchTerm)
    ? data
    : cachedFilteredData;

  const clearFilters = () => {
    onFiltersChange({});
    onMicroregiaoChange('');
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (selectedMicroregiao ? 1 : 0);

  return (
    <div className="flex flex-col h-full">
      {/* Título e Limpar Filtros */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Filtros</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">
          Limpar Tudo
        </Button>
      </div>

      {/* Conteúdo dos Filtros */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Filtro Macrorregião */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            Macrorregião
          </label>
          <Popover open={openMacro} onOpenChange={setOpenMacro}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {filters.macrorregiao || "Todas"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Buscar..." />
                <CommandList>
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => { onFiltersChange({ ...filters, macrorregiao: undefined }); setOpenMacro(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", !filters.macrorregiao ? "opacity-100" : "opacity-0")} />
                      Todas
                    </CommandItem>
                    {uniqueValues.macrorregioes.map((macro) => (
                      <CommandItem key={macro} value={macro} onSelect={() => { 
                        onFiltersChange({ ...filters, macrorregiao: macro }); 
                        onMicroregiaoChange(""); // Limpar microrregião ao trocar macro
                        setOpenMacro(false); 
                      }}>
                        <Check className={cn("mr-2 h-4 w-4", filters.macrorregiao === macro ? "opacity-100" : "opacity-0")} />
                        {macro}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Filtro Microrregião */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Microrregião
          </label>
          <Popover open={openMicroregiao} onOpenChange={setOpenMicroregiao}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {selectedMicroregiao || "Nenhuma"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Buscar..." />
                <CommandList>
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => { onMicroregiaoChange(""); setOpenMicroregiao(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", !selectedMicroregiao ? "opacity-100" : "opacity-0")} />
                      Nenhuma
                    </CommandItem>
                    {filteredMicroregioes.map((item) => (
                      <CommandItem key={item.microrregiao} value={item.microrregiao} onSelect={() => { onMicroregiaoChange(item.microrregiao); setOpenMicroregiao(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", selectedMicroregiao === item.microrregiao ? "opacity-100" : "opacity-0")} />
                        {item.microrregiao}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Filtro Classificação */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Classificação INMSD
          </label>
          <div className="flex flex-col gap-2">
            <Button
              variant={!filters.classificacao_inmsd ? 'default' : 'outline'}
              onClick={() => onFiltersChange({ ...filters, classificacao_inmsd: undefined })}
            >
              Todas
            </Button>
            {uniqueValues.classificacoes.map(classificacao => (
              <Button
                key={classificacao}
                variant={filters.classificacao_inmsd === classificacao ? 'default' : 'outline'}
                onClick={() => onFiltersChange({ ...filters, classificacao_inmsd: classificacao })}
              >
                {classificacao}
              </Button>
            ))}
          </div>
        </div>

        {/* Resumo da Seleção */}
        <div className="mt-4 p-3 bg-muted/50 border rounded-lg text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Microrregião:</span>
              <span className="text-primary font-semibold">{selectedMicroregiao || 'Nenhuma'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Macrorregião:</span>
              <Badge variant="secondary">{filters.macrorregiao || 'Todas'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Classificação:</span>
              <Badge variant="secondary">{filters.classificacao_inmsd || 'Todas'}</Badge>
            </div>
            <div className="pt-2 border-t text-center text-muted-foreground">
              {filteredMicroregioes.length} resultado(s)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
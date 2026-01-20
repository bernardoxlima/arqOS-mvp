import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, Copy, Trash2, ChevronDown, ChevronUp, Merge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface GeneratedItem {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  selected: boolean;
  isLayout: boolean;
  isExtra?: boolean;
}

interface DuplicateGroup {
  key: string;
  items: GeneratedItem[];
  normalizedName: string;
  ambiente: string;
}

interface DuplicateAnalysisProps {
  items: GeneratedItem[];
  onRemoveItem: (id: string) => void;
  onMergeItems: (keepId: string, removeIds: string[], totalQty: number) => void;
}

// Normaliza nome para comparação
const normalizeForComparison = (name: string): string => {
  return name
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[^A-ZÁÉÍÓÚÀÂÊÔÃÕÇÜ0-9\s]/g, '')
    .trim();
};

// Extrai nome base sem ambiente
const extractBaseName = (fullName: string): { baseName: string; ambiente: string } => {
  const parts = fullName.split(' - ');
  if (parts.length >= 2) {
    const ambiente = parts.pop() || '';
    return { baseName: parts.join(' - '), ambiente };
  }
  return { baseName: fullName, ambiente: '' };
};

export const DuplicateAnalysis = ({ items, onRemoveItem, onMergeItems }: DuplicateAnalysisProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<Record<string, string[]>>({});

  // Detecta grupos de itens duplicados ou similares
  const duplicateGroups = useMemo(() => {
    const groups: Record<string, GeneratedItem[]> = {};
    
    items.forEach(item => {
      const { baseName, ambiente } = extractBaseName(item.nome);
      const normalized = normalizeForComparison(baseName);
      
      // Cria chave única por nome normalizado + ambiente
      const key = `${normalized}__${ambiente.toUpperCase()}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    // Filtra apenas grupos com mais de 1 item (duplicados)
    const duplicates: DuplicateGroup[] = [];
    
    Object.entries(groups).forEach(([key, groupItems]) => {
      if (groupItems.length > 1) {
        const { baseName, ambiente } = extractBaseName(groupItems[0].nome);
        duplicates.push({
          key,
          items: groupItems,
          normalizedName: baseName,
          ambiente,
        });
      }
    });

    return duplicates;
  }, [items]);

  // Detecta itens muito similares (mesmo nome base, ambientes diferentes)
  const similarGroups = useMemo(() => {
    const baseGroups: Record<string, GeneratedItem[]> = {};
    
    items.forEach(item => {
      const { baseName } = extractBaseName(item.nome);
      const normalized = normalizeForComparison(baseName);
      
      if (!baseGroups[normalized]) {
        baseGroups[normalized] = [];
      }
      baseGroups[normalized].push(item);
    });

    // Grupos com mesmo nome mas ambientes diferentes (que não são duplicados exatos)
    const similars: DuplicateGroup[] = [];
    
    Object.entries(baseGroups).forEach(([normalized, groupItems]) => {
      if (groupItems.length > 1) {
        // Verifica se tem ambientes diferentes
        const ambientes = new Set(groupItems.map(i => extractBaseName(i.nome).ambiente));
        if (ambientes.size > 1) {
          similars.push({
            key: normalized,
            items: groupItems,
            normalizedName: groupItems[0].nome.split(' - ')[0] || groupItems[0].nome,
            ambiente: 'Múltiplos',
          });
        }
      }
    });

    return similars;
  }, [items]);

  const hasDuplicates = duplicateGroups.length > 0;
  const hasSimilars = similarGroups.length > 0;
  const totalIssues = duplicateGroups.length + similarGroups.length;

  const toggleMergeSelection = (groupKey: string, itemId: string) => {
    setSelectedForMerge(prev => {
      const current = prev[groupKey] || [];
      if (current.includes(itemId)) {
        return { ...prev, [groupKey]: current.filter(id => id !== itemId) };
      }
      return { ...prev, [groupKey]: [...current, itemId] };
    });
  };

  const handleMergeGroup = (group: DuplicateGroup) => {
    const selected = selectedForMerge[group.key] || [];
    if (selected.length < 2) return;

    // Primeiro selecionado é o que fica, outros são removidos
    const keepId = selected[0];
    const removeIds = selected.slice(1);
    
    // Soma as quantidades
    const totalQty = group.items
      .filter(i => selected.includes(i.id))
      .reduce((sum, i) => sum + i.quantidade, 0);

    onMergeItems(keepId, removeIds, totalQty);
    
    // Limpa seleção
    setSelectedForMerge(prev => {
      const { [group.key]: _, ...rest } = prev;
      return rest;
    });
  };

  if (!hasDuplicates && !hasSimilars) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <Check className="w-5 h-5" />
          <span className="font-medium">Nenhum item duplicado detectado</span>
        </div>
        <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1 ml-7">
          Todos os {items.length} itens parecem únicos
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">
            {totalIssues} possível(is) duplicidade(s) encontrada(s)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-amber-600 dark:text-amber-500">
            Clique para {isExpanded ? 'ocultar' : 'revisar'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-amber-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-amber-600" />
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-amber-200 dark:border-amber-800"
          >
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {/* Duplicados exatos */}
              {duplicateGroups.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Itens duplicados (mesmo nome e ambiente)
                  </h4>
                  
                  {duplicateGroups.map(group => (
                    <div 
                      key={group.key}
                      className="bg-white dark:bg-black/30 rounded-lg p-3 border border-amber-200 dark:border-amber-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          "{group.normalizedName}" 
                          {group.ambiente && (
                            <span className="text-muted-foreground"> - {group.ambiente}</span>
                          )}
                        </span>
                        <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">
                          {group.items.length} iguais
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {group.items.map(item => {
                          const isSelected = (selectedForMerge[group.key] || []).includes(item.id);
                          return (
                            <div 
                              key={item.id}
                              className={`flex items-center gap-2 p-2 rounded text-sm transition-colors ${
                                isSelected 
                                  ? 'bg-amber-100 dark:bg-amber-900/50' 
                                  : 'bg-muted/50'
                              }`}
                            >
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => toggleMergeSelection(group.key, item.id)}
                              />
                              <span className="flex-1">{item.nome}</span>
                              <span className="text-muted-foreground">×{item.quantidade}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onRemoveItem(item.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>

                      {(selectedForMerge[group.key]?.length || 0) >= 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full text-amber-700 border-amber-300 hover:bg-amber-100"
                          onClick={() => handleMergeGroup(group)}
                        >
                          <Merge className="w-3 h-3 mr-1" />
                          Mesclar selecionados (soma quantidades)
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Itens similares */}
              {similarGroups.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Itens similares em ambientes diferentes
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Estes itens têm o mesmo nome mas estão em ambientes diferentes. Verifique se é intencional.
                  </p>
                  
                  {similarGroups.map(group => (
                    <div 
                      key={group.key}
                      className="bg-blue-50/50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          "{group.normalizedName}"
                        </span>
                        <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                          {group.items.length} ambientes
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {group.items.map(item => {
                          const { ambiente } = extractBaseName(item.nome);
                          return (
                            <div 
                              key={item.id}
                              className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-black/20 text-sm"
                            >
                              <span className="flex-1">{item.nome}</span>
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                {ambiente}
                              </span>
                              <span className="text-muted-foreground">×{item.quantidade}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

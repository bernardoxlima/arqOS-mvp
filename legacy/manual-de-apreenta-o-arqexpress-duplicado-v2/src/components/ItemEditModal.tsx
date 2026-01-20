import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Link, Image, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloorPlanItem, ItemCategory, LAYOUT_CATEGORIES, COMPLEMENTARY_CATEGORIES } from "@/types/presentation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemEditModalProps {
  item: FloorPlanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: FloorPlanItem) => void;
  categories: typeof LAYOUT_CATEGORIES | typeof COMPLEMENTARY_CATEGORIES;
}

const DEFAULT_AMBIENTES = [
  "Sala de Estar",
  "Sala de Jantar",
  "Sala de Estar e Jantar",
  "Cozinha",
  "Lavanderia",
  "Banheiro Social",
  "Banheiro Suíte",
  "Suíte",
  "Quarto 1",
  "Quarto 2",
  "Home Office",
  "Varanda",
  "Hall de Entrada",
  "Área Gourmet",
  "Geral",
];

const UNIDADES = ["Qt.", "m²", "m", "un", "pç", "cx", "kg", "L"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Map AI categories to our ItemCategory
const mapCategory = (aiCategory: string): ItemCategory => {
  const mapping: Record<string, ItemCategory> = {
    mobiliario: 'mobiliario',
    marcenaria: 'marcenaria',
    iluminacao: 'iluminacao',
    decoracao: 'decoracao',
    materiais: 'materiais',
    outros: 'outros',
  };
  return mapping[aiCategory] || 'mobiliario';
};

export const ItemEditModal = ({
  item,
  isOpen,
  onClose,
  onSave,
  categories,
}: ItemEditModalProps) => {
  const { toast } = useToast();
  const [isExtractingProduct, setIsExtractingProduct] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  
  // Form state
  const [editName, setEditName] = useState("");
  const [editAmbiente, setEditAmbiente] = useState(DEFAULT_AMBIENTES[0]);
  const [editCategory, setEditCategory] = useState<ItemCategory>("mobiliario");
  const [editQuantidade, setEditQuantidade] = useState(1);
  const [editUnidade, setEditUnidade] = useState("Qt.");
  const [editValor, setEditValor] = useState<number | ''>(0);
  const [editFornecedor, setEditFornecedor] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editImagem, setEditImagem] = useState<string>("");

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setEditName(item.name);
      setEditAmbiente(item.ambiente);
      setEditCategory(item.category);
      setEditQuantidade(item.quantidade || 1);
      setEditUnidade(item.unidade || "Qt.");
      setEditValor(item.valorProduto || 0);
      setEditFornecedor(item.fornecedor || "");
      setEditLink(item.link || "");
      setEditImagem(item.imagem || "");
    }
  }, [item]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditImagem(ev.target?.result as string);
      toast({
        title: "Imagem adicionada! 📷",
        description: "A foto do produto foi carregada.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // Extract product info from URL using AI
  const extractProductFromLink = async (url: string) => {
    if (!url.trim() || !url.includes('http')) return;
    
    setIsExtractingProduct(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-product-info', {
        body: { url: url.trim() }
      });

      if (error) {
        console.error('Error extracting product:', error);
        toast({
          title: "Erro ao extrair informações",
          description: "Não foi possível obter dados do produto. Preencha manualmente.",
          variant: "destructive",
        });
        return;
      }

      if (data?.success && data?.data) {
        const product = data.data;
        
        // Auto-fill the form
        if (product.nome) setEditName(product.nome);
        if (product.preco && product.preco > 0) setEditValor(product.preco);
        if (product.fornecedor) setEditFornecedor(product.fornecedor);
        if (product.categoria) setEditCategory(mapCategory(product.categoria));
        if (product.imagem) setEditImagem(product.imagem);
        
        toast({
          title: "Produto identificado! ✨",
          description: `${product.nome}${product.preco > 0 ? ` - ${formatCurrency(product.preco)}` : ''}${product.imagem ? ' (com imagem)' : ''}`,
        });
      } else {
        toast({
          title: "Não foi possível extrair",
          description: data?.error || "Preencha os dados manualmente.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExtractingProduct(false);
    }
  };

  const handleSave = () => {
    if (!item || !editName.trim()) return;

    const updatedItem: FloorPlanItem = {
      ...item,
      name: editName.trim().toUpperCase(),
      ambiente: editAmbiente.toUpperCase(),
      category: editCategory,
      quantidade: editQuantidade,
      unidade: editUnidade,
      valorProduto: typeof editValor === 'number' ? editValor : 0,
      fornecedor: editFornecedor.trim().toUpperCase(),
      link: editLink.trim(),
      imagem: editImagem,
    };

    onSave(updatedItem);
    onClose();
  };

  const itemTotal = (typeof editValor === 'number' ? editValor : 0) * editQuantidade;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Item
            {item && (
              <span className="text-muted-foreground text-sm font-normal">
                #{item.number}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Link do Produto com extração automática */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Link do produto (para extração automática)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://..."
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  className="h-10 text-sm pl-8"
                  disabled={isExtractingProduct}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => extractProductFromLink(editLink)}
                disabled={!editLink.trim() || isExtractingProduct}
                className="h-10 px-4"
              >
                {isExtractingProduct ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Nome do Item */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Nome do Item *</label>
            <Input
              type="text"
              placeholder="Ex: SOFÁ 232CM, MESA DE JANTAR"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Ambiente e Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Ambiente</label>
              <Select value={editAmbiente} onValueChange={setEditAmbiente}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_AMBIENTES.map((amb) => (
                    <SelectItem key={amb} value={amb}>{amb}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Categoria</label>
              <Select 
                value={editCategory} 
                onValueChange={(val) => setEditCategory(val as ItemCategory)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded ${cat.bgColor}`}></span>
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantidade, Unidade, Valor */}
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Qtd</label>
              <Input
                type="number"
                min="1"
                value={editQuantidade}
                onChange={(e) => setEditQuantidade(parseInt(e.target.value) || 1)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Unidade</label>
              <Select value={editUnidade} onValueChange={setEditUnidade}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map((un) => (
                    <SelectItem key={un} value={un}>{un}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium">Valor Unitário R$</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={editValor}
                onChange={(e) => setEditValor(e.target.value ? parseFloat(e.target.value) : '')}
                className="h-9"
              />
            </div>
          </div>

          {/* Fornecedor */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Fornecedor</label>
            <Input
              type="text"
              placeholder="Nome da loja"
              value={editFornecedor}
              onChange={(e) => setEditFornecedor(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Imagem do Produto */}
          <div className="space-y-2">
            <label className="text-xs font-medium flex items-center gap-1">
              <Image className="w-3 h-3" />
              Imagem do Produto
            </label>
            <div className="flex gap-3 items-start">
              {editImagem ? (
                <div className="relative w-24 h-24 rounded border border-border overflow-hidden">
                  <img src={editImagem} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setEditImagem("")}
                    className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                </div>
              ) : (
                <label 
                  className={`w-24 h-24 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-1 ${
                    isDraggingImage 
                      ? 'border-primary bg-primary/10 scale-105' 
                      : 'border-border hover:border-foreground/50 bg-muted/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Upload className={`w-5 h-5 ${isDraggingImage ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs text-center ${isDraggingImage ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {isDraggingImage ? 'Soltar' : 'Arraste ou clique'}
                  </span>
                </label>
              )}
              <p className="text-xs text-muted-foreground flex-1">
                Arraste uma imagem ou clique para fazer upload
              </p>
            </div>
          </div>

          {/* Total */}
          {itemTotal > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {editQuantidade} x {formatCurrency(typeof editValor === 'number' ? editValor : 0)}
                </span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatCurrency(itemTotal)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!editName.trim()}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

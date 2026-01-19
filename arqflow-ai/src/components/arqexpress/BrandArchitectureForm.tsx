import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Loader2,
  Copy,
  Download,
  Target,
  Heart,
  Users,
  Lightbulb,
  TrendingUp,
  Eye,
  Zap
} from 'lucide-react';
import { 
  BRAND_QUESTIONS, 
  DEFAULT_BRAND_ARCHITECTURE,
  BrandArchitecture 
} from '@/lib/brand-architecture-data';
import { supabase } from '@/integrations/supabase/client';

const BLOCKS = ['identity', 'essence', 'audience', 'method', 'transformation', 'vision', 'synthesis'] as const;
type BlockType = typeof BLOCKS[number];

const BLOCK_ICONS: Record<BlockType, typeof Target> = {
  identity: Target,
  essence: Heart,
  audience: Users,
  method: Lightbulb,
  transformation: Zap,
  vision: TrendingUp,
  synthesis: Eye
};

export function BrandArchitectureForm() {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState<BrandArchitecture>(DEFAULT_BRAND_ARCHITECTURE);
  const [brandbook, setBrandbook] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const currentBlockKey = BLOCKS[currentBlock];
  const currentBlockData = BRAND_QUESTIONS[currentBlockKey];
  const progress = ((currentBlock + 1) / BLOCKS.length) * 100;

  const updateAnswer = (blockKey: BlockType, questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [blockKey]: {
        ...prev[blockKey],
        [questionId]: value
      }
    }));
  };

  const toggleMultiSelect = (blockKey: BlockType, questionId: string, option: string) => {
    const current = (answers[blockKey] as any)[questionId] as string[] || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    updateAnswer(blockKey, questionId, updated);
  };

  const generateBrandbook = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('brand-architecture-ai', {
        body: { answers }
      });

      if (error) throw error;
      
      setBrandbook(data.brandbook);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao gerar brandbook:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (brandbook) {
      await navigator.clipboard.writeText(brandbook);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const Icon = BLOCK_ICONS[currentBlockKey];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="arq-card p-5 bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-violet-900 mb-1">Arquitetura de Marca</h3>
            <p className="text-sm text-violet-700">
              Defina missão, visão, valores, propósito e posicionamento do seu escritório.
              A IA irá gerar um brandbook completo e personalizado.
            </p>
          </div>
        </div>
      </div>

      {showForm ? (
        <>
          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {currentBlock + 1} / {BLOCKS.length}
            </span>
          </div>

          {/* Block Navigation Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {BLOCKS.map((block, index) => {
              const BlockIcon = BLOCK_ICONS[block];
              const blockData = BRAND_QUESTIONS[block];
              return (
                <button
                  key={block}
                  onClick={() => setCurrentBlock(index)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    index === currentBlock 
                      ? 'bg-primary text-primary-foreground' 
                      : index < currentBlock
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {index < currentBlock ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <BlockIcon className="w-4 h-4" />
                  )}
                  {blockData.block}
                </button>
              );
            })}
          </div>

          {/* Current Block */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBlockKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="arq-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{currentBlockData.block}</h3>
                  <p className="text-sm text-muted-foreground">{currentBlockData.subtitle}</p>
                </div>
              </div>

              <div className="space-y-5">
                {currentBlockData.questions.map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium mb-2">
                      {question.label}
                    </label>
                    
                    {question.type === 'text' && (
                      <input
                        type="text"
                        value={(answers[currentBlockKey] as any)[question.id] || ''}
                        onChange={(e) => updateAnswer(currentBlockKey, question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="arq-input"
                      />
                    )}

                    {question.type === 'textarea' && (
                      <textarea
                        value={(answers[currentBlockKey] as any)[question.id] || ''}
                        onChange={(e) => updateAnswer(currentBlockKey, question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="arq-input min-h-[100px] resize-y"
                      />
                    )}

                    {question.type === 'select' && (
                      <select
                        value={(answers[currentBlockKey] as any)[question.id] || ''}
                        onChange={(e) => updateAnswer(currentBlockKey, question.id, e.target.value)}
                        className="arq-select"
                      >
                        <option value="">Selecione...</option>
                        {question.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {question.type === 'multiselect' && (
                      <div className="flex flex-wrap gap-2">
                        {question.options?.map(opt => {
                          const selected = ((answers[currentBlockKey] as any)[question.id] || []).includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleMultiSelect(currentBlockKey, question.id, opt)}
                              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                selected 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'bg-background border-border hover:border-primary/50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentBlock(prev => Math.max(0, prev - 1))}
              disabled={currentBlock === 0}
              className="arq-btn-secondary"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            {currentBlock < BLOCKS.length - 1 ? (
              <button
                onClick={() => setCurrentBlock(prev => prev + 1)}
                className="arq-btn-primary"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={generateBrandbook}
                disabled={isGenerating}
                className="arq-btn-primary bg-gradient-to-r from-violet-500 to-blue-500"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando Brandbook...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Brandbook com IA
                  </>
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        /* Brandbook Result */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Brandbook Gerado
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="arq-btn-secondary text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar ao Formulário
              </button>
              <button
                onClick={copyToClipboard}
                className="arq-btn-secondary text-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button className="arq-btn-secondary text-sm">
                <Download className="w-4 h-4" />
                Baixar PDF
              </button>
            </div>
          </div>
          
          <div className="arq-card p-6 max-h-[600px] overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              {brandbook?.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{line.replace('# ', '')}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-semibold mt-5 mb-3 text-violet-700">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-medium mt-4 mb-2">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={index} className="font-semibold mt-3">{line.replace(/\*\*/g, '')}</p>;
                }
                if (line.startsWith('- ')) {
                  return <li key={index} className="ml-4">{line.replace('- ', '')}</li>;
                }
                if (line.startsWith('---')) {
                  return <hr key={index} className="my-6 border-border" />;
                }
                if (line.trim() === '') {
                  return <br key={index} />;
                }
                return <p key={index} className="mb-2">{line}</p>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

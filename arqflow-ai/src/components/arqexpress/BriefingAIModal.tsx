import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  FileText, 
  Image, 
  Loader2, 
  Check, 
  Copy,
  Download,
  Home
} from 'lucide-react';
import { Project } from '@/lib/arqexpress-data';
import { supabase } from '@/integrations/supabase/client';

interface BriefingAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onMemorialGenerated?: (memorial: string) => void;
  onMoodboardGenerated?: (prompt: string) => void;
  onReferenceGenerated?: (prompt: string) => void;
}

type AIMode = 'memorial' | 'moodboard' | 'reference';

export function BriefingAIModal({ 
  isOpen, 
  onClose, 
  project,
  onMemorialGenerated,
  onMoodboardGenerated,
  onReferenceGenerated
}: BriefingAIModalProps) {
  const [mode, setMode] = useState<AIMode>('memorial');
  const [transcription, setTranscription] = useState('');
  const [memorial, setMemorial] = useState('');
  const [moodboardPrompt, setMoodboardPrompt] = useState('');
  const [referencePrompt, setReferencePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerateMemorial = async () => {
    if (!transcription.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('briefing-ai', {
        body: { 
          type: 'memorial',
          transcription,
          clientName: project.client,
          projectCode: project.code,
          architectName: 'Equipe'
        }
      });

      if (error) throw error;
      
      setMemorial(data.memorial);
      onMemorialGenerated?.(data.memorial);
    } catch (error) {
      console.error('Erro ao gerar memorial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMoodboard = async () => {
    if (!memorial.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('briefing-ai', {
        body: { 
          type: 'moodboard',
          memorial,
          clientName: project.client
        }
      });

      if (error) throw error;
      
      setMoodboardPrompt(data.prompt);
      onMoodboardGenerated?.(data.prompt);
    } catch (error) {
      console.error('Erro ao gerar prompt de moodboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReference = async () => {
    if (!memorial.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('briefing-ai', {
        body: { 
          type: 'reference',
          memorial,
          clientName: project.client
        }
      });

      if (error) throw error;
      
      setReferencePrompt(data.prompt);
      onReferenceGenerated?.(data.prompt);
    } catch (error) {
      console.error('Erro ao gerar prompt de referência:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-background rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">IA de Briefing</h2>
                <p className="text-xs text-muted-foreground">
                  {project.code} • {project.client}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setMode('memorial')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === 'memorial' 
                  ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              1. Documento
            </button>
            <button
              onClick={() => setMode('moodboard')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === 'moodboard' 
                  ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Image className="w-4 h-4" />
              2. Moodboard
            </button>
            <button
              onClick={() => setMode('reference')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === 'reference' 
                  ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="w-4 h-4" />
              3. Referência Visual
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {mode === 'memorial' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Transcrição do Briefing ou Reunião
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Cole aqui a transcrição da reunião com o cliente ou as notas do briefing. 
                    A IA irá transformar em um documento de briefing estruturado profissional.
                  </p>
                  <textarea
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder="Cole aqui a transcrição da reunião ou as notas do briefing..."
                    className="arq-input min-h-[200px] resize-y"
                  />
                </div>

                <button
                  onClick={handleGenerateMemorial}
                  disabled={!transcription.trim() || isLoading}
                  className="arq-btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando Documento de Briefing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Documento de Briefing
                    </>
                  )}
                </button>

                {memorial && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">Documento de Briefing Gerado</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(memorial, 'memorial')}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {copiedField === 'memorial' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedField === 'memorial' ? 'Copiado!' : 'Copiar'}
                        </button>
                        <button
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Download className="w-3 h-3" />
                          Baixar MD
                        </button>
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-[400px] overflow-y-auto font-mono text-xs">
                      {memorial}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMode('moodboard')}
                        className="arq-btn-secondary flex-1"
                      >
                        <Image className="w-4 h-4" />
                        Gerar Moodboard
                      </button>
                      <button
                        onClick={() => setMode('reference')}
                        className="arq-btn-secondary flex-1"
                      >
                        <Home className="w-4 h-4" />
                        Gerar Referência Visual
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : mode === 'moodboard' ? (
              <div className="space-y-4">
                {!memorial ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Atenção:</strong> Para gerar o moodboard, primeiro você precisa gerar o documento de briefing na aba anterior.
                    </p>
                    <button
                      onClick={() => setMode('memorial')}
                      className="mt-2 text-sm text-amber-600 hover:text-amber-700 underline"
                    >
                      Ir para Gerar Documento
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Documento de Referência:</h4>
                      <p className="text-sm line-clamp-3">{memorial.slice(0, 300)}...</p>
                    </div>

                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                      <p className="text-sm text-violet-800">
                        <strong>Flat Lay Moodboard:</strong> O prompt será otimizado para criar um moodboard editorial minimalista com vista superior, amostras de materiais e texturas sobrepostas em camadas, composição sofisticada com elementos geométricos.
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateMoodboard}
                      disabled={isLoading}
                      className="arq-btn-primary w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando Prompt para Moodboard...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Gerar Prompt de Moodboard Flat Lay
                        </>
                      )}
                    </button>

                    {moodboardPrompt && (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">Prompt para Moodboard</h3>
                          <button
                            onClick={() => copyToClipboard(moodboardPrompt, 'moodboard')}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {copiedField === 'moodboard' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedField === 'moodboard' ? 'Copiado!' : 'Copiar Prompt'}
                          </button>
                        </div>
                        <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap font-mono">{moodboardPrompt}</p>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            Use este prompt em uma ferramenta de IA generativa como:
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <a
                              href="https://www.midjourney.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-violet-600 hover:underline"
                            >
                              Midjourney
                            </a>
                            <span className="text-muted-foreground">•</span>
                            <a
                              href="https://chat.openai.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-violet-600 hover:underline"
                            >
                              ChatGPT (DALL-E)
                            </a>
                            <span className="text-muted-foreground">•</span>
                            <a
                              href="https://leonardo.ai"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-violet-600 hover:underline"
                            >
                              Leonardo.ai
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {!memorial ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Atenção:</strong> Para gerar referências visuais, primeiro você precisa gerar o documento de briefing na aba anterior.
                    </p>
                    <button
                      onClick={() => setMode('memorial')}
                      className="mt-2 text-sm text-amber-600 hover:text-amber-700 underline"
                    >
                      Ir para Gerar Documento
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Documento de Referência:</h4>
                      <p className="text-sm line-clamp-3">{memorial.slice(0, 300)}...</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Referência Visual:</strong> O prompt será otimizado para criar uma imagem realista do ambiente descrito no briefing, com renderização 3D ultra-realista, iluminação natural e todos os elementos de mobiliário e acabamento especificados.
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateReference}
                      disabled={isLoading}
                      className="arq-btn-primary w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando Prompt de Referência...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Gerar Prompt de Referência Visual
                        </>
                      )}
                    </button>

                    {referencePrompt && (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">Prompt para Referência Visual</h3>
                          <button
                            onClick={() => copyToClipboard(referencePrompt, 'reference')}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {copiedField === 'reference' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedField === 'reference' ? 'Copiado!' : 'Copiar Prompt'}
                          </button>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap font-mono">{referencePrompt}</p>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            Use este prompt para gerar imagens realistas do ambiente:
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <a
                              href="https://www.midjourney.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Midjourney
                            </a>
                            <span className="text-muted-foreground">•</span>
                            <a
                              href="https://chat.openai.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              ChatGPT (DALL-E)
                            </a>
                            <span className="text-muted-foreground">•</span>
                            <a
                              href="https://leonardo.ai"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Leonardo.ai
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
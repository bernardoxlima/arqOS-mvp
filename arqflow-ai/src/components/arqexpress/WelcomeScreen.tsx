import { motion } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';

export function WelcomeScreen() {
  const { setView, setOffice } = useArqExpress();

  const handleDevMode = () => {
    // Pre-fill with sample data to skip setup
    setOffice({
      name: 'Escritório Demo',
      size: 'medium',
      team: [
        { id: 1, name: 'Arquiteta Principal', role: 'senior', salary: 12000, hours: 160 },
        { id: 2, name: 'Designer', role: 'pleno', salary: 6000, hours: 160 },
      ],
      costs: { rent: 3000, utilities: 500, software: 800, marketing: 1000, accountant: 500, internet: 200, others: 300 },
      services: ['decoracao', 'interiores', 'arquitetonico'],
      margin: 30,
    });
    setView('overview');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md px-6"
      >
        {/* Logo */}
        <motion.h1 
          initial={{ opacity: 0, letterSpacing: '0.1em' }}
          animate={{ opacity: 1, letterSpacing: '0.2em' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl font-extralight tracking-widest-xl mb-2"
        >
          ARQEXPRESS
        </motion.h1>
        
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="w-16 h-0.5 bg-primary mx-auto mb-4"
        />
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground mb-10"
        >
          Sistema de gestão para arquitetura
        </motion.p>
        
        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('setup')} 
          className="arq-btn-primary px-10 py-4 text-sm tracking-widest"
        >
          COMEÇAR SETUP
          <ChevronRight className="w-4 h-4" />
        </motion.button>

        {/* Dev Mode Button */}
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDevMode}
          className="mt-4 px-6 py-2 text-xs text-muted-foreground hover:text-primary border border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <Zap className="w-3 h-3" />
          MODO DEV
        </motion.button>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
          className="mt-8 text-xs text-muted-foreground"
        >
          Versão Pro • Powered by AI
        </motion.p>
      </motion.div>
    </div>
  );
}

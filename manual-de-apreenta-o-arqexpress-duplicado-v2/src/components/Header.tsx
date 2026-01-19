import { motion } from "framer-motion";
import logoArqexpress from "@/assets/logo-arqexpress.png";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background border-b border-border py-8 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center justify-center"
        >
          {/* Logo */}
          <img 
            src={logoArqexpress} 
            alt="ARQEXPRESS" 
            className="h-10 md:h-12 mb-3"
          />
          
          {/* Divider */}
          <div className="w-48 h-px bg-foreground mb-3" />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground uppercase tracking-widest"
          >
            Gerador de Apresentações
          </motion.p>
        </motion.div>
      </div>
    </motion.header>
  );
};

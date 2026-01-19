import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface ValidationItem {
  id: string;
  label: string;
  isValid: boolean;
  required?: boolean;
}

interface ValidationChecklistProps {
  items: ValidationItem[];
}

export const ValidationChecklist = ({ items }: ValidationChecklistProps) => {
  const allValid = items.filter(i => i.required).every(i => i.isValid);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border p-6"
    >
      <h3 className="text-base font-semibold text-foreground uppercase tracking-wide mb-4">
        Verificação
      </h3>
      
      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={false}
            className="flex items-center gap-3 p-3 border border-border"
          >
            <motion.div
              initial={false}
              animate={{
                backgroundColor: item.isValid 
                  ? "hsl(0 0% 0%)" 
                  : "hsl(0 0% 90%)",
                scale: item.isValid ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.2 }}
              className="w-5 h-5 flex items-center justify-center flex-shrink-0"
            >
              {item.isValid ? (
                <Check className="w-3 h-3 text-background" />
              ) : (
                <X className="w-3 h-3 text-muted-foreground" />
              )}
            </motion.div>
            <span className={`text-sm ${item.isValid ? "text-foreground" : "text-muted-foreground"}`}>
              {item.label}
              {item.required && (
                <span className="text-foreground ml-1">*</span>
              )}
            </span>
          </motion.div>
        ))}
      </div>
      
      {allValid && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 p-3 bg-foreground text-background flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Tudo pronto para gerar!</span>
        </motion.div>
      )}
    </motion.div>
  );
};

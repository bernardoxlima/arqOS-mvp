import React from 'react';
import { User, Phone, Mail, FileText } from 'lucide-react';

interface ClientFormProps {
  clientName: string;
  setClientName: (value: string) => void;
  clientPhone: string;
  setClientPhone: (value: string) => void;
  clientEmail: string;
  setClientEmail: (value: string) => void;
  projectNotes: string;
  setProjectNotes: (value: string) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientEmail,
  setClientEmail,
  projectNotes,
  setProjectNotes,
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 mb-6 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            Cliente *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border-0 rounded-xl text-sm focus:ring-2 focus:ring-accent transition-all placeholder:text-muted-foreground/60"
              placeholder="Nome completo"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            Telefone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border-0 rounded-xl text-sm focus:ring-2 focus:ring-accent transition-all placeholder:text-muted-foreground/60"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border-0 rounded-xl text-sm focus:ring-2 focus:ring-accent transition-all placeholder:text-muted-foreground/60"
              placeholder="email@exemplo.com"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            Observações
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border-0 rounded-xl text-sm focus:ring-2 focus:ring-accent transition-all placeholder:text-muted-foreground/60"
              placeholder="Detalhes do projeto..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;

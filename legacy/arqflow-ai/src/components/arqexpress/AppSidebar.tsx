import { 
  LayoutDashboard, 
  Calculator, 
  FileText, 
  Briefcase, 
  DollarSign,
  Settings,
  Percent,
  Users,
  Sparkles,
  Eye
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { formatCurrency, getHealthIndicator } from '@/lib/arqexpress-data';

export function AppSidebar() {
  const { view, setView, office, officeTotals, budgets } = useArqExpress();
  
  const draftCount = budgets.filter(b => b.status === 'draft').length;
  const health = getHealthIndicator(office.margin);

  const mainNavItems = [
    { id: 'overview' as const, icon: Eye, label: 'Visão Geral' },
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'calculator' as const, icon: Calculator, label: 'Calculadora' },
    { id: 'budgets' as const, icon: FileText, label: 'Orçamentos', badge: draftCount },
    { id: 'projects' as const, icon: Briefcase, label: 'Projetos' },
    { id: 'finances' as const, icon: DollarSign, label: 'Financeiro' },
  ];

  const configNavItems = [
    { id: 'templates' as const, icon: Settings, label: 'Serviços' },
    { id: 'pricing' as const, icon: Percent, label: 'Precificação' },
    { id: 'team' as const, icon: Users, label: 'Equipe' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-52 bg-card border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <h1 className="text-xs tracking-widest-xl font-semibold">ARQEXPRESS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto scrollbar-thin">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 py-2">
          Principal
        </p>
        
        {mainNavItems.map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`sidebar-nav-item ${
              view === id ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="flex-1 text-left">{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                {badge}
              </span>
            )}
          </button>
        ))}

        <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 py-2 mt-3">
          Configuração
        </p>

        {configNavItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`sidebar-nav-item ${
              view === id ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}

        {/* AI Features Teaser */}
        <div className="mt-4 mx-2 p-3 bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-semibold text-violet-800">IA Integrada</span>
          </div>
          <p className="text-[10px] text-violet-600">
            Assistente de IA disponível em cada etapa do projeto
          </p>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex justify-between items-center mb-1">
          <p className="font-medium text-sm truncate max-w-[120px]">
            {office.name || 'Escritório'}
          </p>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            office.margin >= 50 ? 'bg-emerald-100 text-emerald-700' :
            office.margin >= 30 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {health.emoji} {office.margin}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(officeTotals.hourly)}/hora • {office.team.length} pessoas
        </p>
      </div>
    </aside>
  );
}

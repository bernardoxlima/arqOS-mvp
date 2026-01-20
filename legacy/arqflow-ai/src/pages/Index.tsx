import { ArqExpressProvider, useArqExpress } from '@/contexts/ArqExpressContext';
import { AppSidebar } from '@/components/arqexpress/AppSidebar';
import { WelcomeScreen } from '@/components/arqexpress/WelcomeScreen';
import { SetupWizard } from '@/components/arqexpress/SetupWizard';
import { OverviewView } from '@/components/arqexpress/OverviewView';
import { DashboardView } from '@/components/arqexpress/DashboardView';
import { CalculatorView } from '@/components/arqexpress/CalculatorView';
import { BudgetsListView } from '@/components/arqexpress/BudgetsListView';
import { BudgetDetailView } from '@/components/arqexpress/BudgetDetailView';
import { KanbanView } from '@/components/arqexpress/KanbanView';
import { ProjectRegisterView } from '@/components/arqexpress/ProjectRegisterView';
import { FinancesView } from '@/components/arqexpress/FinancesView';
import { TemplatesView } from '@/components/arqexpress/TemplatesView';

function ArqExpressApp() {
  const { view } = useArqExpress();

  // Welcome and Setup screens are full-page
  if (view === 'welcome') return <WelcomeScreen />;
  if (view === 'setup') return <SetupWizard />;

  // Main app with sidebar
  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <main className="flex-1 ml-52 p-6 overflow-auto">
        {view === 'overview' && <OverviewView />}
        {view === 'dashboard' && <DashboardView />}
        {view === 'calculator' && <CalculatorView />}
        {view === 'budgets' && <BudgetsListView />}
        {view === 'budget-detail' && <BudgetDetailView />}
        {view === 'projects' && <KanbanView />}
        {view === 'project-register' && <ProjectRegisterView />}
        {view === 'finances' && <FinancesView />}
        {view === 'templates' && <TemplatesView />}
        {view === 'pricing' && (
          <div className="arq-card p-8 text-center">
            <h2 className="text-xl font-light mb-2">Precificação</h2>
            <p className="text-muted-foreground">Em desenvolvimento - Configure preços por ambiente e m²</p>
          </div>
        )}
        {view === 'team' && (
          <div className="arq-card p-8 text-center">
            <h2 className="text-xl font-light mb-2">Equipe</h2>
            <p className="text-muted-foreground">Em desenvolvimento - Gerencie membros da equipe</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Index() {
  return (
    <ArqExpressProvider>
      <ArqExpressApp />
    </ArqExpressProvider>
  );
}

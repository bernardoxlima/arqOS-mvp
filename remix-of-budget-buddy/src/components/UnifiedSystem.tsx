import React, { useState } from 'react';
import { Calculator, Building2, FileText, List, Save, Plus, RefreshCw, ArrowLeft, LayoutGrid, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ServiceId } from '@/data/companyData';

// Overview components
import CompanyHero from '@/components/overview/CompanyHero';
import CompanyInfo from '@/components/overview/CompanyInfo';
import ServicePortfolio from '@/components/overview/ServicePortfolio';

// Service components
import ServiceDetail from '@/components/services/ServiceDetail';

// Financial components
import FinancialDashboard from '@/components/financial/FinancialDashboard';

// Calculator components
import ClientForm from '@/components/calculator/ClientForm';
import ServiceSelector from '@/components/calculator/ServiceSelector';
import DecorConfig from '@/components/calculator/DecorConfig';
import ProjetConfig from '@/components/calculator/ProjetConfig';
import ResultDisplay from '@/components/calculator/ResultDisplay';
import SavedBudgets from '@/components/calculator/SavedBudgets';
import ReferenceTable from '@/components/calculator/ReferenceTable';

// Project components
import ProjectDashboard from '@/components/projects/ProjectDashboard';
import BudgetSummaryModal from '@/components/projects/BudgetSummaryModal';

import { useToast } from '@/hooks/use-toast';
import type { EnvironmentConfig, SavedBudget, Calculation } from '@/types/budget';
import type { Project } from '@/types/project';
import { getStagesForService } from '@/types/project';
import {
  HOUR_VALUE,
  decorExpressPricing,
  producaoPricing,
  projetExpressPricing,
  environmentTypeMultipliers,
  sizeMultipliers,
} from '@/data/pricingData';
import { generateProposalPDF } from '@/utils/pdfGenerator';
import { generateProposalDOC } from '@/utils/docGenerator';

type MainTab = 'overview' | 'financial' | 'calculator' | 'savedBudgets' | 'projects' | 'referenceTable';
type OverviewSubView = 'main' | 'serviceDetail';
type ServiceType = 'decorexpress' | 'producao' | 'projetexpress';

const UnifiedSystem: React.FC = () => {
  const { toast } = useToast();
  
  // Main navigation
  const [mainTab, setMainTab] = useState<MainTab>('overview');
  const [overviewSubView, setOverviewSubView] = useState<OverviewSubView>('main');
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceId | null>(null);
  const [pendingBudgetForSummary, setPendingBudgetForSummary] = useState<SavedBudget | null>(null);
  const [isNewBudget, setIsNewBudget] = useState(false);

  // Calculator state (same as before)
  const [selectedService, setSelectedService] = useState<ServiceType>('decorexpress');
  const [selectedSize, setSelectedSize] = useState('1');
  const [paymentType, setPaymentType] = useState<'cash' | 'installments'>('cash');
  const [discountPercentage, setDiscountPercentage] = useState(5);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [environmentsConfig, setEnvironmentsConfig] = useState<EnvironmentConfig[]>([
    { type: 'standard', size: 'P', complexity: 'decor1' },
  ]);
  const [extraEnvironments, setExtraEnvironments] = useState(0);
  const [extraEnvironmentPrice, setExtraEnvironmentPrice] = useState(1200);
  const [serviceModality, setServiceModality] = useState<'online' | 'presencial'>('online');
  const [surveyFee, setSurveyFee] = useState(1000);
  const [projectArea, setProjectArea] = useState(50);
  const [projectType, setProjectType] = useState<'novo' | 'reforma'>('novo');
  const [includeManagement, setIncludeManagement] = useState(false);
  const [managementFee, setManagementFee] = useState(1500);
  const [savedBudgets, setSavedBudgets] = useState<SavedBudget[]>(() => {
    const saved = localStorage.getItem('arqexpress_budgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentBudgetId, setCurrentBudgetId] = useState<number | null>(null);
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('arqexpress_projects');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('arqexpress_budgets', JSON.stringify(savedBudgets));
  }, [savedBudgets]);

  React.useEffect(() => {
    localStorage.setItem('arqexpress_projects', JSON.stringify(projects));
  }, [projects]);

  // Calculations (copied from PricingCalculator)
  const decorCalculation = React.useMemo((): Calculation | null => {
    if (selectedService !== 'decorexpress') return null;
    let totalPrice = 0, totalHours = 0, totalMultiplier = 0;
    const environmentsDetails = environmentsConfig.map((env, index) => {
      const base = (decorExpressPricing[selectedSize] as any)[env.complexity];
      const typeMultiplier = environmentTypeMultipliers[env.type].multiplier;
      const sizeMultiplier = sizeMultipliers[env.size].multiplier;
      const combinedMultiplier = typeMultiplier * sizeMultiplier;
      const envPrice = (base.price / parseInt(selectedSize)) * combinedMultiplier;
      const envHours = (base.hours / parseInt(selectedSize)) * combinedMultiplier;
      totalPrice += envPrice; totalHours += envHours; totalMultiplier += combinedMultiplier;
      return { index: index + 1, type: env.type, size: env.size, typeMultiplier, sizeMultiplier, combinedMultiplier };
    });
    const avgMultiplier = totalMultiplier / environmentsConfig.length;
    const extrasTotal = extraEnvironments * extraEnvironmentPrice;
    const extrasHours = extraEnvironments * 8;
    const surveyFeeTotal = serviceModality === 'presencial' ? surveyFee : 0;
    const surveyFeeHours = serviceModality === 'presencial' ? 4 : 0;
    const finalPrice = totalPrice + extrasTotal + surveyFeeTotal;
    const finalHours = totalHours + extrasHours + surveyFeeHours;
    const hourRate = finalPrice / finalHours;
    const discount = paymentType === 'cash' ? discountPercentage / 100 : 0;
    const priceWithDiscount = finalPrice * (1 - discount);
    return { basePrice: totalPrice, avgMultiplier, environmentsDetails, priceBeforeExtras: totalPrice, extrasTotal, extrasHours, surveyFeeTotal, surveyFeeHours, finalPrice, priceWithDiscount, discount, estimatedHours: finalHours, hourRate, description: 'Cálculo por ambiente individual', efficiency: hourRate >= HOUR_VALUE ? 'Ótimo' : hourRate >= HOUR_VALUE * 0.9 ? 'Bom' : 'Reajustar' };
  }, [selectedService, selectedSize, environmentsConfig, extraEnvironments, extraEnvironmentPrice, serviceModality, surveyFee, paymentType, discountPercentage]);

  const producaoCalculation = React.useMemo((): Calculation | null => {
    if (selectedService !== 'producao') return null;
    let totalPrice = 0, totalHours = 0;
    environmentsConfig.forEach((env) => {
      const base = (producaoPricing[selectedSize] as any)[env.complexity];
      totalPrice += base.price / parseInt(selectedSize);
      totalHours += base.hours / parseInt(selectedSize);
    });
    const extrasTotal = extraEnvironments * extraEnvironmentPrice;
    const extrasHours = extraEnvironments * 8;
    const finalPrice = totalPrice + extrasTotal;
    const finalHours = totalHours + extrasHours;
    const hourRate = finalPrice / finalHours;
    const discount = paymentType === 'cash' ? discountPercentage / 100 : 0;
    const priceWithDiscount = finalPrice * (1 - discount);
    return { basePrice: totalPrice, extrasTotal, extrasHours, surveyFeeTotal: 0, surveyFeeHours: 0, finalPrice, priceWithDiscount, discount, estimatedHours: finalHours, hourRate, description: 'Cálculo por ambiente individual', efficiency: hourRate >= HOUR_VALUE ? 'Ótimo' : hourRate >= HOUR_VALUE * 0.9 ? 'Bom' : 'Reajustar' };
  }, [selectedService, selectedSize, environmentsConfig, extraEnvironments, extraEnvironmentPrice, paymentType, discountPercentage]);

  const projetCalculation = React.useMemo((): Calculation | null => {
    if (selectedService !== 'projetexpress') return null;
    const ranges = projetExpressPricing[projectType].ranges;
    const range = ranges.find((r) => projectArea >= r.min && projectArea <= r.max) || ranges[ranges.length - 1];
    const basePrice = range.pricePerM2 * projectArea;
    const estimatedHours = range.hours * projectArea;
    const surveyFeeTotal = serviceModality === 'presencial' ? surveyFee : 0;
    const surveyFeeHours = serviceModality === 'presencial' ? 4 : 0;
    const managementTotal = includeManagement ? managementFee : 0;
    const managementHours = includeManagement ? 8 : 0;
    const finalPrice = basePrice + surveyFeeTotal + managementTotal;
    const finalHours = estimatedHours + surveyFeeHours + managementHours;
    const hourRate = finalPrice / finalHours;
    const discount = paymentType === 'cash' ? discountPercentage / 100 : 0;
    const priceWithDiscount = finalPrice * (1 - discount);
    return { basePrice, surveyFeeTotal, surveyFeeHours, extrasTotal: managementTotal, extrasHours: managementHours, finalPrice, priceWithDiscount, discount, pricePerM2: range.pricePerM2, estimatedHours: finalHours, hourRate, efficiency: hourRate >= HOUR_VALUE ? 'Ótimo' : hourRate >= HOUR_VALUE * 0.9 ? 'Bom' : 'Reajustar' };
  }, [selectedService, projectType, projectArea, serviceModality, surveyFee, paymentType, discountPercentage, includeManagement, managementFee]);

  const currentCalculation = selectedService === 'decorexpress' ? decorCalculation : selectedService === 'producao' ? producaoCalculation : projetCalculation;

  // Handlers
  const handleServiceChange = (service: ServiceType) => {
    setSelectedService(service);
    setEnvironmentsConfig([{ type: 'standard', size: 'P', complexity: service === 'decorexpress' ? 'decor1' : 'prod1' }]);
    setSelectedSize('1');
  };

  const updateEnvironmentsCount = (count: string, defaultComplexity: string = 'decor1') => {
    const newConfig: EnvironmentConfig[] = [];
    for (let i = 0; i < parseInt(count); i++) {
      newConfig.push(environmentsConfig[i] || { type: 'standard', size: 'P', complexity: defaultComplexity });
    }
    setEnvironmentsConfig(newConfig);
  };

  const updateEnvironmentConfig = (index: number, field: keyof EnvironmentConfig, value: string) => {
    const newConfig = [...environmentsConfig];
    newConfig[index] = { ...newConfig[index], [field]: value as any };
    setEnvironmentsConfig(newConfig);
  };

  const handleNewBudget = () => {
    setClientName(''); setClientPhone(''); setClientEmail(''); setProjectNotes('');
    setSelectedService('decorexpress'); setSelectedSize('1');
    setEnvironmentsConfig([{ type: 'standard', size: 'P', complexity: 'decor1' }]);
    setExtraEnvironments(0); setExtraEnvironmentPrice(1200);
    setServiceModality('online'); setSurveyFee(1000);
    setPaymentType('cash'); setDiscountPercentage(5);
    setProjectArea(50); setProjectType('novo');
    setIncludeManagement(false); setManagementFee(1500);
    setCurrentBudgetId(null); setMainTab('calculator');
  };

  const handleSaveBudget = () => {
    if (!clientName.trim()) { toast({ title: "Campo obrigatório", description: "Por favor, preencha o nome do cliente", variant: "destructive" }); return; }
    if (!currentCalculation) { toast({ title: "Erro", description: "Por favor, configure o orçamento antes de salvar", variant: "destructive" }); return; }
    const newBudget: SavedBudget = {
      id: currentBudgetId || Date.now(), date: new Date().toLocaleString('pt-BR'),
      clientName: clientName.trim(), clientPhone, clientEmail, projectNotes, service: selectedService,
      serviceDetails: { ...(selectedService === 'projetexpress' ? { projectType, projectArea, includeManagement, managementFee } : { size: selectedSize, environmentsConfig, extraEnvironments, extraEnvironmentPrice }), serviceModality, surveyFee, paymentType, discountPercentage },
      calculation: currentCalculation
    };
    // Show summary modal instead of saving directly
    setPendingBudgetForSummary(newBudget);
    setIsNewBudget(!currentBudgetId);
  };

  const confirmSaveOnly = () => {
    if (!pendingBudgetForSummary) return;
    if (currentBudgetId) { 
      setSavedBudgets((prev) => prev.map((b) => (b.id === currentBudgetId ? pendingBudgetForSummary : b))); 
      toast({ title: "✓ Orçamento atualizado", description: `Proposta para ${pendingBudgetForSummary.clientName} foi atualizada` }); 
    } else { 
      setSavedBudgets((prev) => [...prev, pendingBudgetForSummary]); 
      toast({ title: "✓ Orçamento salvo", description: `Proposta para ${pendingBudgetForSummary.clientName} foi salva` }); 
    }
    setCurrentBudgetId(pendingBudgetForSummary.id);
    setPendingBudgetForSummary(null);
    setMainTab('savedBudgets');
  };

  const confirmSaveAndCreateProject = (arquiteta: string, squad: string, dataBriefing: string, prazoEstimado: string) => {
    if (!pendingBudgetForSummary) return;
    // Save budget first
    if (currentBudgetId) { 
      setSavedBudgets((prev) => prev.map((b) => (b.id === currentBudgetId ? pendingBudgetForSummary : b))); 
    } else { 
      setSavedBudgets((prev) => [...prev, pendingBudgetForSummary]); 
    }
    setCurrentBudgetId(pendingBudgetForSummary.id);
    // Then create project
    handleStartProject(pendingBudgetForSummary, arquiteta, squad, dataBriefing, prazoEstimado);
    setPendingBudgetForSummary(null);
    setMainTab('projects');
  };

  const handleDeleteBudget = (id: number) => { if (confirm('Deseja realmente excluir este orçamento?')) { setSavedBudgets((prev) => prev.filter((b) => b.id !== id)); } };

  const handleLoadBudget = (budget: SavedBudget) => {
    setClientName(budget.clientName); setClientPhone(budget.clientPhone); setClientEmail(budget.clientEmail); setProjectNotes(budget.projectNotes); setSelectedService(budget.service);
    if (budget.service === 'projetexpress') { setProjectType(budget.serviceDetails.projectType || 'novo'); setProjectArea(budget.serviceDetails.projectArea || 50); setIncludeManagement(budget.serviceDetails.includeManagement || false); setManagementFee(budget.serviceDetails.managementFee || 1500); }
    else { setSelectedSize(budget.serviceDetails.size || '1'); setEnvironmentsConfig(budget.serviceDetails.environmentsConfig || [{ type: 'standard', size: 'P', complexity: 'decor1' }]); setExtraEnvironments(budget.serviceDetails.extraEnvironments || 0); setExtraEnvironmentPrice(budget.serviceDetails.extraEnvironmentPrice || 1200); }
    setServiceModality(budget.serviceDetails.serviceModality || 'online'); setSurveyFee(budget.serviceDetails.surveyFee || 1000); setPaymentType(budget.serviceDetails.paymentType); setDiscountPercentage(budget.serviceDetails.discountPercentage || 5); setCurrentBudgetId(budget.id); setMainTab('calculator');
  };

  const handleServiceClick = (serviceId: ServiceId) => { setSelectedServiceDetail(serviceId); setOverviewSubView('serviceDetail'); };

  // Project handlers
  const pendingBudgets = savedBudgets.filter(b => !projects.some(p => p.budgetId === b.id));
  const activeProjectsCount = projects.filter(p => p.status !== 'finalizado').length;

  const handleStartProject = (budget: SavedBudget, arquiteta: string, squad: string, dataBriefing: string, prazoEstimado: string) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      budgetId: budget.id,
      codigo: `${String(projects.length + 1).padStart(3, '0')}_${new Date().getMonth() + 1}_${String(new Date().getFullYear()).slice(-2)}`,
      clientName: budget.clientName,
      clientPhone: budget.clientPhone,
      clientEmail: budget.clientEmail,
      service: budget.service,
      serviceDetails: budget.service === 'projetexpress' 
        ? `${budget.serviceDetails.projectType === 'novo' ? 'Novo' : 'Reforma'} - ${budget.serviceDetails.projectArea}m²`
        : `${budget.serviceDetails.environmentsConfig?.length || 1} ambiente(s)`,
      valor: budget.calculation?.priceWithDiscount || 0,
      horasEstimadas: budget.calculation?.estimatedHours || 0,
      arquiteta,
      squad,
      currentStage: 'briefing',
      dataBriefing,
      prazoEstimado,
      notes: budget.projectNotes,
      entries: [],
      status: 'em_andamento',
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    toast({ title: "✓ Projeto criado", description: `Projeto para ${budget.clientName} iniciado com sucesso!` });
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    toast({ title: "✓ Projeto salvo", description: "Alterações salvas com sucesso!" });
  };

  const handleAdvanceStage = (project: Project, hours: number, description: string) => {
    const stages = getStagesForService(project.service);
    const currentIndex = stages.findIndex(s => s.id === project.currentStage);
    const nextStage = stages[currentIndex + 1];

    const updatedProject: Project = {
      ...project,
      entries: [...project.entries, {
        stageId: project.currentStage,
        stageName: stages[currentIndex]?.name || project.currentStage,
        hours,
        description,
        date: new Date().toISOString(),
      }],
      currentStage: nextStage?.id || project.currentStage,
      status: nextStage?.id === 'finalizado' ? 'finalizado' : 'em_andamento',
      completedAt: nextStage?.id === 'finalizado' ? new Date().toISOString() : undefined,
    };

    setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    toast({ 
      title: `✓ ${hours}h registradas`, 
      description: nextStage ? `Avançado para: ${nextStage.name}` : 'Projeto finalizado!' 
    });
  };

  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <Building2 className="w-4 h-4" /> },
    { id: 'financial', label: 'Financeiro', icon: <Wallet className="w-4 h-4" /> },
    { id: 'calculator', label: 'Orçamento', icon: <Calculator className="w-4 h-4" /> },
    { id: 'savedBudgets', label: `Salvos (${savedBudgets.length})`, icon: <List className="w-4 h-4" /> },
    { id: 'projects', label: `Projetos (${activeProjectsCount})`, icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'referenceTable', label: 'Tabela', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="glass-card rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl accent-gradient flex items-center justify-center">
                <Building2 className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">ARQEXPRESS</h1>
                <p className="text-sm text-muted-foreground">Sistema Completo de Serviços — 2026</p>
              </div>
            </div>
            <div className="flex gap-2">
              {mainTab === 'savedBudgets' && <button onClick={handleNewBudget} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:opacity-90 active:scale-95"><Plus className="w-4 h-4" /><span className="hidden sm:inline">Novo</span></button>}
              {mainTab === 'calculator' && (<><button onClick={handleNewBudget} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground font-medium transition-all hover:bg-muted active:scale-95 border border-border"><RefreshCw className="w-4 h-4" /><span className="hidden sm:inline">Limpar</span></button><button onClick={handleSaveBudget} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success text-success-foreground font-medium transition-all hover:opacity-90 active:scale-95"><Save className="w-4 h-4" /><span>Salvar</span></button></>)}
            </div>
          </div>
          <nav className="flex gap-1 p-1 bg-secondary rounded-xl">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setMainTab(tab.id); if (tab.id === 'overview') setOverviewSubView('main'); }}
                className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all", mainTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                {tab.icon}<span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Content */}
        {mainTab === 'overview' && overviewSubView === 'main' && (<><CompanyHero /><CompanyInfo /><div className="mt-8"><ServicePortfolio onServiceClick={handleServiceClick} /></div></>)}
        {mainTab === 'overview' && overviewSubView === 'serviceDetail' && selectedServiceDetail && (<ServiceDetail serviceId={selectedServiceDetail} onBack={() => setOverviewSubView('main')} onGoToCalculator={() => { const mapping: Record<ServiceId, ServiceType> = { consultexpress: 'decorexpress', produzexpress: 'producao', decorexpress: 'decorexpress', projetexpress: 'projetexpress' }; setSelectedService(mapping[selectedServiceDetail]); setMainTab('calculator'); }} />)}
        {mainTab === 'savedBudgets' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setMainTab('overview')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Visão Geral
            </button>
            <SavedBudgets budgets={savedBudgets} onLoad={handleLoadBudget} onDelete={handleDeleteBudget} onExportPDF={generateProposalPDF} onExportDOC={generateProposalDOC} onNewBudget={handleNewBudget} />
          </div>
        )}
        {mainTab === 'referenceTable' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setMainTab('overview')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Visão Geral
            </button>
            <ReferenceTable />
          </div>
        )}
        {mainTab === 'calculator' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setMainTab('overview')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Visão Geral
            </button>
            <ClientForm clientName={clientName} setClientName={setClientName} clientPhone={clientPhone} setClientPhone={setClientPhone} clientEmail={clientEmail} setClientEmail={setClientEmail} projectNotes={projectNotes} setProjectNotes={setProjectNotes} />
            <ServiceSelector selectedService={selectedService} onServiceChange={handleServiceChange} />
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                {(selectedService === 'decorexpress' || selectedService === 'producao') && <DecorConfig selectedService={selectedService} selectedSize={selectedSize} setSelectedSize={setSelectedSize} environmentsConfig={environmentsConfig} updateEnvironmentsCount={(count) => updateEnvironmentsCount(count, selectedService === 'decorexpress' ? 'decor1' : 'prod1')} updateEnvironmentConfig={updateEnvironmentConfig} extraEnvironments={extraEnvironments} setExtraEnvironments={setExtraEnvironments} extraEnvironmentPrice={extraEnvironmentPrice} setExtraEnvironmentPrice={setExtraEnvironmentPrice} serviceModality={serviceModality} setServiceModality={setServiceModality} surveyFee={surveyFee} setSurveyFee={setSurveyFee} paymentType={paymentType} setPaymentType={setPaymentType} discountPercentage={discountPercentage} setDiscountPercentage={setDiscountPercentage} />}
                {selectedService === 'projetexpress' && <ProjetConfig projectArea={projectArea} setProjectArea={setProjectArea} projectType={projectType} setProjectType={setProjectType} serviceModality={serviceModality} setServiceModality={setServiceModality} surveyFee={surveyFee} setSurveyFee={setSurveyFee} paymentType={paymentType} setPaymentType={setPaymentType} discountPercentage={discountPercentage} setDiscountPercentage={setDiscountPercentage} includeManagement={includeManagement} setIncludeManagement={setIncludeManagement} managementFee={managementFee} setManagementFee={setManagementFee} />}
              </div>
              {currentCalculation && <ResultDisplay calculation={currentCalculation} selectedService={selectedService} extraEnvironments={extraEnvironments} extraEnvironmentPrice={extraEnvironmentPrice} projectArea={projectArea} projectType={projectType} />}
            </div>
          </div>
        )}
        {mainTab === 'projects' && (
          <ProjectDashboard
            projects={projects}
            pendingBudgets={pendingBudgets}
            onBack={() => setMainTab('overview')}
            onUpdateProject={handleUpdateProject}
            onAdvanceStage={handleAdvanceStage}
            onStartProject={handleStartProject}
          />
        )}
        {mainTab === 'financial' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setMainTab('overview')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Visão Geral
            </button>
            <FinancialDashboard />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 mt-8 border-t border-border">
          <p className="text-xl font-bold">ARQ<span className="font-light">EXPRESS</span></p>
          <p className="text-sm text-muted-foreground mt-2">Arquitetura, sem complicar.</p>
        </footer>
      </div>

      {/* Budget Summary Modal */}
      {pendingBudgetForSummary && (
        <BudgetSummaryModal
          budget={pendingBudgetForSummary}
          isNew={isNewBudget}
          onClose={() => setPendingBudgetForSummary(null)}
          onSaveOnly={confirmSaveOnly}
          onSaveAndCreateProject={confirmSaveAndCreateProject}
        />
      )}
    </div>
  );
};

export default UnifiedSystem;

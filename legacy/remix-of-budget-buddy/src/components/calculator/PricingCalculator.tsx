import React, { useState, useMemo } from 'react';
import Header from '@/components/calculator/Header';
import ClientForm from '@/components/calculator/ClientForm';
import ServiceSelector from '@/components/calculator/ServiceSelector';
import DecorConfig from '@/components/calculator/DecorConfig';
import ProjetConfig from '@/components/calculator/ProjetConfig';
import ResultDisplay from '@/components/calculator/ResultDisplay';
import SavedBudgets from '@/components/calculator/SavedBudgets';
import ReferenceTable from '@/components/calculator/ReferenceTable';
import { generateProposalPDF } from '@/utils/pdfGenerator';
import { generateProposalDOC } from '@/utils/docGenerator';
import { useToast } from '@/hooks/use-toast';
import type { EnvironmentConfig, SavedBudget, Calculation } from '@/types/budget';
import {
  HOUR_VALUE,
  decorExpressPricing,
  producaoPricing,
  projetExpressPricing,
  environmentTypeMultipliers,
  sizeMultipliers,
} from '@/data/pricingData';

type ViewType = 'calculator' | 'savedBudgets' | 'referenceTable';
type ServiceType = 'decorexpress' | 'producao' | 'projetexpress';

const PricingCalculator: React.FC = () => {
  const { toast } = useToast();
  
  // View state
  const [currentView, setCurrentView] = useState<ViewType>('calculator');

  // Service state
  const [selectedService, setSelectedService] = useState<ServiceType>('decorexpress');
  const [selectedSize, setSelectedSize] = useState('1');
  const [paymentType, setPaymentType] = useState<'cash' | 'installments'>('cash');
  const [discountPercentage, setDiscountPercentage] = useState(5);

  // Client state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectNotes, setProjectNotes] = useState('');

  // Environment config
  const [environmentsConfig, setEnvironmentsConfig] = useState<EnvironmentConfig[]>([
    { type: 'standard', size: 'P', complexity: 'decor1' },
  ]);
  const [extraEnvironments, setExtraEnvironments] = useState(0);
  const [extraEnvironmentPrice, setExtraEnvironmentPrice] = useState(1200);

  // Modality
  const [serviceModality, setServiceModality] = useState<'online' | 'presencial'>('online');
  const [surveyFee, setSurveyFee] = useState(1000);

  // Project express
  const [projectArea, setProjectArea] = useState(50);
  const [projectType, setProjectType] = useState<'novo' | 'reforma'>('novo');
  const [includeManagement, setIncludeManagement] = useState(false);
  const [managementFee, setManagementFee] = useState(1500);

  // Saved budgets - Load from localStorage on mount
  const [savedBudgets, setSavedBudgets] = useState<SavedBudget[]>(() => {
    const saved = localStorage.getItem('arqexpress_budgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentBudgetId, setCurrentBudgetId] = useState<number | null>(null);

  // Save budgets to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('arqexpress_budgets', JSON.stringify(savedBudgets));
  }, [savedBudgets]);

  // Update environments count
  const updateEnvironmentsCount = (count: string, defaultComplexity: string = 'decor1') => {
    const newConfig: EnvironmentConfig[] = [];
    for (let i = 0; i < parseInt(count); i++) {
      newConfig.push(environmentsConfig[i] || { type: 'standard', size: 'P', complexity: defaultComplexity });
    }
    setEnvironmentsConfig(newConfig);
  };

  // Update environment config
  const updateEnvironmentConfig = (index: number, field: keyof EnvironmentConfig, value: string) => {
    const newConfig = [...environmentsConfig];
    newConfig[index] = { ...newConfig[index], [field]: value as any };
    setEnvironmentsConfig(newConfig);
  };

  // DECOREXPRESS calculation
  const decorCalculation = useMemo((): Calculation | null => {
    if (selectedService !== 'decorexpress') return null;

    let totalPrice = 0;
    let totalHours = 0;
    let totalMultiplier = 0;

    const environmentsDetails = environmentsConfig.map((env, index) => {
      const base = (decorExpressPricing[selectedSize] as any)[env.complexity];
      const typeMultiplier = environmentTypeMultipliers[env.type].multiplier;
      const sizeMultiplier = sizeMultipliers[env.size].multiplier;
      const combinedMultiplier = typeMultiplier * sizeMultiplier;
      
      // Price per environment based on its complexity and multipliers
      const envPrice = (base.price / parseInt(selectedSize)) * combinedMultiplier;
      const envHours = (base.hours / parseInt(selectedSize)) * combinedMultiplier;
      
      totalPrice += envPrice;
      totalHours += envHours;
      totalMultiplier += combinedMultiplier;

      return {
        index: index + 1,
        type: env.type,
        size: env.size,
        typeMultiplier,
        sizeMultiplier,
        combinedMultiplier,
      };
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

    return {
      basePrice: totalPrice,
      avgMultiplier,
      environmentsDetails,
      priceBeforeExtras: totalPrice,
      extrasTotal,
      extrasHours,
      surveyFeeTotal,
      surveyFeeHours,
      finalPrice,
      priceWithDiscount,
      discount,
      estimatedHours: finalHours,
      hourRate,
      description: 'Cálculo por ambiente individual',
      efficiency: hourRate >= HOUR_VALUE ? 'Ótimo' : hourRate >= HOUR_VALUE * 0.9 ? 'Bom' : 'Reajustar',
    };
  }, [
    selectedService,
    selectedSize,
    environmentsConfig,
    extraEnvironments,
    extraEnvironmentPrice,
    serviceModality,
    surveyFee,
    paymentType,
    discountPercentage,
  ]);

  // PRODUCAO calculation
  const producaoCalculation = useMemo((): Calculation | null => {
    if (selectedService !== 'producao') return null;

    let totalPrice = 0;
    let totalHours = 0;

    environmentsConfig.forEach((env) => {
      const base = (producaoPricing[selectedSize] as any)[env.complexity];
      const envPrice = base.price / parseInt(selectedSize);
      const envHours = base.hours / parseInt(selectedSize);
      
      totalPrice += envPrice;
      totalHours += envHours;
    });

    const extrasTotal = extraEnvironments * extraEnvironmentPrice;
    const extrasHours = extraEnvironments * 8;

    const finalPrice = totalPrice + extrasTotal;
    const finalHours = totalHours + extrasHours;
    const hourRate = finalPrice / finalHours;

    const discount = paymentType === 'cash' ? discountPercentage / 100 : 0;
    const priceWithDiscount = finalPrice * (1 - discount);

    return {
      basePrice: totalPrice,
      extrasTotal,
      extrasHours,
      surveyFeeTotal: 0,
      surveyFeeHours: 0,
      finalPrice,
      priceWithDiscount,
      discount,
      estimatedHours: finalHours,
      hourRate,
      description: 'Cálculo por ambiente individual',
      efficiency: hourRate >= HOUR_VALUE ? 'Ótimo' : hourRate >= HOUR_VALUE * 0.9 ? 'Bom' : 'Reajustar',
    };
  }, [
    selectedService,
    selectedSize,
    environmentsConfig,
    extraEnvironments,
    extraEnvironmentPrice,
    paymentType,
    discountPercentage,
  ]);

  // PROJETEXPRESS calculation
  const projetCalculation = useMemo((): Calculation | null => {
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

    return {
      basePrice,
      surveyFeeTotal,
      surveyFeeHours,
      extrasTotal: managementTotal,
      extrasHours: managementHours,
      finalPrice,
      priceWithDiscount,
      discount,
      pricePerM2: range.pricePerM2,
      estimatedHours: finalHours,
      hourRate,
      efficiency: hourRate >= HOUR_VALUE ? 'Ótimo' : hourRate >= HOUR_VALUE * 0.9 ? 'Bom' : 'Reajustar',
    };
  }, [selectedService, projectType, projectArea, serviceModality, surveyFee, paymentType, discountPercentage, includeManagement, managementFee]);

  // Service change handler
  const handleServiceChange = (service: ServiceType) => {
    setSelectedService(service);
    const defaultComplexity = service === 'decorexpress' ? 'decor1' : 'prod1';
    setEnvironmentsConfig([{ type: 'standard', size: 'P', complexity: defaultComplexity }]);
    setSelectedSize('1');
  };

  // New budget handler
  const handleNewBudget = () => {
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setProjectNotes('');
    setSelectedService('decorexpress');
    setSelectedSize('1');
    setEnvironmentsConfig([{ type: 'standard', size: 'P', complexity: 'decor1' }]);
    setExtraEnvironments(0);
    setExtraEnvironmentPrice(1200);
    setServiceModality('online');
    setSurveyFee(1000);
    setPaymentType('cash');
    setDiscountPercentage(5);
    setProjectArea(50);
    setProjectType('novo');
    setIncludeManagement(false);
    setManagementFee(1500);
    setCurrentBudgetId(null);
    setCurrentView('calculator');
  };

  // Save budget handler
  const handleSaveBudget = () => {
    if (!clientName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o nome do cliente",
        variant: "destructive",
      });
      return;
    }

    const calculation =
      selectedService === 'decorexpress'
        ? decorCalculation
        : selectedService === 'producao'
          ? producaoCalculation
          : projetCalculation;

    if (!calculation) {
      toast({
        title: "Erro",
        description: "Por favor, configure o orçamento antes de salvar",
        variant: "destructive",
      });
      return;
    }

    const newBudget: SavedBudget = {
      id: currentBudgetId || Date.now(),
      date: new Date().toLocaleString('pt-BR'),
      clientName: clientName.trim(),
      clientPhone,
      clientEmail,
      projectNotes,
      service: selectedService,
      serviceDetails: {
        ...(selectedService === 'projetexpress'
          ? { projectType, projectArea, includeManagement, managementFee }
          : {
              size: selectedSize,
              environmentsConfig,
              extraEnvironments,
              extraEnvironmentPrice,
            }),
        serviceModality,
        surveyFee,
        paymentType,
        discountPercentage,
      },
      calculation,
    };

    if (currentBudgetId) {
      setSavedBudgets((prev) => prev.map((b) => (b.id === currentBudgetId ? newBudget : b)));
      toast({
        title: "✓ Orçamento atualizado",
        description: `Proposta para ${clientName} foi atualizada com sucesso`,
      });
    } else {
      setSavedBudgets((prev) => [...prev, newBudget]);
      toast({
        title: "✓ Orçamento salvo",
        description: `Proposta para ${clientName} foi salva com sucesso`,
      });
    }

    setCurrentBudgetId(newBudget.id);
    setCurrentView('savedBudgets');
  };

  // Delete budget handler
  const handleDeleteBudget = (id: number) => {
    if (confirm('Deseja realmente excluir este orçamento?')) {
      setSavedBudgets((prev) => prev.filter((b) => b.id !== id));
      toast({
        title: "Orçamento excluído",
        description: "O orçamento foi removido da lista",
      });
    }
  };

  // Load budget handler
  const handleLoadBudget = (budget: SavedBudget) => {
    setClientName(budget.clientName);
    setClientPhone(budget.clientPhone);
    setClientEmail(budget.clientEmail);
    setProjectNotes(budget.projectNotes);
    setSelectedService(budget.service);

    if (budget.service === 'projetexpress') {
      setProjectType(budget.serviceDetails.projectType || 'novo');
      setProjectArea(budget.serviceDetails.projectArea || 50);
      setIncludeManagement(budget.serviceDetails.includeManagement || false);
      setManagementFee(budget.serviceDetails.managementFee || 1500);
    } else {
      setSelectedSize(budget.serviceDetails.size || '1');
      setEnvironmentsConfig(budget.serviceDetails.environmentsConfig || [{ type: 'standard', size: 'P', complexity: 'decor1' }]);
      setExtraEnvironments(budget.serviceDetails.extraEnvironments || 0);
      setExtraEnvironmentPrice(budget.serviceDetails.extraEnvironmentPrice || 1200);
    }

    setServiceModality(budget.serviceDetails.serviceModality || 'online');
    setSurveyFee(budget.serviceDetails.surveyFee || 1000);
    setPaymentType(budget.serviceDetails.paymentType);
    setDiscountPercentage(budget.serviceDetails.discountPercentage || 5);
    setCurrentBudgetId(budget.id);
    setCurrentView('calculator');
  };

  // Export PDF handler
  const handleExportPDF = async (budget: SavedBudget) => {
    await generateProposalPDF(budget);
  };

  // Export DOC handler
  const handleExportDOC = async (budget: SavedBudget) => {
    await generateProposalDOC(budget);
  };
  const currentCalculation =
    selectedService === 'decorexpress'
      ? decorCalculation
      : selectedService === 'producao'
        ? producaoCalculation
        : projetCalculation;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          onSave={handleSaveBudget}
          onNewBudget={handleNewBudget}
          savedBudgetsCount={savedBudgets.length}
        />

        {currentView === 'savedBudgets' && (
          <SavedBudgets
            budgets={savedBudgets}
            onLoad={handleLoadBudget}
            onDelete={handleDeleteBudget}
            onExportPDF={handleExportPDF}
            onExportDOC={handleExportDOC}
            onNewBudget={handleNewBudget}
          />
        )}

        {currentView === 'referenceTable' && <ReferenceTable />}

        {currentView === 'calculator' && (
          <>
            <ClientForm
              clientName={clientName}
              setClientName={setClientName}
              clientPhone={clientPhone}
              setClientPhone={setClientPhone}
              clientEmail={clientEmail}
              setClientEmail={setClientEmail}
              projectNotes={projectNotes}
              setProjectNotes={setProjectNotes}
            />

            <ServiceSelector selectedService={selectedService} onServiceChange={handleServiceChange} />

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                {(selectedService === 'decorexpress' || selectedService === 'producao') && (
                  <DecorConfig
                    selectedService={selectedService}
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    environmentsConfig={environmentsConfig}
                    updateEnvironmentsCount={(count) => updateEnvironmentsCount(count, selectedService === 'decorexpress' ? 'decor1' : 'prod1')}
                    updateEnvironmentConfig={updateEnvironmentConfig}
                    extraEnvironments={extraEnvironments}
                    setExtraEnvironments={setExtraEnvironments}
                    extraEnvironmentPrice={extraEnvironmentPrice}
                    setExtraEnvironmentPrice={setExtraEnvironmentPrice}
                    serviceModality={serviceModality}
                    setServiceModality={setServiceModality}
                    surveyFee={surveyFee}
                    setSurveyFee={setSurveyFee}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    discountPercentage={discountPercentage}
                    setDiscountPercentage={setDiscountPercentage}
                  />
                )}

                {selectedService === 'projetexpress' && (
                  <ProjetConfig
                    projectArea={projectArea}
                    setProjectArea={setProjectArea}
                    projectType={projectType}
                    setProjectType={setProjectType}
                    serviceModality={serviceModality}
                    setServiceModality={setServiceModality}
                    surveyFee={surveyFee}
                    setSurveyFee={setSurveyFee}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    discountPercentage={discountPercentage}
                    setDiscountPercentage={setDiscountPercentage}
                    includeManagement={includeManagement}
                    setIncludeManagement={setIncludeManagement}
                    managementFee={managementFee}
                    setManagementFee={setManagementFee}
                  />
                )}
              </div>

              <div className="lg:sticky lg:top-6 lg:self-start">
                <ResultDisplay
                  calculation={currentCalculation}
                  selectedService={selectedService}
                  extraEnvironments={extraEnvironments}
                  extraEnvironmentPrice={extraEnvironmentPrice}
                  projectArea={projectArea}
                  projectType={projectType}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PricingCalculator;

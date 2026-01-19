import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, Plus, Trash2, Building2, Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface TeamMember {
  id: string;
  name: string;
  role: 'coordenadora' | 'arquiteta' | 'estagiaria' | 'administrativo';
  squad: string;
  monthlySalary: number;
  monthlyHours: number;
  active: boolean;
}

interface Expense {
  id: string;
  category: 'fixo' | 'variavel' | 'impostos' | 'ferramentas';
  description: string;
  value: number;
  recurring: boolean;
  date: string;
}

interface FinancialData {
  team: TeamMember[];
  expenses: Expense[];
}

const EXPENSE_CATEGORIES = {
  fixo: { label: 'Custos Fixos', color: 'bg-blue-500' },
  variavel: { label: 'Custos Variáveis', color: 'bg-orange-500' },
  impostos: { label: 'Impostos', color: 'bg-red-500' },
  ferramentas: { label: 'Ferramentas/Software', color: 'bg-purple-500' },
};

const ROLES = {
  coordenadora: { label: 'Coordenadora', color: 'bg-amber-500' },
  arquiteta: { label: 'Arquiteta', color: 'bg-emerald-500' },
  estagiaria: { label: 'Estagiária', color: 'bg-cyan-500' },
  administrativo: { label: 'Administrativo', color: 'bg-slate-500' },
};

const SQUADS = [
  'Squad Alpha',
  'Squad Beta', 
  'Squad Gamma',
  'Squad Delta',
  'Sem Squad',
];

const FinancialDashboard: React.FC = () => {
  const { toast } = useToast();
  
  // Load data from localStorage
  const [financialData, setFinancialData] = useState<FinancialData>(() => {
    const saved = localStorage.getItem('arqexpress_financial');
    return saved ? JSON.parse(saved) : { team: [], expenses: [] };
  });

  // Form states
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    role: 'arquiteta',
    squad: 'Squad Alpha',
    monthlySalary: 5000,
    monthlyHours: 160,
    active: true,
  });
  
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'fixo',
    recurring: true,
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('arqexpress_financial', JSON.stringify(financialData));
  }, [financialData]);

  // Team handlers
  const handleAddMember = () => {
    if (!newMember.name?.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    const member: TeamMember = {
      id: `member_${Date.now()}`,
      name: newMember.name!,
      role: newMember.role as TeamMember['role'],
      squad: newMember.squad || 'Sem Squad',
      monthlySalary: newMember.monthlySalary || 5000,
      monthlyHours: newMember.monthlyHours || 160,
      active: true,
    };
    setFinancialData(prev => ({ ...prev, team: [...prev.team, member] }));
    setNewMember({ role: 'arquiteta', squad: 'Squad Alpha', monthlySalary: 5000, monthlyHours: 160, active: true });
    toast({ title: "✓ Membro adicionado", description: `${member.name} foi adicionado à equipe` });
  };

  const handleRemoveMember = (id: string) => {
    setFinancialData(prev => ({ ...prev, team: prev.team.filter(m => m.id !== id) }));
  };

  // Expense handlers
  const handleAddExpense = () => {
    if (!newExpense.description?.trim() || !newExpense.value) {
      toast({ title: "Erro", description: "Descrição e valor são obrigatórios", variant: "destructive" });
      return;
    }
    const expense: Expense = {
      id: `expense_${Date.now()}`,
      category: newExpense.category as Expense['category'],
      description: newExpense.description!,
      value: newExpense.value!,
      recurring: newExpense.recurring || false,
      date: new Date().toISOString(),
    };
    setFinancialData(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
    setNewExpense({ category: 'fixo', recurring: true });
    toast({ title: "✓ Despesa adicionada", description: `${expense.description} foi registrada` });
  };

  const handleRemoveExpense = (id: string) => {
    setFinancialData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  // Calculations
  const totalTeamCost = financialData.team.reduce((acc, m) => 
    acc + (m.active ? m.monthlySalary : 0), 0
  );
  
  const totalExpenses = financialData.expenses.reduce((acc, e) => acc + e.value, 0);
  
  const expensesByCategory = financialData.expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.value;
    return acc;
  }, {} as Record<string, number>);

  const totalMonthlyCost = totalTeamCost + totalExpenses;
  
  const totalMonthlyHours = financialData.team.reduce((acc, m) => 
    acc + (m.active ? m.monthlyHours : 0), 0
  );

  // Calcula valor/hora de cada membro
  const getHourlyRate = (member: TeamMember) => {
    return member.monthlyHours > 0 ? member.monthlySalary / member.monthlyHours : 0;
  };

  const avgTeamHourlyRate = totalMonthlyHours > 0
    ? totalTeamCost / totalMonthlyHours
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Equipe</span>
            </div>
            <p className="text-2xl font-bold">{financialData.team.filter(m => m.active).length}</p>
            <p className="text-xs text-muted-foreground">{totalMonthlyHours}h/mês disponíveis</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Custo Equipe</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              R$ {totalTeamCost.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground">
              Média R$ {avgTeamHourlyRate.toFixed(0)}/h
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs">Despesas</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              R$ {totalExpenses.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground">{financialData.expenses.length} lançamentos</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-xs">Custo Total/Mês</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              R$ {totalMonthlyCost.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground">
              Custo/hora: R$ {totalMonthlyHours > 0 ? (totalMonthlyCost / totalMonthlyHours).toFixed(0) : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            Equipe
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Despesas
          </TabsTrigger>
        </TabsList>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          {/* Add Member Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Membro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <Label className="text-xs">Nome</Label>
                  <Input
                    placeholder="Nome"
                    value={newMember.name || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Função</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(v) => setNewMember(prev => ({ ...prev, role: v as TeamMember['role'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLES).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Squad</Label>
                  <Select
                    value={newMember.squad}
                    onValueChange={(v) => setNewMember(prev => ({ ...prev, squad: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SQUADS.map((squad) => (
                        <SelectItem key={squad} value={squad}>{squad}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Salário Mensal (R$)</Label>
                  <Input
                    type="number"
                    value={newMember.monthlySalary || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, monthlySalary: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Horas/Mês</Label>
                  <Input
                    type="number"
                    value={newMember.monthlyHours || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, monthlyHours: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddMember} className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Equipe Cadastrada</CardTitle>
            </CardHeader>
            <CardContent>
              {financialData.team.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum membro cadastrado. Adicione sua equipe acima.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Squad</TableHead>
                      <TableHead className="text-right">Salário</TableHead>
                      <TableHead className="text-right">Horas/Mês</TableHead>
                      <TableHead className="text-right">Valor/Hora</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.team.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <Badge className={`${ROLES[member.role].color} text-white text-xs`}>
                            {ROLES[member.role].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{member.squad}</TableCell>
                        <TableCell className="text-right">
                          R$ {member.monthlySalary.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">{member.monthlyHours}h</TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          R$ {getHourlyRate(member).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          {/* Add Expense Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Despesa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(v) => setNewExpense(prev => ({ ...prev, category: v as Expense['category'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPENSE_CATEGORIES).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    placeholder="Ex: Aluguel, SketchUp, etc"
                    value={newExpense.description || ''}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Valor (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newExpense.value || ''}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, value: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddExpense} className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Summary by Category */}
          {Object.keys(expensesByCategory).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(EXPENSE_CATEGORIES).map(([key, { label, color }]) => (
                <Card key={key} className="overflow-hidden">
                  <div className={`h-1 ${color}`} />
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold">
                      R$ {(expensesByCategory[key] || 0).toLocaleString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Expenses List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Despesas Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              {financialData.expenses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma despesa cadastrada. Adicione suas despesas acima.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          <Badge className={`${EXPENSE_CATEGORIES[expense.category].color} text-white text-xs`}>
                            {EXPENSE_CATEGORIES[expense.category].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {expense.value.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;

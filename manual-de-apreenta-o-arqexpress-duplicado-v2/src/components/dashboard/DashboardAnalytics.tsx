import { useEffect, useState } from 'react';
import { BarChart3, Building2, Store, Package, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Profile {
  id: string;
  role: 'arquiteta' | 'coordenadora' | 'head';
  full_name: string;
}

interface DashboardAnalyticsProps {
  profile: Profile;
}

interface EnvironmentStat {
  name: string;
  count: number;
  value: number;
}

interface SupplierStat {
  name: string;
  count: number;
}

interface CategoryStat {
  name: string;
  count: number;
  value: number;
}

const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];

export const DashboardAnalytics = ({ profile }: DashboardAnalyticsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [environmentStats, setEnvironmentStats] = useState<EnvironmentStat[]>([]);
  const [supplierStats, setSupplierStats] = useState<SupplierStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [profile]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch project environments with values
      const { data: projectEnvs, error: envsError } = await supabase
        .from('project_environments')
        .select(`
          environment_value,
          environment_id,
          environments (name)
        `);

      if (envsError) throw envsError;

      // Aggregate environments
      const envMap = new Map<string, { count: number; value: number }>();
      projectEnvs?.forEach(pe => {
        const name = (pe.environments as any)?.name || 'Desconhecido';
        const existing = envMap.get(name) || { count: 0, value: 0 };
        envMap.set(name, {
          count: existing.count + 1,
          value: existing.value + (Number(pe.environment_value) || 0),
        });
      });

      const envStats: EnvironmentStat[] = Array.from(envMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setEnvironmentStats(envStats);

      // Fetch project items with suppliers and categories
      const { data: items, error: itemsError } = await supabase
        .from('project_items')
        .select(`
          name,
          quantity,
          unit_price,
          supplier_id,
          category_id,
          suppliers (name),
          categories (name)
        `);

      if (itemsError) throw itemsError;

      // Aggregate suppliers
      const supplierMap = new Map<string, number>();
      items?.forEach(item => {
        const name = (item.suppliers as any)?.name || 'Sem Fornecedor';
        supplierMap.set(name, (supplierMap.get(name) || 0) + 1);
      });

      const suppStats: SupplierStat[] = Array.from(supplierMap.entries())
        .map(([name, count]) => ({ name, count }))
        .filter(s => s.name !== 'Sem Fornecedor')
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setSupplierStats(suppStats);

      // Aggregate categories
      const categoryMap = new Map<string, { count: number; value: number }>();
      items?.forEach(item => {
        const name = (item.categories as any)?.name || 'Sem Categoria';
        const existing = categoryMap.get(name) || { count: 0, value: 0 };
        categoryMap.set(name, {
          count: existing.count + (item.quantity || 1),
          value: existing.value + (Number(item.unit_price) * (item.quantity || 1)),
        });
      });

      const catStats: CategoryStat[] = Array.from(categoryMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .filter(c => c.name !== 'Sem Categoria')
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setCategoryStats(catStats);

      // Top items by frequency
      const itemMap = new Map<string, number>();
      items?.forEach(item => {
        if (item.name) {
          itemMap.set(item.name, (itemMap.get(item.name) || 0) + 1);
        }
      });

      const topItemsList = Array.from(itemMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopItems(topItemsList);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="py-10 text-center text-muted-foreground">
              Carregando...
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const maxEnvCount = Math.max(...environmentStats.map(e => e.count), 1);
  const maxSupplierCount = Math.max(...supplierStats.map(s => s.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Environments Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Ambientes Mais Entregues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {environmentStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum dado de ambiente disponível.
            </p>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={environmentStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip
                    formatter={(value: number) => [value, 'Projetos']}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Value by Environment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Valor por Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {environmentStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum dado disponível.
            </p>
          ) : (
            <div className="space-y-4">
              {environmentStats.slice(0, 5).map((env, index) => (
                <div key={env.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{env.name}</span>
                    <span className="font-medium">
                      R$ {env.value.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <Progress
                    value={(env.value / Math.max(...environmentStats.map(e => e.value))) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Fornecedores Mais Usados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {supplierStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum fornecedor cadastrado.
            </p>
          ) : (
            <div className="space-y-4">
              {supplierStats.map((supplier, index) => (
                <div key={supplier.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{supplier.name}</span>
                    <span className="font-medium">{supplier.count} itens</span>
                  </div>
                  <Progress
                    value={(supplier.count / maxSupplierCount) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Valor por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma categoria cadastrada.
            </p>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name }) => name}
                    labelLine={false}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Itens Mais Usados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum item cadastrado.
            </p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

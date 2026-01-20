import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  BarChart3,
  LogOut,
  Plus,
  Building2,
  TrendingUp,
  Package,
  Store,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import logoArqexpress from '@/assets/logo-arqexpress.png';
import { DashboardProjects } from '@/components/dashboard/DashboardProjects';
import { DashboardTeam } from '@/components/dashboard/DashboardTeam';
import { DashboardAnalytics } from '@/components/dashboard/DashboardAnalytics';

interface DashboardStats {
  totalProjects: number;
  totalValue: number;
  deliveredProjects: number;
  inProgressProjects: number;
}

const Dashboard = () => {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalValue: 0,
    deliveredProjects: 0,
    inProgressProjects: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, total_value, status');

      if (error) throw error;

      const totalProjects = projects?.length || 0;
      const totalValue = projects?.reduce((sum, p) => sum + (Number(p.total_value) || 0), 0) || 0;
      const deliveredProjects = projects?.filter(p => p.status === 'entregue').length || 0;
      const inProgressProjects = projects?.filter(p => p.status === 'em_andamento').length || 0;

      setStats({
        totalProjects,
        totalValue,
        deliveredProjects,
        inProgressProjects,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    arquiteta: 'Arquiteta',
    coordenadora: 'Coordenadora',
    head: 'Head de Arquitetura',
  };

  const canManageTeam = profile.role === 'coordenadora' || profile.role === 'head';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoArqexpress} alt="ArqExpress" className="h-8" />
            <div className="hidden sm:block h-6 w-px bg-border" />
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-foreground">{profile.full_name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({roleLabels[profile.role]})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Total Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats.totalProjects}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : `R$ ${stats.totalValue.toLocaleString('pt-BR')}`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Entregues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoadingStats ? '...' : stats.deliveredProjects}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {isLoadingStats ? '...' : stats.inProgressProjects}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="projects" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Projetos</span>
              </TabsTrigger>
              {canManageTeam && (
                <TabsTrigger value="team" className="gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Equipe</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <DashboardProjects profile={profile} />
            </TabsContent>

            {canManageTeam && (
              <TabsContent value="team">
                <DashboardTeam profile={profile} />
              </TabsContent>
            )}

            <TabsContent value="analytics">
              <DashboardAnalytics profile={profile} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;

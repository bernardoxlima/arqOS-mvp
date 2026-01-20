import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FolderOpen, Calendar, DollarSign, User, Eye, MoreVertical, Check, Clock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  role: 'arquiteta' | 'coordenadora' | 'head';
  full_name: string;
}

interface Project {
  id: string;
  name: string;
  client_name: string | null;
  project_date: string;
  total_value: number;
  status: string;
  created_by: string;
  created_at: string;
  architect_name?: string;
}

interface DashboardProjectsProps {
  profile: Profile;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }> }> = {
  em_andamento: { label: 'Em Andamento', variant: 'secondary', icon: Clock },
  entregue: { label: 'Entregue', variant: 'default', icon: Check },
  cancelado: { label: 'Cancelado', variant: 'destructive', icon: X },
};

export const DashboardProjects = ({ profile }: DashboardProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, [profile]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // Fetch projects with architect info
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          client_name,
          project_date,
          total_value,
          status,
          created_by,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for architect names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const enrichedProjects = projectsData?.map(p => ({
        ...p,
        architect_name: profileMap.get(p.created_by) || 'Desconhecido',
      })) || [];

      setProjects(enrichedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os projetos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: 'O status do projeto foi alterado.',
      });

      fetchProjects();
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Carregando projetos...
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {profile.role === 'arquiteta'
              ? 'Crie seu primeiro projeto para começar.'
              : 'Os projetos da sua equipe aparecerão aqui.'}
          </p>
          {profile.role === 'arquiteta' && (
            <Button onClick={() => navigate('/')}>
              Criar Projeto
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Projetos ({projects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Cliente</TableHead>
                {profile.role !== 'arquiteta' && <TableHead>Arquiteta</TableHead>}
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const StatusIcon = statusConfig[project.status]?.icon || Clock;
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client_name || '-'}</TableCell>
                    {profile.role !== 'arquiteta' && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {project.architect_name}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(project.project_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        R$ {Number(project.total_value).toLocaleString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[project.status]?.variant || 'secondary'}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[project.status]?.label || project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/projeto?id=${project.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {project.created_by === profile.id && (
                            <>
                              <DropdownMenuItem onClick={() => updateProjectStatus(project.id, 'em_andamento')}>
                                <Clock className="w-4 h-4 mr-2" />
                                Marcar Em Andamento
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateProjectStatus(project.id, 'entregue')}>
                                <Check className="w-4 h-4 mr-2" />
                                Marcar Entregue
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

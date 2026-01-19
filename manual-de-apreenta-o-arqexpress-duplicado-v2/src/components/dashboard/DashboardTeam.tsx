import { useEffect, useState } from 'react';
import { Users, UserPlus, ChevronRight, Shield, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  role: 'arquiteta' | 'coordenadora' | 'head';
  full_name: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: 'arquiteta' | 'coordenadora' | 'head';
  coordinator_id: string | null;
  projects_count: number;
}

interface DashboardTeamProps {
  profile: Profile;
}

const roleLabels: Record<string, string> = {
  arquiteta: 'Arquiteta',
  coordenadora: 'Coordenadora',
  head: 'Head',
};

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  arquiteta: 'outline',
  coordenadora: 'secondary',
  head: 'default',
};

export const DashboardTeam = ({ profile }: DashboardTeamProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [coordinators, setCoordinators] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeam();
  }, [profile]);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles based on role
      let query = supabase.from('profiles').select('*');

      if (profile.role === 'coordenadora') {
        // Coordinator sees their assigned architects
        query = query.eq('coordinator_id', profile.id);
      }
      // Head sees everyone

      const { data: profiles, error } = await query.order('full_name');

      if (error) throw error;

      // Fetch project counts
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('created_by');

      if (projectsError) throw projectsError;

      const projectCounts = new Map<string, number>();
      projects?.forEach(p => {
        projectCounts.set(p.created_by, (projectCounts.get(p.created_by) || 0) + 1);
      });

      const enrichedMembers: TeamMember[] = profiles?.map(p => ({
        ...p,
        projects_count: projectCounts.get(p.id) || 0,
      })) || [];

      setTeamMembers(enrichedMembers);

      // Fetch coordinators for assignment (only for head)
      if (profile.role === 'head') {
        const { data: coords } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('role', 'coordenadora');
        setCoordinators(coords || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a equipe.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignToCoordinator = async (memberId: string, coordinatorId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ coordinator_id: coordinatorId })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Atribuição atualizada',
        description: coordinatorId
          ? 'Arquiteta atribuída à coordenadora.'
          : 'Atribuição removida.',
      });

      setIsAssignDialogOpen(false);
      setSelectedMember(null);
      fetchTeam();
    } catch (error) {
      console.error('Error assigning:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a atribuição.',
        variant: 'destructive',
      });
    }
  };

  const updateRole = async (memberId: string, newRole: 'arquiteta' | 'coordenadora' | 'head') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Cargo atualizado',
        description: 'O cargo foi alterado com sucesso.',
      });

      fetchTeam();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o cargo.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Carregando equipe...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Equipe ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {profile.role === 'coordenadora'
                  ? 'Nenhuma arquiteta atribuída a você ainda.'
                  : 'Nenhum membro na equipe.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{member.full_name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{member.projects_count}</div>
                      <div className="text-xs text-muted-foreground">projetos</div>
                    </div>

                    {profile.role === 'head' ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) => updateRole(member.id, value as 'arquiteta' | 'coordenadora' | 'head')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arquiteta">Arquiteta</SelectItem>
                          <SelectItem value="coordenadora">Coordenadora</SelectItem>
                          <SelectItem value="head">Head</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={roleBadgeVariants[member.role]}>
                        {roleLabels[member.role]}
                      </Badge>
                    )}

                    {profile.role === 'head' && member.role === 'arquiteta' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMember(member);
                          setIsAssignDialogOpen(true);
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Atribuir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Atribuir {selectedMember?.full_name} a uma Coordenadora
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {coordinators.map((coord) => (
              <Button
                key={coord.id}
                variant={selectedMember?.coordinator_id === coord.id ? 'default' : 'outline'}
                className="w-full justify-between"
                onClick={() => assignToCoordinator(selectedMember!.id, coord.id)}
              >
                {coord.full_name}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ))}
            {selectedMember?.coordinator_id && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => assignToCoordinator(selectedMember!.id, null)}
              >
                Remover atribuição
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

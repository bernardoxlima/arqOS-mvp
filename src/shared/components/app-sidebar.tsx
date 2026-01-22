"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderKanban,
  Calculator,
  FileText,
  Presentation,
  DollarSign,
  LogOut,
  User,
  Sparkles,
  Settings,
} from "lucide-react";

import { useAuth, usePermissions } from "@/modules/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/shared/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPermission?: "canAccessFinance";
}

const navItems: NavItem[] = [
  {
    title: "Início",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Projetos",
    url: "/projetos",
    icon: FolderKanban,
  },
  {
    title: "Calculadora",
    url: "/calculadora",
    icon: Calculator,
  },
  {
    title: "Orçamentos",
    url: "/orcamentos",
    icon: FileText,
  },
  {
    title: "Apresentações",
    url: "/apresentacoes",
    icon: Presentation,
  },
  {
    title: "Brandbook",
    url: "/brandbook",
    icon: Sparkles,
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: DollarSign,
    requiresPermission: "canAccessFinance",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const permissions = usePermissions();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getAvatarUrl = (): string | null => {
    if (!profile?.settings) return null;
    const settings = profile.settings as Record<string, unknown>;
    return (settings.avatar_url as string) || null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            A
          </div>
          <span className="font-semibold">ArqOS</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // Check if item requires permission
                const hasPermission = item.requiresPermission
                  ? permissions[item.requiresPermission]
                  : true;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild={hasPermission}
                      isActive={
                        pathname === item.url ||
                        (item.url !== "/" && pathname.startsWith(item.url))
                      }
                      tooltip={hasPermission ? item.title : `${item.title} (sem acesso)`}
                      disabled={!hasPermission}
                      className={!hasPermission ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {hasPermission ? (
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl || undefined} alt={profile?.full_name || "Avatar"} />
                    <AvatarFallback>
                      {profile?.full_name ? getInitials(profile.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile?.full_name || "Usuário"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile?.email || ""}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/perfil">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

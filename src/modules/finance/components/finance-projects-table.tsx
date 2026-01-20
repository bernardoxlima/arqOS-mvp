'use client';

import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { formatCurrency } from '@/shared/lib/format';
import type { FinanceSummary } from '@/modules/dashboard/types';

interface FinanceProjectsTableProps {
  data: FinanceSummary | null;
}

export function FinanceProjectsTable({ data }: FinanceProjectsTableProps) {
  if (!data) return null;

  const { projectsRevenue } = data;

  // Calculate total revenue
  const totalRevenue = projectsRevenue.reduce((sum, p) => sum + p.value, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Receita por Projeto</CardTitle>
        {totalRevenue > 0 && (
          <span className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatCurrency(totalRevenue)}</span>
          </span>
        )}
      </CardHeader>
      <CardContent>
        {projectsRevenue.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum projeto com receita no período
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Código</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead className="text-right w-[150px]">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsRevenue.map((project, index) => (
                  <TableRow key={project.projectId}>
                    <TableCell className="font-mono text-sm">
                      {project.projectCode}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      Projeto #{index + 1}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(project.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

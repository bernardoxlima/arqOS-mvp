"use client";

import { useState } from "react";
import { Download, Calendar, Loader2, FileText, FileDown } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";

import type { Workflow, ProjectStage } from "../../types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";

interface TabAgendaProps {
  workflow: Workflow;
  projectCode: string;
  clientName: string;
  startDate?: string | null;
}

// Estimate days per stage based on service type
function getEstimatedDays(stageId: string, serviceType: string): number {
  const estimates: Record<string, Record<string, number>> = {
    decorexpress: {
      formulario: 1,
      reuniao_briefing: 2,
      formulario_briefing: 2,
      moodboard: 3,
      pesquisa_produtos: 5,
      elaboracao_projeto: 7,
      apresentacao: 2,
      ajustes: 3,
      aprovacao: 2,
      lista_compras: 2,
      acompanhamento_compras: 14,
      visita_tecnica: 1,
      acompanhamento_obra: 7,
      instalacao: 3,
      entrega: 1,
    },
    producao: {
      recebimento: 1,
      producao: 14,
      controle_qualidade: 2,
      expedicao: 2,
      entregue: 1,
    },
    projetexpress: {
      formulario: 1,
      reuniao_briefing: 2,
      levantamento: 3,
      anteprojeto: 10,
      projeto_executivo: 14,
      aprovacao: 3,
      detalhamento: 7,
      revisao_final: 3,
      entrega: 1,
    },
  };

  return estimates[serviceType]?.[stageId] ?? 3;
}

interface DeliveryItem {
  stage: ProjectStage;
  startDate: Date;
  endDate: Date;
  days: number;
}

function calculateDeliveries(workflow: Workflow, baseDate: Date): DeliveryItem[] {
  const stages = workflow.stages || [];
  const serviceType = workflow.type || "decorexpress";

  let cumulativeDays = 0;

  return stages.map((stage) => {
    const days = getEstimatedDays(stage.id, serviceType);
    const startDate = addDays(baseDate, cumulativeDays);
    cumulativeDays += days;
    const endDate = addDays(baseDate, cumulativeDays);

    return { stage, startDate, endDate, days };
  });
}

type ScheduleModality = "online" | "presencial";

export function TabAgenda({ workflow, projectCode, clientName, startDate }: TabAgendaProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPro, setIsDownloadingPro] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(
    startDate ? format(new Date(startDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [modality, setModality] = useState<ScheduleModality>(
    workflow.modality === "presencial" ? "presencial" : "online"
  );
  const [environments, setEnvironments] = useState(1);

  const baseDate = new Date(customStartDate);
  const deliveries = calculateDeliveries(workflow, baseDate);
  const totalDays = deliveries.reduce((sum, d) => sum + d.days, 0);
  const finalDate = addDays(baseDate, totalDays);

  const serviceTypeLabels: Record<string, string> = {
    decorexpress: "DecorExpress",
    producao: "Produção",
    projetexpress: "ProjetExpress",
    produzexpress: "ProduzExpress",
    consultexpress: "ConsultExpress",
  };

  // Map workflow type to schedule service type
  const getScheduleServiceType = () => {
    const type = workflow.type || "decorexpress";
    if (type === "producao") return "produzexpress";
    return type as "decorexpress" | "projetexpress";
  };

  // Show modality/environments selectors based on service type
  const showModality = workflow.type === "decorexpress";
  const showEnvironments = workflow.type === "decorexpress" || workflow.type === "producao";

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Agenda de Entregas", pageWidth / 2, y, { align: "center" });
      y += 10;

      // Project info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Projeto: ${projectCode}`, pageWidth / 2, y, { align: "center" });
      y += 6;
      doc.text(`Cliente: ${clientName}`, pageWidth / 2, y, { align: "center" });
      y += 6;
      doc.text(`Serviço: ${serviceTypeLabels[workflow.type || "decorexpress"]}`, pageWidth / 2, y, { align: "center" });
      y += 15;

      // Summary box
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 3, 3, "F");
      y += 13;
      doc.setFontSize(10);
      doc.text(
        `Início: ${format(baseDate, "dd/MM/yyyy", { locale: ptBR })}  |  Previsão de Entrega: ${format(finalDate, "dd/MM/yyyy", { locale: ptBR })}  |  Duração: ${totalDays} dias`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 20;

      // Table header
      doc.setFillColor(64, 64, 64);
      doc.rect(margin, y, pageWidth - margin * 2, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Etapa", margin + 5, y + 7);
      doc.text("Início", margin + 90, y + 7);
      doc.text("Fim", margin + 120, y + 7);
      doc.text("Dias", margin + 150, y + 7);
      y += 10;

      // Table rows
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      deliveries.forEach((delivery, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, y, pageWidth - margin * 2, 10, "F");
        }

        doc.text(delivery.stage.name, margin + 5, y + 7);
        doc.text(format(delivery.startDate, "dd/MM/yyyy", { locale: ptBR }), margin + 90, y + 7);
        doc.text(format(delivery.endDate, "dd/MM/yyyy", { locale: ptBR }), margin + 120, y + 7);
        doc.text(String(delivery.days), margin + 150, y + 7);

        y += 10;
      });

      // Footer
      y += 10;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 5;
      doc.text(
        "* Datas são estimativas e podem sofrer alterações conforme andamento do projeto",
        pageWidth / 2,
        y,
        { align: "center" }
      );

      // Save
      doc.save(`agenda-entregas-${projectCode}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadProPDF = async () => {
    setIsDownloadingPro(true);
    try {
      const response = await fetch("/api/documents/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          serviceType: getScheduleServiceType(),
          modality,
          environments,
          startDate: customStartDate,
          format: "pdf",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar PDF");
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CRONOGRAMA_${serviceTypeLabels[workflow.type || "decorexpress"].toUpperCase().replace(" ", "_")}_${clientName.toUpperCase().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF profissional baixado!");
    } catch (error) {
      console.error("Error downloading pro PDF:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao baixar PDF");
    } finally {
      setIsDownloadingPro(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data de início</Label>
            <Input
              id="startDate"
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-44"
            />
          </div>

          {showModality && (
            <div className="space-y-2">
              <Label>Modalidade</Label>
              <Select value={modality} onValueChange={(v) => setModality(v as ScheduleModality)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showEnvironments && (
            <div className="space-y-2">
              <Label>Ambientes</Label>
              <Select value={String(environments)} onValueChange={(v) => setEnvironments(Number(v))}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Ambiente</SelectItem>
                  <SelectItem value="2">2 Ambientes</SelectItem>
                  <SelectItem value="3">3+ Ambientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generatePDF} disabled={isGenerating} variant="outline" size="sm">
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            PDF Simples
          </Button>
          <Button onClick={downloadProPDF} disabled={isDownloadingPro} size="sm">
            {isDownloadingPro ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            PDF Profissional
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Início</p>
                <p className="font-semibold">{format(baseDate, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Previsão de Entrega</p>
                <p className="font-semibold">{format(finalDate, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração Total</p>
                <p className="font-semibold">{totalDays} dias</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Etapa</th>
              <th className="text-left p-3 font-medium">Início</th>
              <th className="text-left p-3 font-medium">Fim</th>
              <th className="text-center p-3 font-medium">Dias</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery, index) => (
              <tr key={delivery.stage.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                <td className="p-3">
                  <span className="font-medium">{delivery.stage.name}</span>
                  {delivery.stage.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{delivery.stage.description}</p>
                  )}
                </td>
                <td className="p-3 text-sm">{format(delivery.startDate, "dd/MM/yyyy", { locale: ptBR })}</td>
                <td className="p-3 text-sm">{format(delivery.endDate, "dd/MM/yyyy", { locale: ptBR })}</td>
                <td className="p-3 text-center text-sm">{delivery.days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        * Datas são estimativas baseadas em prazos médios e podem sofrer alterações conforme andamento do projeto
      </p>
    </div>
  );
}

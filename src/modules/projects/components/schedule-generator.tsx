"use client";

import { useState, useMemo } from "react";
import {
  Download,
  Calendar,
  Loader2,
  Clock,
  Flag,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
import { cn } from "@/shared/lib/utils";

type ScheduleServiceType = "decorexpress" | "projetexpress" | "produzexpress" | "consultexpress";
type ScheduleModality = "online" | "presencial";

interface ScheduleGeneratorProps {
  defaultClientName?: string;
  defaultServiceType?: ScheduleServiceType;
  defaultModality?: ScheduleModality;
  defaultEnvironments?: number;
  defaultStartDate?: string;
  projectId?: string;
  showServiceSelector?: boolean;
}

interface TimelineItem {
  date: string;
  dateFormatted: string;
  weekday: string;
  title: string;
  description: string;
  milestone?: boolean;
}

interface ScheduleData {
  timeline: TimelineItem[];
  totalDays: number;
  meetingsCount: string;
  finalDeliveryDate: string;
}

const SERVICE_LABELS: Record<ScheduleServiceType, string> = {
  decorexpress: "DecorExpress",
  projetexpress: "ProjetExpress",
  produzexpress: "ProduzExpress",
  consultexpress: "ConsultExpress",
};

const MODALITY_LABELS: Record<ScheduleModality, string> = {
  online: "Online",
  presencial: "Presencial",
};

export function ScheduleGenerator({
  defaultClientName = "",
  defaultServiceType = "decorexpress",
  defaultModality = "online",
  defaultEnvironments = 1,
  defaultStartDate,
  projectId,
  showServiceSelector = true,
}: ScheduleGeneratorProps) {
  const [clientName, setClientName] = useState(defaultClientName);
  const [serviceType, setServiceType] = useState<ScheduleServiceType>(defaultServiceType);
  const [modality, setModality] = useState<ScheduleModality>(defaultModality);
  const [environments, setEnvironments] = useState(defaultEnvironments);
  const [startDate, setStartDate] = useState(
    defaultStartDate || format(new Date(), "yyyy-MM-dd")
  );

  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);

  // Show modality selector for certain service types
  const showModality = serviceType === "decorexpress" || serviceType === "consultexpress";
  // Show environments selector for certain service types
  const showEnvironments = serviceType === "produzexpress" || serviceType === "decorexpress";

  const generateTimeline = async () => {
    if (!clientName.trim()) {
      toast.error("Por favor, informe o nome do cliente");
      return;
    }

    setIsLoadingTimeline(true);
    try {
      const response = await fetch("/api/documents/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          serviceType,
          modality,
          environments,
          startDate,
          projectId,
          format: "json",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar cronograma");
      }

      const result = await response.json();
      setScheduleData(result.data);
      toast.success("Cronograma gerado!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar cronograma");
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const downloadPDF = async () => {
    if (!clientName.trim()) {
      toast.error("Por favor, informe o nome do cliente");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch("/api/documents/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          serviceType,
          modality,
          environments,
          startDate,
          projectId,
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
      a.download = `CRONOGRAMA_${SERVICE_LABELS[serviceType].toUpperCase().replace(" ", "_")}_${clientName.toUpperCase().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao baixar PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Gerar Cronograma de Entregas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início (Pagamento)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {showServiceSelector && (
              <div className="space-y-2">
                <Label>Tipo de Serviço</Label>
                <Select
                  value={serviceType}
                  onValueChange={(v) => setServiceType(v as ScheduleServiceType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showModality && (
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select
                  value={modality}
                  onValueChange={(v) => setModality(v as ScheduleModality)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MODALITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showEnvironments && (
              <div className="space-y-2">
                <Label>Quantidade de Ambientes</Label>
                <Select
                  value={String(environments)}
                  onValueChange={(v) => setEnvironments(Number(v))}
                >
                  <SelectTrigger>
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

          <div className="flex gap-2 mt-6">
            <Button
              onClick={generateTimeline}
              disabled={isLoadingTimeline || !clientName.trim()}
              variant="outline"
            >
              {isLoadingTimeline ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Visualizar
            </Button>
            <Button
              onClick={downloadPDF}
              disabled={isDownloading || !clientName.trim()}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Baixar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Preview */}
      {scheduleData && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Summary */}
          <Card className="bg-foreground text-background">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-widest opacity-60 mb-1">
                  Agenda de Entregas
                </p>
                <h3 className="text-2xl font-bold">{clientName.toUpperCase()}</h3>
                <p className="text-sm opacity-60">
                  {SERVICE_LABELS[serviceType]} • {environments} ambiente
                  {environments > 1 ? "s" : ""} • {MODALITY_LABELS[modality]}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                <div>
                  <div className="text-3xl font-bold">{scheduleData.totalDays}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">
                    Dias Totais
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{scheduleData.meetingsCount}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">
                    Reuniões
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {scheduleData.finalDeliveryDate}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">
                    Entrega
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-0">
                {scheduleData.timeline.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "grid grid-cols-[100px_1fr] gap-4 py-4 border-b last:border-b-0",
                      item.milestone && "bg-muted/50 -mx-6 px-6"
                    )}
                  >
                    <div className="text-right">
                      <div className="font-bold">{item.dateFormatted}</div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {item.weekday}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {item.milestone && (
                          <Flag className="h-3 w-3 text-primary" />
                        )}
                        <h4 className="font-semibold text-sm uppercase">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

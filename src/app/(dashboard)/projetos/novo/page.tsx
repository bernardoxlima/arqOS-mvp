"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { ServiceType, Modality, CreateProjectData } from "@/modules/projects";
import { createProjectSchema, type CreateProjectSchemaType } from "@/modules/projects/schemas";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

const serviceTypes: { value: ServiceType; label: string; description: string }[] = [
  {
    value: "decorexpress",
    label: "DecorExpress",
    description: "Projeto de decoracao completo",
  },
  {
    value: "producao",
    label: "Producao",
    description: "Producao de moveis e itens",
  },
  {
    value: "projetexpress",
    label: "ProjetExpress",
    description: "Projeto arquitetonico express",
  },
];

const modalities: { value: Modality; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
];

export default function NovoProjetoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProjectSchemaType>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      clientName: "",
      serviceType: "decorexpress",
      modality: "presencial",
      notes: "",
    },
  });

  const selectedServiceType = form.watch("serviceType");
  const showModality = selectedServiceType === "decorexpress";

  const handleSubmit = async (values: CreateProjectSchemaType) => {
    setIsSubmitting(true);
    try {
      const projectData: CreateProjectData = {
        clientName: values.clientName,
        serviceType: values.serviceType as ServiceType,
        modality: showModality ? (values.modality as Modality) : undefined,
        notes: values.notes || undefined,
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar projeto");
      }

      toast.success("Projeto criado com sucesso!");
      router.push(`/projetos/${result.data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar projeto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projetos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Projeto</h1>
          <p className="text-muted-foreground">
            Preencha os dados para criar um novo projeto
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Dados do Projeto</CardTitle>
          <CardDescription>
            Selecione o tipo de projeto para comecar. O codigo sera gerado automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente / Projeto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Joao Silva, Apartamento Centro"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nome que identificara o projeto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Servico</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span>{type.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {type.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showModality && (
                <FormField
                  control={form.control}
                  name="modality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modalities.map((mod) => (
                            <SelectItem key={mod.value} value={mod.value}>
                              {mod.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value === "presencial"
                          ? "15 etapas incluindo visita tecnica"
                          : "12 etapas (sem visita tecnica)"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observacoes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observacoes sobre o projeto (opcional)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar Projeto
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

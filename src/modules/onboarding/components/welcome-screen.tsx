"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface WelcomeScreenProps {
  userName?: string;
  onSkip?: () => Promise<void>;
}

export function WelcomeScreen({ userName, onSkip }: WelcomeScreenProps) {
  const router = useRouter();
  const [isSkipping, setIsSkipping] = useState(false);

  const handleStart = () => {
    router.push("/setup");
  };

  const handleSkip = async () => {
    if (onSkip) {
      setIsSkipping(true);
      try {
        await onSkip();
        router.push("/projetos");
      } catch (error) {
        console.error("Error skipping setup:", error);
      } finally {
        setIsSkipping(false);
      }
    } else {
      router.push("/projetos");
    }
  };

  const greeting = userName ? `Bem-vindo(a), ${userName.split(" ")[0]}!` : "Bem-vindo(a) ao ArqOS!";

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">{greeting}</CardTitle>
        <CardDescription className="text-base mt-2">
          Vamos configurar seu escritório para começar a usar o sistema com
          todo o seu potencial.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <h3 className="font-medium text-sm">O que vamos configurar:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Tamanho e nome do escritório
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Equipe e cargos
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Custos fixos mensais
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Serviços oferecidos
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Margem de lucro desejada
            </li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Essas informações ajudam a calcular valores automaticamente e
          personalizar sua experiência.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        <Button onClick={handleStart} className="w-full" size="lg">
          Começar Configuração
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={handleSkip}
          disabled={isSkipping}
          className="w-full text-muted-foreground"
        >
          {isSkipping ? (
            "Pulando..."
          ) : (
            <>
              <SkipForward className="mr-2 h-4 w-4" />
              Pular por agora
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

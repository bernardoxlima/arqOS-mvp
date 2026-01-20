import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground text-2xl font-bold">
            A
          </div>
        </div>
        <h1 className="text-4xl font-light tracking-tight text-foreground mb-2">
          ArqOS
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Sistema unificado para arquitetura e design de interiores
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

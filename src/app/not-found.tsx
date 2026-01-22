import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-muted rounded-full">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-xl font-medium text-muted-foreground">
            Pagina nao encontrada
          </h2>
          <p className="text-sm text-muted-foreground">
            A pagina que voce esta procurando nao existe ou foi movida.
          </p>
        </div>

        <div className="flex justify-center">
          <Button asChild variant="default">
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Ir para o Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

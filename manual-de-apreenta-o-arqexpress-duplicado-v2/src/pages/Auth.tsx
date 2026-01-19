import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import logoArqexpress from '@/assets/logo-arqexpress.png';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn, signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      let message = 'Erro ao fazer login';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email ou senha incorretos';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Confirme seu email antes de fazer login';
      }
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setIsSubmitting(false);

    if (error) {
      let message = 'Erro ao criar conta';
      if (error.message.includes('User already registered')) {
        message = 'Este email já está cadastrado';
      }
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Você já pode fazer login.',
      });
      setIsLogin(true);
      signupForm.reset();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logoArqexpress} alt="ArqExpress" className="h-12" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2 text-foreground">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-center text-muted-foreground mb-6 text-sm">
            {isLogin
              ? 'Entre com suas credenciais'
              : 'Cadastre-se para começar'}
          </p>

          {/* Forms */}
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...loginForm.register('email')}
                  className="mt-1"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  {...loginForm.register('password')}
                  className="mt-1"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Maria Silva"
                  {...signupForm.register('fullName')}
                  className="mt-1"
                />
                {signupForm.formState.errors.fullName && (
                  <p className="text-destructive text-sm mt-1">
                    {signupForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  placeholder="seu@email.com"
                  {...signupForm.register('email')}
                  className="mt-1"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="signupPassword">Senha</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  placeholder="••••••"
                  {...signupForm.register('password')}
                  className="mt-1"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  {...signupForm.register('confirmPassword')}
                  className="mt-1"
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          )}

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                loginForm.reset();
                signupForm.reset();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin
                ? 'Não tem conta? Criar conta'
                : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

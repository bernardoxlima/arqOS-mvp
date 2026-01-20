# Templates de Email - ArqOS

Templates HTML para autenticação Supabase seguindo a identidade visual do ArqOS.

## Templates Disponíveis

| Arquivo | Template Supabase | Subject |
|---------|-------------------|---------|
| `confirm_signup.html` | Confirm signup | `Confirme seu cadastro no ArqOS` |
| `invite_user.html` | Invite user | `Você foi convidado para o ArqOS` |
| `magic_link.html` | Magic link | `Seu link de acesso ao ArqOS` |
| `change_email.html` | Change email address | `Confirme seu novo email no ArqOS` |
| `recovery.html` | Reset password | `Redefinir sua senha no ArqOS` |

## Como Configurar no Supabase

1. Acesse o **Supabase Dashboard** do projeto
2. Navegue até **Authentication** > **Email Templates**
3. Para cada template:
   - Selecione o tipo de template (ex: "Confirm signup")
   - Cole o conteúdo HTML do arquivo correspondente
   - Configure o **Subject** conforme a tabela acima
   - Clique em **Save**

## Design System

| Elemento | Valor |
|----------|-------|
| Cor primária | `#1a1a1a` |
| Cor de fundo | `#ffffff` |
| Cor do texto | `#0a0e27` |
| Texto secundário | `#757575` |
| Bordas | `#e5e5e5` |
| Border radius | `8px` |
| Font family | System fonts (Apple, Segoe UI, Roboto) |

## Variáveis Supabase

Todos os templates usam a variável `{{ .ConfirmationURL }}` que é automaticamente substituída pelo link de confirmação.

## Verificação

Após configurar, teste cada tipo de email:

- [ ] Criar nova conta (confirm_signup)
- [ ] Convidar usuário via dashboard (invite_user)
- [ ] Login com magic link (magic_link)
- [ ] Alterar email nas configurações (change_email)
- [ ] Recuperar senha (recovery)

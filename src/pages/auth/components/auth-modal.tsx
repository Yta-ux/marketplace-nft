import { Link } from "@tanstack/react-router"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { notifyUnavailable } from "@/lib/unavailable"
import { cn } from "@/lib/utils"
import { AuthField, AuthPasswordField } from "@/pages/auth/components/auth-field"
import { SocialButton, SocialDivider } from "@/pages/auth/components/social-auth"
import { type AuthMode, useAuthForm } from "@/pages/auth/use-auth-form"

export type { AuthMode }

type AuthModalProps = {
  mode: AuthMode
  open: boolean
  onOpenChange: (open: boolean) => void
}

const copy = {
  login: {
    description: "Entre para gerenciar sua carteira, coleção e perfil de criador.",
    cta: "Entrar",
    pending: "Entrando…",
    height: "min-h-[600px]",
  },
  register: {
    description: "Crie seu perfil de colecionador e conecte uma carteira quando quiser.",
    cta: "Criar conta",
    pending: "Criando conta…",
    height: "min-h-[656px]",
  },
}

export function AuthModal({ mode, open, onOpenChange }: AuthModalProps) {
  const c = copy[mode]
  const login = mode === "login"

  const form = useAuthForm(mode)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex w-[500px] flex-col gap-0 overflow-y-auto border-0 bg-surface p-0 max-h-[calc(100dvh-2rem)] sm:max-w-[500px]",
          c.height,
          login ? "rounded-none" : "overflow-clip rounded-lg",
        )}
      >
        <DialogTitle className="sr-only">Entrar ou criar conta</DialogTitle>
        <div className="flex flex-col items-center pt-12">
          <div className="flex w-full flex-col items-center gap-10 px-12">
            <nav
              aria-label="Acesso"
              className="flex items-center justify-center gap-2 font-medium text-[20px] leading-4"
            >
              <Link
                to="/login"
                aria-current={login ? "page" : undefined}
                className={login ? "text-highlight" : "text-foreground hover:text-highlight"}
              >
                Entrar
              </Link>
              <span aria-hidden="true" className="h-4 w-px self-stretch bg-coral" />
              <Link
                to="/register"
                aria-current={login ? undefined : "page"}
                className={login ? "text-foreground hover:text-highlight" : "text-highlight"}
              >
                Criar conta
              </Link>
            </nav>
            <DialogDescription className="w-full text-center text-caption-lg leading-4 text-foreground">
              {c.description}
            </DialogDescription>
          </div>
        </div>
        <form noValidate onSubmit={form.onSubmit} onChange={form.onChange} aria-busy={form.pending}>
          <div className="flex flex-col gap-3 px-20 pt-6">
            {!login && (
              <AuthField
                name="username"
                error={form.errors.username}
                aria-label="Nome de usuário"
                placeholder="Nome de usuário"
                autoComplete="username"
              />
            )}
            <AuthField
              name="email"
              error={form.errors.email}
              type="email"
              aria-label="E-mail"
              placeholder={login ? "contato@email.com" : "Digite seu e-mail"}
              autoComplete="email"
            />
            <AuthPasswordField
              variant="modal"
              name="password"
              error={form.errors.password}
              aria-label="Senha"
              placeholder="Senha"
              autoComplete={login ? "current-password" : "new-password"}
            />
            {!login && (
              <AuthPasswordField
                variant="modal"
                name="confirmPassword"
                error={form.errors.confirmPassword}
                aria-label="Confirmar senha"
                placeholder="Confirmar senha"
                autoComplete="new-password"
              />
            )}
            {login && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => notifyUnavailable("A recuperação de senha")}
                  className="rounded-xs text-body-sm leading-4 text-highlight hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 px-20 pt-6">
            {form.formError && (
              <p role="alert" className="text-center text-caption leading-4 text-danger">
                {form.formError}
              </p>
            )}
            <Button type="submit" variant="brand" size="modal" disabled={form.pending}>
              {form.pending ? c.pending : c.cta}
            </Button>
          </div>
        </form>
        <div className={cn("flex flex-col pt-6", login ? "gap-3" : "gap-4")}>
          <SocialDivider />
          <div className={cn("flex flex-col px-20", login ? "gap-3" : "gap-4")}>
            <SocialButton provider="google" />
            <SocialButton provider="facebook" />
          </div>
        </div>
        <div aria-hidden="true" className="mt-auto h-[10px] w-full shrink-0 bg-primary" />
        <DialogClose aria-label="Fechar" className="absolute top-[11px] right-3 rounded-xs">
          <Icon name="close-modal" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

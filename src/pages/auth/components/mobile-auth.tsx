import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { notifyUnavailable } from "@/lib/unavailable"
import { AuthField, AuthPasswordField } from "@/pages/auth/components/auth-field"
import type { AuthMode } from "@/pages/auth/components/auth-modal"
import { SocialButton, SocialDivider } from "@/pages/auth/components/social-auth"
import { useAuthForm } from "@/pages/auth/use-auth-form"

export function MobileAuth({ mode }: { mode: AuthMode }) {
  const login = mode === "login"

  const form = useAuthForm(mode)

  return (
    <div className="flex min-h-dvh flex-col gap-10 bg-ink px-7 pt-20 pb-6">
      <div className="flex h-[136px] items-center justify-center">
        <p className="text-center font-bold text-[32px] leading-[normal] tracking-[3.2px] text-foreground">
          KURIO
        </p>
      </div>
      <h1
        className={`text-center font-bold leading-4 text-foreground ${login ? "text-[20px]" : "text-title-sm"}`}
      >
        {login ? "Entrar" : "Criar perfil de colecionador"}
      </h1>
      <form
        noValidate
        onSubmit={form.onSubmit}
        onChange={form.onChange}
        aria-busy={form.pending}
        className="flex flex-col gap-10"
      >
        <div className="flex flex-col gap-3">
          {!login && (
            <AuthField
              fieldSize="mobile"
              name="username"
              error={form.errors.username}
              aria-label="Nome de usuário"
              placeholder="Nome de usuário"
              autoComplete="username"
            />
          )}
          <AuthField
            fieldSize="mobile"
            name="email"
            error={form.errors.email}
            type="email"
            aria-label="E-mail"
            placeholder={login ? "contato@email.com" : "Digite seu e-mail"}
            autoComplete="email"
          />
          <AuthPasswordField
            variant="mobile"
            name="password"
            error={form.errors.password}
            aria-label="Senha"
            placeholder="Senha"
            autoComplete={login ? "current-password" : "new-password"}
          />
          {!login && (
            <AuthPasswordField
              variant="mobile"
              name="confirmPassword"
              error={form.errors.confirmPassword}
              aria-label="Confirmar senha"
              placeholder="Confirmar senha"
              autoComplete="new-password"
            />
          )}
          {login && (
            <div className="flex items-center justify-end">
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
        <div className="flex flex-col gap-3">
          {form.formError && (
            <p role="alert" className="text-center text-caption leading-4 text-danger">
              {form.formError}
            </p>
          )}
          <Button type="submit" variant="brand" size="auth" disabled={form.pending}>
            {form.pending
              ? login
                ? "Entrando…"
                : "Criando perfil…"
              : login
                ? "Entrar"
                : "Criar perfil"}
          </Button>
        </div>
      </form>
      <div className="flex flex-col gap-3">
        <SocialDivider gap="sm" />
        <div className="flex flex-col gap-4">
          <SocialButton provider="google" />
          <SocialButton provider="facebook" />
        </div>
      </div>
      <p
        className={`flex justify-center text-body leading-[normal] text-text-secondary ${login ? "items-center" : "items-end"}`}
      >
        {login ? (
          <Link to="/register" className="hover:text-highlight">
            Novo na Kurio? Crie uma conta
          </Link>
        ) : (
          <Link to="/login" className="hover:text-highlight">
            Já tem uma conta? Entre
          </Link>
        )}
      </p>
    </div>
  )
}

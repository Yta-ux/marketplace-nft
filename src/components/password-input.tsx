import { type ComponentProps, useState } from "react"
import { Icon, type IconName } from "@/components/icon"
import { cn } from "@/lib/utils"

const variants: Record<string, { box: string; icon: IconName }> = {
  profile: { box: "h-10 rounded-[3px]", icon: "eye-profile" },
  modal: { box: "h-10 rounded-[5px]", icon: "eye-modal" },
  mobile: { box: "h-[50px] rounded-[10px]", icon: "eye-mobile" },
}

type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  variant?: keyof typeof variants
  containerClassName?: string
}

export function PasswordInput({
  variant = "profile",
  containerClassName,
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const v = variants[variant] ?? variants.profile
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 border border-field px-4 focus-within:border-primary has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-highlight",
        v?.box,
        containerClassName,
      )}
    >
      <input
        type={visible ? "text" : "password"}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-body-sm text-foreground outline-none placeholder:text-subtle",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="flex shrink-0 rounded-xs"
      >
        <Icon name={v?.icon ?? "eye-profile"} />
      </button>
    </div>
  )
}

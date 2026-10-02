import { useRouter } from "@tanstack/react-router"
import { CircleButton } from "@/components/circle-button"
import { cn } from "@/lib/utils"

type ScreenHeaderProps = {
  title: string
  titleClassName?: string
  className?: string
}

export function ScreenHeader({
  title,
  titleClassName = "left-[59px]",
  className,
}: ScreenHeaderProps) {
  const router = useRouter()
  return (
    <header className={cn("relative h-11 w-full", className)}>
      <CircleButton
        icon="arrow-left-muted"
        label="Voltar"
        onClick={() => router.history.back()}
        className="absolute top-0 left-0"
      />
      <h1
        className={cn(
          "absolute top-[9px] right-0 font-bold text-[20px] leading-4 text-foreground",
          titleClassName,
        )}
      >
        {title}
      </h1>
    </header>
  )
}

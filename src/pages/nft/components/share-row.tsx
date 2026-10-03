import { Icon, type IconName } from "@/components/icon"
import { notifyUnavailable } from "@/lib/unavailable"

const targets: { label: string; icon: IconName }[] = [
  { label: "LinkedIn", icon: "share-linkedin" },
  { label: "Mensagem", icon: "share-message" },
  { label: "Twitter", icon: "share-twitter" },
]

export function ShareRow({ title }: { title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="font-bold text-body leading-4 whitespace-nowrap text-foreground">{title}</p>
      {targets.map((target) => (
        <button
          key={target.label}
          type="button"
          aria-label={`Compartilhar no ${target.label}`}
          onClick={() => notifyUnavailable(`O compartilhamento por ${target.label}`)}
          className="flex items-center rounded-xs"
        >
          <Icon name={target.icon} />
        </button>
      ))}
    </div>
  )
}

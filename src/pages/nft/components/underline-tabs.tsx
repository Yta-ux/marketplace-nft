import type { KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

export type UnderlineTab = { id: string; label: string; shortLabel?: string }

type UnderlineTabsProps = {
  tabs: UnderlineTab[]
  value: string
  onChange: (id: string) => void
  label: string
  idPrefix: string
  className?: string
}

export function UnderlineTabs({
  tabs,
  value,
  onChange,
  label,
  idPrefix,
  className,
}: UnderlineTabsProps) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const current = tabs.findIndex((tab) => tab.id === value)
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length
    const target = tabs[next]
    if (!target) return
    onChange(target.id)
    requestAnimationFrame(() => document.getElementById(`${idPrefix}-tab-${target.id}`)?.focus())
  }

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-x-8 max-sm:gap-x-0"
      >
        {tabs.map((tab) => {
          const active = tab.id === value
          return (
            <button
              key={tab.id}
              id={`${idPrefix}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${idPrefix}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative pr-2 pb-3 text-label leading-4 max-sm:flex-1 max-sm:pr-0 max-sm:text-center max-sm:text-body",
                active
                  ? "font-bold text-highlight after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-primary"
                  : "font-normal text-foreground hover:text-highlight",
              )}
            >
              {tab.shortLabel ? (
                <>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="max-sm:hidden">{tab.label}</span>
                </>
              ) : (
                tab.label
              )}
            </button>
          )
        })}
      </div>
      <div aria-hidden="true" className="h-[0.3px] w-full bg-primary" />
    </div>
  )
}

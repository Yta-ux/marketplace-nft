import type { FormEvent } from "react"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

type SearchBarProps = {
  defaultValue?: string
  onSearch: (term: string) => void
  onOpenFilters: () => void
  className?: string
}

export function SearchBar({ defaultValue, onSearch, onOpenFilters, className }: SearchBarProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(String(new FormData(event.currentTarget).get("q") ?? "").trim())
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <search className="flex flex-1">
        <form
          onSubmit={submit}
          className="flex h-[45px] min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-surface px-3"
        >
          <Icon name="search-field" />
          <label htmlFor="mobile-search" className="sr-only">
            Buscar NFTs
          </label>
          <input
            id="mobile-search"
            key={defaultValue}
            name="q"
            type="search"
            defaultValue={defaultValue}
            placeholder="Explorar coleções"
            autoComplete="off"
            maxLength={80}
            className="min-w-0 flex-1 bg-transparent font-bold text-body-sm leading-4 text-foreground outline-none placeholder:text-subtle"
          />
        </form>
      </search>
      <button
        type="button"
        onClick={onOpenFilters}
        aria-label="Abrir filtros"
        className="flex size-[45px] shrink-0 items-start rounded-[14px] p-3 bg-[linear-gradient(137.05deg,rgba(210,138,76,0.45)_24.603%,#d28a4c_100%)]"
      >
        <Icon name="filter" />
      </button>
    </div>
  )
}

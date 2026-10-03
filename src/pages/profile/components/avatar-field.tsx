import { useRef, useState } from "react"
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from "@/api/contracts"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

type AvatarFieldProps = {
  id?: string
  src?: string | null
  pending?: boolean
  onPick: (file: File) => void
  onRemove: () => void
}

export function AvatarField({ id, src, pending = false, onPick, onRemove }: AvatarFieldProps) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function onChange(file: File | undefined) {
    if (!file) return
    if (!(AVATAR_MIME_TYPES as readonly string[]).includes(file.type)) {
      setError("Use uma imagem PNG, JPEG ou WebP.")
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError("O tamanho máximo é 1 MB.")
      return
    }
    setError(null)
    onPick(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-6">
        <span className="flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised">
          {src ? (
            <img src={src} alt="Avatar atual" className="size-full object-cover" />
          ) : (
            <Icon name="avatar-image" />
          )}
        </span>
        <div className="flex items-center gap-5">
          <input
            ref={input}
            id={id}
            type="file"
            accept={AVATAR_MIME_TYPES.join(",")}
            aria-label="Escolher avatar"
            className="sr-only"
            onChange={(event) => {
              onChange(event.target.files?.[0])
              event.target.value = ""
            }}
          />
          <Button
            type="button"
            variant="brand"
            size="form"
            className="w-[98px] text-body-sm"
            disabled={pending}
            onClick={() => input.current?.click()}
          >
            Alterar
          </Button>
          <button
            type="button"
            disabled={pending || !src}
            onClick={() => {
              setError(null)
              onRemove()
            }}
            className="rounded-xs text-body-sm leading-4 text-foreground hover:text-highlight disabled:opacity-50"
          >
            Remover
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-caption leading-4 text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

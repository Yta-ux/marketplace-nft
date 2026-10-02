export type JournalCardProps = {
  date: string
  readTime: string
  title: string
  excerpt: string
  image: string
  onReadMore: () => void
}

export function JournalCard({
  date,
  readTime,
  title,
  excerpt,
  image,
  onReadMore,
}: JournalCardProps) {
  return (
    <article className="group flex w-full flex-col overflow-clip rounded-lg bg-surface transition-shadow duration-300 hover:shadow-card">
      <img
        src={image}
        alt=""
        width={268}
        height={195}
        loading="lazy"
        className="h-[195px] w-full object-cover transition-[filter] duration-300 group-hover:brightness-110"
      />
      <div className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
        <p className="font-medium text-caption whitespace-pre-wrap text-text-secondary">
          {`${date}  |  Leitura de ${readTime}`}
        </p>
        <h3 className="font-bold transition-colors duration-200 group-hover:text-highlight text-body-lg leading-[normal] text-foreground-strong">
          {title}
        </h3>
        <p className="font-medium text-caption text-text-secondary">{excerpt}</p>
        <button
          type="button"
          onClick={onReadMore}
          className="flex gap-1 self-start text-caption text-highlight hover:underline"
        >
          <span className="font-bold leading-[14px]">Ler mais</span>
          <span aria-hidden="true" className="leading-[normal]">
            →
          </span>
          <span className="sr-only">: {title}</span>
        </button>
      </div>
    </article>
  )
}

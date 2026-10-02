import { Link, type LinkProps } from "@tanstack/react-router"
import { Fragment } from "react"

export type Crumb = { label: string; link?: Pick<LinkProps, "to" | "search" | "hash"> }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Navegação estrutural">
      <ol className="flex whitespace-pre font-bold text-body leading-4 text-foreground">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <Fragment key={item.label}>
              <li aria-current={last ? "page" : undefined}>
                {item.link && !last ? (
                  <Link {...item.link} className="hover:text-highlight">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </li>
              {!last && <li aria-hidden="true">{" / "}</li>}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

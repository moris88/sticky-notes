import type { ReactNode } from 'react'

interface IconButtonProps {
  label: string // testo per screen reader e tooltip
  onClick: () => void
  children: ReactNode
}

/** Pulsante solo icona, accessibile grazie all'etichetta. */
export function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-7 place-items-center border border-transparent hover:border-ink hover:bg-paper"
    >
      {children}
    </button>
  )
}

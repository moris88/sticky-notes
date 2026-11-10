import type { ReactNode } from 'react';

/** Contenitore comune delle icone: tratto sottile, colore del testo, nascosto agli screen reader. */
function Svg({ children, filled = false }: { children: ReactNode; filled?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const CloseIcon = () => (
  <Svg>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

/** Frecce verso l'esterno: espande la nota. */
export const ExpandIcon = () => (
  <Svg>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </Svg>
);

/** Frecce verso l'interno: riduce la nota al solo titolo. */
export const CollapseIcon = () => (
  <Svg>
    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
  </Svg>
);

/** Puntina: piena quando la nota è fissata in alto, solo contorno quando non lo è. */
export const PinIcon = ({ filled = false }: { filled?: boolean }) => (
  <Svg filled={filled}>
    <path d="M12 17v5M9 3h6l-1 6 3 3H7l3-3-1-6z" />
  </Svg>
);

/** Matita: modifica il testo della nota. */
export const EditIcon = () => (
  <Svg>
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Svg>
);

/** Monitor: apre la nota come post-it sul desktop. */
export const DesktopIcon = () => (
  <Svg>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Svg>
);

/** Cestino: elimina la nota. */
export const TrashIcon = () => (
  <Svg>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </Svg>
);

import { useMemo, useState } from 'react';
import type { Note } from '@shared/types/note';
import { addMonths, buildMonthGrid, groupByDueDate, startOfMonth, toIsoDate } from '../../lib/calendar';
import { NOTE_COLOR_CLASSES } from '../../lib/note-colors';
import { displayTitle } from '../../lib/note-title';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const monthFormatter = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });

interface CalendarViewProps {
  notes: Note[];
  onOpen: (note: Note) => void;
}

/** Vista calendario: ogni nota compare nel giorno della sua scadenza. */
export function CalendarView({ notes, onOpen }: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const days = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const byDay = useMemo(() => groupByDueDate(notes), [notes]);
  const today = toIsoDate(new Date());

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, -1))}
          aria-label="Mese precedente"
          className="rounded-md px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10"
        >
          ‹
        </button>
        <h2 className="text-lg font-semibold capitalize">{monthFormatter.format(cursor)}</h2>
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, 1))}
          aria-label="Mese successivo"
          className="rounded-md px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10"
        >
          ›
        </button>
      </header>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-zinc-300 bg-zinc-300 dark:border-zinc-700 dark:bg-zinc-700">
        {WEEKDAYS.map((d) => (
          <div key={d} className="bg-zinc-100 p-2 text-center text-xs font-semibold dark:bg-zinc-800">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const iso = toIsoDate(day);
          const dayNotes = byDay.get(iso) ?? [];
          const inMonth = day.getMonth() === cursor.getMonth();
          return (
            <div key={iso} className={`min-h-24 bg-white p-1 dark:bg-zinc-900 ${inMonth ? '' : 'opacity-40'}`}>
              <span
                className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                  iso === today ? 'bg-sky-600 text-white' : ''
                }`}
              >
                {day.getDate()}
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {dayNotes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => onOpen(n)}
                    className={`${NOTE_COLOR_CLASSES[n.color]} truncate rounded px-1 py-0.5 text-left text-xs text-ink`}
                  >
                    {displayTitle(n)}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

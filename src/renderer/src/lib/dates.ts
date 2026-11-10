/**
 * Formatta 'YYYY-MM-DD' in italiano. Il suffisso T00:00:00 (senza Z) forza l'ora locale:
 * senza di esso JavaScript interpreta la data come UTC e in Italia mostrerebbe il giorno prima.
 */
export function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

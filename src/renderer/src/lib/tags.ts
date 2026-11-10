/** Trasforma "Fatture, urgente,fatture" in ["fatture", "urgente"]. */
export function parseTags(input: string): string[] {
  const tags = input
    .split(',')
    .map((t) => t.trim().toLocaleLowerCase('it-IT'))
    .filter(Boolean)
  return [...new Set(tags)]
}

/** Converte uma data no valor de um <input type="datetime-local"> (hora local). */
export function toLocalInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Converte o valor de um datetime-local (hora local) para ISO, ou "" se vazio. */
export function fromLocalInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/** true se a data (ISO ou datetime-local) estiver no futuro. */
export function isFutureDate(value: string | Date | null | undefined): boolean {
  if (!value) return false;
  const t = new Date(value).getTime();
  return !Number.isNaN(t) && t > Date.now();
}

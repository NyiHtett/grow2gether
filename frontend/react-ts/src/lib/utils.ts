/** shadcn-convention class merge helper.
 *  (Lightweight version — no clsx/tailwind-merge dependency needed here.) */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

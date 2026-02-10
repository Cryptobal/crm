/**
 * Colores por firmante (Firmante 1, 2, … 10) para tokens y modal.
 * Misma paleta en el editor (chips) y en "Enviar a firma" (badge por orden).
 */

export const SIGNER_TOKEN_COLORS: Array<{ bg: string; border: string; text: string }> = [
  { bg: "hsl(217 91% 60% / 0.22)", border: "hsl(217 91% 55%)", text: "hsl(217 91% 75%)" },      // 1 azul
  { bg: "hsl(160 84% 39% / 0.22)", border: "hsl(160 84% 35%)", text: "hsl(160 84% 55%)" },     // 2 esmeralda
  { bg: "hsl(38 92% 50% / 0.22)", border: "hsl(38 92% 48%)", text: "hsl(38 92% 65%)" },       // 3 ámbar
  { bg: "hsl(350 89% 60% / 0.22)", border: "hsl(350 89% 55%)", text: "hsl(350 89% 75%)" },     // 4 rosa
  { bg: "hsl(263 70% 58% / 0.22)", border: "hsl(263 70% 55%)", text: "hsl(263 70% 75%)" },     // 5 violeta
  { bg: "hsl(189 94% 43% / 0.22)", border: "hsl(189 94% 40%)", text: "hsl(189 94% 65%)" },    // 6 cyan
  { bg: "hsl(25 95% 53% / 0.22)", border: "hsl(25 95% 50%)", text: "hsl(25 95% 70%)" },       // 7 naranja
  { bg: "hsl(292 84% 61% / 0.22)", border: "hsl(292 84% 58%)", text: "hsl(292 84% 78%)" },    // 8 fucsia
  { bg: "hsl(173 80% 40% / 0.22)", border: "hsl(173 80% 36%)", text: "hsl(173 80% 58%)" },     // 9 teal
  { bg: "hsl(199 89% 48% / 0.22)", border: "hsl(199 89% 45%)", text: "hsl(199 89% 68%)" },    // 10 sky
];

export function getSignerColor(order: number): { bg: string; border: string; text: string } {
  const index = Math.max(0, Math.min(order - 1, SIGNER_TOKEN_COLORS.length - 1));
  return SIGNER_TOKEN_COLORS[index];
}

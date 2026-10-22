import { isHelmet, type Product } from './mega-store';
export const PROMOTION_KEY = 'mega-promocao-75-v1';
export const STORE_ACCESS_KEY = 'mega-human-verified-v2';
export const SPIN_KEY = 'mega-promocao-tentativas-v1';
export const MAX_SPINS = 2;
export const WHEEL_LABELS = ['Tente novamente', '25%', '5%', '50%', 'Tente novamente', '95%', '75%', '25%'];
export function spinOutcome(completed: number) {
  if (completed === 0) return { attempt: 1, sector: 0, discount: null, rotation: 1800 - 22.5 };
  if (completed === 1) return { attempt: 2, sector: 6, discount: 75, rotation: 3600 + 67.5 };
  return null;
}
export function promotionDiscount(product: Product) { return isHelmet(product) ? 75 : null; }

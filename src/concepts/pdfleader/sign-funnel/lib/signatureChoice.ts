/**
 * Carries the signature type the user picked in the editor to the pages after
 * it. Flow pages are independent routes, each seeded by its own mock with no
 * shared store, so the choice rides in sessionStorage; in-product this is
 * store/router state and these two helpers go away.
 *
 * Reads fall back to the page's mock when nothing is stored, which is what
 * keeps `?scenario=` previews (and the fidelity run) deterministic.
 */
export type SignedWith = 'simple' | 'digital';

const KEY = 'pdfleader:sign-funnel:signature-type';

export function rememberSignatureType(type: SignedWith): void {
  try {
    window.sessionStorage.setItem(KEY, type);
  } catch {
    // Private mode / storage disabled — the mock default still applies.
  }
}

export function recallSignatureType(): SignedWith | null {
  try {
    const stored = window.sessionStorage.getItem(KEY);
    return stored === 'simple' || stored === 'digital' ? stored : null;
  } catch {
    return null;
  }
}

/** Clears the handoff so the funnel starts fresh (used by "restart"). */
export function forgetSignatureType(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing stored to clear.
  }
}

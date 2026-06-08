// Generisk brevmal-dokument for egendefinerte modeller (ikke XSD-spesifikt).
export type BlokkType = 'overskrift' | 'avsnitt';

export interface Blokk {
  id: string;
  type: BlokkType;
  tekst: string;
}
export interface Brev {
  id: string;
  tittel: string;
  blokker: Blokk[];
}
export interface BrevmalDok {
  brev: Brev[];
}

export function uid(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.floor(performance.now() * 1000).toString(36);
}

// Datamodell-struktur (objekter + felt), bygget fra en XSD.
export interface StrukturFelt {
  navn: string;
  type: string;
  kardinalitet?: string; // valgfri – f.eks. «0..1», «1..n»
  beskrivelse: string;
  nillable?: boolean; // xs:element nillable="true" (kan settes eksplisitt til null)
  attributt?: boolean; // true => xs:attribute, ellers xs:element
  fixed?: string; // xs:attribute fixed="…" (fast verdi)
  // ---- presentasjon i den grupperte Datamodell-fanen (valgfritt) ----
  ref?: string; // navn på objekttypen `type` peker på (klikkbart ref-hopp)
  req?: boolean; // vis «Påkrevd»-merke
  list?: boolean; // feltet er en liste (kun visuelt)
}
export interface StrukturObjekt {
  navn: string;
  beskrivelse: string;
  felt: StrukturFelt[];
  rotElement?: string; // navn på toppnivå-xs:element som peker på denne typen
  targetNamespace?: string; // skjemaets targetNamespace (settes på rot-objektet)
  partikkel?: 'sequence' | 'all' | 'choice'; // hvilken partikkel feltene lå i
  // ---- presentasjon i den grupperte Datamodell-fanen (valgfritt) ----
  group?: string; // gruppe-overskrift (Konvolutt, Parter og aktører, …)
  note?: string; // kort forklaring ved siden av objektnavnet
  open?: boolean; // start ekspandert
}
export type Struktur = StrukturObjekt[];

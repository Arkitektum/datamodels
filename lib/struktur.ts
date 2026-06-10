// Datamodell-struktur (objekter + felt), bygget fra en XSD.
export interface StrukturFelt {
  navn: string;
  type: string;
  kardinalitet?: string; // valgfri – f.eks. «0..1», «1..n»
  beskrivelse: string;
  nillable?: boolean; // xs:element nillable="true" (kan settes eksplisitt til null)
  attributt?: boolean; // true => xs:attribute, ellers xs:element
  fixed?: string; // xs:attribute fixed="…" (fast verdi)
}
export interface StrukturObjekt {
  navn: string;
  beskrivelse: string;
  felt: StrukturFelt[];
  rotElement?: string; // navn på toppnivå-xs:element som peker på denne typen
  targetNamespace?: string; // skjemaets targetNamespace (settes på rot-objektet)
  partikkel?: 'sequence' | 'all' | 'choice'; // hvilken partikkel feltene lå i
}
export type Struktur = StrukturObjekt[];

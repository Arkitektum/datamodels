// Datamodell-struktur (objekter + felt), bygget fra en XSD.
export interface StrukturFelt {
  navn: string;
  type: string;
  kardinalitet?: string; // valgfri – vises ikke i UI
  beskrivelse: string;
}
export interface StrukturObjekt {
  navn: string;
  beskrivelse: string;
  felt: StrukturFelt[];
}
export type Struktur = StrukturObjekt[];

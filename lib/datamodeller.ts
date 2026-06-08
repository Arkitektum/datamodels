/**
 * Register over datamodeller som finnes i portalen.
 * Brukt av landingssiden og av generateStaticParams (statisk eksport krever
 * at alle ruter er kjent ved bygg).
 */
export interface Datamodell {
  id: string; // = datamodell_id i databasen
  navn: string;
  beskrivelse?: string;
  slug: string; // url-segment under /datamodell/<slug>
}

export const DATAMODELLER: Datamodell[] = [
  {
    id: 'hoeringOgOffentligEttersynV2',
    navn: 'Høring og offentlig ettersyn',
    beskrivelse: 'HøringOgOffentligEttersyn V2 – brevmaler og valideringsregler.',
    slug: 'hoering-og-offentlig-ettersyn',
  },
];

export function getDatamodellBySlug(slug: string): Datamodell | undefined {
  return DATAMODELLER.find((d) => d.slug === slug);
}

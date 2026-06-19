// Referanse-/kodelister for HøringOgOffentligEttersyn V2, vist i venstre
// sidemeny under modell-lista. Vedlegg er redigerbart per modell (lagres delt
// i Supabase under type "vedlegg"); roller/høringstype/planprosessregel vises
// som fast referanse.

export interface VedleggType {
  navn: string;
  filtyper: string[];
}
export interface KodeRad {
  kode: string;
  label: string;
  prosess?: string; // FULL | FORENKLET (kun planprosessregel)
}
export interface KodeGruppe {
  gruppe: string;
  koder: KodeRad[];
}
export interface HoeringstypeRad {
  kode: string;
  label: string;
  beskrivelse: string;
}
export interface Referanse {
  roller: KodeGruppe[];
  hoeringstype: HoeringstypeRad[];
  planprosessregel: KodeGruppe[];
}

// ---- Generiske, redigerbare kodelister (lagres delt under type "kodelister") ----
export interface KodelisteRad {
  kode: string;
  beskrivelse: string;
}
export interface Kodeliste {
  navn: string;
  rader: KodelisteRad[];
}

export const VEDLEGG_DEFAULT: VedleggType[] = [
  { navn: 'Planbestemmelse', filtyper: ['PDF', 'XML'] },
  { navn: 'Planbeskrivelse', filtyper: ['PDF', 'PNG', 'TIFF', 'JPG'] },
  { navn: 'Illustrasjoner', filtyper: ['PDF', 'PNG', 'TIFF', 'JPG'] },
  { navn: 'RosAnalyse', filtyper: ['PDF', 'PNG', 'TIFF', 'JPG'] },
  { navn: 'Konsekvensutredning', filtyper: ['PDF', 'PNG', 'TIFF', 'JPG'] },
  { navn: 'Utredning', filtyper: ['PDF'] },
  { navn: 'Plankart', filtyper: ['PDF', 'GML', 'SOSI'] },
  { navn: 'Fagrapporter', filtyper: ['PDF'] },
  { navn: 'Annet', filtyper: ['PDF', 'PNG', 'TIFF', 'JPG'] },
];

export const REFERANSE_HOERING: Referanse = {
  roller: [
    {
      gruppe: 'Forslagsstiller / plankonsulent',
      koder: [
        { kode: 'forslagsstiller', label: 'Forslagsstiller' },
        { kode: 'fagkyndig_plankonsulent', label: 'Fagkyndig plankonsulent' },
      ],
    },
    {
      gruppe: 'Berørt part og interessenter',
      koder: [
        { kode: 'hjemmelshaver', label: 'Hjemmelshaver eller fester i planområdet' },
        { kode: 'nabo_gjenboer', label: 'Nabo eller gjenboer (hjemmelshaver og fester)' },
        { kode: 'leietager', label: 'Leietager i planområdet' },
        { kode: 'interessent', label: 'Berørt interessent' },
      ],
    },
    {
      gruppe: 'Myndigheter',
      koder: [
        { kode: 'berort_kommune', label: 'Annen berørt kommune' },
        { kode: 'statsforvalter', label: 'Statsforvalter' },
        { kode: 'fylkeskommune', label: 'Fylkeskommune' },
        { kode: 'sametinget', label: 'Sametinget' },
        { kode: 'sektormyndighet', label: 'Berørt sektormyndighet' },
      ],
    },
    {
      gruppe: 'Andre',
      koder: [{ kode: 'andre_interessenter', label: 'Annen interessent' }],
    },
  ],
  hoeringstype: [
    {
      kode: 'HOFFE',
      label: 'Høring og offentlig ettersyn',
      beskrivelse:
        'Full høring av planforslag etter pbl. § 5-2 / § 11-14 / § 12-10. Min. 6 uker.',
    },
    {
      kode: 'BEGR',
      label: 'Begrenset høring',
      beskrivelse: 'Kun mot direkte berørte ved endring i bearbeidingsfasen. Typisk 2–4 uker.',
    },
    {
      kode: 'FORE',
      label: 'Forelegging',
      beskrivelse:
        'Ved endrings- eller opphevingsforslag for berørte parter og myndigheter etter forenklet behandling (pbl. § 12-14 andre ledd). Erstatter høring i den forenklede prosessen.',
    },
  ],
  planprosessregel: [
    {
      gruppe: 'Kommuneplan / kommunedelplan',
      koder: [
        { kode: 'NY-KP', label: 'Ny kommuneplan / kommunedelplan', prosess: 'FULL' },
        { kode: 'ENDR-KP-MINDRE', label: 'Mindre endring av kommuneplan', prosess: 'FORENKLET' },
        { kode: 'ENDR-KP', label: 'Endring av kommuneplan, full prosess', prosess: 'FULL' },
        { kode: 'OPPH-KP', label: 'Oppheving av kommuneplan' },
      ],
    },
    {
      gruppe: 'Reguleringsplan',
      koder: [
        { kode: 'NY-RP', label: 'Ny reguleringsplan', prosess: 'FULL' },
        { kode: 'ENDR-RP', label: 'Endring av reguleringsplan, ordinær prosess', prosess: 'FULL' },
        { kode: 'ENDR-F-RP', label: 'Endring av reguleringsplan etter forenklet behandling', prosess: 'FORENKLET' },
        { kode: 'OPPH-RP', label: 'Oppheving av reguleringsplan, ordinær prosess', prosess: 'FULL' },
        { kode: 'OPPH-F-RP', label: 'Oppheving av reguleringsplan etter forenklet behandling', prosess: 'FORENKLET' },
      ],
    },
  ],
};

// Høring sine faste lister omgjort til generiske, redigerbare kodelister.
// Gruppering og FULL/FORENKLET legges inn i beskrivelsesteksten.
const flatGrupper = (grupper: KodeGruppe[]): KodelisteRad[] =>
  grupper.flatMap((g) =>
    g.koder.map((k) => ({
      kode: k.kode,
      beskrivelse: k.prosess ? `${k.label} (${k.prosess})` : k.label,
    })),
  );

export const KODELISTER_DEFAULT: Kodeliste[] = [
  { navn: 'Roller', rader: flatGrupper(REFERANSE_HOERING.roller) },
  {
    navn: 'Høringstype',
    rader: REFERANSE_HOERING.hoeringstype.map((h) => ({
      kode: h.kode,
      beskrivelse: `${h.label} — ${h.beskrivelse}`,
    })),
  },
  { navn: 'Planprosessregel', rader: flatGrupper(REFERANSE_HOERING.planprosessregel) },
];

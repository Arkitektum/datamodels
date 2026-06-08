// AUTO-EKSTRAHERT fra de innebygde doktabellene. Standard datamodell-struktur
// for HoeringOgOffentligEttersyn V2 (redigerbar i appen, lagres i Supabase).
import type { Struktur } from "@/lib/struktur";

export const STRUKTUR_DEFAULT: Struktur = [
  {
    "navn": "Konvolutten – HoeringOgOffentligEttersynType",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "hoeringstype",
        "type": "KodeType",
        "beskrivelse": "Én av: HOFFE (Høring og offentlig ettersyn) / BEGR (Begrenset høring) / FORE (Forelegging). Se kodeliste i sidebar."
      },
      {
        "navn": "planprosessregel",
        "type": "KodeType",
        "beskrivelse": "NY-KP / NY-RP / ENDR-KP-MINDRE / ENDR-KP / ENDR-RP / ENDR-F-RP / OPPH-KP / OPPH-RP / OPPH-F-RP — se kodeliste i sidebar"
      },
      {
        "navn": "mottakerListe",
        "type": "BeroertpartOgInteressentOgMyndighetListe",
        "beskrivelse": "Liste av berørte parter, interessenter og myndigheter som varsles"
      },
      {
        "navn": "eiendommerSomInngaarIPlanomraadet",
        "type": "EiendomListe",
        "beskrivelse": "Eiendommer innenfor planområdet"
      },
      {
        "navn": "eksisterendePlanerSomBeroeres",
        "type": "EksisterendePlanSomBeroeresListe",
        "beskrivelse": "Eksisterende arealplaner som berøres"
      },
      {
        "navn": "kommune",
        "type": "AktoerType",
        "beskrivelse": "Kommunen som sender varselet"
      },
      {
        "navn": "forslagsstiller",
        "type": "AktoerType",
        "beskrivelse": "Forslagsstiller for planforslaget"
      },
      {
        "navn": "plankonsulent",
        "type": "AktoerType",
        "beskrivelse": "Konsulent som har utarbeidet planforslaget"
      },
      {
        "navn": "metadata",
        "type": "MetadataType",
        "beskrivelse": "Sluttbrukersystem, prosjekt-info, foretrukket språk"
      },
      {
        "navn": "planforslag",
        "type": "Arealplan",
        "beskrivelse": "Identifikasjon av selve planforslaget"
      },
      {
        "navn": "medvirkningIHoeringsperioden",
        "type": "string",
        "beskrivelse": "Beskrivelse av medvirkningsformer"
      },
      {
        "navn": "planhensikt",
        "type": "string",
        "beskrivelse": "Formålet med planforslaget"
      },
      {
        "navn": "tilgjengelighetEksemplar",
        "type": "string",
        "beskrivelse": "Fritekst — hvor planen er tilgjengelig (lovkrav)"
      },
      {
        "navn": "fristForUttalelse",
        "type": "dateTime",
        "beskrivelse": "Frist for å levere uttalelse"
      },
      {
        "navn": "hjemmesidePlanforslag",
        "type": "string",
        "beskrivelse": "URL til planprogram/planforslag-side"
      },
      {
        "navn": "kommunensSaksnummer",
        "type": "SaksnummerType",
        "beskrivelse": "Kommunens interne saksnummer (saksår + sekvens)"
      },
      {
        "navn": "beskrivelseVedtakOmHoeringOgOffentligEttersyn",
        "type": "string",
        "beskrivelse": "Politisk vedtak om utlegging til høring/ettersyn"
      }
    ]
  },
  {
    "navn": "Arealplan – planforslag (selve planen)",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "plannavn",
        "type": "string",
        "beskrivelse": "Plannavn (f.eks. «Områdeplan for His Allé»)"
      },
      {
        "navn": "nasjonalArealplanId",
        "type": "NasjonalArealplanIdType",
        "beskrivelse": "Nasjonal ID — kommunenr + landkode + planId"
      },
      {
        "navn": "plantype",
        "type": "KodeType",
        "beskrivelse": "F.eks. «Detaljregulering» (kodeverdi 35)"
      }
    ]
  },
  {
    "navn": "EksisterendePlanSomBeroeresType – eksisterende plan(er) som berøres",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "navn",
        "type": "string",
        "beskrivelse": "Plannavn"
      },
      {
        "navn": "plantype",
        "type": "KodeType",
        "beskrivelse": "Plantype-kode"
      },
      {
        "navn": "nasjonalArealplanId",
        "type": "NasjonalArealplanIdType",
        "beskrivelse": "Nasjonal ID"
      },
      {
        "navn": "beskrivelseAvFoelger",
        "type": "string",
        "beskrivelse": "Delen av denne planen som berøres av ny plan"
      }
    ]
  },
  {
    "navn": "BeroertpartOgInteressentOgMyndighetType – berørt part / interessent / myndighet",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "partstype",
        "type": "KodeType",
        "beskrivelse": "Privatperson eller Organisasjon — fra Geonorge-kodeliste"
      },
      {
        "navn": "foedselsnummer",
        "type": "string",
        "beskrivelse": "Kun for privatperson — krypteres ved distribusjon"
      },
      {
        "navn": "organisasjonsnummer",
        "type": "string",
        "beskrivelse": "Kun for organisasjon (9 siffer fra Brønnøysund)"
      },
      {
        "navn": "rolle",
        "type": "KodeType",
        "beskrivelse": "Én rolle parten har i planprosessen. Mulige verdier: forslagsstiller , fagkyndig_plankonsulent , hjemmelshaver , nabo_gjenboer , leietager , interessent , berort_kommune , statsforvalter , fylkeskommune , sametinget , sektormyndighet , andre_interessenter . Se kodeliste i sidebar."
      },
      {
        "navn": "navn",
        "type": "string",
        "beskrivelse": "Fullt navn på person eller organisasjon"
      },
      {
        "navn": "telefon",
        "type": "string",
        "beskrivelse": "Telefonnummer til parten"
      },
      {
        "navn": "epost",
        "type": "string",
        "beskrivelse": "E-postadresse til parten"
      },
      {
        "navn": "adresse",
        "type": "EnkelAdresseType",
        "beskrivelse": "Postadresse for varsling"
      },
      {
        "navn": "systemReferanse",
        "type": "string",
        "beskrivelse": "Sluttbrukersystemets interne ID — brukes for å koble tilbake ved svar"
      },
      {
        "navn": "gjelderEiendommer",
        "type": "GjelderEiendomListe",
        "beskrivelse": "Eiendommer parten er knyttet til (typisk hjemmelshaver/nabo)"
      }
    ]
  },
  {
    "navn": "AktoerType – kommune / forslagsstiller",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "partstype",
        "type": "KodeType",
        "beskrivelse": "Privatperson eller Organisasjon"
      },
      {
        "navn": "foedselsnummer",
        "type": "string",
        "beskrivelse": "Kun for privatperson"
      },
      {
        "navn": "organisasjonsnummer",
        "type": "string",
        "beskrivelse": "Kun for organisasjon (9 siffer)"
      },
      {
        "navn": "navn",
        "type": "string",
        "beskrivelse": "Navn på person eller organisasjon"
      },
      {
        "navn": "adresse",
        "type": "EnkelAdresseType",
        "beskrivelse": "Postadresse"
      },
      {
        "navn": "telefonnummer",
        "type": "string",
        "beskrivelse": "Sentralbordnummer eller fast telefon"
      },
      {
        "navn": "mobilnummer",
        "type": "string",
        "beskrivelse": "Mobilnummer"
      },
      {
        "navn": "epost",
        "type": "string",
        "beskrivelse": "Felles e-postadresse"
      },
      {
        "navn": "kontaktperson",
        "type": "KontaktpersonType",
        "beskrivelse": "Navngitt person hos organisasjonen — fungerer som kontaktledd"
      }
    ]
  },
  {
    "navn": "KontaktpersonType",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "navn",
        "type": "string",
        "beskrivelse": "Fullt navn på kontaktperson"
      },
      {
        "navn": "telefonnummer",
        "type": "string",
        "beskrivelse": "Direkte telefonnummer til personen"
      },
      {
        "navn": "mobilnummer",
        "type": "string",
        "beskrivelse": "Mobilnummer til personen"
      },
      {
        "navn": "epost",
        "type": "string",
        "beskrivelse": "Direkte e-postadresse til personen"
      }
    ]
  },
  {
    "navn": "EiendomType / GjelderEiendomType",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "eiendomsidentifikasjon",
        "type": "MatrikkelnummerType",
        "beskrivelse": "Matrikkelidentifikasjon — kommunenr + gnr/bnr/fnr/snr"
      },
      {
        "navn": "adresse",
        "type": "EiendommensAdresseType",
        "beskrivelse": "Eiendommens fysiske adresse (gatenavn, husnr, bokstav, postnr/poststed)"
      },
      {
        "navn": "bygningsnummer",
        "type": "string",
        "beskrivelse": "Matrikkelens bygningsnummer — identifiserer en spesifikk bygning på eiendommen"
      },
      {
        "navn": "bolignummer",
        "type": "string",
        "beskrivelse": "Bolignummer (H0101 osv.) — identifiserer en spesifikk leilighet/bolig"
      },
      {
        "navn": "kommunenavn",
        "type": "string",
        "beskrivelse": "Navn på kommunen eiendommen ligger i"
      }
    ]
  },
  {
    "navn": "MatrikkelnummerType",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "kommunenummer",
        "type": "string",
        "beskrivelse": "4-sifret kommunenummer (f.eks. «0301» for Oslo)"
      },
      {
        "navn": "gaardsnummer",
        "type": "integer",
        "beskrivelse": "Gårdsnummer (gnr) — første del av matrikkeladresse"
      },
      {
        "navn": "bruksnummer",
        "type": "integer",
        "beskrivelse": "Bruksnummer (bnr) — andre del av matrikkeladresse"
      },
      {
        "navn": "festenummer",
        "type": "integer",
        "beskrivelse": "Festenummer (fnr) — for festetomter (0 hvis ikke aktuelt)"
      },
      {
        "navn": "seksjonsnummer",
        "type": "integer",
        "beskrivelse": "Seksjonsnummer (snr) — for seksjonerte eiendommer"
      }
    ]
  },
  {
    "navn": "NasjonalArealplanIdType",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "kommunenummer",
        "type": "string",
        "beskrivelse": "Kommunen som forvalter planen (4 siffer)"
      },
      {
        "navn": "landkode",
        "type": "string",
        "beskrivelse": "Landkode (alltid «NO» for norske planer)"
      },
      {
        "navn": "planId",
        "type": "string",
        "beskrivelse": "Unik plan-ID innen kommunen. NB: andre XSD-er bruker «planidentifikasjon»"
      }
    ]
  },
  {
    "navn": "MetadataType",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "fraSluttbrukersystem",
        "type": "string",
        "beskrivelse": "Navn på sluttbrukersystem som sender (f.eks. «Vorpah»)"
      },
      {
        "navn": "ftbId",
        "type": "string",
        "beskrivelse": "Unik referanse-ID generert av Fellestjenester Bygg/Plan"
      },
      {
        "navn": "prosjektnavn",
        "type": "string",
        "beskrivelse": "Internt prosjektnavn i sluttbrukersystem"
      },
      {
        "navn": "prosjektnr",
        "type": "string",
        "beskrivelse": "Internt prosjektnummer i sluttbrukersystem"
      },
      {
        "navn": "foretrukketSpraak",
        "type": "KodeType",
        "beskrivelse": "Bokmål (nb), nynorsk (nn) eller engelsk (en)"
      }
    ]
  },
  {
    "navn": "SaksnummerType",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "saksaar",
        "type": "integer",
        "beskrivelse": "Året saken ble opprettet i kommunen (f.eks. 2026 )"
      },
      {
        "navn": "sakssekvensnummer",
        "type": "integer",
        "beskrivelse": "Løpenummer innen saksåret — unik kombinasjon med saksaar"
      }
    ]
  },
  {
    "navn": "EnkelAdresseType / EiendommensAdresseType",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "adresselinje1–3",
        "type": "string",
        "beskrivelse": "Tre frie linjer for adresse (gatenavn, c/o, bygningsnavn, osv.)"
      },
      {
        "navn": "postnr",
        "type": "string",
        "beskrivelse": "4-sifret postnummer"
      },
      {
        "navn": "poststed",
        "type": "string",
        "beskrivelse": "Poststedsnavn (f.eks. «Oslo»)"
      },
      {
        "navn": "landkode",
        "type": "string",
        "beskrivelse": "ISO 3166 landkode (f.eks. «NO» for Norge)"
      },
      {
        "navn": "gatenavn",
        "type": "string",
        "beskrivelse": "Kun EiendommensAdresseType — strukturert gatenavn"
      },
      {
        "navn": "husnr",
        "type": "string",
        "beskrivelse": "Kun EiendommensAdresseType — husnummer"
      },
      {
        "navn": "bokstav",
        "type": "string",
        "beskrivelse": "Kun EiendommensAdresseType — adressebokstav (A/B/C)"
      }
    ]
  },
  {
    "navn": "KodeType / KodeListe",
    "beskrivelse": "",
    "felt": [
      {
        "navn": "kodeverdi",
        "type": "string",
        "beskrivelse": "Teknisk kode fra kodelisten (f.eks. «35» for detaljregulering)"
      },
      {
        "navn": "kodebeskrivelse",
        "type": "string",
        "beskrivelse": "Menneskelig lesbar tekst (f.eks. «Detaljregulering»)"
      }
    ]
  }
];

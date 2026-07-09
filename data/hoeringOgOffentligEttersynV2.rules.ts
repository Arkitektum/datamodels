// AUTO-GENERERT fra Confluence-siden "Valideringsregler til testing"
// (https://arkitektum.atlassian.net/wiki/spaces/hoffe/pages/4778524673).
// Rediger heller via UI/import.
import type { RegelStatusDef, RegelGruppeDef } from "@/lib/regler";

export const REGEL_ROOT = "HoeringOgOffentligEttersyn";

export const REGEL_STATUSER: RegelStatusDef[] = [
  { "id": "", "navn": "Ingen status", "cls": "" },
  { "id": "utvikling", "navn": "Til utvikling/test", "cls": "st-utvikling" },
  { "id": "slettet", "navn": "Slettet", "cls": "st-slettet" },
  { "id": "avklares", "navn": "Må avklares", "cls": "st-avklares" },
  { "id": "testetok", "navn": "Testet OK", "cls": "st-testetok" },
  { "id": "feilet", "navn": "Test feilet", "cls": "st-feilet" },
  { "id": "nye", "navn": "Nye", "cls": "st-nye" }
];

export const REGEL_GRUPPER_DEFAULT: RegelGruppeDef[] = [
  {
    "g": "Avsender",
    "std": true,
    "rules": [
      {
        "p": "Avsender.Utfylt",
        "t": "Du kan ikke sende planforslaget på høring og offentlig ettersyn uten en avsender.",
        "r": "Feil",
        "b": "AuthenticatedSubmitter",
        "k": "10. juni 2026 MHL OK"
      },
      {
        "p": "Avsender.Kommune.Gyldig",
        "t": "Identiteten (organisasjonsnummeret) til avsender må være lik identiteten som er oppgitt for kommune.",
        "r": "Feil",
        "b": "avsender/kommune",
        "k": "8. juni 2026 MHL OK Hvilken liste brukes? Er den robust og gyldig mtp kommunesammenslåinger. Tidligere vært advarsel ved utgått org og kommuenr 16. juni 2026 ML\n@Marie Hatteberg Leivestad Denne regelen sjekker kun om at kommunens organisasjonsnummer i xml er den samme som organisasjonsnummer til innlogget avsender. Det blir ikke brukt noen lister i denne regelen"
      }
    ]
  },
  {
    "g": "BeskrivelseVedtakOmHoeringOgOffentligEttersyn",
    "rules": [
      {
        "p": "BeskrivelseVedtakOmHoeringOgOffentligEttersyn.Utfylt",
        "t": "Du må fylle ut beskrivelsen for vedtak om høring og offentlig ettersyn.",
        "r": "Feil",
        "b": "beskrivelseVedtakOmHoeringOgOffentligEttersyn",
        "k": "10. juni 2026 MHL OK"
      }
    ]
  },
  {
    "g": "EiendommerSomInngaarIPlanomraadet",
    "rules": [
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Utfylt",
        "t": "Du må oppgi minst én eiendom som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet",
        "k": "10. juni 2026 MHL Ta vekk alle valideringsregler på eiendommerSomInngaarPlanomraadet"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Utfylt",
        "t": "Du må oppgi hvilken eiendom/hvilke eiendommer som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}",
        "k": "22. juni 2026 MHL Spør TK hvorfor de skal slettes. Hvorfor bør de eventuelt må beholdes?"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Utfylt",
        "t": "Du må oppgi eiendomsidentifikasjon for eiendom som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Bruksnummer.Utfylt",
        "t": "Bruksnummer må fylles ut for eiendom som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/bruksnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Bruksnummer.Gyldig",
        "t": "Bruksnummer for eiendom som inngår i planområdet må være '0' eller større.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/bruksnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Festenummer.Gyldig",
        "t": "Festenummer for eiendom som inngår i planområdet må være '0' eller større.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/festenummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Gaardsnummer.Utfylt",
        "t": "Gårdsnummer må fylles ut for eiendom som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/gaardsnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Gaardsnummer.Gyldig",
        "t": "Gårdsnummer for eiendom som inngår i planområdet må være '0' eller større.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/gaardsnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.Utfylt",
        "t": "Kommunenummer må fylles ut for eiendom som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/kommunenummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.KodelisteFinnes",
        "t": "En teknisk feil gjør at vi ikke kan bekrefte om kommunenummeret du har oppgitt '{0}' er riktig. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/kommunenummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.Gyldig",
        "t": "Kommunenummeret '{0}' for eiendom som inngår i planområdet finnes ikke i kodelisten. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/kommunenummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.GyldigIKodeliste",
        "t": "Kommunenummeret '{0}' for eiendom som inngår i planområdet har ugyldig status ({1}). Du kan sjekke status på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/kommunenummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Seksjonsnummer.Gyldig",
        "t": "Seksjonsnummer for eiendom som inngår i planområdet må være '0' eller større.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/seksjonsnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.GyldigIMatrikkel",
        "t": "Når eiendomsidentifikasjon [{0}-{1}/{2}/{3}/{4}] er oppgitt for eiendom som inngår i planområdet, bør den være gyldig i matrikkelen. Du kan sjekke riktig informasjon på https://eiendomsregisteret.kartverket.no/",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon"
      }
    ]
  },
  {
    "g": "FristForUttalelse",
    "rules": [
      {
        "p": "FristForUttalelse.Utfylt",
        "t": "Fristen for uttalelse må fylles ut.",
        "r": "Feil",
        "b": "fristForUttalelse",
        "k": "10. juni 2026 MHL OK"
      },
      {
        "p": "FristForUttalelseHOFFE.Gyldig",
        "t": "Uttalelsesfristen må være minst seks uker frem i tid fra dagens dato.",
        "r": "Feil",
        "b": "fristForUttalelse",
        "f": "hoeringstype/kodeverdi = HOFFE",
        "k": "HOFFE - Høring og offentlig ettersyn - Full høring av planforslag etter pbl. §5-2 / §11-14 / §12-10. Min. 6 uker 10. juni 2026 MHL Gjelder ikke for forelegging eller begrenset høring (mer valgfritt) Bør legge inn forutsetning for høringstype 16. juni 2026 ML\nHar lagt in precondition, og logikk, regelen slår ut hvis høringstype er HOFFE 22. juni 2026 MHL Det er tre ulike prosesstyper. Det må justeres til de tre prosessene i HOFFE. Forutsetning prosessregel: Begrenset høring - ny plan 2.Høring og offentlig ettersyn - endring av plan 3.Høring og offentlig ettersyn - oppheving av plan Må sikres 6 uker for Høring og offentlig ettersyn - endring av plan og oppheving av plan. Begrenset høring er valgfri og må ha annen frist. Enten lage ny valideringsregel for det eller forutsetning i denne regelen. 25. juni 2026 MHL, MA HOFFE - Høring og offentlig ettersyn - Full høring av planforslag etter pbl. §5-2 / §11-14 / §12-10. Min. 6 uker Mindre enn seks uker, må det være feil"
      },
      {
        "p": "FristForUttalelseBEGR.Gyldig",
        "t": "Uttalelsesfristen må være minst to uker frem i tid fra dagens dato.",
        "r": "Advarsel",
        "b": "fristForUttalelse",
        "f": "hoeringstype/kodeverdi = BEGR",
        "k": "25. juni 2026 MHL og MA\nBegrenset høring - Kun mot direkte berørte ved endring i bearbeidingsfasen. Typisk 2-4 uker. Kan være feil om den er kortere enn 2 uker. 26. juni 2026 ML\nSetter til advarsel som avtalt i møte 26.06"
      },
      {
        "p": "FristForUttalelseFORE.Gyldig",
        "t": "Uttalelsesfristen må være minst to uker frem i tid fra dagens dato.",
        "r": "Advarsel",
        "b": "fristForUttalelse",
        "f": "hoeringstype/kodeverdi = FORE",
        "k": "25. juni 2026 MHL, MA Forelegging - Ved endrings- eller opphevingsforslag for berørte parter og myndigheter etter forenklet behandling (pbl § 12-14 andre ledd). Erstatter høring i den forenklende prosessen. Kan være feil om den er kortere enn 2 uker. 26. juni 2026 ML\nSetter til advarsel som avtalt i møte 26.06"
      }
    ]
  },
  {
    "g": "EksisterendePlanerSomBeroeres",
    "rules": [
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.BeskrivelseAvFoelger.Utfylt",
        "t": "Beskrivelse av hvilken del av gjeldende arealplan som berøres bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/beskrivelseAvFoelger",
        "k": "10. juni 2026 MHL Må lages forutsetning: Om det finnes gjeldende arealplan. Slår ikke ut om området er uregulert som det kan være."
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.Utfylt",
        "t": "Nasjonal arealplan-ID for gjeldende arealplan bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/nasjonalArealplanId",
        "k": "10. juni 2026 MHL OK"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.Kommunenummer.Utfylt",
        "t": "Kommunenummer for gjeldende arealplans nasjonale arealplan-ID bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/nasjonalArealplanId/kommunenummer",
        "k": "10. juni 2026 MHL OK"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.PlanId.Utfylt",
        "t": "Plan-ID for gjeldende arealplan bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/nasjonalArealplanId/planId",
        "k": "10. juni 2026 MHL OK"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Navn.Utfylt",
        "t": "Navnet på gjeldende arealplan bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/navn",
        "k": "8. juni 2026 MHL OK"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Utfylt",
        "t": "Plantypen til gjeldende arealplan bør fylles ut. Du kan sjekke gyldige plantyper på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype",
        "k": "10. juni 2026 MHL Endre url til kodelisten til den gyldige. Kodelisten må være offentlig på DiBK nettside med korrekt kodeliste før HOFFE er i PROD. Lenke settes i disse valideringsreglene. https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'plantype' til gjeldende arealplan bør fylles ut. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodeverdi",
        "k": "Endre url til kodelisten til den gyldige."
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' for gjeldende arealplan ble ikke validert. En teknisk feil gjør at vi ikke kan validere informasjon for plantype. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodeverdi",
        "k": "Endre url til kodelisten til den gyldige."
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for plantype til gjeldende arealplan. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodeverdi",
        "k": "Endre url til kodelisten til den gyldige."
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.Tillatt",
        "t": "'{0}' er ikke en tillatt plantype. Tillatte plantyper er 30, 32, 33, 34 og 35.",
        "r": "Feil",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodeverdi",
        "f": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres/plantype/kodeverdi == 20, 21, 22, 31, 36",
        "k": "10. juni 2026 MHL Ny regel om å ikke oppgi kommuneplan og kommuneplanens arealdel 20, 21, 22, 31. Plantype 36 også? @Marie Hatteberg Leivestad er teksten ok? skal alle reglene i bolken her være advarsel? 22. juni 2026 MHL Må settes til feil ved utgåtte plantyper så det ikke er mulig. Endre url til kodelisten til den gyldige."
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodebeskrivelse.Utfylt",
        "t": "Når plantype er valgt for gjeldende arealplan, bør kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodebeskrivelse",
        "k": "Endre url til kodelisten til den gyldige."
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for plantype til gjeldende arealplan. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodebeskrivelse",
        "k": "Endre url til kodelisten til den gyldige."
      }
    ]
  },
  {
    "g": "HjemmesidePlanforslag",
    "rules": [
      {
        "p": "HjemmesidePlanforslag.Utfylt",
        "t": "Du bør legge med en lenke til nettsiden der planforslaget er publisert.",
        "r": "Advarsel",
        "b": "hjemmesidePlanforslag",
        "k": "10. juni 2026 MHL OK"
      }
    ]
  },
  {
    "g": "Hoeringstype",
    "rules": [
      {
        "p": "Hoeringstype.Utfylt",
        "t": "Høringstypen for planen må fylles ut.",
        "r": "Feil",
        "b": "hoeringstype",
        "k": "10. juni 2026 MHL OK"
      },
      {
        "p": "Hoeringstype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for høringstype må fylles ut. Du kan sjekke riktig kodeverdi på LINK HER NÅR DET KOMMER",
        "r": "Feil",
        "b": "hoeringstype/kodeverdi",
        "k": "10. juni 2026 MHL OK"
      },
      {
        "p": "Hoeringstype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Høringstype kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "hoeringstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Hoeringstype.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for høringstype. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/h%C3%B8ringstype",
        "r": "Feil",
        "b": "hoeringstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Hoeringstype.Kodebeskrivelse.Utfylt",
        "t": "Når høringstype er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/h%C3%B8ringstype",
        "r": "Feil",
        "b": "hoeringstype/kodebeskrivelse",
        "k": "OK"
      },
      {
        "p": "Hoeringstype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for høringstype. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/h%C3%B8ringstype",
        "r": "Advarsel",
        "b": "hoeringstype/kodebeskrivelse",
        "k": "OK"
      }
    ]
  },
  {
    "g": "Kommune",
    "rules": [
      {
        "p": "Kommune.Utfylt",
        "t": "Du må fylle ut informasjon om kommunen.",
        "r": "Feil",
        "b": "kommune",
        "k": "10. juni 2026 MHL Synk med kommunen som avsender. Er det nødvendig når kommunen alltid er avsender? Sjelden gang plankonsulent på vegne av"
      },
      {
        "p": "Kommune.Adresse.Utfylt",
        "t": "Adresse bør fylles ut for kommunen",
        "r": "Advarsel",
        "b": "kommune/adresse",
        "k": "OK"
      },
      {
        "p": "Kommune.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 bør fylles ut for kommune",
        "r": "Advarsel",
        "b": "kommune/adresse/adresselinje1",
        "k": "OK"
      },
      {
        "p": "Kommune.Adresse.Landkode.Gyldig",
        "t": "Landkoden '{0}' for kommunens adresse, er ikke gyldig.",
        "r": "Advarsel",
        "b": "kommune/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "Kommune.Adresse.Landkode.Norsk",
        "t": "Landkoden til kommunens adresse må være norsk.",
        "r": "Advarsel",
        "b": "kommune/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "Kommune.Adresse.Postnr.Utfylt",
        "t": "Du bør fylle ut postnummeret til kommunen.",
        "r": "Advarsel",
        "b": "kommune/adresse/postnr",
        "k": "OK"
      },
      {
        "p": "Kommune.Adresse.Postnr.KodelisteFinnes",
        "t": "Postnummeret '{0}' til kommunen ble ikke validert. Postnummeret kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "kommune/adresse/postnr",
        "k": "OK"
      },
      {
        "p": "Kommune.Adresse.Postnr.Gyldig",
        "t": "Postnummeret '{0}' for kommunen er ugyldig. Du kan sjekke riktig postnummer på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "kommune/adresse/postnr",
        "k": "OK"
      },
      {
        "p": "Kommune.Adresse.Postnr.Poststed.Gyldig",
        "t": "Postnummeret '{0}' for kommunen stemmer ikke overens med poststedet '{1}'. Postnummeret er fra '{2}'. Du kan sjekke riktig postnummer/poststed på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "kommune/adresse/postnr",
        "f": "kommune/adresse/poststed",
        "k": "OK"
      },
      {
        "p": "Kommune.Epost.Utfylt",
        "t": "E-postadressen til kommunen bør fylles ut.",
        "r": "Advarsel",
        "b": "kommune/epost",
        "k": "OK"
      },
      {
        "p": "Kommune.Epost.Gyldig",
        "t": "E-postadresse '{0}' for kommune er ikke gyldig. Gyldig e-post skrives som navn@domene.no",
        "r": "Feil",
        "b": "kommune/epost"
      },
      {
        "p": "Kommune.Kontaktperson.Utfylt",
        "t": "Kontaktperson for kommunen bør fylles ut.",
        "r": "Advarsel",
        "b": "kommune/kontaktperson",
        "k": "OK"
      },
      {
        "p": "Kommune.Kontaktperson.Epost.Utfylt",
        "t": "E-postadressen til kommunens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "kommune/kontaktperson/epost",
        "k": "OK"
      },
      {
        "p": "Kommune.Kontaktperson.Epost.Gyldig",
        "t": "E-postadresse '{0}' for kommunens kontaktperson er ikke gyldig. Gyldig e-post skrives som navn@domene.no",
        "r": "Feil",
        "b": "kommune/kontaktperson/epost",
        "k": "OK"
      },
      {
        "p": "Kommune.Kontaktperson.Navn.Utfylt",
        "t": "Navnet til kontaktpersonen for kommunen må fylles ut.",
        "r": "Feil",
        "b": "kommune/kontaktperson/navn",
        "k": "OK"
      },
      {
        "p": "Kommune.Kontaktperson.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til kommunens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "kommune/kontaktperson/telefonnummer",
        "k": "OK"
      },
      {
        "p": "Kommune.Kontaktperson.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til kommunens kontaktperson må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "kommune/kontaktperson/telefonnummer",
        "k": "OK"
      },
      {
        "p": "Kommune.Mobilnummer.Utfylt",
        "t": "Mobilnummeret til kommunen bør fylles ut.",
        "r": "Advarsel",
        "b": "kommune/mobilnummer",
        "k": "OK"
      },
      {
        "p": "Kommune.Mobilnummer.Gyldig",
        "t": "Mobilnummeret til kommunen må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "kommune/mobilnummer",
        "k": "OK"
      },
      {
        "p": "Kommune.Navn.Utfylt",
        "t": "Navnet til kommunen må fylles ut.",
        "r": "Feil",
        "b": "kommune/navn",
        "k": "OK"
      },
      {
        "p": "Kommune.Organisasjonsnummer.Utfylt",
        "t": "Organisasjonsnummeret til kommunen må fylles ut.",
        "r": "Feil",
        "b": "kommune/organisasjonsnummer",
        "k": "OK"
      },
      {
        "p": "Kommune.Organisasjonsnummer.Gyldig",
        "t": "Organisasjonsnummeret '{0}' for kommunen er ikke gyldig.",
        "r": "Feil",
        "b": "kommune/organisasjonsnummer",
        "k": "OK"
      },
      {
        "p": "Kommune.Organisasjonsnummer.Kontrollsiffer",
        "t": "Organisasjonsnummeret til kommunen må ha gyldig kontrollsiffer.",
        "r": "Feil",
        "b": "kommune/organisasjonsnummer",
        "k": "OK"
      },
      {
        "p": "Kommune.Partstype.Utfylt",
        "t": "Du må oppgi partstypen for kommunen. Du kan sjekke gyldige partstyper på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "kommune/partstype",
        "k": "OK"
      },
      {
        "p": "Kommune.Partstype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'partstype' til kommunen må fylles ut. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "kommune/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Kommune.Partstype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Partstypen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "kommune/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Kommune.Partstype.Kodeverdi.Gyldig",
        "t": "Ugyldig kodeverdi '{0}' i henhold til kodeliste for 'partstype' for kommune. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "kommune/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Kommune.Partstype.Kodeverdi.Tillatt",
        "t": "Kodeverdien '{0}' er ikke tillatt for kommunen. Tillatt kodeverdi er 'OffentligMyndighet'.",
        "r": "Feil",
        "b": "kommune/partstype/kodeverdi"
      },
      {
        "p": "Kommune.Partstype.Kodebeskrivelse.Utfylt",
        "t": "Når partstype er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "kommune/partstype/kodebeskrivelse",
        "k": "OK"
      },
      {
        "p": "Kommune.Partstype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for partstype. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Advarsel",
        "b": "kommune/partstype/kodebeskrivelse",
        "k": "OK"
      },
      {
        "p": "Kommune.Plankonsulent.Kontaktperson.Utfylt",
        "t": "Kontaktperson må være med for enten kommune eller plankonsulent.",
        "r": "Feil",
        "b": "kommune/kontaktperson",
        "f": "plankonsulent/kontaktperson = null & kommune/kontaktperson = null",
        "k": "OK"
      },
      {
        "p": "Kommune.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til kommunen bør fylles ut.",
        "r": "Advarsel",
        "b": "kommune/telefonnummer",
        "k": "OK"
      },
      {
        "p": "Kommune.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til kommunen må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "kommune/telefonnummer",
        "k": "OK"
      }
    ]
  },
  {
    "g": "KommunensSaksnummer",
    "std": true,
    "rules": [
      {
        "p": "KommunensSaksnummer.Utfylt",
        "t": "Du bør oppgi kommunens saksnummer.",
        "r": "Advarsel",
        "b": "kommunensSaksnummer",
        "k": "OK"
      },
      {
        "p": "KommunensSaksnummer.Saksaar.Utfylt",
        "t": "Du må oppgi kommunens saksnummer med saksår.",
        "r": "Feil",
        "b": "kommunensSaksnummer/saksaar",
        "f": "kommunensSaksnummer/sakssekvensnummer",
        "k": "OK"
      },
      {
        "p": "KommunensSaksnummer.Saksaar.Gyldig",
        "t": "Saksår ({0}) for kommunens saksnummer er ikke gyldig. Saksåret må inneholde fire siffer.",
        "r": "Feil",
        "b": "kommunensSaksnummer/saksaar",
        "k": "OK"
      },
      {
        "p": "KommunensSaksnummer.Sakssekvensnummer.Utfylt",
        "t": "Du må oppgi kommunens saksnummer med sekvensnummer.",
        "r": "Feil",
        "b": "kommunensSaksnummer/sakssekvensnummer",
        "f": "kommunensSaksnummer/saksaar",
        "k": "OK"
      }
    ]
  },
  {
    "g": "Metadata",
    "std": true,
    "rules": [
      {
        "p": "Metadata.Utfylt",
        "t": "Søknadens metadata må fylles ut.",
        "r": "Feil",
        "b": "metadata",
        "k": "22. juni 2026 MHL Saksbehandlingssystem. Kanskje ikke relevant med disse valideringsreglene?"
      },
      {
        "p": "Metadata.ForetrukketSpraak.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for målform. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/kodelister/byggesoknad/foretrukketspraak",
        "r": "Advarsel",
        "b": "metadata/foretrukketSpraak/kodeverdi"
      },
      {
        "p": "Metadata.ForetrukketSpraak.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Målformen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "metadata/foretrukketSpraak"
      },
      {
        "p": "Metadata.ForetrukketSpraak.Kodebeskrivelse.Utfylt",
        "t": "Når målform er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/kodelister/byggesoknad/foretrukketspraak",
        "r": "Feil",
        "b": "metadata/foretrukketSpraak/kodebeskrivelse",
        "f": "metadata/foretrukketSpraak/kodeverdi"
      },
      {
        "p": "Metadata.ForetrukketSpraak.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for målformen. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/kodelister/byggesoknad/foretrukketspraak",
        "r": "Advarsel",
        "b": "metadata/foretrukketSpraak/kodebeskrivelse"
      },
      {
        "p": "Metadata.FraSluttbrukersystem.Utfylt",
        "t": "Systemet må fylle ut samme navn som er brukt i registrering for Altinn API i 'fraSluttbrukersystem'.",
        "r": "Feil",
        "b": "metadata/fraSluttbrukersystem"
      },
      {
        "p": "Metadata.FtbId.Utfylt",
        "t": "FTB-ID i metadata bør fylles ut.",
        "r": "Advarsel",
        "b": "metadata/ftbId"
      },
      {
        "p": "Metadata.Prosjektnavn.Utfylt",
        "t": "Hvis det er et prosjektnavn på byggesøknaden, bør du oppgi dette.",
        "r": "Advarsel",
        "b": "metadata/prosjektnavn",
        "k": "3. juni 2026 ML\nMå endre tekst til f.eks:\n”Hvis det er et prosjektnavn på plansøknaden, bør du oppgi dette.”"
      },
      {
        "p": "Metadata.Prosjektnr.Utfylt",
        "t": "Hvis det er et prosjektnummer på byggesøknaden, bør du oppgi dette.",
        "r": "Advarsel",
        "b": "metadata/prosjektnr",
        "k": "3. juni 2026 ML\nMå endre teksten til f.eks:\n”Hvis det er et prosjektnummer på plansøknaden, bør du oppgi dette.”"
      }
    ]
  },
  {
    "g": "Planforslag",
    "std": true,
    "rules": [
      {
        "p": "Planforslag.Utfylt",
        "t": "Du må fylle ut feltet planforslag.",
        "r": "Feil",
        "b": "planforslag",
        "k": "OK"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.Utfylt",
        "t": "Du må fylle ut nasjonal arealplan-ID for planforslaget.",
        "r": "Feil",
        "b": "planforslag/nasjonalArealplanId",
        "k": "OK"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.Kommunenummer.Utfylt",
        "t": "Du må fylle ut kommunenummer for planforslagets nasjonale arealplan-ID.",
        "r": "Feil",
        "b": "planforslag/nasjonalArealplanId/kommunenummer",
        "k": "OK"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.Kommunenummer.KodelisteFinnes",
        "t": "En teknisk feil gjør at vi ikke kan bekrefte om kommunenummeret '{0}' for planforslaget er riktig. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Advarsel",
        "b": "planforslag/nasjonalArealplanId/kommunenummer",
        "k": "OK"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.Kommunenummer.Gyldig",
        "t": "Kommunenummeret '{0}' for planforslaget finnes ikke i kodelisten. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Feil",
        "b": "planforslag/nasjonalArealplanId/kommunenummer",
        "k": "OK"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.PlanId.Utfylt",
        "t": "Du må fylle ut plan-ID for planforslaget.",
        "r": "Feil",
        "b": "planforslag/nasjonalArealplanId/planId",
        "k": "OK"
      },
      {
        "p": "Planforslag.Plannavn.Utfylt",
        "t": "Du må fylle ut navnet på planforslaget.",
        "r": "Feil",
        "b": "planforslag/plannavn",
        "k": "OK"
      },
      {
        "p": "Planforslag.Plantype.Utfylt",
        "t": "Du må oppgi en plantype for planforslaget. Du kan sjekke gyldige plantyper på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Feil",
        "b": "planforslag/plantype",
        "k": "Må hensynta status i kodelisten 34, 35 er de gyldige Endre url til kodelisten til den gyldige"
      },
      {
        "p": "Planforslag.Plantype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'plantype' til planforslaget må fylles ut. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Feil",
        "b": "planforslag/plantype/kodeverdi",
        "k": "OK Endre url til kodelisten til den gyldige."
      },
      {
        "p": "Planforslag.Plantype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. En teknisk feil gjør at vi ikke kan validere informasjon for plantype. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Advarsel",
        "b": "planforslag/plantype/kodeverdi",
        "k": "Endre url til kodelisten til den gyldige. OK"
      },
      {
        "p": "Planforslag.Plantype.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for plantype. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Feil",
        "b": "planforslag/plantype/kodeverdi",
        "k": "Endre url til kodelisten til den gyldige. OK"
      },
      {
        "p": "Planforslag.Plantype.Kodeverdi.Tillatt",
        "t": "'{0}' er ikke en tillatt plantype for planforslaget. Tillatte plantyper er 34 og 35.",
        "r": "Feil",
        "b": "planforslag/plantype/kodeverdi",
        "f": "planforslag/plantype/kodeverdi != 34, 35"
      },
      {
        "p": "Planforslag.Plantype.Kodebeskrivelse.Utfylt",
        "t": "Når plantype for planforslaget er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Feil",
        "b": "planforslag/plantype/kodebeskrivelse",
        "k": "Endre url til kodelisten til den gyldige. OK"
      },
      {
        "p": "Planforslag.Plantype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for plantype. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/plantype",
        "r": "Advarsel",
        "b": "planforslag/plantype/kodebeskrivelse",
        "k": "Endre url til kodelisten til den gyldige. OK"
      }
    ]
  },
  {
    "g": "Planhensikt",
    "rules": [
      {
        "p": "Planhensikt.Utfylt",
        "t": "Du må beskrive hva som er hensikten med planen.",
        "r": "Feil",
        "b": "planhensikt",
        "k": "OK"
      }
    ]
  },
  {
    "g": "Forslagsstiller",
    "rules": [
      {
        "p": "Forslagsstiller.Utfylt",
        "t": "Oppgi forslagstiller.",
        "r": "Feil",
        "b": "forslagstiller",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Partstype.Utfylt",
        "t": "Du må oppgi partstypen for forslagsstiller. Du kan sjekke gyldige partstyper på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "forslagstiller/partstype",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'partstype' til forslagsstiller må fylles ut. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "forslagstiller/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Partstypen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "forslagstiller/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodeverdi.Gyldig",
        "t": "Ugyldig kodeverdi for partstypen til forslagsstiller. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "forslagstiller/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodebeskrivelse.Utfylt",
        "t": "Når partstype er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "forslagstiller/partstype/kodebeskrivelse",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for partstype. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Advarsel",
        "b": "forslagstiller/partstype/kodebeskrivelse",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Utfylt",
        "t": "Fødselsnummer må fylles ut når forslagsstiller er en privatperson.",
        "r": "Feil",
        "b": "forslagstiller/foedselsnummer",
        "f": "forslagstiller/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Kryptert",
        "t": "Fødselsnummeret til forslagsstiller må være kryptert.",
        "r": "Feil",
        "b": "forslagstiller/foedselsnummer",
        "f": "forslagstiller/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Dekryptert",
        "t": "Fødselsnummeret til forslagsstiller kan ikke dekrypteres",
        "r": "Feil",
        "b": "forslagstiller/foedselsnummer",
        "f": "forslagstiller/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Gyldig",
        "t": "Fødselsnummeret til forslagsstiller er ikke gyldig",
        "r": "Feil",
        "b": "forslagstiller/foedselsnummer",
        "f": "forslagstiller/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Kontrollsiffer",
        "t": "Fødselsnummeret til forslagsstiller har ikke gyldig kontrollsiffer.",
        "r": "Feil",
        "b": "forslagstiller/foedselsnummer",
        "f": "forslagstiller/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Organisasjonsnummer.Utfylt",
        "t": "Organisasjonsnummer må fylles ut når forslagsstiller er en organisasjon.",
        "r": "Feil",
        "b": "forslagstiller/organisasjonsnummer",
        "f": "forslagstiller/partstype/kodeverdi = ikke privatperson",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Organisasjonsnummer.Gyldig",
        "t": "Organisasjonsnummeret ('{0}') for forslagsstiller er ikke gyldig.",
        "r": "Feil",
        "b": "forslagstiller/organisasjonsnummer",
        "f": "forslagstiller/partstype/kodeverdi = ikke privatperson",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Organisasjonsnummer.Kontrollsiffer",
        "t": "Organisasjonsnummeret ('{0}') for forslagsstiller har ikke gyldig kontrollsiffer.",
        "r": "Feil",
        "b": "forslagstiller/organisasjonsnummer",
        "f": "forslagstiller/partstype/kodeverdi = ikke privatperson",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Adresse.Utfylt",
        "t": "Du bør fylle ut adressen til forslagsstiller.",
        "r": "Advarsel",
        "b": "forslagstiller/adresse",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 bør fylles ut for forslagsstiller.",
        "r": "Advarsel",
        "b": "forslagstiller/adresse/adresselinje1",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Adresse.Landkode.Gyldig",
        "t": "Landkoden '{0}' for forslagsstillers adresse, er ikke gyldig.",
        "r": "Advarsel",
        "b": "forslagstiller/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Adresse.Landkode.Norsk",
        "t": "Landkoden til forslagsstillers adresse må være norsk.",
        "r": "Advarsel",
        "b": "forslagstiller/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Adresse.Postnr.Utfylt",
        "t": "Du bør fylle ut postnummeret til forslagsstillers adresse.",
        "r": "Advarsel",
        "b": "forslagstiller/adresse/postnr",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Adresse.Postnr.Kodelistefinnes",
        "t": "Postnummeret '{0}' til forslagsstiller ble ikke validert. Postnummeret kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "forslagstiller/adresse/postnr",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Adresse.Postnr.Gyldig",
        "t": "Postnummeret '{0}' for forslagsstiller er ugyldig. Du kan sjekke riktig postnummer på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "forslagstiller/adresse/postnr",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Adresse.Postnr.Poststed.Gyldig",
        "t": "Postnummeret '{0}' for forslagsstiller stemmer ikke overens med poststedet '{1}'. Postnummeret er fra '{2}'. Du kan sjekke riktig postnummer/poststed på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "forslagstiller/adresse/postnr",
        "f": "forslagsstiller/adresse/poststed",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Navn.Utfylt",
        "t": "Navnet til forslagsstiller må fylles ut.",
        "r": "Feil",
        "b": "forslagstiller/navn",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til forslagsstiller bør fylles ut.",
        "r": "Advarsel",
        "b": "forslagstiller/telefonnummer",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til forslagsstiller må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "forslagstiller/telefonnummer",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Mobilnummer.Utfylt",
        "t": "Mobilnummeret til forslagsstiller bør fylles ut.",
        "r": "Advarsel",
        "b": "forslagstiller/mobilnummer",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Mobilnummer.Gyldig",
        "t": "Mobilnummeret til forslagsstiller må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "forslagstiller/mobilnummer",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Epost.Utfylt",
        "t": "E-postadressen til forslagsstiller bør fylles ut.",
        "r": "Advarsel",
        "b": "forslagstiller/epost",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Epost.Gyldig",
        "t": "E-postadressen for forslagsstiller er ikke gyldig. Gyldig e-post skrives som navn@domene.no.",
        "r": "Feil",
        "b": "forslagstiller/epost",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Utfylt",
        "t": "Kontaktperson for forslagsstiller bør fylles ut.",
        "r": "Advarsel",
        "b": "forslagstiller/kontaktperson",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Navn.Utfylt",
        "t": "Navnet til kontaktpersonen for forslagsstilleren må fylles ut.",
        "r": "Feil",
        "b": "forslagstiller/kontaktperson/navn",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Epost.Utfylt",
        "t": "E-postadressen til forslagsstillerens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "forslagstiller/kontaktperson/epost",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Epost.Gyldig",
        "t": "E-postadresse '{0}' for forslagsstillerens kontaktperson er ikke gyldig. Gyldig e-post skrives som navn@domene.no",
        "r": "Feil",
        "b": "forslagstiller/kontaktperson/epost",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til forslagsstillerens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "forslagstiller/kontaktperson/telefonnummer",
        "k": "OK"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til forslagsstillerens kontaktperson må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "forslagstiller/kontaktperson/telefonnummer",
        "k": "OK"
      }
    ]
  },
  {
    "g": "Planprosessregel",
    "rules": [
      {
        "p": "Planprosessregel.Utfylt",
        "t": "Planprosessregelen må fylles ut.",
        "r": "Feil",
        "b": "planprosessregel",
        "k": "22. juni 2026 MHL DIBK NAP REFERANSE. endringsobjekt? Spør TK Forutsetning: Ny-rp endr-rp endr-f-rp oph-rp opph-f-rp"
      },
      {
        "p": "Planprosessregel.Kodeverdi.Utfylt",
        "t": "Kodeverdien for planprosessregel må fylles ut. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/planprosessregel",
        "r": "Feil",
        "b": "planprosessregel/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Planprosessregel.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Planprosessregelen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "planprosessregel/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Planprosessregel.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for planprosessregel. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/planprosessregel",
        "r": "Feil",
        "b": "planprosessregel/kodeverdi",
        "k": "OK"
      },
      {
        "p": "Planprosessregel.Kodeverdi.Tillatt",
        "t": "'{0}' er ikke en tillatt kodeverdi for planprosessregel. Tillatte kodeverdier er NY-RP, ENDR-RP, ENDR-F-RP, OPPH-RP og OPPH-F-RP.",
        "r": "Feil",
        "b": "planprosessregel/kodeverdi",
        "f": "planprosessregel/kodeverdi != NY-RP, ENDR-RP, ENDR-F-RP, OPPH-RP, OPPH-F-RP"
      },
      {
        "p": "Planprosessregel.Kodebeskrivelse.Utfylt",
        "t": "Når planprosessregel er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/planprosessregel",
        "r": "Feil",
        "b": "planprosessregel/kodebeskrivelse",
        "k": "OK"
      },
      {
        "p": "Planprosessregel.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for planprosessregel. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/planprosessregel",
        "r": "Advarsel",
        "b": "planprosessregel/kodebeskrivelse",
        "k": "OK"
      }
    ]
  },
  {
    "g": "TilgjengelighetEksemplar",
    "rules": [
      {
        "p": "TilgjengelighetEksemplar.Utfylt",
        "t": "Du bør svare på hvor det finnes tilgjengelige eksemplarer.",
        "r": "Advarsel",
        "b": "tilgjengelighetEksemplar",
        "k": "OK"
      }
    ]
  },
  {
    "g": "MottakerListe",
    "rules": [
      {
        "p": "MottakerListe.Utfylt",
        "t": "Du må legge til minst én berørt part, interessent eller myndighet.",
        "r": "Feil",
        "b": "mottakerListe",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Utfylt",
        "t": "Du må fylle ut informasjon om den berørte parten, interessenten eller myndigheten.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Utfylt",
        "t": "Adresse bør fylles ut for den berørte parten, interessenten eller myndigheten.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 bør fylles ut for den berørte parten, interessenten eller myndigheten.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/adresselinje1",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.Utfylt",
        "t": "Landkoden til berørt parts, interessentens eller myndighetens adresse bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.KodelisteFinnes",
        "t": "Landkoden til berørt parts, interessentens eller myndighets adresse kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.Gyldig",
        "t": "Landkoden for berørt parts, interessentens eller myndighetens adresse er ikke gyldig.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.Norsk",
        "t": "Landkoden til berørt parts, interessentens eller myndighetens adresse må være norsk.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Epost.Utfylt",
        "t": "E-postadressen til den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/epost",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Epost.Gyldig",
        "t": "E-postadressen '{0}' til den berørte parten, interessenten eller myndigheten er ikke gyldig.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/epost",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Utfylt",
        "t": "Fødselsnummer må angis når berørt part, interessent eller myndighet er privatperson.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Gyldig",
        "t": "Fødselsnummeret til berørt part, interessent eller myndighet må være gyldig",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Dekryptert",
        "t": "Fødselsnummeret til den berørte parten, interessenten eller myndigheten kan ikke dekrypteres.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Kontrollsiffer",
        "t": "Berørt parts, interessentens eller myndighetens fødselsnummer må ha gyldig kontrollsiffer",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Kryptert",
        "t": "Fødselsnummeret til den berørte parten, interessenten eller myndigheten må være kryptert.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Utfylt",
        "t": "Adresse bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/adresselinje1",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Gatenavn.Utfylt",
        "t": "Gatenavn bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/gatenavn",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Husnr.Utfylt",
        "t": "Husnummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/husnr",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.Utfylt",
        "t": "Landkoden til adressen for eiendommen den berørte parten, interessenten eller myndigheten gjelder bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.KodelisteFinnes",
        "t": "Landkoden til adressen for eiendommen den berørte parten, interessenten eller myndigheten gjelder kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.Gyldig",
        "t": "Landkoden for adressen til eiendommen den berørte parten, interessenten eller myndigheten gjelder er ikke gyldig.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.Norsk",
        "t": "Landkoden til adressen for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være norsk.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/landkode",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.Utfylt",
        "t": "Postnummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/postnr",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.KodelisteFinnes",
        "t": "Postnummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder ble ikke validert. Postnummeret kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/postnr",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.Gyldig",
        "t": "Postnummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder er ugyldig. Du kan sjekke riktig postnummer på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/postnr",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.Poststed.Gyldig",
        "t": "Postnummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder stemmer ikke overens med poststedet '{1}'. Postnummeret er fra '{2}'. Du kan sjekke riktig postnummer/poststed på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/postnr",
        "f": "mottakerListe/beroertpartOgInteressentOgMyndighet/gjelderEiendommer/gjeldereiendom/adresse/poststed",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Bolignummer.Gyldig",
        "t": "Når bruksenhetsnummer/bolignummer er fylt ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder, må det følge riktig format (for eksempel H0101). Se https://www.kartverket.no/eiendom/adressering/bruksenhetsnummer/",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/bolignummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Bygningsnummer.Numerisk",
        "t": "Bygningsnummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være et tall.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/bygningsnummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Bruksnummer.Utfylt",
        "t": "Bruksnummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/bruksnummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Bruksnummer.Gyldig",
        "t": "Bruksnummer for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være '0' eller større.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/bruksnummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Festenummer.Gyldig",
        "t": "Festenummer for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være '0' eller større.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/festenummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Gaardsnummer.Utfylt",
        "t": "Gårdsnummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/gaardsnummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Gaardsnummer.Gyldig",
        "t": "Gårdsnummer for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være '0' eller større.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/gaardsnummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Kommunenummer.Utfylt",
        "t": "Kommunenummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/kommunenummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Kommunenummer.KodelisteFinnes",
        "t": "Kommunenummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder ble ikke validert. En teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/kommunenummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Kommunenummer.Gyldig",
        "t": "Kommunenummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder finnes ikke i kodelisten. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/kommunenummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Seksjonsnummer.Gyldig",
        "t": "Seksjonsnummer for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være '0' eller større.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/seksjonsnummer",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Kommunenavn.Utfylt",
        "t": "Navnet på kommunen bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/kommunenavn",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Navn.Utfylt",
        "t": "Navnet på den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/navn",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Organisasjonsnummer.Utfylt",
        "t": "Organisasjonsnummeret til den berørte parten, interessenten eller myndigheten må fylles ut.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/organisasjonsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = ikke privatperson",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Organisasjonsnummer.Gyldig",
        "t": "Organisasjonsnummeret ('{0}') for den berørte parten, interessenten eller myndigheten er ikke gyldig.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/organisasjonsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = ikke privatperson",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Organisasjonsnummer.Kontrollsiffer",
        "t": "Organisasjonsnummeret ('{0}') for den berørte parten, interessenten eller myndigheten har ikke gyldig kontrollsiffer.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/organisasjonsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = ikke privatperson",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Utfylt",
        "t": "Du må oppgi partstypen for den berørte parten, interessenten eller myndigheten. Du kan sjekke gyldige partstyper på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'partstype' til den berørte parten, interessenten eller myndigheten må fylles ut. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Partstypen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for partstype. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodebeskrivelse.Utfylt",
        "t": "Når partstype er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodebeskrivelse",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for partstype. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodebeskrivelse",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Utfylt",
        "t": "Rollen til den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/rolle",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'rolle' til den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/rolle/kodeverdi",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Rollen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/rolle/kodeverdi",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for rolle. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/roller",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/rolle/kodeverdi",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodebeskrivelse.Utfylt",
        "t": "Når rolle er valgt for den berørte parten, interessenten eller myndigheten, bør kodebeskrivelse fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/rolle/kodebeskrivelse",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for rolle. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/roller",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/rolle/kodebeskrivelse",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Telefon.Utfylt",
        "t": "Telefonnummeret til den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/telefon",
        "k": "OK"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Telefon.Gyldig",
        "t": "Telefonnummeret til den berørte parten, interessenten eller myndigheten må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/telefon",
        "k": "OK"
      }
    ]
  },
  {
    "g": "Vedlegg",
    "std": true,
    "rules": [
      {
        "p": "Vedlegg.Planbeskrivelse",
        "t": "Du bør sende med vedlegget 'Planbeskrivelse'. Hvis konsekvensutredningen er inkludert i planbeskrivelsen, må du sende med vedlegget.",
        "r": "Feil",
        "b": "vedlegg/",
        "k": "OK"
      },
      {
        "p": "Vedlegg.PlanbestemmelserPdf",
        "t": "Du bør sende med vedlegget 'Planbestemmelser' i lesbart format. Filnavnet skal skrives slik: planbestemmelse-{planidentifikasjon}-{versjon}.pdf/docx",
        "r": "Feil",
        "b": "vedlegg/",
        "k": "OK"
      },
      {
        "p": "Vedlegg.PlanbestemmelserXml",
        "t": "Du bør sende med vedlegget 'Planbestemmelser' i XML-format Filnavnet skal skrives slik: planbestemmelse-{planidentifikasjon}-{versjon}.xml",
        "r": "Feil",
        "b": "vedlegg/",
        "k": "OK"
      },
      {
        "p": "Vedlegg.Plankart2DGml",
        "t": "Du må sende med vedlegget 'Plankart' i 2D. Plankartet skal være i GML eller SOSI-format. Filnavnet skal skrives slik: plankart2d-{planidentifikasjon}-{versjon}-{vertikalnivå}-{vertikallag}.gml/.sos",
        "r": "Feil",
        "b": "vedlegg/",
        "f": "(hoeringstype/kodeverdi == BEGR && planprosessregel/kodeverdi == NY-RP) || (hoeringstype/kodeverdi == HOFFE && planprosessregel/kodeverdi == ENDR-RP) || (hoeringstype/kodeverdi == HOFFE && planprosessregel/kodeverdi == OPPH-RP)",
        "k": "22. juni 2026 MHL Forutsetning prosessregel: 1. Begrenset høring - ny plan 2.Høring og offentlig ettersyn - endring av plan 3.Høring og offentlig ettersyn - oppheving av plan Kan dere lage forutsetningen og plassere i feltet “forutsetning”?"
      },
      {
        "p": "Vedlegg.PlankartTXT",
        "t": "Hvis du skal sende med en SOSI-kontroll-fil (.txt) til vedlegget ‘Plankart’, må den ha samme filnavn som tilhørende SOSI-fil (.sos)",
        "r": "Feil",
        "b": "vedlegg/",
        "k": "30. juni 2026 ML Ny regel ref. https://arkitektum.atlassian.net/browse/FT-1986"
      },
      {
        "p": "Vedlegg.PlankartPdf",
        "t": "Du må sende med vedlegget 'Plankart' i et lesbart format. Filnavnet skal skrives slik: plankart-{planidentifikasjon}-{versjon}-{vertikalnivå}-{vertikallag}.pdf",
        "r": "Feil",
        "b": "vedlegg/",
        "k": "OK"
      },
      {
        "p": "Vedlegg.RosAnalyse",
        "t": "Du bør sende med en risiko- og sårbarhetsanalyse dersom dette ikke er inkludert i vedlegget ‘Planbeskrivelse’. Filnavnet skal skrives slik: ROS-analyse-{planidentifikasjon}-{versjon}.pdf",
        "r": "Advarsel",
        "b": "vedlegg/",
        "k": "25. juni 2026 MHL og MA Advarsel ROS-analyse"
      },
      {
        "p": "Vedlegg.Konsekvensutredning",
        "t": "Dersom planforslaget utløser krav om konsekvensutredning må du inkludere dette i vedlegget ‘Planbeskrivelse’ eller sende med vedlegget ‘Konsekvensutredning’. Filnavnet skal skrives slik: konsekvensutredning-{planidentifikasjon}-{versjon}.pdf",
        "r": "Advarsel",
        "b": "vedlegg/",
        "k": "25. juni 2026 MHL og MA Advarsel Konsekvensutredning"
      }
    ]
  }
];

export const REGEL_STATUS_DEFAULT: Record<string, string> = {
  "HoeringOgOffentligEttersyn.Avsender.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Avsender.Kommune.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.BeskrivelseVedtakOmHoeringOgOffentligEttersyn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Bruksnummer.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Bruksnummer.Gyldig": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Festenummer.Gyldig": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Gaardsnummer.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Gaardsnummer.Gyldig": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.KodelisteFinnes": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.Gyldig": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.GyldigIKodeliste": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Seksjonsnummer.Gyldig": "slettet",
  "HoeringOgOffentligEttersyn.EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.GyldigIMatrikkel": "slettet",
  "HoeringOgOffentligEttersyn.FristForUttalelse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.FristForUttalelseHOFFE.Gyldig": "avklares",
  "HoeringOgOffentligEttersyn.FristForUttalelseBEGR.Gyldig": "avklares",
  "HoeringOgOffentligEttersyn.FristForUttalelseFORE.Gyldig": "avklares",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.BeskrivelseAvFoelger.Utfylt": "avklares",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.Kommunenummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.PlanId.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Navn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Utfylt": "avklares",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.Utfylt": "avklares",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.KodelisteFinnes": "avklares",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.Gyldig": "avklares",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.Tillatt": "avklares",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodebeskrivelse.Utfylt": "avklares",
  "HoeringOgOffentligEttersyn.EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodebeskrivelse.Gyldig": "avklares",
  "HoeringOgOffentligEttersyn.HjemmesidePlanforslag.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Hoeringstype.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Hoeringstype.Kodeverdi.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Hoeringstype.Kodeverdi.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.Hoeringstype.Kodeverdi.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Hoeringstype.Kodebeskrivelse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Hoeringstype.Kodebeskrivelse.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Utfylt": "avklares",
  "HoeringOgOffentligEttersyn.Kommune.Adresse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Adresse.Adresselinje1.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Adresse.Landkode.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Adresse.Landkode.Norsk": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Adresse.Postnr.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Adresse.Postnr.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Adresse.Postnr.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Adresse.Postnr.Poststed.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Epost.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Epost.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Kontaktperson.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Kontaktperson.Epost.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Kontaktperson.Epost.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Kontaktperson.Navn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Kontaktperson.Telefonnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Kontaktperson.Telefonnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Mobilnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Mobilnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Navn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Organisasjonsnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Organisasjonsnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Organisasjonsnummer.Kontrollsiffer": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Partstype.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Partstype.Kodeverdi.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Partstype.Kodeverdi.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Partstype.Kodeverdi.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Partstype.Kodeverdi.Tillatt": "utvikling",
  "HoeringOgOffentligEttersyn.Kommune.Partstype.Kodebeskrivelse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Partstype.Kodebeskrivelse.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Plankonsulent.Kontaktperson.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Telefonnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Kommune.Telefonnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.KommunensSaksnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.KommunensSaksnummer.Saksaar.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.KommunensSaksnummer.Saksaar.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.KommunensSaksnummer.Sakssekvensnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Metadata.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.Metadata.ForetrukketSpraak.Kodeverdi.Gyldig": "slettet",
  "HoeringOgOffentligEttersyn.Metadata.ForetrukketSpraak.KodelisteFinnes": "slettet",
  "HoeringOgOffentligEttersyn.Metadata.ForetrukketSpraak.Kodebeskrivelse.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.Metadata.ForetrukketSpraak.Kodebeskrivelse.Gyldig": "slettet",
  "HoeringOgOffentligEttersyn.Metadata.FraSluttbrukersystem.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.Metadata.FtbId.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.Metadata.Prosjektnavn.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.Metadata.Prosjektnr.Utfylt": "slettet",
  "HoeringOgOffentligEttersyn.Planforslag.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Planforslag.NasjonalArealplanId.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Planforslag.NasjonalArealplanId.Kommunenummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Planforslag.NasjonalArealplanId.Kommunenummer.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.Planforslag.NasjonalArealplanId.Kommunenummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Planforslag.NasjonalArealplanId.PlanId.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Planforslag.Plannavn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Planforslag.Plantype.Utfylt": "avklares",
  "HoeringOgOffentligEttersyn.Planforslag.Plantype.Kodeverdi.Utfylt": "avklares",
  "HoeringOgOffentligEttersyn.Planforslag.Plantype.Kodeverdi.KodelisteFinnes": "avklares",
  "HoeringOgOffentligEttersyn.Planforslag.Plantype.Kodeverdi.Gyldig": "avklares",
  "HoeringOgOffentligEttersyn.Planforslag.Plantype.Kodeverdi.Tillatt": "utvikling",
  "HoeringOgOffentligEttersyn.Planforslag.Plantype.Kodebeskrivelse.Utfylt": "avklares",
  "HoeringOgOffentligEttersyn.Planforslag.Plantype.Kodebeskrivelse.Gyldig": "avklares",
  "HoeringOgOffentligEttersyn.Planhensikt.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Partstype.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Partstype.Kodeverdi.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Partstype.Kodeverdi.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Partstype.Kodeverdi.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Partstype.Kodebeskrivelse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Partstype.Kodebeskrivelse.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Foedselsnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Foedselsnummer.Kryptert": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Foedselsnummer.Dekryptert": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Foedselsnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Foedselsnummer.Kontrollsiffer": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Organisasjonsnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Organisasjonsnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Organisasjonsnummer.Kontrollsiffer": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Adresse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Adresse.Adresselinje1.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Adresse.Landkode.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Adresse.Landkode.Norsk": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Adresse.Postnr.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Adresse.Postnr.Kodelistefinnes": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Adresse.Postnr.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Adresse.Postnr.Poststed.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Navn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Telefonnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Telefonnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Mobilnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Mobilnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Epost.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Epost.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Kontaktperson.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Kontaktperson.Navn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Kontaktperson.Epost.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Kontaktperson.Epost.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Kontaktperson.Telefonnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Forslagsstiller.Kontaktperson.Telefonnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Planprosessregel.Utfylt": "avklares",
  "HoeringOgOffentligEttersyn.Planprosessregel.Kodeverdi.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Planprosessregel.Kodeverdi.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.Planprosessregel.Kodeverdi.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Planprosessregel.Kodeverdi.Tillatt": "utvikling",
  "HoeringOgOffentligEttersyn.Planprosessregel.Kodebeskrivelse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.Planprosessregel.Kodebeskrivelse.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.TilgjengelighetEksemplar.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Adresselinje1.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.Norsk": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Epost.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Epost.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Dekryptert": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Kontrollsiffer": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Kryptert": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Adresselinje1.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Gatenavn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Husnr.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.Norsk": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.Poststed.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Bolignummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Bygningsnummer.Numerisk": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Bruksnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Bruksnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Festenummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Gaardsnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Gaardsnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Kommunenummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Kommunenummer.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Kommunenummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Seksjonsnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Kommunenavn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Navn.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Organisasjonsnummer.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Organisasjonsnummer.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Organisasjonsnummer.Kontrollsiffer": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodeverdi.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodeverdi.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodeverdi.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodebeskrivelse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodebeskrivelse.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodeverdi.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodeverdi.KodelisteFinnes": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodeverdi.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodebeskrivelse.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodebeskrivelse.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Telefon.Utfylt": "testetok",
  "HoeringOgOffentligEttersyn.MottakerListe.BeroertpartOgInteressentOgMyndighet.Telefon.Gyldig": "testetok",
  "HoeringOgOffentligEttersyn.Vedlegg.Planbeskrivelse": "testetok",
  "HoeringOgOffentligEttersyn.Vedlegg.PlanbestemmelserPdf": "testetok",
  "HoeringOgOffentligEttersyn.Vedlegg.PlanbestemmelserXml": "testetok",
  "HoeringOgOffentligEttersyn.Vedlegg.Plankart2DGml": "avklares",
  "HoeringOgOffentligEttersyn.Vedlegg.PlankartTXT": "utvikling",
  "HoeringOgOffentligEttersyn.Vedlegg.PlankartPdf": "testetok",
  "HoeringOgOffentligEttersyn.Vedlegg.RosAnalyse": "avklares",
  "HoeringOgOffentligEttersyn.Vedlegg.Konsekvensutredning": "avklares"
};

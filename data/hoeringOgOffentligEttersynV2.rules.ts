// AUTO-GENERERT fra index.html (valideringsregler). Rediger heller via UI/import.
import type { RegelStatusDef, RegelGruppeDef } from "@/lib/regler";

export const REGEL_ROOT = "HoeringOgOffentligEttersyn";

export const REGEL_STATUSER: RegelStatusDef[] = [
  {
    "id": "",
    "navn": "Ingen status",
    "cls": ""
  },
  {
    "id": "utvikling",
    "navn": "Til utvikling/test",
    "cls": "st-utvikling"
  },
  {
    "id": "slettet",
    "navn": "Slettet",
    "cls": "st-slettet"
  },
  {
    "id": "avklares",
    "navn": "Må avklares",
    "cls": "st-avklares"
  },
  {
    "id": "testetok",
    "navn": "Testet OK",
    "cls": "st-testetok"
  },
  {
    "id": "feilet",
    "navn": "Test feilet",
    "cls": "st-feilet"
  },
  {
    "id": "nye",
    "navn": "Nye",
    "cls": "st-nye"
  }
];

export const REGEL_GRUPPER_DEFAULT: RegelGruppeDef[] = [
  {
    "g": "Avsender",
    "std": true,
    "rules": [
      {
        "p": "Avsender.Kommune.Gyldig",
        "t": "Identiteten (organisasjonsnummeret) til avsender må være lik identiteten som er oppgitt for kommune.",
        "r": "Feil",
        "b": "avsender/kommune"
      },
      {
        "p": "Avsender.Plankonsulent.Gyldig",
        "t": "Identiteten (organisasjonsnummeret) til avsender må være lik identiteten som er oppgitt for plankonsulent.",
        "r": "Feil",
        "b": "avsender/plankonsulent",
        "f": "med plankonsulent"
      },
      {
        "p": "Avsender.Utfylt",
        "t": "Du kan ikke sende planforslaget på høring og offentlig ettersyn uten en avsender.",
        "r": "Feil",
        "b": "AuthenticatedSubmitter"
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
        "b": "beskrivelseVedtakOmHoeringOgOffentligEttersyn"
      }
    ]
  },
  {
    "g": "EiendommerSomInngaarIPlanomraadet",
    "rules": [
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 for eiendom som inngår i planområdet bør fylles ut.",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/adresselinje1"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Gatenavn.Utfylt",
        "t": "Du bør oppgi gatenavn for eiendom som inngår i planområdet slik at adressen kan valideres mot matrikkelen. Du kan sjekke riktig adresse på https://eiendomsregisteret.kartverket.no/",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/gatenavn"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.GyldigIMatrikkel",
        "t": "Du har oppgitt feil gateadresse for eiendom som inngår i planområdet. Du kan sjekke riktig adresse på https://eiendomsregisteret.kartverket.no/",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Husnr.Utfylt",
        "t": "Du bør oppgi husnummer og eventuell bokstav for eiendom som inngår i planområdet slik at adressen kan valideres mot matrikkelen. Du kan sjekke riktig adresse på https://eiendomsregisteret.kartverket.no/",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/husnr"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Landkode.Gyldig",
        "t": "Landkoden for adressen til eiendom som inngår i planområdet er ikke gyldig.",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/landkode"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Landkode.KodelisteFinnes",
        "t": "Landkoden til adressen for eiendom som inngår i planområdet kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/landkode"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Landkode.Norsk",
        "t": "Landkoden til adressen for eiendom som inngår i planområdet må være norsk.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/landkode"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Landkode.Utfylt",
        "t": "Landkoden til adressen for eiendom som inngår i planområdet bør fylles ut.",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/landkode"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Postnr.Gyldig",
        "t": "Postnummeret '{0}' for eiendom som inngår i planområdet er ugyldig. Du kan sjekke riktig postnummer på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/postnr"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Postnr.KodelisteFinnes",
        "t": "Postnummeret '{0}' for eiendom som inngår i planområdet ble ikke validert. Postnummeret kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/postnr"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Postnr.Poststed.Gyldig",
        "t": "Postnummeret '{0}' for eiendom som inngår i planområdet stemmer ikke overens med poststedet '{1}'. Postnummeret er fra '{2}'. Du kan sjekke riktig postnummer/poststed på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/postnr",
        "f": "eiendommerSomInngaarIPlanomraadet/eiendom/adresse/poststed"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Postnr.Utfylt",
        "t": "Postnummer bør fylles ut for eiendom som inngår i planområdet.",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse/postnr"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Adresse.Utfylt",
        "t": "Postadresse for eiendom som inngår i planområdet bør fylles ut.",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/adresse"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Bolignummer.Gyldig",
        "t": "Når bruksenhetsnummer/bolignummer er fylt ut for eiendom som inngår i planområdet, må det følge riktig format (for eksempel H0101). Se https://www.kartverket.no/eiendom/adressering/bruksenhetsnummer/",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/bolignummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Bygningsnummer.Gyldig",
        "t": "Bygningsnummer for eiendom som inngår i planområdet må være større enn '0'.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/bygningsnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Bygningsnummer.GyldigIMatrikkel",
        "t": "Når bygningsnummer [{0}] er oppgitt for eiendom som inngår i planområdet, bør det være gyldig i matrikkelen på aktuelt matrikkelnummer. Du kan sjekke riktig bygningsnummer på https://eiendomsregisteret.kartverket.no/",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/bygningsnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Bygningsnummer.Numerisk",
        "t": "Du har oppgitt følgende bygningsnummer for eiendom som inngår i planområdet: '{0}'. Bygningsnummeret må være et tall.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/bygningsnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Bygningsnummer.Unik",
        "t": "Når bygningsnummer er oppgitt, må det være unikt for hver bygning. Du kan sjekke riktig bygningsnummer på https://eiendomsregisteret.kartverket.no/",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/bygningsnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Bygningsnummer.Utfylt",
        "t": "Bygningsnummer må fylles ut for eiendom som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/bygningsnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Bruksnummer.Gyldig",
        "t": "Bruksnummer for eiendom som inngår i planområdet må være '0' eller større.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/bruksnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Bruksnummer.Utfylt",
        "t": "Bruksnummer må fylles ut for eiendom som inngår i planområdet.",
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
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.GyldigIMatrikkel",
        "t": "Når eiendomsidentifikasjon [{0}-{1}/{2}/{3}/{4}] er oppgitt for eiendom som inngår i planområdet, bør den være gyldig i matrikkelen. Du kan sjekke riktig informasjon på https://eiendomsregisteret.kartverket.no/",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Gaardsnummer.Gyldig",
        "t": "Gårdsnummer for eiendom som inngår i planområdet må være '0' eller større.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/gaardsnummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Gaardsnummer.Utfylt",
        "t": "Gårdsnummer må fylles ut for eiendom som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/gaardsnummer"
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
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.KodelisteFinnes",
        "t": "En teknisk feil gjør at vi ikke kan bekrefte om kommunenummeret du har oppgitt '{0}' er riktig. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon/kommunenummer"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Kommunenummer.Utfylt",
        "t": "Kommunenummer må fylles ut for eiendom som inngår i planområdet.",
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
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Eiendomsidentifikasjon.Utfylt",
        "t": "Du må oppgi eiendomsidentifikasjon for eiendom som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/eiendomsidentifikasjon"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Kommunenavn.Utfylt",
        "t": "Navnet på kommunen bør fylles ut for eiendom som inngår i planområdet.",
        "r": "Advarsel",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}/kommunenavn"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Eiendom.Utfylt",
        "t": "Du må oppgi hvilken eiendom/hvilke eiendommer som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet/eiendom{0}"
      },
      {
        "p": "EiendommerSomInngaarIPlanomraadet.Utfylt",
        "t": "Du må oppgi minst én eiendom som inngår i planområdet.",
        "r": "Feil",
        "b": "eiendommerSomInngaarIPlanomraadet"
      }
    ]
  },
  {
    "g": "Forslagsstiller",
    "rules": [
      {
        "p": "Forslagsstiller.Utfylt",
        "t": "Hvis høringen har en forslagsstiller bør du fylle ut informasjon om den.",
        "r": "Advarsel",
        "b": "forslagsstiller"
      },
      {
        "p": "Forslagsstiller.Partstype.Utfylt",
        "t": "Du må oppgi partstypen for forslagsstiller. Du kan sjekke gyldige partstyper på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "forslagsstiller/partstype"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'partstype' til forslagsstiller må fylles ut. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "forslagsstiller/partstype/kodeverdi"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Partstypen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "forslagsstiller/partstype/kodeverdi"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodeverdi.Gyldig",
        "t": "Ugyldig kodeverdi for partstypen til forslagsstiller. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "forslagsstiller/partstype/kodeverdi"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodebeskrivelse.Utfylt",
        "t": "Når partstype er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "forslagsstiller/partstype/kodebeskrivelse"
      },
      {
        "p": "Forslagsstiller.Partstype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for partstype. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Advarsel",
        "b": "forslagsstiller/partstype/kodebeskrivelse"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Utfylt",
        "t": "Fødselsnummer må fylles ut når forslagsstiller er en privatperson.",
        "r": "Feil",
        "b": "forslagsstiller/foedselsnummer",
        "f": "forslagsstiller/partstype/kodeverdi = privatperson"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Kryptert",
        "t": "Fødselsnummeret til forslagsstiller må være kryptert.",
        "r": "Feil",
        "b": "forslagsstiller/foedselsnummer",
        "f": "forslagsstiller/partstype/kodeverdi = privatperson"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Dekryptert",
        "t": "Fødselsnummeret til forslagsstiller kan ikke dekrypteres.",
        "r": "Feil",
        "b": "forslagsstiller/foedselsnummer",
        "f": "forslagsstiller/partstype/kodeverdi = privatperson"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Gyldig",
        "t": "Fødselsnummeret til forslagsstiller er ikke gyldig.",
        "r": "Feil",
        "b": "forslagsstiller/foedselsnummer",
        "f": "forslagsstiller/partstype/kodeverdi = privatperson"
      },
      {
        "p": "Forslagsstiller.Foedselsnummer.Kontrollsiffer",
        "t": "Fødselsnummeret til forslagsstiller har ikke gyldig kontrollsiffer.",
        "r": "Feil",
        "b": "forslagsstiller/foedselsnummer",
        "f": "forslagsstiller/partstype/kodeverdi = privatperson"
      },
      {
        "p": "Forslagsstiller.Organisasjonsnummer.Utfylt",
        "t": "Organisasjonsnummer må fylles ut når forslagsstiller er en organisasjon.",
        "r": "Feil",
        "b": "forslagsstiller/organisasjonsnummer",
        "f": "forslagsstiller/partstype/kodeverdi = ikke privatperson"
      },
      {
        "p": "Forslagsstiller.Organisasjonsnummer.Gyldig",
        "t": "Organisasjonsnummeret ('{0}') for forslagsstiller er ikke gyldig.",
        "r": "Feil",
        "b": "forslagsstiller/organisasjonsnummer",
        "f": "forslagsstiller/partstype/kodeverdi = ikke privatperson"
      },
      {
        "p": "Forslagsstiller.Organisasjonsnummer.Kontrollsiffer",
        "t": "Organisasjonsnummeret ('{0}') for forslagsstiller har ikke gyldig kontrollsiffer.",
        "r": "Feil",
        "b": "forslagsstiller/organisasjonsnummer",
        "f": "forslagsstiller/partstype/kodeverdi = ikke privatperson"
      },
      {
        "p": "Forslagsstiller.Adresse.Utfylt",
        "t": "Du bør fylle ut adressen til forslagsstiller.",
        "r": "Advarsel",
        "b": "forslagsstiller/adresse"
      },
      {
        "p": "Forslagsstiller.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 bør fylles ut for forslagsstiller.",
        "r": "Advarsel",
        "b": "forslagsstiller/adresse/adresselinje1"
      },
      {
        "p": "Forslagsstiller.Adresse.Landkode.Gyldig",
        "t": "Landkoden '{0}' for forslagsstillers adresse, er ikke gyldig.",
        "r": "Advarsel",
        "b": "forslagsstiller/adresse/landkode"
      },
      {
        "p": "Forslagsstiller.Adresse.Landkode.Norsk",
        "t": "Landkoden til forslagsstillers adresse må være norsk.",
        "r": "Advarsel",
        "b": "forslagsstiller/adresse/landkode"
      },
      {
        "p": "Forslagsstiller.Adresse.Postnr.Utfylt",
        "t": "Du bør fylle ut postnummeret til forslagsstillers adresse.",
        "r": "Advarsel",
        "b": "forslagsstiller/adresse/postnr"
      },
      {
        "p": "Forslagsstiller.Adresse.Postnr.KodelisteFinnes",
        "t": "Postnummeret '{0}' til forslagsstiller ble ikke validert. Postnummeret kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "forslagsstiller/adresse/postnr"
      },
      {
        "p": "Forslagsstiller.Adresse.Postnr.Gyldig",
        "t": "Postnummeret '{0}' for forslagsstiller er ugyldig. Du kan sjekke riktig postnummer på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "forslagsstiller/adresse/postnr"
      },
      {
        "p": "Forslagsstiller.Adresse.Postnr.Poststed.Gyldig",
        "t": "Postnummeret '{0}' for forslagsstiller stemmer ikke overens med poststedet '{1}'. Postnummeret er fra '{2}'. Du kan sjekke riktig postnummer/poststed på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "forslagsstiller/adresse/postnr",
        "f": "forslagsstiller/adresse/poststed"
      },
      {
        "p": "Forslagsstiller.Navn.Utfylt",
        "t": "Navnet til forslagsstiller må fylles ut.",
        "r": "Feil",
        "b": "forslagsstiller/navn"
      },
      {
        "p": "Forslagsstiller.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til forslagsstiller bør fylles ut.",
        "r": "Advarsel",
        "b": "forslagsstiller/telefonnummer"
      },
      {
        "p": "Forslagsstiller.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til forslagsstiller må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "forslagsstiller/telefonnummer"
      },
      {
        "p": "Forslagsstiller.Mobilnummer.Utfylt",
        "t": "Mobilnummeret til forslagsstiller bør fylles ut.",
        "r": "Advarsel",
        "b": "forslagsstiller/mobilnummer"
      },
      {
        "p": "Forslagsstiller.Mobilnummer.Gyldig",
        "t": "Mobilnummeret til forslagsstiller må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "forslagsstiller/mobilnummer"
      },
      {
        "p": "Forslagsstiller.Epost.Utfylt",
        "t": "E-postadressen til forslagsstiller bør fylles ut.",
        "r": "Advarsel",
        "b": "forslagsstiller/epost"
      },
      {
        "p": "Forslagsstiller.Epost.Gyldig",
        "t": "E-postadressen for forslagsstiller er ikke gyldig. Gyldig e-post skrives som navn@domene.no.",
        "r": "Feil",
        "b": "forslagsstiller/epost"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Utfylt",
        "t": "Kontaktperson for forslagsstiller bør fylles ut.",
        "r": "Advarsel",
        "b": "forslagsstiller/kontaktperson"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Navn.Utfylt",
        "t": "Navnet til kontaktpersonen for forslagsstilleren må fylles ut.",
        "r": "Feil",
        "b": "forslagsstiller/kontaktperson/navn"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Epost.Utfylt",
        "t": "E-postadressen til forslagsstillerens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "forslagsstiller/kontaktperson/epost"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Epost.Gyldig",
        "t": "E-postadresse '{0}' for forslagsstillerens kontaktperson er ikke gyldig. Gyldig e-post skrives som navn@domene.no",
        "r": "Feil",
        "b": "forslagsstiller/kontaktperson/epost"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til forslagsstillerens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "forslagsstiller/kontaktperson/telefonnummer"
      },
      {
        "p": "Forslagsstiller.Kontaktperson.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til forslagsstillerens kontaktperson må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "forslagsstiller/kontaktperson/telefonnummer"
      }
    ]
  },
  {
    "g": "FristForUttalelse",
    "rules": [
      {
        "p": "FristForUttalelse.Gyldig",
        "t": "Uttalelsesfristen må være minst seks uker frem i tid fra dagens dato.",
        "r": "Feil",
        "b": "fristForUttalelse"
      },
      {
        "p": "FristForUttalelse.Utfylt",
        "t": "Fristen for uttalelse må fylles ut.",
        "r": "Feil",
        "b": "fristForUttalelse"
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
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/beskrivelseAvFoelger"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.Kommunenummer.Gyldig",
        "t": "Kommunenummeret '{0}' for gjeldende arealplan finnes ikke i kodelisten. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/nasjonalArealplanId/kommunenummer"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.Kommunenummer.KodelisteFinnes",
        "t": "En teknisk feil gjør at vi ikke kan bekrefte om kommunenummeret '{0}' for gjeldende arealplan er riktig. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/nasjonalArealplanId/kommunenummer"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.Kommunenummer.Utfylt",
        "t": "Kommunenummer for gjeldende arealplans nasjonale arealplan-ID bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/nasjonalArealplanId/kommunenummer"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.Landkode.Utfylt",
        "t": "Landkoden for gjeldende arealplans nasjonale arealplan-ID bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/nasjonalArealplanId/landkode"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.PlanId.Utfylt",
        "t": "Plan-ID for gjeldende arealplan bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/nasjonalArealplanId/planId"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.NasjonalArealplanId.Utfylt",
        "t": "Nasjonal arealplan-ID for gjeldende arealplan bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/nasjonalArealplanId"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Navn.Utfylt",
        "t": "Navnet på gjeldende arealplan bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/navn"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for plantype til gjeldende arealplan. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodebeskrivelse"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodebeskrivelse.Utfylt",
        "t": "Når plantype er valgt for gjeldende arealplan, bør kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodebeskrivelse"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for plantype til gjeldende arealplan. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodeverdi"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' for gjeldende arealplan ble ikke validert. En teknisk feil gjør at vi ikke kan validere informasjon for plantype. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodeverdi"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'plantype' til gjeldende arealplan bør fylles ut. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype/kodeverdi"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Plantype.Utfylt",
        "t": "Plantypen til gjeldende arealplan bør fylles ut. Du kan sjekke gyldige plantyper på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}/plantype"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.EksisterendePlanSomBeroeres.Utfylt",
        "t": "Informasjon om gjeldende arealplan bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres/eksisterendePlanSomBeroeres{0}"
      },
      {
        "p": "EksisterendePlanerSomBeroeres.Utfylt",
        "t": "Informasjon om gjeldende arealplaner bør fylles ut.",
        "r": "Advarsel",
        "b": "eksisterendePlanerSomBeroeres"
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
        "b": "hjemmesidePlanforslag"
      }
    ]
  },
  {
    "g": "Hoeringstype",
    "rules": [
      {
        "p": "Hoeringstype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for høringstype. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/høringstype",
        "r": "Advarsel",
        "b": "hoeringstype/kodebeskrivelse"
      },
      {
        "p": "Hoeringstype.Kodebeskrivelse.Utfylt",
        "t": "Når høringstype er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/høringstype",
        "r": "Feil",
        "b": "hoeringstype/kodebeskrivelse"
      },
      {
        "p": "Hoeringstype.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for høringstype. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/høringstype",
        "r": "Feil",
        "b": "hoeringstype/kodeverdi"
      },
      {
        "p": "Hoeringstype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Høringstype kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "hoeringstype/kodeverdi"
      },
      {
        "p": "Hoeringstype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for høringstype må fylles ut. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/høringstype",
        "r": "Feil",
        "b": "hoeringstype/kodeverdi"
      },
      {
        "p": "Hoeringstype.Utfylt",
        "t": "Høringstypen for planen må fylles ut.",
        "r": "Feil",
        "b": "hoeringstype"
      }
    ]
  },
  {
    "g": "Kommune",
    "rules": [
      {
        "p": "Kommune.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 bør fylles ut for kommune",
        "r": "Advarsel",
        "b": "kommune/adresse/adresselinje1"
      },
      {
        "p": "Kommune.Adresse.Landkode.Gyldig",
        "t": "Landkoden '{0}' for kommunens adresse, er ikke gyldig.",
        "r": "Advarsel",
        "b": "kommune/adresse/landkode"
      },
      {
        "p": "Kommune.Adresse.Landkode.Norsk",
        "t": "Landkoden til kommunens adresse må være norsk.",
        "r": "Advarsel",
        "b": "kommune/adresse/landkode"
      },
      {
        "p": "Kommune.Adresse.Postnr.Gyldig",
        "t": "Postnummeret '{0}' for kommunen er ugyldig. Du kan sjekke riktig postnummer på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "kommune/adresse/postnr"
      },
      {
        "p": "Kommune.Adresse.Postnr.KodelisteFinnes",
        "t": "Postnummeret '{0}' til kommunen ble ikke validert. Postnummeret kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "kommune/adresse/postnr"
      },
      {
        "p": "Kommune.Adresse.Postnr.Poststed.Gyldig",
        "t": "Postnummeret '{0}' for kommunen stemmer ikke overens med poststedet '{1}'. Postnummeret er fra '{2}'. Du kan sjekke riktig postnummer/poststed på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "kommune/adresse/postnr",
        "f": "kommune/adresse/poststed"
      },
      {
        "p": "Kommune.Adresse.Postnr.Utfylt",
        "t": "Du bør fylle ut postnummeret til kommunen.",
        "r": "Advarsel",
        "b": "kommune/adresse/postnr"
      },
      {
        "p": "Kommune.Adresse.Utfylt",
        "t": "Adresse bør fylles ut for kommunen",
        "r": "Advarsel",
        "b": "kommune/adresse"
      },
      {
        "p": "Kommune.Epost.Gyldig",
        "t": "E-postadresse '{0}' for kommune er ikke gyldig. Gyldig e-post skrives som navn@domene.no",
        "r": "Feil",
        "b": "kommune/epost"
      },
      {
        "p": "Kommune.Epost.Utfylt",
        "t": "E-postadressen til kommunen bør fylles ut.",
        "r": "Advarsel",
        "b": "kommune/epost"
      },
      {
        "p": "Kommune.Kontaktperson.Epost.Gyldig",
        "t": "E-postadresse '{0}' for kommunens kontaktperson er ikke gyldig. Gyldig e-post skrives som navn@domene.no",
        "r": "Feil",
        "b": "kommune/kontaktperson/epost"
      },
      {
        "p": "Kommune.Kontaktperson.Epost.Utfylt",
        "t": "E-postadressen til kommunens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "kommune/kontaktperson/epost"
      },
      {
        "p": "Kommune.Kontaktperson.Navn.Utfylt",
        "t": "Navnet til kontaktpersonen for kommunen må fylles ut.",
        "r": "Feil",
        "b": "kommune/kontaktperson/navn"
      },
      {
        "p": "Kommune.Kontaktperson.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til kommunens kontaktperson må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "kommune/kontaktperson/telefonnummer"
      },
      {
        "p": "Kommune.Kontaktperson.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til kommunens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "kommune/kontaktperson/telefonnummer"
      },
      {
        "p": "Kommune.Kontaktperson.Utfylt",
        "t": "Kontaktperson for kommunen bør fylles ut.",
        "r": "Advarsel",
        "b": "kommune/kontaktperson"
      },
      {
        "p": "Kommune.Mobilnummer.Gyldig",
        "t": "Mobilnummeret til kommunen må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "kommune/mobilnummer"
      },
      {
        "p": "Kommune.Mobilnummer.Utfylt",
        "t": "Mobilnummeret til kommunen bør fylles ut.",
        "r": "Advarsel",
        "b": "kommune/mobilnummer"
      },
      {
        "p": "Kommune.Navn.Utfylt",
        "t": "Navnet til kommunen må fylles ut.",
        "r": "Feil",
        "b": "kommune/navn"
      },
      {
        "p": "Kommune.Organisasjonsnummer.Gyldig",
        "t": "Organisasjonsnummeret '{0}' for kommunen er ikke gyldig.",
        "r": "Feil",
        "b": "kommune/organisasjonsnummer"
      },
      {
        "p": "Kommune.Organisasjonsnummer.Kontrollsiffer",
        "t": "Organisasjonsnummeret til kommunen må ha gyldig kontrollsiffer.",
        "r": "Feil",
        "b": "kommune/organisasjonsnummer"
      },
      {
        "p": "Kommune.Organisasjonsnummer.Utfylt",
        "t": "Organisasjonsnummeret til kommunen må fylles ut.",
        "r": "Feil",
        "b": "kommune/organisasjonsnummer"
      },
      {
        "p": "Kommune.Partstype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for partstype. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Advarsel",
        "b": "kommune/partstype/kodebeskrivelse"
      },
      {
        "p": "Kommune.Partstype.Kodebeskrivelse.Utfylt",
        "t": "Når partstype er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "kommune/partstype/kodebeskrivelse"
      },
      {
        "p": "Kommune.Partstype.Kodeverdi.Gyldig",
        "t": "Ugyldig kodeverdi '{0}' i henhold til kodeliste for 'partstype' for kommune. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "kommune/partstype/kodeverdi"
      },
      {
        "p": "Kommune.Partstype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Partstypen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "kommune/partstype/kodeverdi"
      },
      {
        "p": "Kommune.Partstype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'partstype' til kommunen må fylles ut. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "kommune/partstype/kodeverdi"
      },
      {
        "p": "Kommune.Partstype.Utfylt",
        "t": "Du må oppgi partstypen for kommunen. Du kan sjekke gyldige partstyper på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "kommune/partstype"
      },
      {
        "p": "Kommune.Plankonsulent.Kontaktperson.Utfylt",
        "t": "Kontaktperson må være med for enten kommune eller plankonsulent.",
        "r": "Feil",
        "b": "kommune/kontaktperson",
        "f": "plankonsulent/kontaktperson = null  &  kommune/kontaktperson = null"
      },
      {
        "p": "Kommune.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til kommunen må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "kommune/telefonnummer"
      },
      {
        "p": "Kommune.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til kommunen bør fylles ut.",
        "r": "Advarsel",
        "b": "kommune/telefonnummer"
      },
      {
        "p": "Kommune.Utfylt",
        "t": "Du må fylle ut informasjon om kommunen.",
        "r": "Feil",
        "b": "kommune"
      }
    ]
  },
  {
    "g": "KommunensSaksnummer",
    "std": true,
    "rules": [
      {
        "p": "KommunensSaksnummer.Sakssekvensnummer.Utfylt",
        "t": "Du må oppgi kommunens saksnummer med sekvensnummer.",
        "r": "Feil",
        "b": "kommunensSaksnummer/sakssekvensnummer",
        "f": "kommunensSaksnummer/saksaar"
      },
      {
        "p": "KommunensSaksnummer.Saksaar.Gyldig",
        "t": "Saksår ({0}) for kommunens saksnummer er ikke gyldig. Saksåret må inneholde fire siffer, og ikke være eldre enn 30 år.",
        "r": "Feil",
        "b": "kommunensSaksnummer/saksaar"
      },
      {
        "p": "KommunensSaksnummer.Saksaar.Utfylt",
        "t": "Du må oppgi kommunens saksnummer med saksår.",
        "r": "Feil",
        "b": "kommunensSaksnummer/saksaar",
        "f": "kommunensSaksnummer/sakssekvensnummer"
      },
      {
        "p": "KommunensSaksnummer.Utfylt",
        "t": "Hvis du har mottatt kommunens saksnummer, må du oppgi dette.",
        "r": "Advarsel",
        "b": "kommunensSaksnummer"
      }
    ]
  },
  {
    "g": "MedvirkningIHoeringsperioden",
    "rules": [
      {
        "p": "MedvirkningIHoeringsperioden.Utfylt",
        "t": "Medvirkning i høringsperioden på fylles ut.",
        "r": "Feil",
        "b": "medvirkningIHoeringsperioden"
      }
    ]
  },
  {
    "g": "Metadata",
    "std": true,
    "rules": [
      {
        "p": "Metadata.ForetrukketSpraak.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for målformen. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/kodelister/byggesoknad/foretrukketspraak",
        "r": "Feil",
        "b": "metadata/foretrukketSpraak/kodebeskrivelse"
      },
      {
        "p": "Metadata.ForetrukketSpraak.Kodebeskrivelse.Utfylt",
        "t": "Når målform er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/kodelister/byggesoknad/foretrukketspraak",
        "r": "Feil",
        "b": "metadata/foretrukketSpraak/kodebeskrivelse",
        "f": "metadata/foretrukketSpraak/kodeverdi"
      },
      {
        "p": "Metadata.ForetrukketSpraak.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Målformen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "metadata/foretrukketSpraak"
      },
      {
        "p": "Metadata.ForetrukketSpraak.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for målform. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/kodelister/byggesoknad/foretrukketspraak",
        "r": "Advarsel",
        "b": "metadata/foretrukketSpraak/kodeverdi"
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
      },
      {
        "p": "Metadata.Utfylt",
        "t": "Søknadens metadata må fylles ut.",
        "r": "Feil",
        "b": "metadata"
      }
    ]
  },
  {
    "g": "Planforslag",
    "std": true,
    "rules": [
      {
        "p": "Planforslag.NasjonalArealplanId.Kommunenummer.Gyldig",
        "t": "Kommunenummeret '{0}' for planforslaget finnes ikke i kodelisten. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Feil",
        "b": "planforslag/nasjonalArealplanId/kommunenummer"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.Kommunenummer.KodelisteFinnes",
        "t": "En teknisk feil gjør at vi ikke kan bekrefte om kommunenummeret '{0}' for planforslaget er riktig. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Advarsel",
        "b": "planforslag/nasjonalArealplanId/kommunenummer"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.Kommunenummer.Utfylt",
        "t": "Du må fylle ut kommunenummer for planforslagets nasjonale arealplan-ID.",
        "r": "Feil",
        "b": "planforslag/nasjonalArealplanId/kommunenummer"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.Landkode.Utfylt",
        "t": "Landkoden for planforslagets nasjonale arealplan-ID bør fylles ut.",
        "r": "Advarsel",
        "b": "planforslag/nasjonalArealplanId/landkode"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.PlanId.Utfylt",
        "t": "Du må fylle ut plan-ID for planforslaget.",
        "r": "Feil",
        "b": "planforslag/nasjonalArealplanId/planId"
      },
      {
        "p": "Planforslag.NasjonalArealplanId.Utfylt",
        "t": "Du må fylle ut nasjonal arealplan-ID for planforslaget.",
        "r": "Feil",
        "b": "planforslag/nasjonalArealplanId"
      },
      {
        "p": "Planforslag.Plannavn.Utfylt",
        "t": "Du må fylle ut navnet på planforslaget.",
        "r": "Feil",
        "b": "planforslag/plannavn"
      },
      {
        "p": "Planforslag.Plantype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for plantype. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Feil",
        "b": "planforslag/plantype/kodebeskrivelse"
      },
      {
        "p": "Planforslag.Plantype.Kodebeskrivelse.Utfylt",
        "t": "Når plantype for planforslaget er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/plansak/plantype-plansak.",
        "r": "Feil",
        "b": "planforslag/plantype/kodebeskrivelse"
      },
      {
        "p": "Planforslag.Plantype.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for plantype. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Feil",
        "b": "planforslag/plantype/kodeverdi"
      },
      {
        "p": "Planforslag.Plantype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. En teknisk feil gjør at vi ikke kan validere informasjon for plantype. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Advarsel",
        "b": "planforslag/plantype/kodeverdi"
      },
      {
        "p": "Planforslag.Plantype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for ‘plantype’ til planforslaget må fylles ut. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Feil",
        "b": "planforslag/plantype/kodeverdi"
      },
      {
        "p": "Planforslag.Plantype.Utfylt",
        "t": "Du må oppgi en plantype for planforslaget. Du kan sjekke gyldige plantyper på https://register.geonorge.no/plansak/plantype-plansak",
        "r": "Feil",
        "b": "planforslag/plantype"
      },
      {
        "p": "Planforslag.Utfylt",
        "t": "Du må fylle ut feltet planforslag.",
        "r": "Feil",
        "b": "planforslag"
      }
    ]
  },
  {
    "g": "Planhensikt",
    "rules": [
      {
        "p": "Planhensikt.Utfylt",
        "t": "Du må svare på hva som er hensikten med planen.",
        "r": "Feil",
        "b": "planhensikt"
      }
    ]
  },
  {
    "g": "Plankonsulent",
    "std": true,
    "rules": [
      {
        "p": "Plankonsulent.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 bør fylles ut for plankonsulent",
        "r": "Advarsel",
        "b": "plankonsulent/adresse/adresselinje1"
      },
      {
        "p": "Plankonsulent.Adresse.Landkode.Gyldig",
        "t": "Landkoden '{0}' for plankonsulents adresse, er ikke gyldig.",
        "r": "Advarsel",
        "b": "plankonsulent/adresse/landkode"
      },
      {
        "p": "Plankonsulent.Adresse.Landkode.Norsk",
        "t": "Landkoden til plankonsulents adresse må være norsk.",
        "r": "Advarsel",
        "b": "plankonsulent/adresse/landkode"
      },
      {
        "p": "Plankonsulent.Adresse.Postnr.Gyldig",
        "t": "Postnummeret '{0}' for plankonsulent er ugyldig. Du kan sjekke riktig postnummer på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "plankonsulent/adresse/postnr"
      },
      {
        "p": "Plankonsulent.Adresse.Postnr.KodelisteFinnes",
        "t": "Postnummeret '{0}' til plankonsulent ble ikke validert. Postnummeret kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "plankonsulent/adresse/postnr"
      },
      {
        "p": "Plankonsulent.Adresse.Postnr.Poststed.Gyldig",
        "t": "Postnummeret '{0}' for plankonsulent stemmer ikke overens med poststedet '{1}'. Postnummeret er fra '{2}'. Du kan sjekke riktig postnummer/poststed på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "plankonsulent/adresse/postnr",
        "f": "plankonsulent/adresse/poststed"
      },
      {
        "p": "Plankonsulent.Adresse.Postnr.Utfylt",
        "t": "Du bør fylle ut postnummeret til plankonsulent.",
        "r": "Advarsel",
        "b": "plankonsulent/adresse/postnr"
      },
      {
        "p": "Plankonsulent.Adresse.Utfylt",
        "t": "Adresse bør fylles ut for plankonsulent",
        "r": "Advarsel",
        "b": "plankonsulent/adresse"
      },
      {
        "p": "Plankonsulent.Epost.Gyldig",
        "t": "E-postadresse '{0}' for plankonsulent er ikke gyldig. Gyldig e-post skrives som navn@domene.no",
        "r": "Feil",
        "b": "plankonsulent/epost"
      },
      {
        "p": "Plankonsulent.Epost.Utfylt",
        "t": "E-postadressen til plankonsulent bør fylles ut.",
        "r": "Advarsel",
        "b": "plankonsulent/epost"
      },
      {
        "p": "Plankonsulent.Kontaktperson.Epost.Gyldig",
        "t": "E-postadresse '{0}' for plankonsulentens kontaktperson er ikke gyldig. Gyldig e-post skrives som navn@domene.no",
        "r": "Feil",
        "b": "plankonsulent/kontaktperson/epost"
      },
      {
        "p": "Plankonsulent.Kontaktperson.Epost.Utfylt",
        "t": "E-postadressen til plankonsulentens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "plankonsulent/kontaktperson/epost"
      },
      {
        "p": "Plankonsulent.Kontaktperson.Navn.Utfylt",
        "t": "Navnet til kontaktpersonen for plankonsulenten må fylles ut.",
        "r": "Feil",
        "b": "plankonsulent/kontaktperson/navn"
      },
      {
        "p": "Plankonsulent.Kontaktperson.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til plankonsulentens kontaktperson må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "plankonsulent/kontaktperson/telefonnummer"
      },
      {
        "p": "Plankonsulent.Kontaktperson.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til plankonsulentens kontaktperson må fylles ut.",
        "r": "Feil",
        "b": "plankonsulent/kontaktperson/telefonnummer"
      },
      {
        "p": "Plankonsulent.Kontaktperson.Utfylt",
        "t": "Kontaktperson for plankonsulent bør fylles ut.",
        "r": "Advarsel",
        "b": "plankonsulent/kontaktperson"
      },
      {
        "p": "Plankonsulent.Mobilnummer.Gyldig",
        "t": "Mobilnummeret til plankonsulent må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "plankonsulent/mobilnummer"
      },
      {
        "p": "Plankonsulent.Mobilnummer.Utfylt",
        "t": "Mobilnummeret til plankonsulent bør fylles ut.",
        "r": "Advarsel",
        "b": "plankonsulent/mobilnummer"
      },
      {
        "p": "Plankonsulent.Navn.Utfylt",
        "t": "Navnet til plankonsulenten må fylles ut.",
        "r": "Feil",
        "b": "plankonsulent/navn"
      },
      {
        "p": "Plankonsulent.Organisasjonsnummer.Gyldig",
        "t": "Organisasjonsnummeret '{0}' for plankonsulent er ikke gyldig.",
        "r": "Feil",
        "b": "plankonsulent/organisasjonsnummer"
      },
      {
        "p": "Plankonsulent.Organisasjonsnummer.Kontrollsiffer",
        "t": "Organisasjonsnummeret til plankonsulent må ha gyldig kontrollsiffer.",
        "r": "Feil",
        "b": "plankonsulent/organisasjonsnummer"
      },
      {
        "p": "Plankonsulent.Organisasjonsnummer.Utfylt",
        "t": "Organisasjonsnummeret til plankonsulenten må fylles ut.",
        "r": "Feil",
        "b": "plankonsulent/organisasjonsnummer"
      },
      {
        "p": "Plankonsulent.Partstype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for partstype. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Advarsel",
        "b": "plankonsulent/partstype/kodebeskrivelse"
      },
      {
        "p": "Plankonsulent.Partstype.Kodebeskrivelse.Utfylt",
        "t": "Når partstype er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "plankonsulent/partstype/kodebeskrivelse"
      },
      {
        "p": "Plankonsulent.Partstype.Kodeverdi.Gyldig",
        "t": "Ugyldig kodeverdi '{0}' i henhold til kodeliste for 'partstype' for plankonsulent. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "plankonsulent/partstype/kodeverdi"
      },
      {
        "p": "Plankonsulent.Partstype.Kodeverdi.Tillatt",
        "t": "Partstypen for plankonsulent må være et foretak eller en organisasjon.",
        "r": "Feil",
        "b": "plankonsulent/partstype/kodeverdi"
      },
      {
        "p": "Plankonsulent.Partstype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Partstypen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "plankonsulent/partstype/kodeverdi"
      },
      {
        "p": "Plankonsulent.Partstype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'partstype' til plankonsulent må fylles ut. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "plankonsulent/partstype/kodeverdi"
      },
      {
        "p": "Plankonsulent.Partstype.Utfylt",
        "t": "Du må oppgi partstypen for plankonsulent. Du kan sjekke gyldige partstyper på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "plankonsulent/partstype"
      },
      {
        "p": "Plankonsulent.Telefonnummer.Gyldig",
        "t": "Telefonnummeret til plankonsulent må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "plankonsulent/telefonnummer"
      },
      {
        "p": "Plankonsulent.Telefonnummer.Utfylt",
        "t": "Telefonnummeret til plankonsulent bør fylles ut.",
        "r": "Advarsel",
        "b": "plankonsulent/telefonnummer"
      },
      {
        "p": "Plankonsulent.Utfylt",
        "t": "Du må fylle ut informasjon om plankonsulent.",
        "r": "Advarsel",
        "b": "plankonsulent"
      }
    ]
  },
  {
    "g": "Planprosessregel",
    "rules": [
      {
        "p": "Planprosessregel.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for planprosessregel. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/planprosessregel",
        "r": "Advarsel",
        "b": "planprosessregel/kodebeskrivelse"
      },
      {
        "p": "Planprosessregel.Kodebeskrivelse.Utfylt",
        "t": "Når planprosessregel er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/planprosessregel",
        "r": "Feil",
        "b": "planprosessregel/kodebeskrivelse"
      },
      {
        "p": "Planprosessregel.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for planprosessregel. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/planprosessregel",
        "r": "Feil",
        "b": "planprosessregel/kodeverdi"
      },
      {
        "p": "Planprosessregel.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Planprosessregelen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "planprosessregel/kodeverdi"
      },
      {
        "p": "Planprosessregel.Kodeverdi.Utfylt",
        "t": "Kodeverdien for planprosessregel må fylles ut. Du kan sjekke riktig kodeverdi på https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io/kodelister/planprosessregel",
        "r": "Feil",
        "b": "planprosessregel/kodeverdi"
      },
      {
        "p": "Planprosessregel.Utfylt",
        "t": "Planprosessregelen må fylles ut.",
        "r": "Feil",
        "b": "planprosessregel"
      }
    ]
  },
  {
    "g": "TilgjengelighetEksemplar",
    "rules": [
      {
        "p": "TilgjengelighetEksemplar.Utfylt",
        "t": "Du må svare på hvor det finnes tilgjengelige eksemplarer.",
        "r": "Feil",
        "b": "tilgjengelighetEksemplar"
      }
    ]
  },
  {
    "g": "MottakerListe",
    "rules": [
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 bør fylles ut for den berørte parten, interessenten eller myndigheten.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/adresselinje1"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.Gyldig",
        "t": "Landkoden for berørt parts, interessentens eller myndighetens adresse er ikke gyldig.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/landkode"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.KodelisteFinnes",
        "t": "Landkoden til berørt parts, interessentens eller myndighets adresse kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/landkode"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.Norsk",
        "t": "Landkoden til berørt parts, interessentens eller myndighetens adresse må være norsk.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/landkode"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Landkode.Utfylt",
        "t": "Landkoden til berørt parts, interessentens eller myndighetens adresse bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse/landkode"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Adresse.Utfylt",
        "t": "Adresse bør fylles ut for den berørte parten, interessenten eller myndigheten.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/adresse"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Epost.Gyldig",
        "t": "E-postadressen '{0}' til den berørte parten, interessenten eller myndigheten er ikke gyldig.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/epost"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Epost.Utfylt",
        "t": "E-postadressen til den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/epost"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Dekryptert",
        "t": "Fødselsnummeret til den berørte parten, interessenten eller myndigheten kan ikke dekrypteres.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Gyldig",
        "t": "Fødselsnummeret til berørt part, interessent eller myndighet må være gyldig",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Kontrollsiffer",
        "t": "Berørt parts, interessentens eller myndighetens fødselsnummer må ha gyldig kontrollsiffer",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Kryptert",
        "t": "Fødselsnummeret til den berørte parten, interessenten eller myndigheten må være kryptert.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Foedselsnummer.Utfylt",
        "t": "Fødselsnummer må angis når berørt part, interessent eller myndighet er privatperson.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/foedselsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = privatperson"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Adresselinje1.Utfylt",
        "t": "Adresselinje 1 bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/adresselinje1"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Gatenavn.Utfylt",
        "t": "Gatenavn bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/gatenavn"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Husnr.Utfylt",
        "t": "Husnummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/husnr"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.Gyldig",
        "t": "Landkoden for adressen til eiendommen den berørte parten, interessenten eller myndigheten gjelder er ikke gyldig.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/landkode"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.KodelisteFinnes",
        "t": "Landkoden til adressen for eiendommen den berørte parten, interessenten eller myndigheten gjelder kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/landkode"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.Norsk",
        "t": "Landkoden til adressen for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være norsk.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/landkode"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Landkode.Utfylt",
        "t": "Landkoden til adressen for eiendommen den berørte parten, interessenten eller myndigheten gjelder bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/landkode"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.Gyldig",
        "t": "Postnummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder er ugyldig. Du kan sjekke riktig postnummer på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/postnr"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.KodelisteFinnes",
        "t": "Postnummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder ble ikke validert. Postnummeret kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/postnr"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.Poststed.Gyldig",
        "t": "Postnummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder stemmer ikke overens med poststedet '{1}'. Postnummeret er fra '{2}'. Du kan sjekke riktig postnummer/poststed på http://adressesok.bring.no/",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/postnr",
        "f": "mottakerListe/beroertpartOgInteressentOgMyndighet/gjelderEiendommer/gjeldereiendom/adresse/poststed"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Postnr.Utfylt",
        "t": "Postnummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse/postnr"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Adresse.Utfylt",
        "t": "Adresse bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/adresse"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Bolignummer.Gyldig",
        "t": "Når bruksenhetsnummer/bolignummer er fylt ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder, må det følge riktig format (for eksempel H0101). Se https://www.kartverket.no/eiendom/adressering/bruksenhetsnummer/",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/bolignummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Bygningsnummer.Numerisk",
        "t": "Bygningsnummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være et tall.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/bygningsnummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Bruksnummer.Gyldig",
        "t": "Bruksnummer for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være '0' eller større.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/bruksnummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Bruksnummer.Utfylt",
        "t": "Bruksnummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/bruksnummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Festenummer.Gyldig",
        "t": "Festenummer for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være '0' eller større.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/festenummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Gaardsnummer.Gyldig",
        "t": "Gårdsnummer for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være '0' eller større.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/gaardsnummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Gaardsnummer.Utfylt",
        "t": "Gårdsnummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/gaardsnummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Kommunenummer.Gyldig",
        "t": "Kommunenummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder finnes ikke i kodelisten. Du kan sjekke riktig kommunenummer på https://register.geonorge.no/sosi-kodelister/kommunenummer",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/kommunenummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Kommunenummer.KodelisteFinnes",
        "t": "Kommunenummeret '{0}' for eiendommen den berørte parten, interessenten eller myndigheten gjelder ble ikke validert. En teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/kommunenummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Kommunenummer.Utfylt",
        "t": "Kommunenummer bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/kommunenummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Eiendomsidentifikasjon.Seksjonsnummer.Gyldig",
        "t": "Seksjonsnummer for eiendommen den berørte parten, interessenten eller myndigheten gjelder må være '0' eller større.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/eiendomsidentifikasjon/seksjonsnummer"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.GjelderEiendommer.Gjeldereiendom.Kommunenavn.Utfylt",
        "t": "Navnet på kommunen bør fylles ut for eiendommen den berørte parten, interessenten eller myndigheten gjelder.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/gjelderEiendommer/gjeldereiendom{0}/kommunenavn"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Navn.Utfylt",
        "t": "Navnet på den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/navn"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Organisasjonsnummer.Gyldig",
        "t": "Organisasjonsnummeret ('{0}') for den berørte parten, interessenten eller myndigheten er ikke gyldig.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/organisasjonsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = ikke privatperson"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Organisasjonsnummer.Kontrollsiffer",
        "t": "Organisasjonsnummeret ('{0}') for den berørte parten, interessenten eller myndigheten har ikke gyldig kontrollsiffer.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/organisasjonsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = ikke privatperson"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Organisasjonsnummer.Utfylt",
        "t": "Organisasjonsnummeret til den berørte parten, interessenten eller myndigheten må fylles ut.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/organisasjonsnummer",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi = ikke privatperson"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodebeskrivelse.Gyldig",
        "t": "Kodebeskrivelsen '{0}' stemmer ikke med den valgte kodeverdien for partstype. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodebeskrivelse"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodebeskrivelse.Utfylt",
        "t": "Når partstype er valgt, må kodebeskrivelse fylles ut. Du kan sjekke riktig kodebeskrivelse på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodebeskrivelse",
        "f": "/mottakerListe/beroertpartOgInteressentOgMyndighet/partstype/kodeverdi"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodeverdi.Gyldig",
        "t": "'{0}' er en ugyldig kodeverdi for partstype. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodeverdi"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodeverdi.KodelisteFinnes",
        "t": "Kodeverdien '{0}' ble ikke validert. Partstypen kan være riktig, men en teknisk feil gjør at vi ikke kan bekrefte det.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodeverdi"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'partstype' til den berørte parten, interessenten eller myndigheten må fylles ut. Du kan sjekke riktig kodeverdi på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype/kodeverdi"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Partstype.Utfylt",
        "t": "Du må oppgi partstypen for den berørte parten, interessenten eller myndigheten. Du kan sjekke gyldige partstyper på https://register.geonorge.no/byggesoknad/partstype",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/partstype"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodebeskrivelse.Utfylt",
        "t": "Når rolle er valgt for den berørte parten, interessenten eller myndigheten, bør kodebeskrivelse fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/rolle/kodebeskrivelse"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Kodeverdi.Utfylt",
        "t": "Kodeverdien for 'rolle' til den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/rolle/kodeverdi"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Rolle.Utfylt",
        "t": "Rollen til den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/rolle"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Telefon.Gyldig",
        "t": "Telefonnummeret til den berørte parten, interessenten eller myndigheten må kun inneholde tall og '+'.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/telefon"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Telefon.Utfylt",
        "t": "Telefonnummeret til den berørte parten, interessenten eller myndigheten bør fylles ut.",
        "r": "Advarsel",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}/telefon"
      },
      {
        "p": "MottakerListe.BeroertpartOgInteressentOgMyndighet.Utfylt",
        "t": "Du må fylle ut informasjon om den berørte parten, interessenten eller myndigheten.",
        "r": "Feil",
        "b": "mottakerListe/beroertpartOgInteressentOgMyndighet{0}"
      },
      {
        "p": "MottakerListe.Utfylt",
        "t": "Du må legge til minst én berørt part, interessent eller myndighet.",
        "r": "Feil",
        "b": "mottakerListe"
      }
    ]
  },
  {
    "g": "Vedlegg",
    "std": true,
    "rules": [
      {
        "p": "Vedlegg.KonsekvensutredningPlanbeskrivelse",
        "t": "Du har valgt at planforslaget utløser krav om konsekvensutredning. Da må du sende med vedlegget ‘Konsekvensutredning’ eller inkludere det i ‘Planbeskrivelse’.",
        "r": "Feil"
      },
      {
        "p": "Vedlegg.Planbeskrivelse",
        "t": "Du bør sende med vedlegget ‘Planbeskrivelse’. Hvis konsekvensutredningen er inkludert i planbeskrivelsen, må du sende med vedlegget.",
        "r": "Advarsel"
      },
      {
        "p": "Vedlegg.PlanbestemmelserPdf",
        "t": "Du bør sende med vedlegget ‘Planbestemmelser’ i lesbart format. Filnavnet skal skrives slik: planbestemmelse-{planidentifikasjon}-{versjon}.pdf/docx",
        "r": "Advarsel"
      },
      {
        "p": "Vedlegg.PlanbestemmelserXml",
        "t": "Du bør sende med vedlegget ‘Planbestemmelser’ i XML-format Filnavnet skal skrives slik: planbestemmelse-{planidentifikasjon}-{versjon}.xml",
        "r": "Advarsel"
      },
      {
        "p": "Vedlegg.Plankart2DGml",
        "t": "Du må sende med vedlegget ‘Plankart’ i 2D. Plankartet skal være i GML eller SOSI-format. Filnavnet skal skrives slik: plankart2d-{planidentifikasjon}-{versjon}-{vertikalnivå}-{vertikallag}.gml/.sos",
        "r": "Feil"
      },
      {
        "p": "Vedlegg.Plankart3DGml",
        "t": "Du bør sende med vedlegget ‘Plankart’ i 3D. Plankartet skal være i GML eller SOSI-format. Filnavnet skal skrives slik: plankart3d-{planidentifikasjon}-{versjon}-{vertikalnivå}-{vertikallag}.gml/.sos",
        "r": "Advarsel"
      },
      {
        "p": "Vedlegg.PlankartPdf",
        "t": "Du bør sende med vedlegget ‘Plankart’ i et lesbart format. Filnavnet skal skrives slik: plankart-{planidentifikasjon}-{versjon}-{vertikalnivå}-{vertikallag}.pdf",
        "r": "Advarsel"
      }
    ]
  }
];

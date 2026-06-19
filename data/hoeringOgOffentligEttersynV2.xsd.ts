// Kanonisk XSD-kilde for HoeringOgOffentligEttersyn V2 (vises i XSD-fanen med
// kopier/last ned). Egendefinerte modeller genererer XSD fra strukturen i stedet.
export const HOERING_XSD_FILE = "hoeringOgOffentligEttersynV2.xsd";
export const HOERING_XSD_NS = "https://skjema.ft.dibk.no/HoeringOgOffentligEttersyn/v2";
export const HOERING_XSD_SRC = `<?xml version="1.0" encoding="utf-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
		   xmlns="https://skjema.ft.dibk.no/HoeringOgOffentligEttersyn/v2"
		   targetNamespace="https://skjema.ft.dibk.no/HoeringOgOffentligEttersyn/v2"
		   elementFormDefault="qualified"
		   attributeFormDefault="unqualified">

	<xs:element name="HoeringOgOffentligEttersyn" type="HoeringOgOffentligEttersynType"/>

	<xs:complexType name="HoeringOgOffentligEttersynType">
		<xs:all>
			<xs:element name="hoeringstype" type="KodeType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="planprosessregel" type="KodeType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="mottakerliste" type="BeroertpartOgInteressentOgMyndighetListe" minOccurs="1" maxOccurs="1"/>
			<xs:element name="eiendommerSomInngaarIPlanomraadet" type="EiendomListe" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="eksisterendePlanerSomBeroeres" type="EksisterendePlanSomBeroeresListe" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="kommune" type="AktoerType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="forslagsstiller" type="AktoerType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="plankonsulent" type="AktoerType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="metadata" type="MetadataType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="planforslag" type="Arealplan" minOccurs="1" maxOccurs="1"/>
			<xs:element name="beskrivelseKartutsnitt" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="medvirkningIHoeringsperioden" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="planhensikt" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="tilgjengelighetEksemplar" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="fristForUttalelse" type="xs:dateTime" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="hjemmesidePlanforslag" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="kommunensSaksnummer" type="SaksnummerType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="beskrivelseVedtakOmHoeringOgOffentligEttersyn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
		<xs:attribute name="dataFormatProvider" type="xs:string" use="required" fixed="DIBK"/>
		<xs:attribute name="dataFormatId" type="xs:string" use="required" fixed="11002"/>
		<xs:attribute name="dataFormatVersion" type="xs:string" use="required" fixed="2"/>
	</xs:complexType>
	<xs:complexType name="KodeListe">
		<xs:sequence>
			<xs:element name="kode" type="KodeType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="KodeType">
		<xs:all>
			<xs:element name="kodeverdi" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="kodebeskrivelse" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="BeroertpartOgInteressentOgMyndighetListe">
		<xs:sequence>
			<xs:element name="beroertpartOgInteressentOgMyndighet" type="BeroertpartOgInteressentOgMyndighetType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="BeroertpartOgInteressentOgMyndighetType">
		<xs:all>
			<xs:element name="partstype" type="KodeType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="foedselsnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="organisasjonsnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="rolle" type="KodeType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="navn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="telefon" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="epost" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="adresse" type="EnkelAdresseType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="systemReferanse" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="gjelderEiendommer" type="GjelderEiendomListe" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="EiendomListe">
		<xs:sequence>
			<xs:element name="eiendom" type="EiendomType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="EiendomType">
		<xs:all>
			<xs:element name="eiendomsidentifikasjon" type="MatrikkelnummerType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="adresse" type="EiendommensAdresseType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="bygningsnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="bolignummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="kommunenavn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="EiendommensAdresseType">
		<xs:all>
			<xs:element name="adresselinje1" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="adresselinje2" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="adresselinje3" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="postnr" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="poststed" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="landkode" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="gatenavn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="husnr" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="bokstav" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="MetadataType">
		<xs:all>
			<xs:element name="fraSluttbrukersystem" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="ftbId" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="prosjektnavn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1" />
			<xs:element name="prosjektnr" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1" />
			<xs:element name="foretrukketSpraak" type="KodeType" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="AktoerType"> <!--PartType-->
		<xs:all>
			<xs:element name="partstype" type="KodeType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="foedselsnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="organisasjonsnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="navn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="adresse" type="EnkelAdresseType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="telefonnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="mobilnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="epost" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="kontaktperson" type="KontaktpersonType" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="KontaktpersonType">
		<xs:all>
			<xs:element name="navn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="tittel" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="telefonnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="mobilnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="epost" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="Arealplan"> <!--PlanType-->
		<xs:all>
			<xs:element name="plannavn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="nasjonalArealplanId" type="NasjonalArealplanIdType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="plantype" type="KodeType" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="SaksnummerType">
		<xs:all>
			<xs:element name="saksaar" type="xs:integer" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="sakssekvensnummer" type="xs:integer" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="EnkelAdresseType">
		<xs:all>
			<xs:element name="adresselinje1" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="adresselinje2" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="adresselinje3" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="postnr" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="poststed" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="landkode" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="GjelderEiendomListe">
		<xs:sequence>
			<xs:element name="gjeldereiendom" type="GjelderEiendomType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="GjelderEiendomType">
		<xs:all>
			<xs:element name="bolignummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="bygningsnummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="eiendomsidentifikasjon" type="MatrikkelnummerType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="adresse" type="EiendommensAdresseType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="kommunenavn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="EksisterendePlanSomBeroeresListe">
		<xs:sequence>
			<xs:element name="eksisterendePlanSomBeroeres" type="EksisterendePlanSomBeroeresType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
	</xs:complexType>
	<xs:complexType name="EksisterendePlanSomBeroeresType">
		<xs:all>
			<xs:element name="navn" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="plantype" type="KodeType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="nasjonalArealplanId" type="NasjonalArealplanIdType" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="beskrivelseAvFoelger" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="MatrikkelnummerType">
		<xs:all>
			<xs:element name="kommunenummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="gaardsnummer" type="xs:integer" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="bruksnummer" type="xs:integer" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="festenummer" type="xs:integer" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="seksjonsnummer" type="xs:integer" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
	<xs:complexType name="NasjonalArealplanIdType">
		<xs:all>
			<xs:element name="kommunenummer" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="landkode" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
			<xs:element name="planId" type="xs:string" nillable="true" minOccurs="0" maxOccurs="1"/>
		</xs:all>
	</xs:complexType>
</xs:schema>`;

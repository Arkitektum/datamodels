-- ====================================================================
-- STORAGE-HERDING — hindre at opplastede filer kan rendres som HTML
-- --------------------------------------------------------------------
-- Problemet: `lastOppFil` sendte `contentType: file.type`, altså en verdi
-- klienten bestemmer. En innlogget bruker kunne kalle Storage-API-et
-- direkte med `contentType: 'text/html'` (eller laste opp en SVG med
-- skript i), be om en signert URL, og få innholdet rendret inline på
-- prosjektets `*.supabase.co`-domene. Sesjonen i portalen er ikke i fare
-- (annet origin), men et troverdig domene som vert for phishing er det.
--
-- Klientfiksen alene er ikke nok — en angriper bruker ikke vår klient.
-- Derfor settes allowlisten på selve bucketet, der Storage håndhever den
-- uansett hvem som laster opp.
--
-- Storage sammenligner mot Content-Type-headeren, den snuser ikke på
-- innholdet. Det holder likevel: laster noen opp HTML-bytes merket som
-- application/pdf, blir de servert som PDF og kjører ikke som HTML. Det
-- er Content-Type som styrer om nettleseren rendrer noe.
--
-- Typene som bevisst IKKE står på lista:
--   text/html, application/xhtml+xml  – rendres og kjører skript
--   image/svg+xml                     – SVG kan inneholde <script>
--   text/javascript, application/javascript
--   application/xml, text/xml         – XML lagres som tekst i databasen
--                                       (kolonnen fil_tekst), aldri i Storage
--
-- Kjør denne patchen i Supabase (SQL Editor). Idempotent.
-- ====================================================================

update storage.buckets
   set public = false,
       file_size_limit = 52428800,   -- 50 MB
       allowed_mime_types = array[
           'application/pdf',
           -- tekstdokumenter
           'application/msword',
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
           'application/vnd.oasis.opendocument.text',
           'application/rtf',
           -- regneark og presentasjoner
           'application/vnd.ms-excel',
           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
           'application/vnd.oasis.opendocument.spreadsheet',
           'application/vnd.ms-powerpoint',
           'application/vnd.openxmlformats-officedocument.presentationml.presentation',
           -- bilder (uten svg)
           'image/png',
           'image/jpeg',
           'image/gif',
           'image/webp',
           'image/bmp',
           'image/tiff',
           -- inerte vedlegg
           'text/csv',
           'text/plain',
           'application/zip'
       ]
 where id = 'dokumenter';

-- Kontroll: skal gi én rad, med public = false og en ikke-tom liste.
-- select id, public, file_size_limit, allowed_mime_types
--   from storage.buckets where id = 'dokumenter';

# 3. Integracija Python API-ja z zalednim delom

## Opis
 
Član 3 je bil odgovoren za povezovanje posameznih delov sistema v delujočo celoto. Njegove naloge so zajemale:
 
* vzpostavitev Flask API strežnika za obdelavo slik,
* integracijo modela za detekcijo z zalednim delom,
* implementacijo Multer vmesnika za sprejem slik,
* pripravo usmerjevalnih poti v zalednem delu,
* pripravo Docker vsebnikov za vse dele sistema,
* povezavo mobilne aplikacije z zalednim delom.
---
 
## Mobilna aplikacija
 
Ker smo v sklopu projekta že implementirali zajem slik za naslovnice knjig in QR kode, smo obstoječo rešitev s CameraX knjižnico ponovno uporabili za zajem slik obraza. Namesto lokalnega procesiranja z ML Kit smo vsak zajet okvir pretvorili v JPEG bajte in jih poslali na zaledni del. Da ne bi pošiljali ogromno sličic na sekundo, smo dodali dušenje zahtev, tako da se slika pošlje le enkrat na nekaj sekund.
 
---
 
## Multer vmesnik
 
Na strani zalednega dela smo implementirali Multer vmesnik za sprejem slik iz mobilne aplikacije. Multer je Node.js vmesnik za obdelavo `multipart/form-data` zahtev, ki omogoča shranjevanje prejetih datotek na disk. Konfigurirali smo ga z `diskStorage`, ki sliko shrani na skupni volumen med zalednim delom in Python strežnikom:
 
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/ORV/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
```
 
S tem zaledni del spletne strani shrani sliko, python applikacija pa jo lahko prebere iz diska, brez potrebe po ponovnem prenašanju.
 
---
 
## Usmerjanje zahtev
 
V zalednem delu smo dodali novo pot za prijavo administratorja s sliko:
 
```javascript
router.post('/image-login', upload.single('image'), image_2FA);
```
 
Vmesnik `upload.single('image')` poskrbi, da Multer obdela sliko preden zahteva doseže funkcijo `image_2FA`. Funkcija nato pošlje pot do shranjene slike Python strežniku, preveri rezultat detekcije in vrne podatke o uporabniku, če je detekcija uspešna.
 
---
 
## Flask API strežnik
 
Za obdelavo slik smo implementirali datoteko `app.py`, ki uporablja knjižnico Flask za vzpostavitev strežnika, ki posluša na naslovu `0.0.0.0:5001`. Strežnik posluša na vseh omrežnih vmesnikih, ker teče znotraj Docker vsebnika, kjer privzeti naslov `127.0.0.1` ni dostopen iz drugih vsebnikov.
 
Ko `app.py` prejme zahtevo, pokliče model za detekcijo in vrne JSON objekt z naslednjimi atributi:
 
| Atribut | Opis |
|---|---|
| `success` | Ali je bila zahteva uspešno obdelana |
| `match` | Ali je bila detekcija uspešna |
| `confidence` | Stopnja zaupanja detekcije |
| `details` | Podrobnosti detekcije |
 
---
 
## Docker
 
Celoten sistem smo zapakirali v Docker vsebnike s pomočjo Docker Compose. Vsak del sistema teče v svojem vsebniku:
 
| Vsebnik | Tehnologija | Vrata |
|---|---|---|
| `flask` | Python / Flask | 5001 |
| `backend` | Node.js / Express | 5000 |
| `frontend` | React / Nginx | 3000 |
 
Za prenos slik med vsebnikoma `backend` in `flask` smo uporabili skupni Docker volumen `uploads`, na katerega zaledni del zapiše sliko, Python strežnik pa jo prebere neposredno iz iste lokacije.

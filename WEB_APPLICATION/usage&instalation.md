# BookBox – dokumentacija spletne aplikacije

## 1. Predstavitev aplikacije

**BookBox** je spletna aplikacija za pregledovanje in rezervacijo knjig v sistemu pametnega paketnika.

Uporabnik lahko prek spletne aplikacije:

* ustvari uporabniški račun;
* se prijavi v sistem;
* pregleda seznam knjig;
* odpre podrobnosti izbrane knjige;
* rezervira razpoložljivo knjigo;
* pregleda svoje podatke in rezervacije.

---

## 2. Dostop do spletne aplikacije

Spletne aplikacije ni treba nameščati na računalnik. Za uporabo potrebujete samo spletni brskalnik in povezavo do aplikacije.

### 2.1 Potrebščine

Za uporabo aplikacije potrebujete:

* računalnik, tablico ali telefon;
* spletni brskalnik, na primer Google Chrome, Microsoft Edge ali Mozilla Firefox;
* internetno povezavo oziroma povezavo z lokalnim omrežjem, v katerem je aplikacija dostopna.

### 2.2 Odpiranje aplikacije

1. Odprite spletni brskalnik.

2. Kliknite naslovno vrstico na vrhu brskalnika.

3. Vpišite povezavo do spletne aplikacije:

   ```text
   [TUKAJ VSTAVITE POVEZAVO DO SPLETNE APLIKACIJE]
   ```

4. Pritisnite tipko **Enter**.

5. Odpre se začetna stran aplikacije BookBox.

> Če aplikacija deluje samo v lokalnem omrežju, mora uporabnik uporabiti povezavo, ki jo poda skrbnik sistema. Primer lokalnega naslova:
>
> ```text
> http://192.168.1.25:3000
> ```
>Slednji IP naslov se poišče tako da v konzolo vpišete ukaz "ipconfig" in ga
poiščete pod "Wireless".
>

---

## 3. Uporaba spletne aplikacije

## 3.1 Registracija novega uporabnika

Če uporabniškega računa še nimate, ga morate najprej ustvariti.

### Postopek

1. Odprite spletno aplikacijo BookBox.
2. Izberite možnost **Registracija**.
3. Vnesite zahtevane osebne podatke.
4. Izberite geslo.
5. Potrdite registracijo.
6. Po uspešni registraciji se lahko prijavite v aplikacijo.

### Rezultat

Ustvarjen je nov uporabniški račun, s katerim lahko dostopate do funkcionalnosti aplikacije.

---

## 3.2 Prijava v aplikacijo

Za rezervacijo knjig morate biti prijavljeni.

### Postopek

1. Odprite spletno aplikacijo BookBox.
2. Izberite možnost **Prijava**.
3. Vnesite svoje uporabniške podatke.
4. Potrdite prijavo.

### Rezultat

Po uspešni prijavi lahko pregledujete knjige, ustvarjate rezervacije in dostopate do svojega uporabniškega profila.

---

## 3.3 Odjava iz aplikacije

Ko aplikacije ne uporabljate več, se lahko iz sistema odjavite.

### Postopek

1. Odprite svoj uporabniški profil.
2. Izberite možnost **Odjava**.

### Rezultat

Uporabniška seja se zaključi. Za ponovno uporabo funkcionalnosti, ki zahtevajo prijavo, se morate ponovno prijaviti.

---

## 4. Primeri uporabe

## 4.1 Primer uporabe: registracija in prijava uporabnika

### Namen

Nov uporabnik želi ustvariti račun in se prijaviti v sistem BookBox.

### Predpogoji

* Uporabnik ima dostop do spletne aplikacije.
* Uporabnik še nima ustvarjenega računa.

### Postopek

1. Uporabnik odpre spletno aplikacijo BookBox.
2. Izbere možnost **Registracija**.
3. V obrazec vnese zahtevane podatke.
4. Potrdi registracijo.
5. Nato izbere možnost **Prijava**.
6. Vnese svoje prijavne podatke.
7. Potrdi prijavo.

### Rezultat

Uporabnik je uspešno prijavljen in lahko uporablja funkcionalnosti spletne aplikacije.

---

## 4.2 Primer uporabe: pregled in rezervacija knjige

### Namen

Prijavljeni uporabnik želi poiskati in rezervirati razpoložljivo knjigo.

### Predpogoji

* Uporabnik je registriran.
* Uporabnik je prijavljen v aplikacijo.
* V sistemu obstaja vsaj ena razpoložljiva knjiga.

### Postopek

1. Uporabnik odpre seznam knjig.
2. Na seznamu poišče želeno knjigo.
3. Klikne na izbrano knjigo.
4. Pregleda podatke o knjigi.
5. Preveri, ali je knjiga na voljo.
6. Izbere možnost **Rezerviraj**.
7. Sistem prikaže potrdilo o uspešni rezervaciji.

### Rezultat

Izbrana knjiga je rezervirana za prijavljenega uporabnika.

---

## 5. Pogoste težave

## 5.1 Spletna stran se ne odpre

Preverite:

* ali ste pravilno vpisali povezavo;
* ali imate vzpostavljeno internetno povezavo;
* ali ste povezani v ustrezno lokalno omrežje;
* ali je strežnik aplikacije zagnan.

Če težava ostane, se obrnite na skrbnika sistema.

## 5.2 Prijava ne deluje

Preverite:

* ali ste pravilno vnesli uporabniške podatke;
* ali ste predhodno ustvarili uporabniški račun;
* ali ste pravilno vnesli geslo.

## 5.3 Knjige ni mogoče rezervirati

Knjige ni mogoče rezervirati, če je že rezervirana ali trenutno ni na voljo. V tem primeru izberite drugo knjigo oziroma poskusite pozneje.

---

## 6. Navodila za lokalni zagon spletne aplikacije

Ta razdelek je namenjen skrbniku sistema oziroma osebi, ki želi spletno aplikacijo zagnati na svojem računalniku.

### 6.1 Potrebna programska oprema

Pred zagonom morajo biti na računalniku nameščeni:

* [Node.js](https://nodejs.org/);
* [Git](https://git-scm.com/);
* spletni brskalnik;
* dostop do podatkovne baze MongoDB.

### 6.2 Prenos projekta

Odprite terminal oziroma ukazno vrstico in izvedite naslednje ukaze:

```bash
git clone [TUKAJ VSTAVITE POVEZAVO DO REPOZITORIJA]
cd PROJECT_PAMETNI_PAKETNIK
```

### 6.3 Nastavitev zalednega dela aplikacije

Odprite mapo zalednega dela spletne aplikacije:

```bash
cd WEB_APPLICATION/BookBox_WebApp/backend
```

Namestite potrebne knjižnice:

```bash
npm install
```

V mapi ustvarite datoteko `.env` in vanjo vstavite potrebne nastavitve za povezavo s podatkovno bazo.

Primer:

```env
MONGODB_URI=[POVEZAVA_DO_PODATKOVNE_BAZE]
SESSION_SECRET=[SKRIVNI_KLJUC]
PORT=3001
```

Zaženite zaledni del aplikacije:

```bash
npm start
```

### 6.4 Nastavitev uporabniškega vmesnika

Odprite nov terminal in pojdite v mapo uporabniškega vmesnika:

```bash
cd PROJECT_PAMETNI_PAKETNIK/WEB_APPLICATION/BookBox_WebApp/frontend
```

Namestite potrebne knjižnice:

```bash
npm install
```

Zaženite uporabniški vmesnik:

```bash
npm run dev
```

### 6.5 Odpiranje lokalne različice aplikacije

Po uspešnem zagonu odprite spletni brskalnik in obiščite naslov, ki se izpiše v terminalu.

Najpogosteje je to:

```text
http://localhost:5173
```

---

## 7. Kontakt in pomoč

V primeru težav se obrnite na skrbnika sistema oziroma razvojno skupino projekta BookBox.

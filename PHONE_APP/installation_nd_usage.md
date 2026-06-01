# BookBox – dokumentacija mobilne aplikacije

## 1. Predstavitev aplikacije

**BookBox** je mobilna aplikacija za naprave z operacijskim sistemom Android. Namenjena je uporabnikom sistema za izposojo knjig s pomočjo pametnega paketnika.

Aplikacija omogoča:

* pregled zemljevida paketnikov;
* pregled razpoložljivih knjig;
* pregled podrobnosti izbrane knjige;
* pregled uporabnikovih izposojenih oziroma rezerviranih knjig;
* dostop do uporabniškega profila;
* odpiranje ustreznega predala pametnega paketnika pri prevzemu knjige.

---

## 2. Namestitev mobilne aplikacije

Mobilna aplikacija BookBox je namenjena telefonom in tablicam z operacijskim sistemom Android.

Za običajno uporabo aplikacije uporabniku ni treba nameščati razvojnih orodij ali uporabljati emulatorja. Uporabnik potrebuje samo namestitveno datoteko `.apk`.

## 2.1 Orodja za uporabo

Za uporabo aplikacije potrebujete:

* telefon ali tablico z operacijskim sistemom Android;
* dostop do datoteke `BookBox.apk`;
* internetno povezavo oziroma povezavo z lokalnim omrežjem;
* po potrebi dovoljenje za dostop do lokacije.

## 2.2 Namestitev aplikacije iz datoteke APK

1. Prenesite datoteko:

   ```text
   BookBox.apk
   ```

2. Na telefonu odprite preneseno datoteko.

3. Če telefon prikaže opozorilo, da nameščanje aplikacij iz neznanih virov ni dovoljeno, odprite nastavitve telefona.

4. Omogočite namestitev aplikacij iz vira, iz katerega ste odprli datoteko, na primer iz brskalnika ali upravitelja datotek.

5. Ponovno odprite datoteko `BookBox.apk`.

6. Izberite možnost **Namesti**.

7. Po končani namestitvi izberite možnost **Odpri**.

Po uspešni namestitvi se ikona aplikacije BookBox prikaže med ostalimi aplikacijami na telefonu.

> Pri nekaterih različicah operacijskega sistema Android se lahko imena nastavitev nekoliko razlikujejo.

---

## 3. Prvi zagon aplikacije

Ob prvem zagonu aplikacije se prikaže začetni zaslon.

Če aplikacija zahteva dovoljenje za uporabo lokacije, izberite možnost **Dovoli**, saj je lokacija lahko potrebna za prikaz bližnjih paketnikov na zemljevidu.

Za uporabo nekaterih funkcionalnosti je potrebna tudi povezava s strežnikom aplikacije.

---

## 4. Uporaba aplikacije

## 4.1 Navigacija med zasloni

Na spodnjem delu aplikacije je navigacijska vrstica, prek katere lahko preklapljate med posameznimi zasloni.

Na voljo so naslednji zasloni:

* **Zemljevid** – prikaz lokacij paketnikov;
* **Seznam knjig** – pregled knjig, ki so na voljo v sistemu;
* **Scan QR** - za skeniranje QR kode paketnika;
* **Moje knjige** – pregled knjig, povezanih z uporabniškim računom;
* **Profil** – pregled uporabniških podatkov in dodatnih možnosti.

---

## 4.2 Pregled paketnikov na zemljevidu

### Namen

Uporabnik želi poiskati lokacijo paketnika.

### Postopek

1. Odprite aplikacijo BookBox.
2. V spodnji navigacijski vrstici izberite možnost **Zemljevid**.
3. Na zemljevidu preglejte prikazane lokacije paketnikov.
4. Izberite želeni paketnik za prikaz dodatnih informacij.

### Rezultat

Uporabnik vidi lokacijo paketnika in lahko ugotovi, kje lahko prevzame ali vrne knjigo.

---

## 4.3 Pregled knjig

### Namen

Uporabnik želi preveriti, katere knjige so na voljo.

### Postopek

1. Odprite aplikacijo BookBox.
2. V spodnji navigacijski vrstici izberite možnost **Seznam knjig**.
3. Preglejte prikazane knjige.
4. Izberite knjigo, ki vas zanima.
5. Odpre se zaslon s podrobnostmi izbrane knjige.

### Rezultat

Uporabnik vidi osnovne podatke o izbrani knjigi in njeno razpoložljivost.

---

## 4.4 Pregled svojih knjig

### Namen

Uporabnik želi pregledati knjige, ki jih ima rezervirane oziroma izposojene.

### Postopek

1. Odprite aplikacijo BookBox.
2. V spodnji navigacijski vrstici izberite možnost **Moje knjige**.
3. Preglejte prikazane knjige.
4. Izberite knjigo za prikaz dodatnih informacij.

### Rezultat

Uporabnik vidi pregled svojih aktivnih rezervacij oziroma izposoj.

---

## 4.5 Odpiranje predala paketnika

### Namen

Uporabnik želi prevzeti rezervirano knjigo iz pametnega paketnika.

### Predpogoji

* uporabnik ima aktivno rezervacijo;
* uporabnik se nahaja pri ustreznem paketniku;
* aplikacija je povezana s strežnikom;
* paketnik je dosegljiv.

### Postopek

1. Odprite aplikacijo BookBox.
2. Izberite zaslon **Moje knjige**.
3. Izberite rezervirano knjigo.
4. Izberite možnost za odpiranje predala.
5. Počakajte na potrditev aplikacije.
6. Prevzemite knjigo iz odprtega predala.
7. Zaprite predal paketnika.

### Rezultat

Predal paketnika se odpre, uporabnik pa lahko prevzame rezervirano knjigo.

> Če je funkcionalnost odpiranja predala v trenutni različici aplikacije samo simulirana, lahko v dokumentaciji napišete:
>
> *Aplikacija prikaže obvestilo o uspešnem odpiranju predala. V demonstracijski različici je odpiranje paketnika simulirano.*

---

## 5. Primeri uporabe

## 5.1 Primer uporabe: iskanje paketnika

### Namen

Uporabnik želi poiskati najbližji paketnik za prevzem knjige.

### Predpogoji

* aplikacija je nameščena;
* aplikacija ima dovoljenje za dostop do lokacije;
* uporabnik ima omogočeno internetno povezavo.

### Postopek

1. Uporabnik odpre aplikacijo BookBox.
2. Izbere zaslon **Zemljevid**.
3. Aplikacija prikaže lokacije paketnikov.
4. Uporabnik izbere želeni paketnik.
5. Aplikacija prikaže podatke o izbrani lokaciji.

### Rezultat

Uporabnik ugotovi, kje se nahaja paketnik za prevzem ali vračilo knjige.

---

## 5.2 Primer uporabe: prevzem rezervirane knjige

### Namen

Uporabnik želi prevzeti predhodno rezervirano knjigo.

### Predpogoji

* uporabnik je predhodno rezerviral knjigo;
* uporabnik se nahaja pri ustreznem paketniku;
* telefon je povezan z internetom oziroma lokalnim omrežjem.

### Postopek

1. Uporabnik odpre aplikacijo BookBox.
2. Izbere zaslon **Moje knjige**.
3. Na seznamu izbere rezervirano knjigo.
4. Izbere možnost za odpiranje predala.
5. Aplikacija pošlje zahtevo za odpiranje predala.
6. Uporabnik prevzame knjigo.
7. Uporabnik zapre predal.

### Rezultat

Knjiga je uspešno prevzeta iz paketnika.

---

## 6. Odstranitev aplikacije

Aplikacijo odstranite enako kot druge aplikacije na telefonu.

### Postopek

1. Odprite nastavitve telefona.
2. Izberite možnost **Aplikacije**.
3. Na seznamu poiščite aplikacijo **BookBox**.
4. Izberite aplikacijo.
5. Izberite možnost **Odstrani**.
6. Potrdite odstranitev.

---

## 7. Pogoste težave

## 7.1 Aplikacije ni mogoče namestiti

Preverite:

* ali uporabljate napravo z operacijskim sistemom Android;
* ali ste prenesli pravilno datoteko `.apk`;
* ali ste dovolili nameščanje aplikacij iz neznanih virov;
* ali imate na telefonu dovolj prostega prostora.

## 7.2 Aplikacija ne prikaže paketnikov

Preverite:

* ali je omogočena internetna povezava;
* ali ima aplikacija dovoljenje za dostop do lokacije;
* ali je v telefonu vklopljena lokacija;
* ali je strežnik aplikacije zagnan.

## 7.3 Aplikacija se ne poveže s strežnikom

Če aplikacijo uporabljate v lokalnem omrežju, preverite:

* ali sta telefon in računalnik povezana v isto omrežje Wi-Fi;
* ali je strežnik zagnan;
* ali je v aplikaciji nastavljen pravilen IP-naslov računalnika;
* ali se je IP-naslov računalnika od zadnjega zagona spremenil.

## 7.4 Predala ni mogoče odpreti

Preverite:

* ali imate aktivno rezervacijo;
* ali ste izbrali pravo knjigo;
* ali je paketnik dosegljiv;
* ali je aplikacija povezana s strežnikom.

Če težava ostane, se obrnite na skrbnika sistema.

---

## 8. Navodila za lokalni zagon mobilne aplikacije

Ta razdelek je namenjen skrbniku sistema oziroma osebi, ki želi mobilno aplikacijo zagnati iz izvorne kode.

## 8.1 Potrebna programska oprema

Pred zagonom morajo biti na računalniku nameščeni:

* [Android Studio](https://developer.android.com/studio);
* Git;
* ustrezna različica JDK;
* Android emulator ali fizični telefon z omogočenim razvijalskim načinom;
* strežnik spletne aplikacije oziroma zaledni del sistema.

## 8.2 Prenos projekta

Odprite terminal in izvedite:

```bash
git clone [TUKAJ VSTAVITE POVEZAVO DO REPOZITORIJA]
cd PROJECT_PAMETNI_PAKETNIK
```

## 8.3 Odpiranje projekta

1. Odprite program Android Studio.

2. Izberite možnost **Open**.

3. Izberite mapo mobilne aplikacije:

   ```text
   Phone_App
   ```

4. Počakajte, da Android Studio naloži projekt in namesti potrebne odvisnosti.

## 8.4 Nastavitev povezave s strežnikom

Če aplikacija uporablja lokalni strežnik, preverite naslov zalednega dela aplikacije.

Primer naslova:

```text
http://192.168.1.25:3001
```

IP-naslov mora ustrezati računalniku, na katerem je zagnan strežnik.

> Pri uporabi fizičnega telefona naslov `localhost` ne deluje, saj bi se nanašal na telefon in ne na računalnik. Uporabiti morate lokalni IP-naslov računalnika.

## 8.5 Zagon na emulatorju

1. V Android Studiu odprite upravitelja naprav.
2. Izberite obstoječi emulator ali ustvarite novega.
3. Zaženite emulator.
4. Kliknite gumb **Run**.
5. Aplikacija se namesti in odpre v emulatorju.

## 8.6 Zagon na fizičnem telefonu

1. Na telefonu omogočite razvijalski način.
2. Omogočite možnost **USB debugging**.
3. Telefon povežite z računalnikom prek kabla USB.
4. Na telefonu potrdite dovoljenje za povezavo z računalnikom.
5. V Android Studiu izberite telefon kot ciljno napravo.
6. Kliknite gumb **Run**.

Aplikacija se namesti in odpre na telefonu.

---

## 9. Priprava namestitvene datoteke APK

Ta razdelek je namenjen razvojni skupini.

Za lažjo namestitev aplikacije na telefonu pripravite datoteko `.apk`.

V programu Android Studio:

1. Odprite projekt.

2. V zgornjem meniju izberite:

   ```text
   Build → Build App Bundles or APKs → Build APKs
   ```

3. Po končanem postopku Android Studio prikaže povezavo do ustvarjene datoteke.

4. Datoteko preimenujte v:

   ```text
   BookBox.apk
   ```

5. Datoteko posredujte uporabniku oziroma profesorju.

---

## 10. Kontakt in pomoč

V primeru težav se obrnite na skrbnika sistema oziroma razvojno skupino projekta BookBox.

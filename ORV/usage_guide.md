# BookBox – dokumentacija modula računalniškega vida

## 1. Predstavitev modula

Modul računalniškega vida je izdelan v programskem jeziku Python. Njegov namen je samodejna razpoznava vrste sadja na sliki.

Program prejme fotografijo sadja, jo obdela in določi, kateri skupini pripada prikazano sadje.

Podprti razredi so:

* **jabolko**;
* **banana**;
* **pomaranča**.

Modul je namenjen demonstraciji uporabe računalniškega vida in strojnega učenja pri razvrščanju slik.

---

## 2. Način delovanja

Postopek razpoznave poteka v več korakih:

1. uporabnik programu poda sliko;
2. program sliko prebere;
3. sliko prilagodi na zahtevano velikost;
4. iz slike izlušči značilnosti;
5. naučeni klasifikator določi najverjetnejši razred;
6. uporabniku se izpiše rezultat.

Primer rezultata:

```text
Prepoznano sadje: banana
```

---

## 3. Priprava slik

Za boljše rezultate naj fotografija vsebuje predvsem eno vrsto sadja.

Priporočljivo je, da:

* je sadje jasno vidno;
* slika ni zamegljena;
* je na fotografiji dovolj svetlobe;
* sadje ni prekrito z drugimi predmeti;
* je ozadje čim manj moteče.

Program zna obdelati slike različnih velikosti. Pred razpoznavo jih samodejno prilagodi na enotno velikost.

Če slika nima ustreznega razmerja stranic, program doda črn rob, da se slika ne popači.

---

## 4. Uporaba modula

Modul je konzolni program. To pomeni, da uporabnik izbere sliko, rezultat pa se izpiše v terminalu oziroma ukazni vrstici.

## 4.1 Osnovni postopek

1. Zaženite program.
2. Vnesite pot do slike oziroma izberite sliko iz pripravljene mape.
3. Počakajte, da program obdela fotografijo.
4. Preglejte izpisano napoved.

Primer:

```text
Vnesite pot do slike: slike/test/banana_01.jpg
Prepoznano sadje: banana
```

---

## 5. Primeri uporabe

## 5.1 Primer uporabe: prepoznava jabolka

### Namen

Uporabnik želi preveriti, ali program pravilno prepozna fotografijo jabolka.

### Predpogoji

* program je nameščen oziroma pripravljen za zagon;
* uporabnik ima fotografijo jabolka;
* slika je shranjena v podprtem formatu, na primer `.jpg`, `.jpeg` ali `.png`.

### Postopek

1. Uporabnik zažene program.

2. Programu poda pot do fotografije jabolka:

   ```text
   slike/test/jabolko_01.jpg
   ```

3. Program sliko prebere in obdela.

4. Program izvede razvrščanje slike.

5. V terminalu se izpiše rezultat.

### Pričakovani rezultat

```text
Prepoznano sadje: jabolko
```

---

## 5.2 Primer uporabe: prepoznava banane

### Namen

Uporabnik želi preveriti, ali program pravilno prepozna fotografijo banane.

### Predpogoji

* program je pripravljen za zagon;
* uporabnik ima fotografijo banane;
* fotografija je dovolj jasna.

### Postopek

1. Uporabnik zažene program.

2. Programu poda pot do fotografije:

   ```text
   slike/test/banana_01.jpg
   ```

3. Program sliko obdela.

4. Program določi najverjetnejši razred.

5. Rezultat se izpiše v terminalu.

### Pričakovani rezultat

```text
Prepoznano sadje: banana
```

---

## 5.3 Primer uporabe: prepoznava pomaranče

### Namen

Uporabnik želi preveriti, ali program pravilno prepozna fotografijo pomaranče.

### Postopek

1. Uporabnik zažene program.

2. Programu poda pot do fotografije:

   ```text
   slike/test/pomaranca_01.jpg
   ```

3. Program sliko obdela.

4. Program izpiše napoved.

### Pričakovani rezultat

```text
Prepoznano sadje: pomaranča
```

---

## 6. Lokalni zagon programa

Ta razdelek je namenjen osebi, ki želi modul zagnati iz izvorne kode.

## 6.1 Potrebna programska oprema

Pred zagonom mora biti na računalniku nameščeno:

* [Python](https://www.python.org/) različice 3.10 ali novejše;
* [Git](https://git-scm.com/);
* terminal oziroma ukazna vrstica.

## 6.2 Prenos projekta

Odprite terminal in izvedite:

```bash
git clone [https://github.com/Projekt-Direct4me-Paketnik-Smarties/Pametni-Paketnik-Smarties]
cd PROJECT_PAMETNI_PAKETNIK
```

Nato odprite mapo modula računalniškega vida:

```bash
cd ORV
```

---

## 6.3 Ustvarjanje virtualnega okolja

Priporočljivo je, da za namestitev knjižnic uporabite virtualno okolje.

### Windows

```powershell
python -m venv venv
venv\Scripts\activate
```

### Linux ali macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 6.4 Namestitev knjižnic

Če je v mapi pripravljena datoteka `requirements.txt`, namestite potrebne knjižnice z ukazom:

```bash
pip install -r requirements.txt
```

Če datoteke še ni, jo lahko razvojna skupina ustvari z ukazom:

```bash
pip freeze > requirements.txt
```

Med uporabljenimi knjižnicami so lahko na primer:

* `opencv-python`;
* `numpy`;
* `scikit-learn`;
* `matplotlib`;
* `joblib`.

> Seznam mora ustrezati knjižnicam, ki jih dejansko uporablja projekt.

---

## 6.5 Zagon programa

Program zaženite z ukazom:

```bash
python [IME_GLAVNE_SKRIPTE].py
```

Primer:

```bash
python main.py
```

Če program sprejme pot do slike kot argument, ga zaženite na primer tako:

```bash
python main.py slike/test/banana_01.jpg
```

---

## 7. Učenje modela

Ta razdelek je namenjen razvojni skupini.

Za ponovno učenje modela uporabite pripravljeno skripto:

```bash
python [IME_SKRIPTE_ZA_UCENJE].py
```

Primer:

```bash
python train.py
```

Podatkovna zbirka mora vsebovati ločene mape za posamezne razrede:

```text
dataset/
├── train/
│   ├── jabolko/
│   ├── banana/
│   └── pomaranca/
└── test/
    ├── jabolko/
    ├── banana/
    └── pomaranca/
```

Program pri učenju uporabi slike iz mape `train`, pri preverjanju uspešnosti pa slike iz mape `test`.

---

## 8. Struktura map

Primer strukture modula:

```text
ORV/
├── dataset/
│   ├── train/
│   └── test/
├── slike/
├── models/
├── main.py
├── train.py
├── requirements.txt
└── README.md
```

Pomen posameznih map:

* `dataset/` – slike za učenje in preverjanje modela;
* `slike/` – dodatne slike za ročno testiranje;
* `models/` – shranjeni naučeni modeli;
* `main.py` – glavna skripta za razpoznavo slike;
* `train.py` – skripta za učenje modela;
* `requirements.txt` – seznam potrebnih knjižnic.

> Strukturo map prilagodite dejanski strukturi vašega projekta.

---

## 9. Pogoste težave

## 9.1 Program ne najde slike

Preverite:

* ali ste vnesli pravilno pot;
* ali slika obstaja;
* ali uporabljate podprt format slike;
* ali je ime datoteke pravilno zapisano.

Primer pravilne poti:

```text
slike/test/banana_01.jpg
```

---

## 9.2 Manjka knjižnica

Če se pojavi napaka, kot je:

```text
ModuleNotFoundError
```

namestite manjkajoče knjižnice:

```bash
pip install -r requirements.txt
```

---

## 9.3 Rezultat ni pravilen

Klasifikator ne more vedno pravilno določiti vrste sadja.

Na rezultat lahko vplivajo:

* slaba osvetlitev;
* zamegljena fotografija;
* več različnih vrst sadja na isti sliki;
* zelo nenavadno ozadje;
* premajhen ali delno zakrit predmet;
* prenizka kakovost slike.

Za boljši rezultat uporabite jasno fotografijo, na kateri je sadje dobro vidno.

---

## 9.4 Program ne najde shranjenega modela

Preverite:

* ali je bil model predhodno naučen;
* ali obstaja datoteka modela;
* ali je pot do datoteke pravilno nastavljena.

Če model še ne obstaja, ponovno zaženite skripto za učenje:

```bash
python train.py
```

---

## 10. Omejitve modula

Program je namenjen razpoznavanju treh vrst sadja:

* jabolka;
* banane;
* pomaranče.

Program ni namenjen prepoznavanju drugih predmetov ali vrst sadja.

Če uporabnik programu poda sliko drugega predmeta, bo program kljub temu poskusil izbrati enega izmed podprtih razredov. Rezultat v takem primeru ni zanesljiv.

---

## 11. Kontakt in pomoč

V primeru težav se obrnite na razvojno skupino projekta BookBox.

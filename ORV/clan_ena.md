# Projekt ORV – Klasifikacija sadja

## 1. Opis projekta

Cilj projektne naloge je razvoj aplikativnega sistema, ki s pomočjo računalniškega vida prepozna vrsto sadja na vhodni sliki.

Za rešitev problema smo izbrali pristop **klasifikacije slik**, saj želimo vsako vhodno sliko razvrstiti v enega izmed naslednjih razredov:

* `pomaranca`
* `jabolko`
* `banana`
* `ozadje`

Razred `ozadje` predstavlja slike, na katerih ni nobenega izmed treh izbranih sadežev. S tem omogočimo, da sistem prepozna tudi primer, ko na vhodni sliki ni relevantnega objekta.

Osnovni potek sistema je:

```txt
vhodna slika → model za klasifikacijo → napovedan razred
```

Primer rezultata:

```txt
pomaranca
```

---

## 2. Prispevek člana 1

Član 1 je bil odgovoren za pripravo podatkovnega dela projekta. Njegove naloge so zajemale:

* zbiranje in izbor slik sadja,
* pripravo strukture podatkovne množice,
* razvrščanje slik po razredih,
* predobdelavo slik,
* implementacijo lastnih postopkov augmentacije,
* pripravo učne, validacijske in testne množice,
* pripravo dokumentacije za uporabo skript.

Za vsak razred je bila pripravljena kombinacija različnih vrst slik:

* slike posameznega sadeža na enostavnem ozadju,
* slike več sadežev skupaj,
* slike sadežev v gajbicah oziroma realnem okolju,
* lastne fotografije, zajete s telefonom,
* slike različnih ozadij brez sadja.

Pri izboru slik smo upoštevali različne kote zajema, svetlobne pogoje, oddaljenost objekta od kamere in različna ozadja. S tem smo želeli zmanjšati verjetnost, da bi se model naučil prepoznavati samo idealne fotografije sadežev na belem ozadju.

---

## 3. Struktura projekta

```txt
ORV/
├── dataset/
│   ├── raw/
│   │   ├── banana/
│   │   ├── jabolko/
│   │   ├── ozadje/
│   │   └── pomaranca/
│   │
│   ├── processed/
│   │   └── all/
│   │       ├── banana/
│   │       ├── jabolko/
│   │       ├── ozadje/
│   │       └── pomaranca/
│   │
│   ├── augmented/
│   │   ├── banana/
│   │   ├── jabolko/
│   │   ├── ozadje/
│   │   └── pomaranca/
│   │
│   └── final/
│       ├── train/
│       │   ├── banana/
│       │   ├── jabolko/
│       │   ├── ozadje/
│       │   └── pomaranca/
│       ├── val/
│       │   ├── banana/
│       │   ├── jabolko/
│       │   ├── ozadje/
│       │   └── pomaranca/
│       └── test/
│           ├── banana/
│           ├── jabolko/
│           ├── ozadje/
│           └── pomaranca/
│
├── scripts/
│   ├── preprocess_images.py
│   ├── augment_images.py
│   └── split_dataset.py
│
├── README.md
└── .gitignore
```

---

## 4. Priprava podatkovne množice

Originalne slike so razvrščene po razredih in shranjene v mapi:

```txt
dataset/raw/
```

Vsaka podmapa predstavlja en razred:

```txt
dataset/raw/banana/
dataset/raw/jabolko/
dataset/raw/pomaranca/
dataset/raw/ozadje/
```

Slike v razredu `ozadje` ne vsebujejo banan, jabolk ali pomaranč. Vključujejo različne predmete in prizore, na primer mizo, tipkovnico, zvezek, tla, stol ali prazno kuhinjsko površino.

---

## 5. Predobdelava slik

Za predobdelavo slik se uporablja skripta:

```txt
scripts/preprocess_images.py
```

Skripta izvede naslednje korake:

1. prebere vse slike iz mape `dataset/raw`,
2. ohrani razmerje med širino in višino slike,
3. spremeni velikost slike na `224 × 224` slikovnih pik,
4. po potrebi doda črne robove,
5. shrani obdelane slike v mapo `dataset/processed/all`.

Črni robovi se uporabijo zato, da se pri spreminjanju velikosti slike sadeži ne raztegnejo oziroma popačijo.

Zagon skripte:

```bash
py scripts\preprocess_images.py
```

Na sistemih, kjer se Python zažene z ukazom `python`, se lahko uporabi:

```bash
python scripts/preprocess_images.py
```

---

## 6. Augmentacija podatkov

Za povečanje podatkovne množice se uporablja skripta:

```txt
scripts/augment_images.py
```

Skripta iz vsake obdelane vhodne slike ustvari več različic:

* originalno obdelano sliko,
* sliko, rotirano za `+10°`,
* sliko, rotirano za `-10°`,
* svetlejšo različico,
* temnejšo različico,
* rahlo zamegljeno različico.

Z augmentacijo povečamo število učnih primerov in izboljšamo robustnost modela. Model se tako lažje prilagodi različnim pogojem zajema slik, na primer spremembam svetlobe, manj ostrim fotografijam in manjšim spremembam položaja objekta.

Zagon skripte:

```bash
py scripts\augment_images.py
```

Augmentirane slike se shranijo v mapo:

```txt
dataset/augmented/
```

---

## 7. Delitev podatkov na učni, validacijski in testni del

Za pripravo končne podatkovne množice se uporablja skripta:

```txt
scripts/split_dataset.py
```

Podatki se naključno razdelijo v tri skupine:

| Množica | Delež podatkov | Namen                          |
| ------- | -------------: | ------------------------------ |
| `train` |           70 % | učenje modela                  |
| `val`   |           15 % | preverjanje modela med učenjem |
| `test`  |           15 % | končno testiranje modela       |

Zagon skripte:

```bash
py scripts\split_dataset.py
```

Končni podatki se shranijo v mapo:

```txt
dataset/final/
```

Član, ki implementira model za klasifikacijo, uporablja naslednje poti:

```txt
dataset/final/train/
dataset/final/val/
dataset/final/test/
```

---

## 8. Vrstni red zagona skript

Pred prvim zagonom je treba namestiti potrebne Python pakete:

```bash
py -m pip install opencv-python numpy
```

Nato se skripte zaženejo v naslednjem vrstnem redu:

```bash
py scripts\preprocess_images.py
py scripts\augment_images.py
py scripts\split_dataset.py
```

Po uspešnem zagonu zadnje skripte je podatkovna množica pripravljena za učenje modela.

---

## 9. Uporaba sistema za verzioniranje kode

Pri razvoju projekta uporabljamo sistem Git.

Prispevek člana 1 je razviden iz zgodovine repozitorija. Med drugim vključuje:

* dodajanje začetne strukture podatkovne množice,
* dodajanje originalnih slik,
* implementacijo skripte za predobdelavo,
* implementacijo skripte za augmentacijo,
* implementacijo skripte za razdelitev podatkov,
* pripravo dokumentacije.

Primeri ustreznih commit sporočil:

```txt
Add initial fruit image dataset
Add image preprocessing script
Add image augmentation script
Add dataset split script
Add ORV dataset documentation
```

---

## 10. Datoteke, ki se ne shranjujejo v repozitorij

Datoteka `.gitignore` vsebuje:

```gitignore
__pycache__/
*.pyc
.env
venv/
*.zip
```

S tem preprečimo shranjevanje nepotrebnih datotek, virtualnega Python okolja, nastavitev iz datoteke `.env` in velikih ZIP arhivov.

---

## 11. Nadaljnje delo

Po pripravi podatkov se projekt nadaljuje z implementacijo modela za klasifikacijo slik.

Model bo uporabljal končno podatkovno množico iz mape:

```txt
dataset/final/
```

Po učenju bo model vključen v širši aplikativni sistem, kjer bo lahko na podlagi prejete slike vrnil napovedan razred sadja.

# Član 2: Razvoj in učenje modela za prepoznavo pomaranče

## Zakaj model namesto cv2 algoritmov

Sprva sem razmišljal, da bi prepoznavo pomaranče naredil zgolj z osnovnimi `cv2`
funkcijami (npr. iskanje oranžnih krogov preko barvnih mask in Hough transformacij).
Hitro se je izkazalo, da ta pristop ni zanesljiv:

- pomaranče imajo poleg barve in oblike tudi izrazito teksturo (luknjičava lupina),
  kar en sam algoritem za zaznavo "oranžnega kroga" ne zajame,
- prsti, ki med slikanjem pogosto pridejo v kader, lahko po barvi in obliki
  zavedejo enostaven algoritem,
- potreboval sem rešitev, ki posplošuje na različne kote, osvetlitve in ozadja.

Zato sem se odločil za nevronsko mrežo (CNN), ki se nauči relevantnih značilk
sama, namesto da bi jih ročno definiral.

Prvi poskus je bil lasten, plitek model (3 konvolucijski sloji). Ta se je izkazal
za premalo zmogljivega — ni dosegal zadovoljive natančnosti in se je slabo
posploševal na nove slike. Zamenjal sem ga s prednaučenim **ResNet18**
(`torchvision.models.resnet18`, uteži `IMAGENET1K_V1`), kjer sem zamenjal le
zadnji polno povezani sloj (`model.fc`) za 4 razrede. S tem modelom je bilo mogoče
v učenje vključiti bistveno več slik (augmentirane, obdelane in surove), rezultati
pa so bistveno boljši.

## Delo na `train_orange_classifier.py`

Skripta poskrbi za celoten proces učenja modela:

1. **Augmentacija in normalizacija** – za učno množico (`TRAIN_TRANSFORMS`) so
   dodane naključne obrezave, zrcaljenja, rotacije in spremembe svetlosti/
   kontrasta/nasičenosti/odtenka, kar modelu pomaga, da se ne nauči na pamet, ampak
   posploši. Validacijska in testna množica (`VAL_TEST_TRANSFORMS`) gresta skozi
   le pretvorbo v tenzor in normalizacijo po ImageNet statistikah
   (`mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`), kar je
   pričakovana normalizacija za prednaučen ResNet18.

2. **Združevanje podatkovnih virov** – učna množica je sestavljena iz več
   direktorijev (`final/train`, `augmented`, `processed`) preko `ConcatDataset`,
   da je modelu na voljo čim več raznolikih primerov.

3. **Uravnoteženje razredov** – ker so razredi neenakomerno zastopani, so
   izračunane uteži po metodi obratne frekvence (`class_weights`) in posredovane
   v `nn.CrossEntropyLoss(weight=...)`, da redkejši razredi (npr. banana, jabolko)
   ne bodo zanemarjeni.

4. **Model, optimizator in učna zanka** – uporabljen je prednaučen `resnet18`
   z zamenjanim zadnjim slojem za 4 razrede, optimizator `Adam`
   (`lr=1e-4`, `weight_decay=1e-5`) in `CrossEntropyLoss`. Funkciji `train_epoch`
   in `validate` izvajata po eno epoho učenja oz. validacije in vrneta povprečno
   izgubo ter natančnost. Po vsaki epohi se shrani stanje modela z najboljšo
   validacijsko natančnostjo (`best_model_state`).

6. **Testiranje in shranjevanje** – po koncu učenja se naloži najboljše stanje
   modela, izvede se ovrednotenje na testni množici (`test_model`) z izračunom
   natančnosti, preciznosti, priklica, F1 ter matrike zmede in poročila po
   razredih. Naučeni model se shrani v `models/orange_classifier.pth`, rezultati
   učenja (hiperparametri, zgodovina izgub/natančnosti, testni rezultati) pa v
   `models/training_results.json`. Na koncu se izrišeta in shranita grafa
   izgube in natančnosti skozi epohe (`training_history.png`).

Učenje je potekalo na GPU (`torch.device("cuda")`, `cudnn.benchmark = True`),
kar je bistveno pospešilo proces glede na velikost podatkovne množice.

## Delo na `detect_orange.py`

Ta skripta uporablja naučen model za sklepanje (inference) v okviru
dvofaktorske avtentikacije:

1. **`OrangeDetector`** – naloži arhitekturo `resnet18` (brez prednaučenih
   uteži, `weights=None`), ji ponovno zamenja zadnji sloj na 4 razrede in nato
   naloži shranjeno stanje (`state_dict`) iz `orange_classifier.pth`. Model se
   prestavi na GPU/CPU in postavi v način ovrednotenja (`model.eval()`).

2. **Pot slike skozi model (`detect`)**:
   - slika se prebere s `cv2.imread`,
   - pretvori se iz BGR v RGB (OpenCV bere v BGR, model pa pričakuje RGB,
     enako kot pri učenju),
   - prevzorči se na 224x224 (`IMG_SIZE`), enako velikost kot pri učenju,
   - pretvori se v `PIL.Image` in nato preko enakih transformacij kot pri
     validaciji/testiranju (`ToTensor` + normalizacija po ImageNet statistikah)
     v tenzor,
   - doda se dodatna dimenzija za serijo (`unsqueeze(0)`) in tenzor se prenese
     na napravo (GPU/CPU),
   - model v načinu `torch.no_grad()` vrne logite, ki se s `softmax` pretvorijo
     v verjetnosti za vse 4 razrede.

3. **Odločitev** – preveri se, ali je razred z najvišjo verjetnostjo
   "pomaranca" (`orange_idx = 1`) in ali zaupanje (verjetnost tega razreda)
   presega prag (`confidence_threshold`). Če oboje drži, je rezultat
   "ORANGE DETECTED - LOGIN APPROVED", sicer "NOT ORANGE - LOGIN REJECTED".

4. **`two_factor_authentication`** – ovije klic `detect` v poskusni blok in
   vrne strukturiran rezultat (uspešnost, avtentikacija, sporočilo, zaupanje,
   podrobnosti), primeren za uporabo v drugih delih aplikacije (npr. backend API).

5. **`live_webcam_detection`** – enak postopek (BGR→RGB, resize, normalizacija,
   napoved) izvaja v živo nad slikami iz spletne kamere in v realnem času
   izpisuje, ali je zaznana pomaranča in s kakšnim zaupanjem. Namenjen je bil testiranju.

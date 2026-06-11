# Améliorations prévues

## 1. Luminosité minimale au démarrage

Au lancement de l'application, la luminosité de l'écran part automatiquement au niveau le plus bas (valeur proche de 0) sans que l'utilisateur ait besoin de baisser le slider manuellement dans le noir.

**Fichiers concernés :** `App.tsx` — initialiser `brightness` à une valeur basse (ex. `0.05`) et appeler `Brightness.setBrightness()` dans le premier `useEffect`.

---

## 2. Garder l'écran allumé pendant l'enregistrement

Empêcher l'écran de s'éteindre automatiquement lorsqu'un enregistrement est en cours, pour ne pas rater une partie du concert.

**Implémentation :** Module natif `android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON` activé au début de l'enregistrement et désactivé à l'arrêt. Ou via le package `@sayem314/react-native-keep-awake`.

**Fichiers concernés :** `BrightnessModule.kt` (ajout de `setKeepScreenOn(bool)`), `NativeBrightness.ts`, `App.tsx`.

---

## 3. Assombrir automatiquement l'écran au début de l'enregistrement

Dès que l'utilisateur appuie sur le bouton rouge pour démarrer l'enregistrement, la luminosité descend automatiquement à un niveau très bas (ex. `0.05`). L'utilisateur peut toujours la remonter manuellement avec le slider si besoin.

**Fichiers concernés :** `App.tsx` — ajouter `handleBrightnessChange(0.05)` au début de `startRecording()`.

# CamGig

Application Android pour enregistrer des vidéos en appuyant sur un bouton rouge.

Développée en React Native avec [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera).

## Prérequis

- Node.js 22+
- JDK 17 ou 18
- Android SDK (`ANDROID_HOME` configuré)
- Un appareil Android connecté en USB (débogage activé) ou un émulateur

## Installation

```bash
npm install
```

## Développement

Démarrer le bundler Metro :
```bash
npm start
```

Compiler et installer sur l'appareil (dans un second terminal) :
```bash
npm run android
```

## Build APK

**Debug** (rapide) :
```bash
cd android && ./gradlew assembleDebug
```
→ `android/app/build/outputs/apk/debug/app-debug.apk`

**Release** :
```bash
cd android && ./gradlew assembleRelease
```
→ `android/app/build/outputs/apk/release/app-release.apk`

## Utilisation

1. Lancer l'application
2. Accorder les permissions caméra et microphone au premier démarrage
3. Sur Android 11+, accorder la permission « Accès à tous les fichiers » pour sauvegarder dans Téléchargements
4. Appuyer sur le **bouton rouge** pour démarrer l'enregistrement
5. Appuyer à nouveau pour arrêter — le chemin du fichier `.mp4` s'affiche

## Fonctionnalités

### Enregistrement vidéo
- Bouton rouge central pour démarrer/arrêter l'enregistrement
- Vidéo sauvegardée automatiquement dans le dossier Téléchargements sous le nom `camgig_YYYYMMDD_HHMMSS.mp4`
- Audio inclus
- Indicateur REC en haut à gauche pendant l'enregistrement

### Gestion de la luminosité
- Slider pour régler la luminosité de 0 % (noir total) à 100 %
- À luminosité zéro, un calque noir recouvre l'écran mais le bouton reste visible (cercle gris)
- La barre de navigation Android (retour/accueil/multitâche) suit aussi la luminosité

### Comportements automatiques pour le concert
- Luminosité minimale (5 %) dès le lancement de l'app
- Assombrissement automatique à 5 % dès que l'enregistrement démarre
- Écran toujours allumé pendant l'enregistrement (`FLAG_KEEP_SCREEN_ON`), désactivé à l'arrêt
- Le bouton d'enregistrement et ses icônes s'assombrissent avec le slider pour ne pas trahir votre présence dans le noir

### Interface adaptative
- Mode portrait : slider en haut, bouton en bas
- Mode paysage : bouton ancré à droite, nom du fichier affiché en bas à gauche

### Permissions gérées
- Caméra et microphone demandés au premier lancement
- Sur Android 11+, invite à accorder l'accès à tous les fichiers pour sauvegarder dans Téléchargements

## Permissions requises

| Permission | Utilisation |
|---|---|
| `CAMERA` | Preview et enregistrement vidéo |
| `RECORD_AUDIO` | Audio dans les vidéos |
| `WRITE_EXTERNAL_STORAGE` | Sauvegarde (Android ≤ 9) |
| `READ_MEDIA_VIDEO` | Accès aux vidéos (Android 13+) |
| `MANAGE_EXTERNAL_STORAGE` | Sauvegarde dans Téléchargements (Android 11+) |

## Architecture

- **`App.tsx`** — composant unique : preview caméra, permissions, enregistrement, slider, gestion orientation
- **`src/NativeBrightness.ts`** — wrapper TypeScript du module natif
- **`android/…/BrightnessModule.kt`** — module Kotlin : luminosité de la fenêtre, keep-screen-on, chemin Téléchargements, permission stockage
- **`android/…/BrightnessPackage.kt`** — enregistrement du module dans React Native

## Dépendances principales

| Package | Version | Rôle |
|---|---|---|
| `react-native` | 0.86.0 | Framework |
| `react-native-vision-camera` | ^5.0.11 | Caméra et enregistrement vidéo |
| `react-native-nitro-modules` | ^0.35.9 | Moteur de liaison natif (requis par vision-camera v5) |
| `react-native-nitro-image` | ^0.15.1 | Types d'images (requis par vision-camera v5) |
| `@react-native-community/slider` | ^4.x | Composant slider pour la luminosité |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CamGig** — Application React Native Android pour enregistrer des vidéos via un bouton rouge.

## Commands

```bash
# Installer les dépendances
npm install

# Lancer le bundler Metro
npm start

# Compiler et déployer sur Android (appareil ou émulateur connecté)
npx react-native run-android

# Build APK release
cd android && ./gradlew assembleRelease

# Tests
npm test

# TypeScript check
npx tsc --noEmit
```

## Architecture

- **`App.tsx`** — Composant unique contenant toute la logique : preview caméra, gestion permissions, enregistrement vidéo.
- **`react-native-vision-camera`** — Bibliothèque caméra (v5). Gère le preview, `startRecording()` / `stopRecording()`, et retourne le chemin du fichier vidéo enregistré.
- **`android/app/src/main/AndroidManifest.xml`** — Permissions déclarées : `CAMERA`, `RECORD_AUDIO`, `WRITE_EXTERNAL_STORAGE` (≤ API 28), `READ_MEDIA_VIDEO`.

## Camera API key points (v5)

- `useCameraDevice('back')` retourne le device caméra arrière.
- `useCameraPermission()` / `useMicrophonePermission()` — hooks pour demander les permissions au runtime.
- `useVideoOutput({ enableAudio: true })` crée l'output vidéo ; à passer au composant Camera via `outputs={[videoOutput]}`.
- `videoOutput.createRecorder({})` crée une instance `Recorder` (une par enregistrement).
- `recorder.startRecording(onFinished, onError)` — `onFinished` reçoit `(filePath: string, reason)`, pas un objet.
- `recorder.stopRecording()` arrête l'enregistrement ; déclenche `onFinished`.
- Le `Recorder` ne peut enregistrer qu'une seule fois ; créer un nouveau pour chaque enregistrement.

## Android environment

- `ANDROID_HOME=/home/util01/Android/Sdk`
- Java 18 (`/usr/bin/java`)
- `minSdkVersion` / `targetSdkVersion` définis dans `android/build.gradle`

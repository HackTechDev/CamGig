import React, {useRef, useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  StatusBar,
  Alert,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  useVideoOutput,
  type Recorder,
} from 'react-native-vision-camera';
import Brightness from './src/NativeBrightness';

export default function App() {
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;

  const {hasPermission: hasCameraPermission, requestPermission: requestCamera} =
    useCameraPermission();
  const {hasPermission: hasMicPermission, requestPermission: requestMic} =
    useMicrophonePermission();

  const device = useCameraDevice('back');
  const videoOutput = useVideoOutput({enableAudio: true});
  const recorderRef = useRef<Recorder | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0.5);
  const downloadsPathRef = useRef<string | null>(null);

  // Initialisation : luminosité + permission stockage + chemin téléchargements
  useEffect(() => {
    Brightness.getBrightness()
      .then(val => setBrightness(val))
      .catch(() => {});

    Brightness.hasStoragePermission().then(granted => {
      if (!granted) {
        Alert.alert(
          'Permission stockage',
          'Pour sauvegarder dans Téléchargements, autorisez l\'accès à tous les fichiers.',
          [
            {text: 'Plus tard', style: 'cancel'},
            {
              text: 'Autoriser',
              onPress: () => Brightness.requestStoragePermission(),
            },
          ],
        );
      }
    });

    Brightness.getDownloadsPath()
      .then(path => {
        downloadsPathRef.current = path;
      })
      .catch(() => {});
  }, []);

  const ensurePermissions = useCallback(async () => {
    if (!hasCameraPermission) {
      const ok = await requestCamera();
      if (!ok) {
        Alert.alert('Permission refusée', 'La caméra est nécessaire.');
        return false;
      }
    }
    if (!hasMicPermission) {
      const ok = await requestMic();
      if (!ok) {
        Alert.alert('Permission refusée', 'Le microphone est nécessaire.');
        return false;
      }
    }
    return true;
  }, [hasCameraPermission, hasMicPermission, requestCamera, requestMic]);

  const buildFilePath = useCallback(() => {
    const base = downloadsPathRef.current;
    if (!base) return undefined;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp =
      `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
      `_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `${base}/camgig_${stamp}.mp4`;
  }, []);

  const startRecording = useCallback(async () => {
    const ok = await ensurePermissions();
    if (!ok) return;

    try {
      const filePath = buildFilePath();
      const recorder = await videoOutput.createRecorder(
        filePath ? {filePath} : {},
      );
      recorderRef.current = recorder;
      const name = recorder.filePath.split('/').pop() ?? recorder.filePath;
      setFileName(name);
      setIsRecording(true);

      await recorder.startRecording(
        (path, _reason) => {
          recorderRef.current = null;
          setIsRecording(false);
          const n = path.split('/').pop() ?? path;
          setFileName(n);
          Alert.alert('Vidéo enregistrée', `Sauvegardée dans :\n${path}`);
        },
        error => {
          recorderRef.current = null;
          setIsRecording(false);
          Alert.alert('Erreur', error.message);
        },
      );
    } catch (e: any) {
      setIsRecording(false);
      Alert.alert('Erreur', e.message);
    }
  }, [ensurePermissions, buildFilePath, videoOutput]);

  const stopRecording = useCallback(async () => {
    try {
      await recorderRef.current?.stopRecording();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  }, []);

  const handleButtonPress = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleBrightnessChange = useCallback((val: number) => {
    setBrightness(val);
    Brightness.setBrightness(val);
  }, []);

  if (!device) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.message}>Aucune caméra disponible</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={isLandscape} barStyle="light-content" backgroundColor="#000" />

      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        outputs={[videoOutput]}
      />

      {/* Calque noir — opacité inverse de la luminosité */}
      <View
        style={[StyleSheet.absoluteFill, {backgroundColor: '#000', opacity: 1 - brightness}]}
        pointerEvents="none"
      />

      {/* Indicateur REC */}
      {isRecording && (
        <View style={styles.recBadge}>
          <View style={styles.recDot} />
          <Text style={styles.recText}>REC</Text>
        </View>
      )}

      {/* Slider de luminosité */}
      <View
        style={[
          styles.brightnessBar,
          isLandscape ? styles.brightnessBarLandscape : styles.brightnessBarPortrait,
        ]}>
        <Text style={styles.brightnessIcon}>🔅</Text>
        <Slider
          style={styles.brightnessSlider}
          value={brightness}
          onValueChange={handleBrightnessChange}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          minimumTrackTintColor="#FFD700"
          maximumTrackTintColor="rgba(255,255,255,0.35)"
          thumbTintColor="#FFD700"
        />
        <Text style={styles.brightnessIcon}>🔆</Text>
      </View>

      {/* Nom du fichier — paysage uniquement */}
      {isLandscape && fileName && (
        <View style={styles.fileNameBar}>
          <Text style={styles.fileNameText} numberOfLines={1}>
            {fileName}
          </Text>
        </View>
      )}

      {/* Bouton d'enregistrement */}
      <SafeAreaView
        style={[styles.controls, isLandscape && styles.controlsLandscape]}>
        <TouchableOpacity
          style={[styles.button, isRecording && styles.buttonRecording]}
          onPress={handleButtonPress}
          activeOpacity={0.8}>
          {isRecording ? (
            <View style={styles.stopIcon} />
          ) : (
            <View style={styles.recordIcon} />
          )}
        </TouchableOpacity>
        <Text style={styles.hint}>
          {isRecording ? 'Arrêter' : 'Enregistrer'}
        </Text>
      </SafeAreaView>
    </View>
  );
}

const SLIDER_TOP = 64; // décalé sous la caméra de face

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  message: {
    color: '#fff',
    fontSize: 16,
  },

  // REC badge
  recBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  recDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E00',
    marginRight: 6,
  },
  recText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Slider de luminosité
  brightnessBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 10,
    top: SLIDER_TOP,
  },
  brightnessBarPortrait: {
    right: 16,
    left: 16,
  },
  brightnessBarLandscape: {
    right: 110,
    left: 16,
  },
  brightnessSlider: {
    flex: 1,
    height: 36,
  },
  brightnessIcon: {
    fontSize: 16,
    marginHorizontal: 2,
  },

  // Nom du fichier (paysage)
  fileNameBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 110,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fileNameText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'monospace',
  },

  // Bouton d'enregistrement
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 32,
  },
  controlsLandscape: {
    bottom: 0,
    top: 0,
    left: 'auto',
    right: 16,
    width: 90,
    justifyContent: 'center',
    paddingBottom: 0,
  },
  button: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E00',
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  buttonRecording: {
    backgroundColor: '#900',
  },
  recordIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  hint: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

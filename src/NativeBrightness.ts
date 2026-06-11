import {NativeModules} from 'react-native';

const {BrightnessModule} = NativeModules as {
  BrightnessModule: {
    setBrightness(value: number): void;
    getBrightness(): Promise<number>;
    getDownloadsPath(): Promise<string>;
    hasStoragePermission(): Promise<boolean>;
    requestStoragePermission(): void;
    setKeepScreenOn(enabled: boolean): void;
  };
};

export default BrightnessModule;

import {NativeModules} from 'react-native';

const {BrightnessModule} = NativeModules as {
  BrightnessModule: {
    setBrightness(value: number): void;
    getBrightness(): Promise<number>;
    getDownloadsPath(): Promise<string>;
    hasStoragePermission(): Promise<boolean>;
    requestStoragePermission(): void;
  };
};

export default BrightnessModule;

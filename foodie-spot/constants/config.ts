import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ENV = {
    development: {
        get API_URL() {
            // On web the browser and server share the same machine → localhost always works.
            if (Platform.OS === 'web') return 'http://localhost:4000/';

            // On a physical device/emulator, derive the host from the Expo dev-server URI.
            const hostUri =
                Constants.expoConfig?.hostUri ??
                (Constants as any).manifest?.debuggerHost ??
                (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
            const host = hostUri ? hostUri.split(':')[0] : '10.116.1.229';
            return `http://${host}:4000/`;
        },
    },
    staging: {
        API_URL: 'https://staging-api.foodie-spot.com/api',
    },
    production: {
        API_URL: 'https://api.foodie-spot.com/api',
    },
};

const getEnvVars = () => {
    const releaseChannel = Constants.expoConfig?.extra?.releaseChannel || 'development';
    if (releaseChannel === 'production') {
        return ENV.production;
    } else if (releaseChannel === 'staging') {
        return ENV.staging;
    } else {
        return ENV.development; 
    }
};

export default getEnvVars();


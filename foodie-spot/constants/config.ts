import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ENV = {
    development: {
        API_URL: '',
    },
    staging: {
        API_URL: 'https://staging-api.foodie-spot.com/api',
    },
    production: {
        API_URL: 'https://api.foodie-spot.com/api',
    },
};

const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const getHostFromExpo = () => {
    const hostUri =
        Constants.expoConfig?.hostUri ||
        (Constants as any).manifest?.hostUri ||
        (Constants as any).manifest2?.extra?.expoClient?.hostUri;
    if (!hostUri) return null;
    const cleaned = hostUri.replace(/^[a-z]+:\/\//i, '').split('/')[0];
    const host = cleaned.split(':')[0];
    return host || null;
};

const getDevApiUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) return ensureTrailingSlash(envUrl);

    const extraUrl =
        Constants.expoConfig?.extra?.apiUrl ||
        (Constants as any).manifest?.extra?.apiUrl ||
        (Constants as any).manifest2?.extra?.apiUrl;
    if (extraUrl) return ensureTrailingSlash(extraUrl);

    const host = getHostFromExpo();
    if (host) return `http://${host}:4000/`;

    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:4000/';
    }
    return 'http://localhost:4000/';
};

const getEnvVars = () => {
    const releaseChannel = Constants.expoConfig?.extra?.releaseChannel || 'development';
    if (releaseChannel === 'production') {
        return ENV.production;
    } else if (releaseChannel === 'staging') {
        return ENV.staging;
    } else {
        return { ...ENV.development, API_URL: getDevApiUrl() }; 
    }
};

export default getEnvVars();

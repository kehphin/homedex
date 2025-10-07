
interface AppConfig {
    appHost: string;
    stripePublicKey: string;
}

const config: AppConfig = {
    appHost: process.env.REACT_APP_HOST || 'http://localhost',
    stripePublicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || '',
};


export function getConfigValue<K extends keyof AppConfig>(key: K): NonNullable<AppConfig[K]> {
    const value = config[key];
    if (value === undefined || value === null || value === '') {
        throw new Error(`Missing required configuration value: ${key}`);
    }
    return value;
}


export { config };
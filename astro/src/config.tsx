
interface AppConfig {
    appHost: string;
    stripePublicKey: string;
}

const config: AppConfig = {
    appHost: import.meta.env.PUBLIC_ASTRO_DOMAIN || 'http://localhost',
    stripePublicKey: import.meta.env.PUBLIC_STRIPE_PUBLIC_KEY || '',
};


export function getConfigValue<K extends keyof AppConfig>(key: K): NonNullable<AppConfig[K]> {
    const value = config[key];
    if (value === undefined || value === null || value === '') {
        throw new Error(`Missing required configuration value: ${key}`);
    }
    return value;
}


export { config };
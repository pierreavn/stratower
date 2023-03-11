import { config as env } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { LoggerService } from "../logger/logger.service.ts";
import { ProvidersService } from "../providers/providers.service.ts";
import { Config, ConfigCluster } from "./config.interfaces.ts";

/**
 * Configuration service
 */
export class ConfigService {
    static readonly VERSION = '1.0.0';

    static config: Config;
    static isValid = false;
    static error: string | null = null;

    /**
     * Load configuration
     */
    static load(): void {
        LoggerService.info(`Loading configuration`);
        const clustersVar = ConfigService.getEnvVar('CLUSTERS');
        if (!clustersVar) {
            return ConfigService.setInvalid('Missing STRATOWER_CLUSTERS env variable');
        }

        ConfigService.config = {
            clusters: [],
        };

        // Parse clusters
        for (const clusterKey of clustersVar.split(',')) {
            const providerKey = ConfigService.getEnvVar('PROVIDER', clusterKey);
            const provider = ProvidersService.get(providerKey!);
            if (!provider) {
                return ConfigService.setInvalid(`Invalid STRATOWER_${clusterKey}_PROVIDER`);
            }

            const cluster: ConfigCluster = {
                key: clusterKey,
                provider,
                name: ConfigService.getEnvVar('NAME', clusterKey) ?? clusterKey,
                icon: ConfigService.getEnvVar('ICON', clusterKey),
                config: {},
            };

            // Load cluster config
            for (const item of provider.config) {
                const value = ConfigService.getEnvVar(item.key, clusterKey);
                if (!value && item.required) {
                    return ConfigService.setInvalid(`Missing STRATOWER_${clusterKey}_${item.key}`);
                }

                if (value) {
                    cluster.config[item.key] = value;
                }
            }

            ConfigService.config.clusters.push(cluster);
        }

        if (ConfigService.config.clusters.length === 0) {
            return ConfigService.setInvalid(`No clusters found!`);
        }

        ConfigService.isValid = true;
        LoggerService.info(`${ConfigService.config.clusters.length} cluster(s) found!`);
    }

    /**
     * Get port from environment variable
     * @returns 
     */
    static getPort(): number | undefined {
        const port = parseInt(env()[`PORT`]);
        return isNaN(port) ? undefined : port;
    }

    /**
     * Get value of environment variable
     * @param key 
     * @param clusterKey 
     * @returns 
     */
    private static getEnvVar(key: string, clusterKey?: string): string | undefined {
        return env()[`STRATOWER_${clusterKey ? `${clusterKey}_` : ''}${key}`];
    }

    /**
     * Mark configuration as invalid
     * @param error 
     */
    private static setInvalid(error: string): void {
        ConfigService.config.clusters = [];
        ConfigService.isValid = false;
        ConfigService.error = error;
        LoggerService.error(`Invalid configuration:`, error);
    }
}

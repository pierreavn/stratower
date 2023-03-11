import { ConfigCluster } from "../config/config.interfaces.ts";

export interface Provider {
    readonly key: string;
    readonly name: string;
    readonly config: ProviderConfig[];

    getClusterResources(cluster: ConfigCluster): Promise<unknown>;
}

export interface ProviderConfig {
    key: string;
    required?: boolean;
}

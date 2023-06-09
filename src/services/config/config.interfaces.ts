import { Provider } from "../providers/providers.interfaces.ts";

export type Config = {
    version: string;
    clusters: ConfigCluster[];
}

export type ConfigCluster = {
    key: string;
    provider: Provider;
    name: string;
    icon?: string;
    config: Record<string, string>;
};

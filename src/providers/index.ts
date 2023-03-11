import { ScalewayProvider } from "./scaleway/scaleway.ts";

/**
 * List of available providers
 */
export const PROVIDERS = [
    new ScalewayProvider(),
];

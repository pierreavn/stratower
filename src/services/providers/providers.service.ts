
import { PROVIDERS } from "../../providers/index.ts";
import { Provider } from "./providers.interfaces.ts";

/**
 * Providers Service
 */
export class ProvidersService {
    /**
     * Get provider by key
     * @param providerKey 
     * @returns 
     */
    static get(providerKey: string): Provider | undefined {
        return PROVIDERS.find(provider => provider.key === providerKey);
    }
}

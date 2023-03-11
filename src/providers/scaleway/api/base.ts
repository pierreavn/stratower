import { ConfigCluster } from "../../../services/config/config.interfaces.ts";
import { ScalewayApiRequestOptions, ScalewayPricing } from "../interfaces.ts";
import Pricing from "../pricing.json" assert { type: "json" };

export class ScalewayApi {
    static readonly HOSTNAME = "https://api.scaleway.com";

    static readonly REGIONS = [
        "fr-par",
        "nl-ams",
        "pl-waw",
    ];

    static readonly ZONES = [
        "fr-par-1",
        "fr-par-2",
        "fr-par-3",
        "nl-ams-1",
        "pl-waw-1",
    ];

    constructor(protected cluster: ConfigCluster) {}

    protected readonly pricing = Pricing as ScalewayPricing;

    /**
     * Do GET request to the Scaleway API
     * @param endpoint 
     * @returns 
     */
    public request = async <T = unknown>(endpoint: string, options?: ScalewayApiRequestOptions): Promise<T> => {
        const init: RequestInit = {
            method: 'GET',
            headers: {
                'X-Auth-Token': this.cluster.config['AUTH_TOKEN'],
            }
        };

        // Append organization ID
        if (options?.withOrganizationId) {
            endpoint += `?organization_id=${this.cluster.config['ORGANIZATION_ID']}`;
        }

        const res = await fetch(`${ScalewayApi.HOSTNAME}${endpoint}`, init);

        if (res.status !== 200) {
            console.error(await res.json());
            throw new Error("Failed to execute GET request");
        }

        return res.json() as T;
    }

    /**
     * Do GET request to the Scaleway API on all zones
     * @param endpoint 
     * @returns 
     */
    public requestAllZones = async <T = unknown>(endpoint: string, options?: ScalewayApiRequestOptions): Promise<Record<string, T>> => {
        const requests = await Promise.all(
            ScalewayApi.ZONES.map(zone => this.request(endpoint.replaceAll("{zone}", zone), options))
        );

        const response: Record<string, T> = {};
        requests.forEach((request, i) => {
            const zone = ScalewayApi.ZONES[i];
            response[zone] = request as T;
        });

        return response;
    }
}

import { ScalewayResource, ScalewayResourceType } from "../interfaces.ts";
import { ScalewayApi } from "./base.ts";

export interface ScalewayServerlessFunction {
    id: string;
    name: string;
    description: string;
    region: string;
    namespace_id: string;
    min_scale: number;
    max_scale: number;
    memory_limit: number;
    cpu_limit: number;
    status: 'unknown' | 'ready' | 'deleting' | 'error' | 'locked' | 'created' | 'pending';
}

export interface ScalewayServerlessFunctionNamespace {
    id: string;
    name: string;
    organization_id: string;
    project_id: string;
}

export class ScalewayApiServerlessFunctions extends ScalewayApi {
    /**
     * Fetch all Scaleway serverless functions
     */
    public fetchServerlessFunctions = async (): Promise<ScalewayResource[]> => {
        const namespaces = await this.fetchNamespaces();
        const functions = await this.requestAllRegions<{ functions: ScalewayServerlessFunction[] }>("/functions/v1beta1/regions/{region}/functions?per_page=100");

        const data: ScalewayResource[] = [];

        for (const region in functions) {
            functions[region].functions.forEach((fn: ScalewayServerlessFunction) => {
                const parsedFunction = this.parseFunction(fn);
                const namespace = namespaces.find(namespace => namespace.id === fn.namespace_id);
                if (namespace) {
                    parsedFunction.projectId = namespace.project_id;
                }

                data.push(parsedFunction);
            });
        }

        return data;
    }

    /**
     * Fetch serverless functions namespaces
     */
    protected fetchNamespaces = async (): Promise<ScalewayServerlessFunctionNamespace[]> => {
        const response = await this.requestAllRegions<{ namespaces: ScalewayServerlessFunctionNamespace[] }>("/functions/v1beta1/regions/{region}/namespaces?per_page=100");
        const namespaces: ScalewayServerlessFunctionNamespace[] = [];

        for (const region in response) {
            response[region].namespaces.forEach((namespace) => namespaces.push(namespace));
        }

        return namespaces;
    }

    /**
     * Parse serverless function to Scaleway Resource
     * @param fn 
     */
    protected parseFunction = (fn: ScalewayServerlessFunction): ScalewayResource => {
        const pricePer100ms = this.pricing.serverless.functions[fn.memory_limit] ?? null;
        const pricePerHour = pricePer100ms !== null ? pricePer100ms * 10 * 3_600 : null;
        const quantity = fn.status === 'ready';

        return {
            id: fn.id,
            type: ScalewayResourceType.SERVERLESS_FUNCTION,
            zone: fn.region,
            name: fn.name,
            projectId: "",
            description: fn.description,
            unitPricePerHour: pricePerHour,
            quantity,
            unit: null,
            parentId: null,
            totalPricePerHour: pricePerHour !== null ? (quantity ? pricePerHour : 0) : null,
        };
    }
}

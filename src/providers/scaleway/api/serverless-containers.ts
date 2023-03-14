import { ScalewayResource, ScalewayResourceType } from "../interfaces.ts";
import { ScalewayApi } from "./base.ts";

export interface ScalewayServerlessContainer {
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

export interface ScalewayServerlessContainerNamespace {
    id: string;
    name: string;
    organization_id: string;
    project_id: string;
}

export class ScalewayApiServerlessContainers extends ScalewayApi {
    /**
     * Fetch all Scaleway serverless containers
     */
    public fetchServerlessContainers = async (): Promise<ScalewayResource[]> => {
        const namespaces = await this.fetchNamespaces();
        const containers = await this.requestAllRegions<{ containers: ScalewayServerlessContainer[] }>("/containers/v1beta1/regions/{region}/containers?per_page=100");

        const data: ScalewayResource[] = [];

        for (const zone in containers) {
            containers[zone].containers.forEach((container: ScalewayServerlessContainer) => {
                const parsedContainer = this.parseContainer(container);
                const namespace = namespaces.find(namespace => namespace.id === container.namespace_id);
                if (namespace) {
                    parsedContainer.projectId = namespace.project_id;
                }

                data.push(parsedContainer);
            });
        }

        return data;
    }

    /**
     * Fetch serverless containers namespaces
     */
    protected fetchNamespaces = async (): Promise<ScalewayServerlessContainerNamespace[]> => {
        const response = await this.requestAllRegions<{ namespaces: ScalewayServerlessContainerNamespace[] }>("/containers/v1beta1/regions/{region}/namespaces?per_page=100");
        const namespaces: ScalewayServerlessContainerNamespace[] = [];

        for (const region in response) {
            response[region].namespaces.forEach((namespace) => namespaces.push(namespace));
        }

        return namespaces;
    }

    /**
     * Parse serverless container to Scaleway Resource
     * @param container 
     */
    protected parseContainer = (container: ScalewayServerlessContainer): ScalewayResource => {
        const pricePer100ms = this.pricing.serverless.containers[container.memory_limit] ?? null;
        const pricePerHour = pricePer100ms !== null ? pricePer100ms * 10 * 3_600 : null;
        const quantity = container.status === 'ready' ? Math.max(container.min_scale, 1) : false;

        return {
            id: container.id,
            type: ScalewayResourceType.SERVERLESS_CONTAINER,
            zone: container.region,
            name: container.name,
            projectId: "",
            description: container.description,
            unitPricePerHour: pricePerHour,
            quantity,
            unit: null,
            parentId: null,
            totalPricePerHour: pricePerHour !== null ? (quantity ? pricePerHour * quantity : 0) : null,
        };
    }
}

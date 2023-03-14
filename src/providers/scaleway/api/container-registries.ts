import { ScalewayResource, ScalewayResourceType } from "../interfaces.ts";
import { ScalewayApi } from "./base.ts";

export interface ScalewayContainerRegistry {
    id: string;
    name: string;
    description: string;
    project_id: string;
    size: number;
    region: string;
}

export class ScalewayApiContainerRegistries extends ScalewayApi {
    /**
     * Fetch all Scaleway container registries
     */
    public fetchContainerRegistries = async (): Promise<ScalewayResource[]> => {
        const registries = await this.requestAllRegions<{ namespaces: ScalewayContainerRegistry[] }>("/registry/v1/regions/{region}/namespaces?per_page=100");
        const data: ScalewayResource[] = [];

        for (const zone in registries) {
            registries[zone].namespaces.forEach((registry: ScalewayContainerRegistry) => data.push(this.parseRegistry(registry)));
        }

        return data;
    }

    /**
     * Parse container registry to Scaleway Resource
     * @param registry 
     */
    protected parseRegistry = (registry: ScalewayContainerRegistry): ScalewayResource => {
        const pricePerGbPerHour = this.pricing.containerRegistry;
        const quantityInGb = registry.size / 1_000_000_000;
        const quantity = Math.round(100 * quantityInGb) / 100;
        const totalPricePerHour = pricePerGbPerHour * quantityInGb;

        return {
            id: registry.id,
            type: ScalewayResourceType.CONTAINER_REGISTRY,
            zone: registry.region,
            name: registry.name,
            projectId: registry.project_id,
            description: registry.description,
            unitPricePerHour: pricePerGbPerHour,
            quantity,
            unit: "Gb",
            parentId: null,
            totalPricePerHour,
        };
    }
}

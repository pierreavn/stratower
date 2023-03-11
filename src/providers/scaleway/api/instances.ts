import { ScalewayResource, ScalewayResourceType } from "../interfaces.ts";
import { ScalewayApi } from "./base.ts";

export interface ScalewayInstance {
    id: string;
    name: string;
    zone: string;
    project: string;
    commercial_type: string;
    state: 'running' | 'stopped' | 'stopped in place' | 'starting' | 'stopping' | 'locked';
}

export class ScalewayApiInstances extends ScalewayApi {
    /**
     * Fetch all Scaleway instances
     */
    public fetchInstances = async (): Promise<ScalewayResource[]> => {
        const instances = await this.requestAllZones<{ servers: ScalewayInstance[] }>("/instance/v1/zones/{zone}/servers?per_page=100");

        const data: ScalewayResource[] = [];

        for (const zone in instances) {
            instances[zone].servers.forEach((instance: ScalewayInstance) => data.push(this.parseInstance(instance)));
        }

        return data;
    }

    /**
     * Parse instance to Scaleway Resource
     * @param instance 
     */
    protected parseInstance = (instance: ScalewayInstance): ScalewayResource => {
        const pricePerHour = this.pricing.instances[instance.commercial_type] ?? null;
        const quantity = (instance.state !== 'stopped' && instance.state !== 'stopped in place' ? true : false);

        return {
            id: instance.id,
            type: ScalewayResourceType.INSTANCE,
            zone: instance.zone,
            name: instance.name,
            projectId: instance.project,
            description: `${instance.commercial_type}`,
            unitPricePerHour: pricePerHour,
            quantity,
            unit: null,
            parentId: null,
            totalPricePerHour: pricePerHour !== null ? (quantity ? pricePerHour : 0) : null,
        };
    }
}

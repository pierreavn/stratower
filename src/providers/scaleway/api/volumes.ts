import { ScalewayResource, ScalewayResourceType } from "../interfaces.ts";
import { ScalewayApi } from "./base.ts";

export interface ScalewayVolume {
    id: string;
    name: string;
    zone: string;
    volume_type: "l_ssd" | "b_ssd" | "unified";
    project: string;
    server: { id: string; name: string } | null;
    size: number;
}

export class ScalewayApiVolumes extends ScalewayApi {
    /**
     * Fetch all Scaleway volumes
     */
    public fetchVolumes = async (): Promise<ScalewayResource[]> => {
        const volumes = await this.requestAllZones<{ volumes: ScalewayVolume[] }>("/instance/v1/zones/{zone}/volumes?per_page=100");
        const data: ScalewayResource[] = [];

        for (const zone in volumes) {
            volumes[zone].volumes.forEach((volume: ScalewayVolume) => data.push(this.parseVolume(volume)));
        }

        return data;
    }

    /**
     * Parse volume to Scaleway Resource
     * @param volume 
     */
    protected parseVolume = (volume: ScalewayVolume): ScalewayResource => {
        const quantity = Math.round(100 * volume.size / 1_000_000_000) / 100;

        let pricePerGbPerHour: number | null = null;
        switch (volume.volume_type) {
            case 'b_ssd':
                pricePerGbPerHour = this.pricing.storage.block;
                break;

            case 'l_ssd':
            case 'unified':
                pricePerGbPerHour = this.pricing.storage.local;
                break;
        }

        return {
            id: volume.id,
            type: ScalewayResourceType.VOLUME,
            zone: volume.zone,
            name: volume.name,
            projectId: volume.project,
            description: `${volume.volume_type}`,
            unitPricePerHour: pricePerGbPerHour,
            quantity,
            unit: "Gb",
            parentId: volume.server ? volume.server.id : null,
            totalPricePerHour: pricePerGbPerHour !== null ? pricePerGbPerHour * quantity : null,
        };
    }
}

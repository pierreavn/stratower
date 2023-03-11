import { ScalewayResource, ScalewayResourceType } from "../interfaces.ts";
import { ScalewayApi } from "./base.ts";

export interface ScalewaySnapshot {
    id: string;
    name: string;
    zone: string;
    volume_type: "l_ssd" | "b_ssd" | "unified";
    project: string;
    base_volume: { id: string; name: string } | null;
    size: number;
}

export class ScalewayApiSnapshots extends ScalewayApi {
    /**
     * Fetch all Scaleway snapshots
     */
    public fetchSnapshots = async (): Promise<ScalewayResource[]> => {
        const snapshots = await this.requestAllZones<{ snapshots: ScalewaySnapshot[] }>("/instance/v1/zones/{zone}/snapshots?per_page=100");
        const data: ScalewayResource[] = [];

        for (const zone in snapshots) {
            snapshots[zone].snapshots.forEach((snapshot: ScalewaySnapshot) => data.push(this.parseSnapshot(snapshot)));
        }

        return data;
    }

    /**
     * Parse snapshot to Scaleway Resource
     * @param snapshot 
     */
    protected parseSnapshot = (snapshot: ScalewaySnapshot): ScalewayResource => {
        const quantity = Math.round(100 * snapshot.size / 1_000_000_000) / 100;

        let pricePerGbPerHour: number | null = null;
        switch (snapshot.volume_type) {
            case 'b_ssd':
                pricePerGbPerHour = this.pricing.storage.block;
                break;

            case 'l_ssd':
            case 'unified':
                pricePerGbPerHour = this.pricing.storage.local;
                break;
        }

        return {
            id: snapshot.id,
            type: ScalewayResourceType.SNAPSHOT,
            zone: snapshot.zone,
            name: snapshot.name,
            projectId: snapshot.project,
            description: `${snapshot.volume_type}`,
            unitPricePerHour: pricePerGbPerHour,
            quantity,
            unit: "Gb",
            parentId: snapshot.base_volume ? snapshot.base_volume.id : null,
            totalPricePerHour: pricePerGbPerHour !== null ? pricePerGbPerHour * quantity : null,
        };
    }
}

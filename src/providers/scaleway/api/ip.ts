import { ScalewayResource, ScalewayResourceType } from "../interfaces.ts";
import { ScalewayApi } from "./base.ts";

export interface ScalewayIP {
    id: string;
    address: string;
    project: string;
    zone: string;
    server: { id: string; name: string } | null;
}

export class ScalewayApiIPs extends ScalewayApi {
    /**
     * Fetch all Scaleway IPs
     */
    public fetchIPs = async (): Promise<ScalewayResource[]> => {
        const IPs = await this.requestAllZones<{ ips: ScalewayIP[] }>("/instance/v1/zones/{zone}/ips?per_page=100");
        const data: ScalewayResource[] = [];

        for (const zone in IPs) {
            IPs[zone].ips.forEach((ip: ScalewayIP) => data.push(this.parseIP(ip)));
        }

        return data;
    }

    /**
     * Parse IP to Scaleway Resource
     * @param IP 
     */
    protected parseIP = (ip: ScalewayIP): ScalewayResource => {
        const pricePerHour = this.pricing.ip;

        return {
            id: ip.id,
            type: ScalewayResourceType.IP,
            zone: ip.zone,
            name: ip.address,
            projectId: ip.project,
            description: null,
            unitPricePerHour: pricePerHour,
            quantity: null,
            unit: null,
            parentId: ip.server ? ip.server.id : null,
            totalPricePerHour: pricePerHour,
        };
    }
}

export interface ScalewayApiRequestOptions {
    withOrganizationId?: boolean;
}

export enum ScalewayResourceType {
    INSTANCE = "Instance",
    IP = "IP",
    VOLUME = "Volume",
    SNAPSHOT = "Snapshot",
}

export interface ScalewayProject {
    id: string;
    name: string;
}

export interface ScalewayResource {
    id: string;
    projectId: string;
    parentId: string | null;
    type: ScalewayResourceType;
    zone: string;
    name: string;
    description: string | null;
    unitPricePerHour: number | null;
    quantity: number | boolean | null;
    unit: string | null;
    totalPricePerHour: number | null;
}

export interface ScalewayResources {
    projects: ScalewayProject[];
    resources: ScalewayResource[];
}

export interface ScalewayPricing {
    version: number;
    updated: string;
    instances: Record<string, number>;
    ip: number;
    storage: {
        object: {
            multiAZ: number;
            singleAZ: number;
            glacier: number;
        };
        block: number;
        local: number;
    };
}

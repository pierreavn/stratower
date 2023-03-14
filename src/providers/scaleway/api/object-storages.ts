import { S3Client, ListBucketsCommand } from "https://deno.land/x/aws_sdk@v3.32.0-1/client-s3/mod.ts";

import { ScalewayProject, ScalewayResource, ScalewayResourceType } from "../interfaces.ts";
import { ScalewayApi } from "./base.ts";

export interface ScalewayBucket {
    current_size: number;
    current_objects: number;
    is_public: boolean;
}

export class ScalewayApiObjectStorages extends ScalewayApi {
    /**
     * Fetch all Scaleway buckets for given projects
     */
    public fetchBuckets = async (projects: ScalewayProject[]): Promise<ScalewayResource[]> => {
        const data: ScalewayResource[] = [];

        // Fetch buckets lists
        const bucketsLists = await Promise.all(ScalewayApiObjectStorages.REGIONS
            .map(region => this.fetchBucketsList(region)));

        for (const project of projects) {
            let regionIndex = -1;
            for (const region of ScalewayApiObjectStorages.REGIONS) {
                regionIndex++;
                const buckets = await this.request<{ buckets: Record<string, ScalewayBucket> }>(`/object-private/v1/regions/${region}/buckets-info?per_page=100`, {
                    method: 'POST',
                    body: JSON.stringify({
                        buckets_name: bucketsLists[regionIndex],
                        project_id: project.id,
                    })
                });
    
                Object.keys(buckets.buckets)
                    .forEach((bucketKey: string) => data.push(this.parseBucket(bucketKey, region, buckets.buckets[bucketKey], project)));
            }
        }

        console.log(data)
        return data;
    }

    /**
     * Fetch list of buckets
     * @returns 
     */
    protected async fetchBucketsList(region: string): Promise<string[]> {
        const client = new S3Client({
            region,
            endpoint: `https://s3.${region}.scw.cloud`,
            credentials: {
                accessKeyId: 'SCW0D8MBYCN1AD699D8C', // FIXME:
                secretAccessKey: '765f955c-2de7-45d7-8059-0cab387ad77b',
            }
        })

        const { Buckets } = await client.send(new ListBucketsCommand({}));
        return Buckets!.map((bucket) => bucket.Name!);
    }

    /**
     * Parse bucket to Scaleway Resource
     * @param bucket 
     */
    protected parseBucket = (key: string, region: string, bucket: ScalewayBucket, project: ScalewayProject): ScalewayResource => {
        const pricePerGbPerHour = 0;// FIXME:
        const quantityInGb = Math.round(100 * bucket.current_size / 1_000_000_000) / 100;

        return {
            id: `${region}/${key}`,
            type: ScalewayResourceType.OBJECT_STORAGE,
            zone: region,
            name: key,
            projectId: project.id,
            description: null,
            unitPricePerHour: pricePerGbPerHour,
            quantity: quantityInGb,
            unit: "Gb",
            parentId: null,
            totalPricePerHour: pricePerGbPerHour !== null ? pricePerGbPerHour * quantityInGb : null,
        };
    }
}

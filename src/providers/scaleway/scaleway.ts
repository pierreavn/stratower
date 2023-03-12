import { ConfigCluster } from "../../services/config/config.interfaces.ts";
import { Provider } from "../../services/providers/providers.interfaces.ts";
import { ScalewayApi } from "./api/base.ts";
import { ScalewayApiContainerRegistries } from "./api/container-registries.ts";
import { ScalewayApiInstances } from "./api/instances.ts";
import { ScalewayApiIPs } from "./api/ip.ts";
import { ScalewayApiServerlessContainers } from "./api/serverless-containers.ts";
import { ScalewayApiServerlessFunctions } from "./api/serverless-function.ts";
import { ScalewayApiSnapshots } from "./api/snapshots.ts";
import { ScalewayApiVolumes } from "./api/volumes.ts";
import { ScalewayResources } from "./interfaces.ts";

/**
 * Scaleway Provider
 */
export class ScalewayProvider implements Provider {
    readonly key = "scaleway";

    readonly name = "Scaleway";

    readonly config = [
        { key: "AUTH_TOKEN", required: true },
        { key: "ORGANIZATION_ID", required: true },
    ];

    /**
     * Get all Scaleway resources for given cluster
     * @param cluster 
     */
    public async getClusterResources(cluster: ConfigCluster): Promise<ScalewayResources> {
        const api = new ScalewayApi(cluster);

        return {
            projects: (await api.request("/account/v2/projects", { withOrganizationId: true }) as any).projects,
            resources: (await Promise.all([
                new ScalewayApiInstances(cluster).fetchInstances(),
                new ScalewayApiIPs(cluster).fetchIPs(),
                new ScalewayApiVolumes(cluster).fetchVolumes(),
                new ScalewayApiSnapshots(cluster).fetchSnapshots(),
                new ScalewayApiContainerRegistries(cluster).fetchContainerRegistries(),
                new ScalewayApiServerlessContainers(cluster).fetchServerlessContainers(),
                new ScalewayApiServerlessFunctions(cluster).fetchServerlessFunctions(),
            ])).flat(1)
        };
    }
}

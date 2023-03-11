import { serve } from "https://deno.land/std@0.178.0/http/mod.ts";
import { lookup } from "https://deno.land/x/media_types@deprecated/mod.ts";
import { ConfigService } from "../config/config.service.ts";
import { LoggerService } from "../logger/logger.service.ts";
import { ProvidersService } from "../providers/providers.service.ts";

export class WebserverService {
    static readonly STATIC_FOLDER_GLOBAL = "src/public";

    static readonly STATIC_FOLDER_PROVIDER = "src/providers/{provider}/public";

    /**
     * Serve WebServer on given port
     * @param port 
     */
    static serve(port: number): void {
        LoggerService.info("Starting Webserver");

        const reqHandler = async (req: Request) => {
            let pathname = new URL(req.url).pathname;
            if (pathname === '/' || pathname === '') {
                pathname = '/public/index.html';
            }

            // Get Configuration
            if (pathname === '/_config') {
                const data = {
                  isValid: ConfigService.isValid,
                  error: ConfigService.error,
                  clusters: ConfigService.config.clusters.map(cluster => ({
                    key: cluster.key,
                    name: cluster.name,
                    icon: cluster.icon,
                    provider: {
                      key: cluster.provider.key,
                      name: cluster.provider.name,
                    }
                  })),
                }

                return new Response(JSON.stringify(data));
            }
            
            // Get Cluster Data
            else if (pathname.startsWith('/_cluster/')) {
                const clusterKey = pathname.split('/_cluster/', 2)[1];
                const cluster = ConfigService.config.clusters.find(cluster => cluster.key === clusterKey);
                if (!cluster) {
                  return new Response(null, { status: 404 });
                }

                try {
                  const data = await cluster.provider.getClusterResources(cluster);
                  return new Response(JSON.stringify(data));
                } catch (error) {
                  LoggerService.error("Failed to load cluster resources:", error);
                  return new Response(null, { status: 500 });
                }
            }

            // Load global static file
            else if (pathname.startsWith('/public/')) {
              const filePath = WebserverService.STATIC_FOLDER_GLOBAL + pathname.split('/public')[1];
              return WebserverService.loadStaticFile(filePath);
            }

            // Load provider static file
            else if (pathname.startsWith('/provider-public/')) {
              const providerKey = pathname.split('/')[2];
              const provider = ProvidersService.get(providerKey);
              if (!provider) {
                return new Response(null, { status: 404 });
              }

              const filePath = WebserverService.STATIC_FOLDER_PROVIDER.replace('{provider}', provider.key) + pathname.split(`/provider-public/${provider.key}`)[1];
              return WebserverService.loadStaticFile(filePath);
            }
        
            return new Response(null, { status: 404 });
        };
        
        serve(async (req: Request) => {
          const res = await reqHandler(req);

          const pathname = new URL(req.url).pathname;
          LoggerService.info(`${res.status} - ${pathname}`);

          return res;
        }, { port });
    }

    /**
     * Load static file
     * @param filePath 
     * @returns 
     */
    private static async loadStaticFile(filePath: string): Promise<Response> {
      let fileSize;
      try {
        fileSize = (await Deno.stat(filePath)).size;
      } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
          return new Response(null, { status: 404 });
        }
        return new Response(null, { status: 500 });
      }
      const body = (await Deno.open(filePath)).readable;
      return new Response(body, {
        headers: {
          "content-length": fileSize.toString(),
          "content-type": lookup(filePath) || "application/octet-stream",
        },
      });
    }
}

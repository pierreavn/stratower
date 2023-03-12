import { LoggerService } from "./services/logger/logger.service.ts";
import { ConfigService } from "./services/config/config.service.ts";
import { WebserverService } from "./services/webserver/webserver.service.ts";

const version = await Deno.readTextFile("version");
LoggerService.info(`Starting Stratower ${version}`);

// Configuration
ConfigService.load(version);

// WebServer
const PORT = ConfigService.getPort() ?? 8080;
WebserverService.serve(PORT);

LoggerService.info("Stratower ready!");

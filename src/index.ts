import { LoggerService } from "./services/logger/logger.service.ts";
import { ConfigService } from "./services/config/config.service.ts";
import { WebserverService } from "./services/webserver/webserver.service.ts";

LoggerService.info(`Starting Stratower ${ConfigService.VERSION}`);

// Configuration
ConfigService.load();

// WebServer
const PORT = ConfigService.getPort() ?? 8080;
WebserverService.serve(PORT);

LoggerService.info("Stratower ready!");

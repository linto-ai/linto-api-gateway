import 'module-alias/register';
import Config from '@src/config';
import CoreGateway from '@src/core/CoreGateway';
import CoreEventsModule from './modules/coreEvents/CoreEventsModule';
import CoreRoutesModule from '@src/modules/coreRoutes/CoreRoutesModule';
import CoreServicesDatabase from '@src/modules/coreServicesDatabase/CoreServicesDatabase';
import DockerEventsModule from '@src/modules/dockerEvents/DockerEventsModule';
import ExpressModule from '@src/modules/express/ExpressModule';
import ServicesModule from '@src/modules/coreServices/servicesModule';

// Load configuration
const config = Config.getInstance();
// Initialize core
const core = new CoreGateway();

// Register and initialize modules
const coreEventsModule = new CoreEventsModule();
const expressModule = new ExpressModule();
const coreRoutesModule = new CoreRoutesModule();
const dockerEventsModule = new DockerEventsModule();
const servicesModule = new ServicesModule();
const coreServicesDatabase = new CoreServicesDatabase(config.redisUrl);

core.modules.register(coreEventsModule);
core.modules.register(expressModule);
core.modules.register(coreRoutesModule);
core.modules.register(dockerEventsModule);
core.modules.register(servicesModule);
core.modules.register(coreServicesDatabase);

(async () => {
  await core.modules.initAll();
  core.log('info', `LinTO API Gateway fully started on http://${config.host}:${config.port}`);
})();

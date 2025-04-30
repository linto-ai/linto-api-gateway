import type { IModule } from '@src/core/IModule';
import type CoreGateway from '@src/core/CoreGateway';
import type ExpressModule from '@src/modules/express/ExpressModule';
import pkg from '../../../package.json';

/**
 * CoreRoutesModule
 * Adds default system routes: / and /health
 */
export default class CoreRoutesModule implements IModule {
  public name = 'core-routes';
  public core: CoreGateway | undefined;

  async init(core: CoreGateway) {
    // Get the ExpressModule from the registry
    const expressModule = core.modules.get<ExpressModule>('express');
    if (!expressModule) throw new Error('ExpressModule is required for CoreRoutesModule');

    // Route: GET /
    expressModule.app.get('/', function(req, res) { res.send('ok'); });

    // Route: GET /health
    expressModule.app.get('/health', function(req, res) {
      res.json({ message: 'ok', version: pkg.version });
    });
  }
}
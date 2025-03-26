import { Plugin, Logger, APIServer } from '@ale-run/runtime';
import { CloudwatchMetricDriver } from './metric';
import chalk from 'ansi-colors';

const logger = Logger.getLogger('plugin:example');

export default class ExamplePlugin extends Plugin {
  public async activate(): Promise<void> {
    logger.info(chalk.blueBright(`plugin ${this.name} is activate`), this.options);

    const { key } = this.options;

    console.log('key', key);

    // add api route
    const api: APIServer = this.get('api-server');
    if (!api) throw new Error(`api-server is required`);

    const router = api.routers.body.get(this.name);

    router.post('/cloudwatch/:space', async (req, res) => {
      res.send({
        key
      });
    });

    // add metric driver
    const clustermgr = this.context.getClusterManager();
    clustermgr.addMetricDriver('cloudwatch', CloudwatchMetricDriver);
  }

  public async deactivate(): Promise<void> {
    logger.info(chalk.red(`plugin ${this.name} will be deactivate`));

    const server: APIServer = this.get('api-server');
    server?.routers?.body?.remove(this.name);

    // remove metric driver
    const clustermgr = this.context.getClusterManager();
    clustermgr.removeMetricDriver('cloudwatch');
  }
}

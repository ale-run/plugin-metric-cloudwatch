import { ClusterMetricDriver, IDeployment, MetricItem, MetricFilter, MetricData, Logger, AnyObject } from '@ale-run/runtime';
import { CloudwatchApi } from './CloudwatchApi';
import { Statistic } from '@aws-sdk/client-cloudwatch';

const logger = Logger.getLogger('app:CloudwatchMetricDriver');

export class CloudwatchMetricDriver extends ClusterMetricDriver {
  private readonly cloudwatchApi: CloudwatchApi = new CloudwatchApi();

  public async getMetricItems(deployment: IDeployment): Promise<MetricItem[]> {
    return [
      {
        name: 'pod_cpu_utilization',
        title: 'pod_cpu_utilization',
        unit: '%'
      },
      {
        name: 'pod_cpu_request',
        title: 'pod_cpu_request',
        unit: 'b'
      },
      {
        name: 'pod_memory_utilization',
        title: 'pod_memory_utilization',
        unit: '%'
      },
      {
        name: 'pod_memory_request',
        title: 'pod_memory_request',
        unit: 'b'
      },
      {
        name: 'pod_network_rx_bytes',
        title: 'pod_network_rx_bytes',
        unit: 'b'
      },
      {
        name: 'pod_network_tx_bytes',
        title: 'pod_network_tx_bytes',
        unit: 'b'
      }
    ];
  }

  public async getMetric(deployment: IDeployment, name: string, options: MetricFilter): Promise<MetricData> {
    logger.debug(`[METRIC][${deployment.name}]metricName=${name}`);

    const statObjects: AnyObject[] = deployment.stat?.objects?.filter((o) => (o.kind === 'Deployment' ? o : null));
    if (statObjects.length === 0) {
      logger.warn(`[METRIC][${name}]deploymentName=${deployment.name} MetricObjects not found!`);
      return;
    }

    const statObject = statObjects[0];

    // ContainerInsight에서 DeploymentName은 POD_NAME, PodName은 FULL_POD_Name으로
    // [
    //   { kind: 'Namespace', name: 'ale-ns-m5bs2ldc8abcdefg' },
    //   {
    //     kind: 'Deployment',
    //     name: 'deploy-httpbin-httpbin',
    //     namespace: 'ale-ns-m5bs2ldc8abcdefg'
    //   },
    //   {
    //     kind: 'Pod',
    //     name: 'deploy-httpbin-httpbin-abcdefg123-abc12',
    //     namespace: 'ale-ns-m5bs2ldc8abcdefg'
    //   },
    //   {
    //     kind: 'Service',
    //     name: 'httpbin',
    //     namespace: 'ale-ns-m5bs2ldc8abcdefg'
    //   }
    // ]

    const clusterName = this.cluster.env.EKS_CLUSTER_NAME;
    const region = this.cluster.env.EKS_REGION;

    logger.info(`[METRIC][${deployment.name}]metricName=${name} statObject=`, statObject);

    let metricData: MetricData;

    switch (name) {
      case 'pod_cpu_utilization':
      case 'pod_cpu_request':
        metricData = await this.cloudwatchApi.getMetricData(name, Statistic.Average, region, clusterName, statObject.namespace, statObject.name, options);
        break;
      case 'pod_memory_utilization':
      case 'pod_memory_request':
      case 'pod_network_rx_bytes':
      case 'pod_network_tx_bytes':
        metricData = await this.cloudwatchApi.getMetricData(name, Statistic.Average, region, clusterName, statObject.namespace, statObject.name, options);
        break;
      default:
        logger.warn(`[METRIC][${deployment.name}] undefined metric item '${name}'`);
        return;
    }

    logger.info(`[METRIC]`, metricData);
    return metricData;
  }
}

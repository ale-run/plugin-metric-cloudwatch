import { MetricData, MetricFilter } from '@ale-run/runtime';
import { Datapoint, GetMetricStatisticsCommandInput, Statistic } from '@aws-sdk/client-cloudwatch';
export declare class CloudwatchApi {
    /**
     *
     * @param metricName
     * @param statistic
     * @param region
     * @param clusterName
     * @param namespace
     * @param podName
     * @param options
     * @returns
     */
    getMetricData(metricName: string, statistic: Statistic, region: string, clusterName: string, namespace: string, podName: string, options: MetricFilter): Promise<MetricData>;
    getMetricStatistics(region: string, input: GetMetricStatisticsCommandInput): Promise<Datapoint[]> | undefined;
    private getClient;
    private getCommandInput;
    private toPeriod;
    private toMetricData;
}

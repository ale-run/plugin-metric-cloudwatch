import { AnyObject, Logger, MetricData, MetricFilter } from '@ale-run/runtime';
import { CloudWatchClient, Datapoint, Dimension, GetMetricStatisticsCommand, GetMetricStatisticsCommandInput, StandardUnit, Statistic } from '@aws-sdk/client-cloudwatch';


const logger = Logger.getLogger('app:CloudwatchApi');

export class CloudwatchApi {



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
   public async getMetricData(metricName: string, statistic: Statistic, region: string, clusterName: string, namespace: string, podName: string, options: MetricFilter): Promise<MetricData> {

    // Region
    // ClusterName
    // Namespace
    // PodName
    const input = this.getCommandInput(metricName, [statistic], clusterName, namespace, podName, options);
    const datapoints = await this.getMetricStatistics(region, input);
    return this.toMetricData(podName, datapoints)
  }


  public async getMetricStatistics(region: string, input: GetMetricStatisticsCommandInput): Promise<Datapoint[]> | undefined {

    logger.debug('[getMetricStatistics]input=', input);
    const client = this.getClient(region);

    try {

      const command = new GetMetricStatisticsCommand(input);
      const response = await client.send(command);
      logger.debug('[getMetricStatistics]metadata=', response.$metadata);
      logger.debug('[getMetricStatistics]Datapoints=', response.Datapoints);

      if (response.$metadata.httpStatusCode === 200) {
        // DataPoint를 시간순으로 정렬하기
        return response.Datapoints.sort((a, b): number => {
          return a.Timestamp.getTime() - b.Timestamp.getTime();
        });
      }

    } catch (err) {
      logger.error('getMetricStatistics Error ===============================================')
      logger.error(input)
      logger.error(err)

    } finally {
      client.destroy();
    }

    return undefined;


    // { // GetMetricStatisticsOutput
    //   Label: "STRING_VALUE",
    //   Datapoints: [ // Datapoints
    //     { // Datapoint
    //       Timestamp: new Date("TIMESTAMP"),
    //       SampleCount: Number("double"),
    //       Average: Number("double"),
    //       Sum: Number("double"),
    //       Minimum: Number("double"),
    //       Maximum: Number("double"),
    //       Unit: "Seconds" || "Microseconds" || "Milliseconds" || "Bytes" || "Kilobytes" || "Megabytes" || "Gigabytes" || "Terabytes" || "Bits" || "Kilobits" || "Megabits" || "Gigabits" || "Terabits" || "Percent" || "Count" || "Bytes/Second" || "Kilobytes/Second" || "Megabytes/Second" || "Gigabytes/Second" || "Terabytes/Second" || "Bits/Second" || "Kilobits/Second" || "Megabits/Second" || "Gigabits/Second" || "Terabits/Second" || "Count/Second" || "None",
    //       ExtendedStatistics: { // DatapointValueMap
    //         "<keys>": Number("double"),
    //       },
    //     },
    //   ],
    // };
  }

  private getClient(region: string): CloudWatchClient {
    const config = {
      region
    }
    const client = new CloudWatchClient(config)
    return client;

  }

  private getCommandInput(metricName: string, statistics: Statistic[], clusterName:string, namespce:string, podName: string, options: MetricFilter): GetMetricStatisticsCommandInput {

    const input = { // GetMetricStatisticsInput
      Namespace: 'ContainerInsights', // required
      MetricName: metricName, // required
      Dimensions: [ // Dimensions
        { // Dimension
          Name: 'ClusterName', // required
          Value: clusterName, // required
        },
        { // Dimension
          Name: 'Namespace', // required
          Value: namespce, // required
        },
        { // Dimension
          Name: 'PodName', // required
          Value: podName, // required
        },

      ],
      StartTime: options.from, // required
      EndTime: options.to, // required
      Period: this.toPeriod(options.interval), // required
      // Statistics: [ // Statistics
      //   "Average" || "Sum" || "Minimum" || "Maximum",
      // ],
      Statistics: statistics,
      // ExtendedStatistics: [ // ExtendedStatistics
      //   "STRING_VALUE",
      // ],
      // Unit: StandardUnit.Bytes_Second
      // Unit: "Seconds" || "Microseconds" || "Milliseconds" || "Bytes" || "Kilobytes" || "Megabytes" || "Gigabytes" || "Terabytes" || "Bits" || "Kilobits" || "Megabits" || "Gigabits" || "Terabits" || "Percent" || "Count" || "Bytes/Second" || "Kilobytes/Second" || "Megabytes/Second" || "Gigabytes/Second" || "Terabytes/Second" || "Bits/Second" || "Kilobits/Second" || "Megabits/Second" || "Gigabits/Second" || "Terabits/Second" || "Count/Second" || "None",
    };

    return input;

  }

  private toPeriod(unit: string) {

    const regex = new RegExp('([0-9]{0,2})(m|h|d)');
    const match = regex.exec(unit);
    const time: number = (match[1] !== '' ? Number(match[1]) : 1);
    const timeUnit = match[2];

    switch (timeUnit) {
      case 'm':
        return time * 60;
      case 'h':
        return time * 60 * 60;
      case 'd':
        return time * 24 * 60 * 60;
      default:
        return 10 * 60
    }

  }

  private toMetricData(identifier: string, datapoints: Datapoint[]) {

    if (datapoints === undefined || datapoints.length === 0) return;

    const dates = [];
    const values = [];

    for (const data of datapoints) {
      dates.push(data.Timestamp);

      if (data.Average) {
        values.push(data.Average);
      } else if (data.Sum) {
        values.push(data.Sum);
      } else if (data.Maximum) {
        values.push(data.Maximum);
      } else if (data.Minimum) {
        values.push(data.Minimum);
      } else {
        values.push(0);
      }

    }

    const item = {
      name: identifier,
      values
    }

    const metricData = {
      total: dates.length,
      dates,
      series: [item]
    }

    return metricData;
  }

}

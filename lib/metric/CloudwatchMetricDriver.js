"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudwatchMetricDriver = void 0;
const runtime_1 = require("@ale-run/runtime");
const CloudwatchApi_1 = require("./CloudwatchApi");
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const logger = runtime_1.Logger.getLogger('app:CloudwatchMetricDriver');
class CloudwatchMetricDriver extends runtime_1.ClusterMetricDriver {
    constructor() {
        super(...arguments);
        this.cloudwatchApi = new CloudwatchApi_1.CloudwatchApi();
    }
    getMetricItems(deployment) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    getMetric(deployment, name, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            logger.debug(`[METRIC][${deployment.name}]metricName=${name}`);
            const statObjects = (_b = (_a = deployment.stat) === null || _a === void 0 ? void 0 : _a.objects) === null || _b === void 0 ? void 0 : _b.filter((o) => (o.kind === 'Deployment' ? o : null));
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
            let metricData;
            switch (name) {
                case 'pod_cpu_utilization':
                case 'pod_cpu_request':
                    metricData = yield this.cloudwatchApi.getMetricData(name, client_cloudwatch_1.Statistic.Average, region, clusterName, statObject.namespace, statObject.name, options);
                    break;
                case 'pod_memory_utilization':
                case 'pod_memory_request':
                case 'pod_network_rx_bytes':
                case 'pod_network_tx_bytes':
                    metricData = yield this.cloudwatchApi.getMetricData(name, client_cloudwatch_1.Statistic.Average, region, clusterName, statObject.namespace, statObject.name, options);
                    break;
                default:
                    logger.warn(`[METRIC][${deployment.name}] undefined metric item '${name}'`);
                    return;
            }
            logger.info(`[METRIC]`, metricData);
            return metricData;
        });
    }
}
exports.CloudwatchMetricDriver = CloudwatchMetricDriver;
//# sourceMappingURL=CloudwatchMetricDriver.js.map
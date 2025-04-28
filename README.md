<br />
<br />

<p align="center">
<a href="https://ale.run/">
  <img src="https://raw.githubusercontent.com/ale-run/ale/refs/heads/main/resources/logo/ale-wordmark-black.svg" width="160px" alt="Ale logo" />
</a>
</p>
<h3 align="center">A Fully Customizable Developer Platform</h3>
<p align="center">
  Ale is an extensible, self-hosted developer platform offering full customization,<br />
  enabling you to build and deploy on your terms.
</p>

<br />

# Ale Plugin for AWS CloudWatch

This driver enables you to monitor CloudWatch-collected metrics for services deployed to AWS EKS clusters using ale.

## Getting Started

<a href="https://docs.ale.run/" target="_blank">Read the documentation</a> or follow the steps below:

### 📌 Requirements

- Node.js version 20 or higher
- AWS EKS cluster
- AWS CloudWatch enabled by default
- Ensure AWS credentials are pre-configured in your local environment using `aws configure`

### 🪄 Installation(Local)

1. Clone the project repository.

   ```bash
   git clone https://github.com/ale-run/plugin-metric-cloudwatch.git
   ```

2. Navigate to the project directory and run the npm installation command.

   ```bash
   cd plugin-metric-cloudwatch
   npm i
   ```

3. Run Ale with the built-in Ale Plugin for AWS CloudWatch.

   ```bash
   npm run dev
   ```

4. Select the target cluster for Ale.

   ```bash
   ? Select a Kubernetes context: (Use arrow keys)
     No Cluster Selected
     orbstack
   ❯ docker-desktop
   (Move up and down to reveal more choices)
   ```

5. Access via the following address.

   - <http://localhost:9001>

### ⚙️ Configuration

1. Navigate to the Settings page under the Operating System section.

2. From the Clusters section, click on a cluster where metrics are being collected through CloudWatch.

3. In the Metric Driver section, select **AWS CloudWatch** and then add the following key-value pairs to Variables under More Options.

   - `EKS_REGION`: The region where EKS is located (`ap-northeast-2`, etc.)
   - `EKS_CLUSTER_NAME`: The name of the EKS cluster

### 📈 Observation

1. After configuring the metrics, click on the Metrics tab on the deployed service page.

2. In the dashboard, you can monitor CPU, Memory, and network traffic by date and interval.

## Community support

For general help using Ale, please refer to [the official Ale documentation](https://docs.ale.run/).
For additional help, you can use one of these channels to ask a question:

- [Discord](https://discord.gg/wVafphzcRE)
- [YouTube Channel](https://www.youtube.com/@ale_run)

## Documentation

- [Ale docs](https://docs.ale.run/)

## License

See the [LICENSE](./LICENSE) file for licensing information.

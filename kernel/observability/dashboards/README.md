# AI-BOS Kernel - Grafana Dashboards

This directory contains Grafana dashboard configurations for monitoring the AI-BOS Kernel.

## Available Dashboards

### 1. **Policy Governance Dashboard** (`grafana-policy-dashboard.json`)
Monitors policy evaluations, violations, and precedence resolution.

**Metrics:**
- Policy evaluations per second
- Evaluations by effect (allow/deny/advise)
- Active policies count
- Policy violations (last hour)
- Policy conflicts resolved
- Evaluation duration (p50, p95, p99)
- Policies by precedence level
- Enforcement distribution

**Alerts:**
- High violation rate (>10/hour)
- Evaluation latency >100ms (p99)

### 2. **Orchestra Coordination Dashboard** (`grafana-orchestra-dashboard.json`)
Monitors orchestra actions, coordination, and cross-orchestra workflows.

**Metrics:**
- Orchestra actions per second
- Actions by domain
- Active orchestras
- Active coordination sessions
- Success rate
- Action duration (p50, p95, p99)
- Cross-orchestra authorization checks
- Action duration heatmap

**Alerts:**
- Action latency >200ms (p99)
- Success rate <95%

## Installation

### Option 1: Manual Import
1. Open Grafana UI
2. Navigate to Dashboards → Import
3. Upload the JSON file
4. Select your Prometheus data source
5. Click "Import"

### Option 2: Provisioning (Recommended)
```yaml
# grafana/provisioning/dashboards/aibos.yaml
apiVersion: 1

providers:
  - name: 'AI-BOS Dashboards'
    folder: 'AI-BOS'
    type: file
    options:
      path: /etc/grafana/dashboards/aibos
```

Copy dashboard JSON files to `/etc/grafana/dashboards/aibos/`

### Option 3: API
```bash
# Import via Grafana API
curl -X POST \\
  http://localhost:3000/api/dashboards/db \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -d @grafana-policy-dashboard.json
```

## Required Data Source

All dashboards require a **Prometheus** data source configured in Grafana.

**Prometheus scrape config:**
```yaml
scrape_configs:
  - job_name: 'aibos-kernel'
    static_configs:
      - targets: ['localhost:9090']  # Adjust to your kernel metrics endpoint
    scrape_interval: 15s
```

## Dashboard Customization

### Change Refresh Rate
Edit `"refresh": "30s"` in the JSON to your desired interval (e.g., `"10s"`, `"1m"`).

### Add Panels
Use Grafana UI to add new panels, then export the updated JSON.

### Modify Alerts
Edit the `"alert"` section in panel definitions to customize thresholds and notifications.

## Metrics Reference

### Policy Metrics
- `aibos_kernel_policy_evaluations_total` - Total policy evaluations
- `aibos_kernel_policies_active` - Number of active policies
- `aibos_kernel_policy_violations_total` - Total policy violations
- `aibos_kernel_policy_conflicts_total` - Policy conflicts resolved
- `aibos_kernel_policy_evaluation_duration_seconds` - Evaluation latency histogram
- `aibos_kernel_policy_enforcements_total` - Policy enforcements

### Orchestra Metrics
- `aibos_kernel_orchestra_actions_total` - Total orchestra actions
- `aibos_kernel_orchestra_active_orchestras_gauge` - Active orchestras
- `aibos_kernel_orchestra_active_coordination_sessions_gauge` - Active sessions
- `aibos_kernel_orchestra_action_duration_seconds` - Action latency histogram
- `aibos_kernel_orchestra_cross_auth_checks_total` - Cross-orchestra auth checks

## Best Practices

1. **Set up alerts** for critical metrics (violations, latency)
2. **Review dashboards weekly** to identify trends
3. **Customize thresholds** based on your SLAs
4. **Use variables** for tenant filtering (multi-tenant deployments)
5. **Export regularly** to version control

## Support

For issues or feature requests, contact the AI-BOS Platform team.


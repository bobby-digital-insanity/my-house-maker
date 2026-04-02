# Sending Datadog Agent Data to LaunchDarkly

This app runs on EC2 with the Datadog Agent and uses the LaunchDarkly SDK (with Observability). To see **metrics, logs, and traces** from the Datadog Agent in the LaunchDarkly UI, use **dual shipping** so data goes to **both** Datadog and LaunchDarkly.

**LaunchDarkly docs:** [Datadog Agent ingestion](https://launchdarkly.com/docs/home/observability/datadog-agent)  
**Datadog dual shipping:** [Dual Shipping](https://docs.datadoghq.com/agent/configuration/dual-shipping/)

---

## Why you saw nothing in either place

If you **replaced** the default Datadog URLs with LaunchDarkly’s endpoint (`apm_dd_url`, `dd_url`, `logs_dd_url`), the agent sent **only** to LaunchDarkly and stopped sending to Datadog. If LaunchDarkly didn’t show data, common causes are: missing `launchdarkly.project_id`, observability not enabled in LD, or the agent not restarted. Either way, replacing the URLs is the wrong approach when you want **both**.

Use **additional endpoints** (dual shipping) so the primary destination stays Datadog and a **second** copy is sent to LaunchDarkly.

---

## 1. Get your LaunchDarkly Client-Side ID

LaunchDarkly uses this to route telemetry to the right project:

1. In LaunchDarkly UI → project dropdown → **Project settings**
2. **Environments** → select your environment
3. Copy **Client-side ID**

(This is the same value as `VITE_LAUNCHDARKLY_CLIENT_SIDE_ID` in your frontend.)

---

## 2. Dual shipping: add LaunchDarkly as additional endpoints

**Do not change** `apm_dd_url`, `dd_url`, or `logs_dd_url` — leave them at their defaults so Datadog keeps receiving data. **Only add** the blocks below.

**LaunchDarkly endpoint:** `http://otel.observability.app.launchdarkly.com:8126`  
The agent requires an “API key” for each additional endpoint; LaunchDarkly ignores it, so use any non-empty value (e.g. `placeholder`).

### In `datadog.yaml`

Edit the agent config on EC2 (e.g. `/etc/datadog-agent/datadog.yaml`). Keep your existing `api_key`, `apm_config.enabled`, etc. Add this:

```yaml
# --- APM (traces): send to Datadog (default) AND LaunchDarkly ---
apm_config:
  enabled: true
  # Do NOT set apm_dd_url — leave default so Datadog still receives traces
  additional_endpoints:
    "http://otel.observability.app.launchdarkly.com:8126":
      - "placeholder"

# --- Logs: send to Datadog (default) AND LaunchDarkly ---
logs_config:
  use_http: true
  # Do NOT set logs_dd_url — leave default so Datadog still receives logs
  additional_endpoints:
    - api_key: "placeholder"
      Host: "otel.observability.app.launchdarkly.com"
      Port: 8126
```

- **APM:** Requires Agent ≥ 6.7.0. Primary trace destination stays Datadog; a copy is sent to LaunchDarkly.
- **Logs:** If your agent already has `logs_config`, merge the `additional_endpoints` list into it; do not remove existing settings. LaunchDarkly’s receiver is Datadog-compatible; if logs still don’t appear in LaunchDarkly, see [Logs and external destinations](#logs-and-external-destinations) below.

---

## 3. Associate telemetry with your LaunchDarkly project

Set the project ID so LaunchDarkly can route data. On the EC2 host, set this in the environment of your **application** (and any other services that send data through the agent):

```bash
export OTEL_RESOURCE_ATTRIBUTES="launchdarkly.project_id=6973f5dcc9022b0a199a283d"
```

[Service]
Environment="OTEL_RESOURCE_ATTRIBUTES=launchdarkly.project_id=6973f5dcc9022b0a199a283d"

Replace `YOUR_CLIENT_SIDE_ID` with the Client-side ID from step 1. Add it to your process manager (e.g. systemd unit), `.env`, or shell profile so it’s set when the app runs.

---

## 4. Restart the Datadog Agent

After changing config:

```bash
sudo systemctl restart datadog-agent
```

If you use Docker, restart the agent container. Give it a few minutes, then check both Datadog and LaunchDarkly.

---

## 5. Verify

- **Datadog:** Traces and logs should continue as before.
- **LaunchDarkly:** **Observe** → **Traces** and **Observe** → **Logs**.

Data can take a few minutes to appear in LaunchDarkly after the first config.

---

## Logs and external destinations

Datadog’s built-in logs dual shipping is aimed at multiple Datadog orgs/sites. For sending logs to an external destination like LaunchDarkly, the format above is the right one to try first (LaunchDarkly provides a Datadog-compatible intake). If logs still don’t show in LaunchDarkly, consider [Observability Pipelines](https://docs.datadoghq.com/observability_pipelines/) to duplicate log traffic to LaunchDarkly.

---

## Sending only to LaunchDarkly (no Datadog)

Only use this if you want to **stop** sending data to Datadog and send **only** to LaunchDarkly:

```yaml
apm_config:
  enabled: true
  apm_dd_url: http://otel.observability.app.launchdarkly.com:8126

logs_config:
  logs_dd_url: otel.observability.app.launchdarkly.com:8126
  use_http: true

dd_url: http://otel.observability.app.launchdarkly.com:8126
```

The agent still needs a non-empty `DD_API_KEY` to start; use any placeholder. Set `OTEL_RESOURCE_ATTRIBUTES="launchdarkly.project_id=YOUR_CLIENT_SIDE_ID"` for your app as in step 3.

---

## Feature flags and traces (optional)

For guarded rollouts and autogenerated metrics, traces should include feature-flag evaluation data. Your app already uses `@launchdarkly/observability-node`, which can add that context. The Datadog Agent setup above only routes existing traces/logs/metrics to LaunchDarkly; the Node Observability plugin is what attaches flag context to traces from this application.

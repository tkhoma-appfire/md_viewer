# Production Incident Investigation Plan (AWS Microservices)

A step-by-step plan for investigating a production issue in AWS microservices, based on internal Appfire documentation.

---

## Phase 0 — First 5–10 minutes: stabilize and scope

1. **Confirm the alert is real.** Check whether it comes from CloudWatch alarms, Sumo Logic, Bugsnag or support tickets. Note when it started, including the timezone.
2. **Work out how much is affected.** Is it one tenant, one service, or everything? The [Time to SLA runbook](https://appfire.atlassian.net/servicedesk/customer/portal/11/article/3696459932) has a useful rule: one user points to permissions or network, all users in one project points to configuration, and everything everywhere points to a platform problem or recent change. It also warns: *"Do not infer causality from a single browser error."*
3. **Open an incident channel or ticket** and pick a driver and a scribe. Keep a timeline from the very start.
4. **Ask "what changed?"** Look for recent deployments, feature flags, config or secrets changes, infrastructure changes, traffic spikes, and outages at dependencies like Atlassian, Salesforce or OpenAI.
5. **Roll back if a recent release looks guilty.** Restore service first and find the root cause afterwards. In the [Canned Responses post-mortem](https://appfire.atlassian.net/servicedesk/customer/portal/11/article/157352196), rollbacks brought the app back within minutes.

## Phase 1 — Start at the entry point and move inward

6. **Begin with the edge logs (API Gateway, ALB, CloudFront), not the service logs.** The [Installation Service alert guide](https://appfire.atlassian.net/wiki/spaces/PLATFORM/pages/2992013433/Installation+Service+debugging+production+Alerts) explains why: edge logs show what the client actually experienced. That includes timeouts that never appear in Lambda logs. A starting query:

   ```sql
   fields @timestamp, @message, status, path, httpMethod, responseLatency, error
   | filter status >= 500
   | sort @timestamp desc
   | limit 10000
   ```

7. **Classify the error** ([same guide](https://appfire.atlassian.net/wiki/spaces/PLATFORM/pages/2992013433/Installation+Service+debugging+production+Alerts)):
   - **504**: a timeout in Lambda or a downstream service
   - **500**: an unhandled exception
   - **502**: the service crashed or returned an invalid response
8. **Pull out identifiers** to use in later searches: requestId, tenantId, appKey and timestamp. Remember to URL-decode the ARIs.

## Phase 2 — Follow the request across services

9. **Use the trace ID or request ID to follow one request** through every service: gateway → service → queue → worker → database. CMJ Cloud uses OpenTelemetry via Micrometer, so you can [look up logs by trace ID in CloudWatch](https://appfire.atlassian.net/wiki/spaces/CMJCDEV/pages/3466723756/Observability) across connect-app, migration-service, model-service and the Fargate workers.
10. **Search the service's own logs** for that ID:

    ```sql
    fields @timestamp, @message, @requestId
    | filter @message like /<requestId>/
    | sort @timestamp asc
    ```

11. **Search by customer** when you have no ID. For example, filter on the Jira site URL, as described in the [SFJC Invalid Query KB](https://appfire.atlassian.net/servicedesk/customer/portal/11/article/3490086914).

## Phase 3 — Check metrics and infrastructure

12. **Compute (ECS/Fargate and Lambda):** task restarts or OOM kills, CPU and memory usage, Lambda duration, throttles and cold starts.
13. **Queues (SQS):** a growing queue, old messages piling up, or messages landing in the dead-letter queue (DLQ).
14. **Data stores (Aurora, DynamoDB, Mongo):** connection limits, slow queries, throttling. Don't run heavy reads against the production database while it's struggling. A [2024 outage](https://appfire.atlassian.net/servicedesk/customer/portal/11/article/1153139028) started that way.
15. **External dependencies:** call them directly with curl or Postman to see whether they're slow or failing ([Installation Service guide](https://appfire.atlassian.net/wiki/spaces/PLATFORM/pages/2992013433/Installation+Service+debugging+production+Alerts)).
16. **Infrastructure and limits:** IAM or Secrets Manager failures, network or security group changes, and AWS service limits. One release was blocked by the [500-resource CloudFormation stack limit](https://appfire.atlassian.net/wiki/spaces/~712020b632bf4ec33b412cba4e0d6260ca1c07/pages/3409838246/AWS+Stack+Refactoring).

## Phase 4 — Form a hypothesis and confirm it

17. **Connect the evidence:** match the error spike's start time to a deploy, config change, traffic change or dependency incident.
18. **Check whether it has happened before.** Search past tickets and incident reviews in Rovo before starting from scratch. The [JMWE escalation guide](https://appfire.atlassian.net/servicedesk/customer/portal/11/article/3523379221) recommends this step.
19. **Reproduce the issue** in staging or a sandbox if you can, then confirm the fix there.
20. **Check the data afterwards** (e.g. sync status, stale records) to confirm nothing was left inconsistent.

## Phase 5 — Fix, communicate, learn

21. **Apply a short-term fix:** a rollback, a feature-flag change, scaling up, or replaying messages from the DLQ.
22. **Keep stakeholders and support updated** at regular intervals, covering impact, ETA and workaround.
23. **Write a post-incident review** with a timeline, impact, root cause, what went well and what went badly, and action items with owners. The [Canned Responses reviews](https://appfire.atlassian.net/servicedesk/customer/portal/11/article/1153139028) are a good template.
24. **Prevent a repeat:** add the missing alerts or dashboards, indexes and timeouts, and document the queries you used so the next person can reuse them.

---

## Quick checklist

| Question | Where to look |
|---|---|
| What did clients see? | API Gateway / ALB logs |
| What changed? | Deploy history, CI/CD, flags, config |
| Which service failed? | Trace ID → service logs |
| Why? | Metrics, database, queues, external dependencies |
| Has it happened before? | Rovo, past tickets and incident reviews |

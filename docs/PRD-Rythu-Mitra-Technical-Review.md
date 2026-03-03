# Technical Review: PRD-Rythu-Mitra-Enterprise.md

**Reviewer Role:** Principal Enterprise Architect / AI Systems Auditor / CTO-level Reviewer  
**Document Under Review:** docs/PRD-Rythu-Mitra-Enterprise.md  
**Review Date:** 2026-02-26

---

## Overall Architectural Score (0–10)

**Score: 7.5/10**

**Justification:** The PRD is well-structured and covers business, product, and technical dimensions with clear state labels (Implemented / In Development / Planned). It lacks executable architecture: no diagrams, no quantified non-functional requirements (latency, throughput, RTO/RPO), and no data or domain model. Critical production concerns—observability specification, offline sync semantics, API versioning policy, cost/capacity model, and marketplace entity/state model—are either absent or deferred to "planned" / "TBD." KPIs are largely placeholders. For a system targeting 10M+ users and government-grade reliability, the document does not yet provide the precision required for architecture sign-off, capacity planning, or security review. Elevation to 10/10 requires the gaps and additions identified below.

---

## Critical Gaps (Must Fix Before Production)

1. **RTO/RPO undefined.** Section 11 references "Documented RTO/RPO" but no values exist. Without RTO/RPO, DR design, backup frequency, and replication strategy cannot be specified or approved.

2. **No observability specification.** "Logging, metrics, tracing" and "alerting and runbooks" are stated; there is no definition of what is logged (fields, retention), what metrics are emitted (names, dimensions, SLI/SLO), what spans are traced, or what alert conditions and runbooks exist. Operations cannot build or validate the stack.

3. **Offline sync semantics unspecified.** Conflict resolution strategy (last-write-wins, merge, server-wins, user resolution), CAP tradeoff (consistency vs. availability when offline), max queue size and retention, and sync ordering/atomicity are not defined. This blocks implementation and creates risk of data loss or inconsistent state.

4. **API versioning and backward-compatibility policy missing.** Section 9.2 states "URL or header versioning; backward compatibility policy" as Planned. Without a written policy (support window, deprecation notice, breaking-change process), frontend and third-party consumers cannot plan; B2B and Command Center integrations are at risk.

5. **Accuracy targets for AI models are TBD.** Section 16.2 and 8.4 leave crop, disease, and weather targets as TBD. Production launch criteria and model promotion gates cannot be defined; regulatory or audit expectations for "explainable, governed" AI cannot be met without numeric benchmarks.

6. **Database scaling and partitioning strategy absent for 10M scale.** "Read replicas" and "partitioning for large tables" are mentioned but no partition key design (e.g., by tenant_id, time, region), no sizing or growth model for telemetry/events, and no connection pool limits (e.g., PgBouncer). Risk of unplanned outages or costly re-architecture at scale.

7. **Marketplace settlement and payment flow undefined.** "Transaction recording for analytics and fees" and "payment flows (e.g., in-app, external)" do not specify who holds funds, escrow vs. direct payment, fee calculation and collection point, or dispute states. Legal, compliance, and engineering cannot design settlement.

8. **Security hardening specifics missing.** No key rotation policy, secrets management (e.g., Vault), WAF/IDS, DDoS/rate-limit thresholds, or incident response for breach. "Encryption at rest" and "key management per cloud policy" are insufficient for enterprise security review.

---

## Major Architectural Improvements Needed

### 1. Data model and domain boundaries

- Add an explicit **domain boundary** section: Bounded Contexts (e.g., Farmer Identity, Crop Intelligence, Disease Intelligence, Market Intelligence, Worker Marketplace, Transport Marketplace, Command Center, Telemetry).
- Define **ownership of data** per context (which service/DB owns which entities) and **inter-context contracts** (events, APIs) to avoid big-ball-of-mud and unclear ownership at scale.
- Publish **core entity-relationship model**: User, Farmer, Plot, Crop, Recommendation, DiseaseReport, PriceForecast, Worker, TransportProvider, Booking (worker/transport), Offer, Payment, TelemetryEvent—with cardinalities and lifecycle ownership.

### 2. API contract and versioning

- Add **API versioning policy**: version in URL (e.g. `/v1/`) or header; minimum support window (e.g. 12 months); deprecation notice period (e.g. 6 months); process for breaking changes (new version required, migration path).
- Define **contract stability** for each API surface (farmer-facing, Command Center, B2B): which fields are stable, which are experimental, and how backward compatibility is tested (e.g. contract tests, schema registry).

### 3. Offline-first and sync specification

- Document **offline scope**: which entities and actions are available offline (e.g. view last recommendations, create booking request, capture disease image); which require online (e.g. inference, live price fetch).
- Define **sync protocol**: queue format, ordering guarantees, idempotency keys, and server-side conflict resolution (e.g. last-write-wins with timestamp, or merge rules per entity type).
- Specify **limits**: max pending operations per device, max retention of pending queue, and behavior when limit exceeded (block, drop oldest, prompt user).
- Specify **consistency**: eventual consistency model and any read-your-writes or session guarantees after sync.

### 4. Observability specification

- **Logging:** Log format (e.g. JSON), required fields (trace_id, user_id, action, timestamp, level), PII exclusion list, retention by log type (e.g. 90 days app, 1 year audit).
- **Metrics:** SLI metrics (e.g. request latency p50/p95/p99, error rate, throughput per endpoint), business metrics (e.g. recommendation_requests_total, disease_detections_total), and dashboard ownership.
- **Tracing:** Trace sampling strategy (e.g. 100% errors, 1% success), propagation (W3C Trace Context), and retention.
- **Alerting:** Alert conditions, severity, runbook links, and on-call ownership for each critical path (auth, recommendation, booking, sync).

### 5. Cost and capacity model

- Add **infrastructure cost projection** section: estimated monthly/yearly cost at 1M, 5M, 10M MAU for compute (API, workers, ML serving), DB (PostgreSQL, Qdrant, Redis), storage (object, logs), and egress.
- Define **capacity planning**: requests per second per domain at target MAU, DB connections and IOPS, Celery worker count and queue depth, and ML inference QPS.
- Tie **scaling triggers** to metrics (e.g. scale API when CPU > 70% or latency p95 > threshold).

### 6. Disaster recovery and RTO/RPO

- Set **RTO** (e.g. 4 hours) and **RPO** (e.g. 1 hour) for production; document **backup frequency** (e.g. PostgreSQL continuous archiving, object storage versioning), **restore procedure**, and **failover** (e.g. DB replica promotion, region failover).
- Add **DR runbook** reference and **DR drill** cadence (e.g. annual).

### 7. Marketplace entity and state model

- Define **booking lifecycle state machine** for worker and transport: e.g. REQUEST_CREATED → OFFERS_RECEIVED → OFFER_ACCEPTED → CONFIRMED → IN_PROGRESS → COMPLETED (with CANCELED, DISPUTED branches); who can transition and under what conditions.
- Define **settlement flow**: who pays whom, when (e.g. farmer pays platform; platform pays worker after completion); escrow rules if any; fee calculation (%, fixed) and collection point.
- Define **dispute states** and resolution path (e.g. DISPUTED → under_review → resolved_refund / resolved_complete); no need for full reputation system, but state and ownership must be clear.

---

## Missing Architecture Diagrams

The following diagrams are required and should be referenced (and ideally included or linked) in the PRD:

| Diagram | Purpose |
|---------|---------|
| **System Context (C4 L1)** | Actors (farmer, worker, transport provider, gov user, external systems) and system boundary; external systems (weather, mandi, Supabase, etc.). |
| **High-Level Architecture / C4 L2** | Main containers: React PWA, Django API, Celery workers, PostgreSQL, Redis, Qdrant, object storage, ML serving; communication protocols. |
| **AI/ML Pipeline** | End-to-end: data ingestion → feature computation → training → registry → serving; feedback loop (predictions + feedback → validation → retraining); batch vs real-time paths. |
| **Domain Boundaries / Bounded Contexts** | Contexts (Farmer, Crop Intelligence, Disease, Market, Weather, Worker Marketplace, Transport Marketplace, Command Center, Telemetry); context map with upstream/downstream and coupling (e.g. OHS, ACL). |
| **Data Flow – Crop Recommendation** | Sequence or flow: Farmer → PWA → API → feature fetch (DB/Qdrant) → model serving → response → logging. |
| **Data Flow – Disease Detection** | Image upload → storage → async/sync inference → result → aggregation path to Command Center. |
| **Data Flow – Offline Sync** | PWA offline queue → coming online → sync API → conflict resolution → DB write; idempotency and ordering. |
| **Booking Lifecycle – Worker & Transport** | State machine or sequence: request creation → matching → offer → accept → confirm → execute → complete → settlement. |
| **Deployment Diagram** | Regions/AZs, load balancer, API replicas, Celery workers, DB primary + replicas, Redis cluster, Qdrant cluster; ingress and egress. |
| **Disaster Recovery / Failover** | RTO/RPO; backup and restore; failover steps (DB, region); dependencies (e.g. Supabase DR capability). |

---

## AI & MLOps Weaknesses

1. **No numeric accuracy targets.** Section 16.2 and 8.4 use "TBD" for crop, disease, weather. Without targets, promotion gates, launch criteria, and regulatory narrative are undefined. Specify at least baseline (current/baseline model) and target (e.g. Top-3 accuracy ≥ X%, disease macro-F1 ≥ Y%, price MAPE ≤ Z%).

2. **Feature store and training data versioning unspecified.** "Feature store (planned)" and "training data reference" in registry do not define schema, versioning (e.g. DVC, Delta Lake), or backfill strategy. Reproducibility and drift detection depend on this.

3. **Inference SLA and fallback not specified.** No P95/P99 latency target for recommendation or disease inference; no defined behavior on model timeout or failure (cached response, default recommendation, error message). SLOs and fallback behavior must be documented.

4. **No canary or shadow deployment.** "Rollback" and "A/B or shadow mode where appropriate" are vague. Define: canary % and duration, shadow (no traffic to new model) vs. A/B (split traffic), and success criteria for promotion.

5. **Fairness and bias audit not operationalized.** "Fairness metrics" and "regular audit" are mentioned but no metrics (e.g. accuracy by region, crop, language), no audit cadence, and no remediation process (e.g. retrain, add data, document limitation).

6. **Model approval workflow missing.** "Approval state" in registry does not specify who approves (e.g. ML lead, product, compliance), what gates (accuracy, fairness, latency), or how approval is recorded and auditable.

7. **Feedback loop latency and quality.** "Feedback ingestion → validation → training pipeline" has no target latency (e.g. feedback to retrained model in production) or data quality checks (e.g. minimum samples, label quality). Risk of slow or low-quality learning loop.

---

## Scalability & Performance Risks

1. **Single PostgreSQL as primary store.** At 10M farmers and high telemetry volume, single primary + read replicas may hit write throughput and replication lag limits. Document: write QPS estimate, replication lag SLO, and when sharding or CQRS is considered.

2. **Telemetry and events table growth.** "Partitioning for large tables (e.g. telemetry, logs)" has no partition key (e.g. by date, by region), retention (e.g. 90 days hot, then archive), or archival strategy. Unbounded growth will impact cost and query performance.

3. **Qdrant scaling not defined.** Replication, sharding, and resource sizing for vector store at 10M users and growing embedding volume are not specified. Risk of bottleneck or unexpected cost.

4. **Celery topology and backpressure.** Number of queues (per domain vs. shared), priority queues, worker sizing, and behavior under queue backlog (e.g. drop, throttle, scale workers) are not defined. Risk of queue explosion or slow processing.

5. **Connection pool limits.** "Connection pooling" is mentioned without numbers. Document max connections per service, PgBouncer (or equivalent) config, and behavior when pool exhausted (reject vs. queue).

6. **Latency and throughput targets are placeholders.** "P95 API latency (e.g. < 500 ms)" and "throughput (e.g. X req/s per core)" are not fixed. Define numeric SLOs per critical path (e.g. recommendation, disease, booking creation) for capacity and performance testing.

7. **Django monolith at 10M scale.** Monolith is acceptable if justified, but the PRD does not discuss when to split (e.g. by domain) or how to avoid DB and deployment coupling. Document scaling and decomposition strategy or explicit decision to stay monolith with rationale.

---

## Security & Compliance Gaps

1. **Secrets management not specified.** "Key management per cloud/provider policy" does not state how application secrets (DB credentials, API keys, model endpoints) are stored, rotated, and accessed (e.g. HashiCorp Vault, cloud secret manager). Required for audit.

2. **Key rotation policy missing.** Encryption keys for DB and object storage: rotation frequency, procedure, and impact on availability during rotation.

3. **WAF and DDoS/rate limiting not quantified.** "Rate limiting" exists but no numbers (e.g. req/min per user, per IP). No WAF (e.g. OWASP rules) or DDoS mitigation (e.g. cloud shield, throttling). Required for public-facing platform.

4. **No breach/incident response.** No process for detection, containment, notification, and post-mortem for security incidents. Reference or add incident response plan.

5. **SAST/DAST and penetration testing cadence.** "Penetration testing for major releases" is vague. Define: SAST in CI, DAST frequency, pen-test before major release or annually; scope (API, PWA, auth).

6. **PII in logs and traces.** "No unnecessary logging of PII" is not operationalized. Define: allowlist of fields that may appear in logs; automated checks to block PII in log payloads; trace sampling and PII in span tags.

7. **Vector store access control and retention.** "No raw PII in Qdrant unless explicitly approved" and "retention aligned with policy" need concrete rules: what can be stored (e.g. hashed IDs, embeddings only), retention period, and access control (who can query, from where).

---

## Marketplace Modeling Weaknesses

1. **Two marketplaces (worker, transport) not clearly related.** Unified discovery is stated but the relationship between worker and transport marketplaces (shared catalog, shared identity, shared payment, or separate) is unclear. Define shared vs. separate services and data.

2. **No entity model.** Core entities (Farmer, Worker, TransportProvider, Request, Offer, Booking, Payment, Dispute) and their relationships are not documented. ER diagram or equivalent is needed for engineering and product alignment.

3. **Booking state machine not specified.** Section 7.6/7.7 list lifecycle steps but not states, transitions, or who can trigger them. Implementations may diverge; disputes and analytics require a single source of truth.

4. **Settlement and payment flow undefined.** Who pays whom, when (before/after completion), escrow vs. direct, platform fee calculation and collection, and refund flow are not specified. Blocks payment integration and compliance.

5. **Matching algorithm not specified.** "Matching & discovery" and "ranking and relevance" have no definition: rule-based, ML ranking, or both; inputs (location, availability, price, rating); and how offers are presented (e.g. push to farmer, farmer browses). Affects liquidity and UX.

6. **Minimum liquidity not defined.** No target for supply density (e.g. minimum workers or transport providers per district/block) to achieve "> 80% match rate." Without this, go-to-market and incentives are unclear.

7. **Dispute handling is vague.** "Basic in v1" and "DISPUTED" state are not enough. Define: who can open dispute, allowed states (e.g. open, under_review, resolved), resolution options (refund, partial, no_refund), and who resolves (platform, automated rules).

---

## Suggested Structural Additions

Add the following sections (with exact headings) to the PRD:

| Section | Heading | Content |
|---------|---------|---------|
| 5a | **Architecture Diagrams** | Index and references (or links) to System Context, HLD, AI Pipeline, Domain Boundaries, Data Flows, Deployment, DR. |
| 9a | **Data Model & Domain Boundaries** | Bounded contexts; core entities and relationships; ownership per context. |
| 9b | **API Contract & Versioning Policy** | Versioning scheme; backward-compatibility and deprecation policy; contract stability per surface. |
| 9c | **Observability Specification** | Logging (format, fields, retention, PII); metrics (SLI/SLO, business); tracing (sampling, retention); alerting (conditions, runbooks, ownership). |
| 9d | **Offline-First & Sync Specification** | Offline scope; sync protocol; conflict resolution; limits; consistency model. |
| 10a | **Cost & Capacity Model** | Infra cost projection (1M, 5M, 10M MAU); capacity planning (RPS, DB, workers, ML); scaling triggers. |
| 11a | **Disaster Recovery & RTO/RPO** | RTO/RPO values; backup and restore; failover procedure; DR runbook and drill cadence. |
| 12a | **Security Hardening Checklist** | Secrets management; key rotation; WAF; rate limits and DDoS; incident response; SAST/DAST/pen-test cadence; PII in logs. |
| 15a | **Marketplace Entity & State Model** | Entity-relationship; booking state machines (worker, transport); settlement flow; dispute states and resolution. |

---

## What Would Make This 10/10

- [ ] **Diagrams:** All 10 diagrams (System Context, HLD, AI Pipeline, Domain Boundaries, Data Flows, Offline Sync, Booking Lifecycle, Deployment, DR) present or linked; ownership and maintenance stated.
- [ ] **RTO/RPO:** Numeric RTO and RPO; backup and failover procedures; DR runbook and drill cadence.
- [ ] **Observability:** Full spec: log schema and retention; SLI/SLO metrics and dashboards; trace sampling and retention; alert conditions and runbooks per critical path.
- [ ] **API policy:** Written versioning and backward-compatibility policy; contract stability and deprecation process.
- [ ] **Offline sync:** Documented conflict resolution, queue limits, consistency model, and sync protocol.
- [ ] **AI targets:** Numeric accuracy targets and review cadence for crop, disease, price, weather; inference SLA and fallback; model approval workflow and gates.
- [ ] **MLOps:** Feature store and training data versioning; canary/shadow deployment process; feedback loop latency and quality checks; fairness metrics and audit process.
- [ ] **Scalability:** Partition strategy for telemetry/events; Qdrant and Celery scaling; connection pool limits; numeric latency and throughput SLOs; monolith vs. split decision.
- [ ] **Security:** Secrets management; key rotation; WAF and rate-limit numbers; incident response; SAST/DAST/pen-test cadence; PII handling in logs/traces and in Qdrant.
- [ ] **Cost & capacity:** Infra cost projection at 1M/5M/10M MAU; capacity plan (RPS, DB, workers, ML); scaling triggers.
- [ ] **Marketplace:** Entity model; worker and transport booking state machines; settlement and payment flow; dispute states; matching approach; minimum liquidity targets.
- [ ] **KPIs:** No TBD in production-critical KPIs; baseline and target for adoption, accuracy, liquidity, revenue; measurement method and owner.
- [ ] **Consistency:** Resolve "real-time" vs "near-real-time"; align 99.5% vs "government-grade" (e.g. commit to 99.9% or document why 99.5%); clarify offline availability in Phase 1/2 vs Phase 3.
- [ ] **No open "TBD" for production:** All items that block architecture sign-off, security review, or launch criteria have a decision or a dated follow-up; open questions in Appendix tied to owners and target resolution date.

---

*End of Technical Review.*

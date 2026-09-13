# Developer interview plan

A structured prep outline for a full-stack / platform-style role. Adjust depth to seniority (junior: concepts + one project story each; senior: trade-offs, failure modes, and system design).

---

## 1. Java

### Core to review

- **Language:** primitives vs objects, `String` immutability, equality (`==` vs `equals`), generics, wildcards, enums, records (if on modern JDK).
- **OOP & design:** SOLID, composition vs inheritance, interfaces vs abstract classes.
- **Collections:** `List` / `Set` / `Map` choices, iteration, `ConcurrentHashMap`, when `ArrayList` vs `LinkedList`. Streams and terminal operations.
- **Algorithms & complexity:** Big O for typical patterns (single pass O(n), nested loops, amortized O(1) hash map lookups); orders for common sorts/searches at interview level.
- **Exceptions:** checked vs unchecked, try-with-resources, when not to catch.
- **Concurrency (very common):** `ExecutorService`, `CompletableFuture`, `synchronized` / locks; **`java.util.concurrent.atomic`** (`AtomicInteger`, `AtomicLong`, `AtomicReference`, compare-and-swap idea); **`volatile`** (visibility / happens-before vs atomicity for compound actions); thread safety pitfalls.
- **JVM (often L4+):** heap vs stack, GC idea (stop-the-world, generational), tuning only at high level unless you did it.
- **Ecosystem:** Maven/Gradle basics, JUnit, **Testcontainers** (spin real Postgres, Kafka, etc. in integration tests from Java).

### Practice

- Explain one production bug you fixed involving null, concurrency, or a collection misuse.

### Sample questions to self-test

- When would you choose a `ConcurrentHashMap` over a synchronized `HashMap`?
- What is the difference between `Runnable` and `Callable`?
- What does type erasure mean for Java generics at runtime?
- When is `volatile` enough for a shared flag, and when do you need an `AtomicInteger` (or locks) instead?
- What is the time complexity of scanning a list once vs nested loops over the same list?

---

## 2. Spring

### Core to review

- **IoC & DI:** beans, scopes (`singleton` vs `prototype`), constructor vs field injection (prefer constructor), `@Configuration`, `@Bean`, component scanning.
- **Spring Boot:** auto-configuration idea, `application.yml` / profiles, externalized config, Actuator (health, metrics) at a high level.
- **Web:** `@RestController`, `@RequestMapping` / HTTP verbs, status codes, `@Valid` + Bean Validation, exception handlers (`@ControllerAdvice`).
- **Data access (with Hibernate, see §3):** `JdbcTemplate` vs JPA starter, transactions (`@Transactional`: propagation, read-only, rollback rules).
- **Security:** filter chain, authentication vs authorization, OAuth2/resource server basics.
- **Testing:** `@SpringBootTest` vs slice tests (`@WebMvcTest`, `@DataJpaTest`), mocks (`@MockBean`), Testcontainers (concept).

### Practice

- Trace one request: servlet filter → controller → service → repository → DB.

### Sample questions to self-test

- How does Spring dependency injection improve testability and wiring?
- When would `@Transactional` not roll back, and why?
- What is the difference between `@Component`, `@Service`, and `@Repository` in typical usage?

---

## 3. Hibernate / JPA

### Core to review

- **JPA basics:** entities, `@Id`, identity vs natural keys, relationships (`@OneToMany`, `@ManyToOne`, `@ManyToMany`), owning side, `fetch` type (`LAZY` vs `EAGER`).
- **Persistence context:** entity states (new, managed, detached, removed), `merge` vs `persist`, `flush` / `clear`.
- **Queries:** JPQL vs Criteria vs native SQL — when each is appropriate; named parameters.
- **N+1 & fetching:** join fetch, `@EntityGraph`, batch size (concept), DTO projections for read models.
- **Mapping pitfalls:** equals/hashCode on entities (business key vs id), cascading (`CascadeType`), orphan removal.
- **Schema & migrations:** `ddl-auto` trade-offs in prod vs Flyway/Liquibase (high level).

### Practice

- Model a parent/child relationship and write a query that avoids N+1 for a list endpoint.
- Describe a time lazy loading caused `LazyInitializationException` and how you fixed it.

### Sample questions to self-test

- Why is `FetchType.EAGER` often discouraged on associations?
- What is the difference between `persist` and `merge`?
- How would you map a read-heavy report without loading full entity graphs?

---

## 4. Kafka

### Core to review

- **Model:** topics, partitions, brokers, producers, consumers, consumer groups.
- **Ordering:** per-partition ordering; key choice for partitioning.
- **Delivery semantics:** at-most-once, at-least-once, exactly-once (what it means in Kafka + pitfalls).
- **Offsets:** commit strategies, rebalancing, `__consumer_offsets`.
- **Retention:** log retention, compaction (high level).
- **Ops mindset:** lag, replay, idempotent consumers, duplicate handling.

### Practice

- Draw your last (or imaginary) event flow: producer → topic(s) → consumer(s) → downstream DB/API.
- List three ways duplicates can appear and how you’d handle them in the consumer.

### Sample questions to self-test

- Why partitions? What happens if a consumer is slower than producers?
- What causes consumer rebalance and how does it affect processing?
- When would you use a compacted topic?

---

## 5. GraphQL

### Core to review

- **Schema:** types, fields, arguments, `Query` / `Mutation` / `Subscription`.
- **Resolvers:** N+1 problem, DataLoader pattern (concept).
- **Client usage:** queries vs mutations, variables, fragments, error shape.
- **API design:** pagination (`cursor` vs `offset`), versioning vs additive schema changes.
- **Security:** depth/complexity limits, auth at field level, introspection in production.
- **Comparison to REST:** over-fetching/under-fetching, caching differences, when GraphQL is a good fit.

### Practice

- Sketch a schema for a domain you know (e.g. users + orders + items) with one relation that would trigger N+1 and how you’d mitigate it.

### Sample questions to self-test

- How would you prevent an arbitrarily deep query from hurting the server?
- How does GraphQL caching differ from HTTP caching for REST?

---

## 6. SQL & NoSQL databases

### SQL — core to review

- **Modeling:** normalization vs denormalization, primary/foreign keys, indexes.
- **Querying:** `JOIN` types, `WHERE` vs `HAVING`, aggregates, subqueries vs CTEs.
- **Transactions:** ACID, isolation levels (conceptual), deadlocks, optimistic locking.
- **Performance:** index selection, explain plans (high level), pagination cost.

### NoSQL — core to review

- **Families:** document (e.g. MongoDB), key-value, wide-column, graph — when each fits.
- **CAP / practical trade-offs:** consistency vs availability in distributed stores (interview-level, not theorem recitation).
- **Document modeling:** embedding vs referencing, shard keys / hot partitions (if relevant).

### Practice

- Write SQL for: last N orders per user, or “users who never logged in.”
- Compare storing a feed in SQL vs a document DB for read-heavy vs write-heavy patterns.

### Sample questions to self-test

- When would you add a covering index vs a composite index?
- How do you choose between strong consistency and eventual consistency for a given feature?

---

## 7. React

### Core to review

- **Components:** function components, props, composition, children.
- **State:** `useState`, `useReducer`, lifting state, when to colocate state.
- **Effects:** `useEffect` dependencies, cleanup, avoiding effect-driven architecture smell.
- **Rendering:** keys in lists, reconciliation idea, memoization (`useMemo` / `useCallback` / `React.memo`) when it actually helps.
- **Data fetching:** loading/error states, race conditions (stale responses), basic patterns with fetch or a library you use.
- **Ecosystem (as needed):** React Router, basic state libraries.
- **Performance & accessibility:** lists, lazy loading (concept), semantic HTML, focus basics.

### Practice

- Explain one UI bug caused by stale closure or missing dependency array.

### Sample questions to self-test

- Why must list items have stable keys?
- When does `useCallback` not improve performance?

---

## 8. Using AI

### Core to review

- **Interview context:** Many teams care how you use AI day-to-day — be ready to describe *your* workflow honestly (pairing, review, tests), not “AI wrote it.” Some companies restrict or monitor tool use; know their policy if you can.
- **Prep (safe, high value):** mock questions, flashcards, explaining a topic in your own words, rubber-ducking designs, boilerplate for *throwaway* exercises — always **verify** facts (APIs, JVM behavior, Kafka defaults change).
- **On the job (professional bar):** treat AI output as **untrusted code**: read it, run it, add tests, check licenses and security (dependencies, secrets, injection). Never paste proprietary code or credentials into unknown tools if policy forbids it.
- **Limits:** hallucinations, stale training data, wrong “best practice” for your stack version — you own the merge.
- **Communication:** Practice articulating *why* you chose an approach without reading an answer verbatim — interviewers still grade reasoning.

### Practice

- Take one bug or feature from your history: write a short design **without** AI, then compare to an AI draft and list what you would still change before shipping.
- List three questions you would ask a teammate reviewing AI-generated code.

### Sample questions to self-test

- How do you decide when AI-assisted code needs extra tests or a human review?
- What would you not put into a public AI chat, and why?
- If an AI suggested a “clever” concurrency fix, how would you validate it before production?

---

## Cross-cutting themes (prepare 2–3 stories each)

1. **Production incident:** detection, mitigation, root cause, prevention.
2. **Trade-off decision:** e.g. Kafka vs job queue, GraphQL vs REST, SQL vs document store.
3. **Collaboration:** code review, mentoring, disagreeing with PM/design on scope or quality.

---

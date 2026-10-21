<!--section:file-path-->

A user opens a scan. The **application** (a scan application on a server or a VM) asks its operating
system to read file data. The VM's **file client** sends an **SMB or NFS** request; the **network** carries
requests and file bytes between systems; **PowerScale** serves the shared file with its storage nodes. The
file data comes back the same way: PowerScale → network → VM → application.

A write follows the same route ("store these bytes at this position"), and one user click can cause many file
operations. No collector is involved in this path.

<!--section:inside-->

PowerScale is the shared storage product; **OneFS** is its operating system, and several storage nodes work
together. For each file operation a node:

1. **Receives** it through SMB or NFS;
2. **Processes** it: checks access and locates the file data or metadata;
3. **Serves** it: reads from available cache or storage, or processes the write;
4. **Responds**: sends data, an acknowledgement or an error back to the client.

Storage latency has a **measurement boundary**: it describes the work covered by that storage metric. The user
also waits for application processing and the rest of the path. This is a simplified flow, not an exact
execution trace for every operation.

Reference: [Dell OneFS technical overview](https://www.dellemc.com/resources/en-us/asset/technical-guides-support-information/products/storage/h10719-isilon-onefs-technical-overview-wp.pdf).

<!--section:statistics-->

While serving file operations, PowerScale maintains counters and performance measurements, and an API exposes
grouped statistics:

- **Activity**: operation counts, rates and transferred bytes, where the endpoint supplies them;
- **Latency**: time spent processing the operations covered by the metric;
- **Who / where**: client address, protocol, operation class and storage node, where reported.

*Illustration:* ten measured operations whose durations add up to 120 ms give a 12 ms average. That does not
say each request took 12 ms, or that the user saw the scan in 12 ms: a returned average alone cannot recover
every request, its maximum or its percentiles. Keep the units, the operation group and the measurement
interval with the number.

References: [Dell client-statistics dimensions](https://www.dell.com/support/manuals/en-us/isilon-onefs/ifs-pub-9700-cli-command-reference/isi-statistics-client?guid=guid-8f8e156e-695b-4bb3-be3a-6796d40f1eb0&lang=en-us) ·
[Dell protocol-latency report](https://www.dell.com/support/manuals/en-us/isilon-insightiq/iiq_pub_insightiq_user_guide/protocol-operations-average-latency-report?guid=guid-c3e2a21f-1409-41fa-a7ba-9fdeba9f2a1d&lang=en-us) ·
[Dell performance troubleshooting](https://www.dell.com/support/kbdoc/en-us/000015384/emc14001790-troubleshooting-performance-issues).

<!--section:collector-->

The collector makes a **management API request** on its own schedule. It sits beside the application's
file-data path, not in it: the file bytes never pass through the collector, and real reads and writes continue
between collection runs.

Two meanings of "request": the application's file request opens or changes a file; the collector's API request
reads management information about that activity.

<!--section:collection-->

A timer starts each poll; it is not triggered by an application request. The collector asks PowerScale for
selected statistics, receives rows and metadata, records success, partial results, a timeout or an error, and
the existing Python collection writes the measurements to **InfluxDB**.

Reported schedules (operator settings, still to be confirmed against the deployment; not PowerScale defaults):

| Collector | What it observes | Reported schedule |
|---|---|---|
| Performance: clients | client activity, latency, throughput, selection coverage | every 5 seconds |
| Performance: full pass | system, drives, protocols, nodes, heat, network, jobs, sessions | every 5 minutes |
| Configuration | inventory and storage configuration | every 6 hours, at minute 05 |
| Protection | protection and replication information | every hour, at minute 35 |
| Events | reported events, warnings and errors | every hour, at minute 20 |

A row usually describes a **group of operations**, not one named application request, and **top-N** selection
keeps only the selected clients. A poll is not a trace of one request. Latency fields are stored in
**microseconds** (1,000 µs = 1 ms). Collection time is when we asked; an event's own timestamp is when it
reportedly happened.

<!--section:data-->

*One small synthetic poll, an illustration: addresses from the documentation range 192.0.2.0/24, a made-up
fingerprint.*

1. **The raw API response.** The management API answers with client rows: address, protocol, operation class,
   storage node, operation count and `time_avg` in microseconds.
2. **Top-N selection** keeps a few rows per poll, each with its reason (rate, bytes, peak or typical). A row that is
   not selected stays in the response, but no saved row carries it.
3. **The row's address.** A kept row is named by a pointer into its response (`/client/2`, the third element counting
   from zero) and the response's SHA-256 fingerprint.
4. **The typed point.** The row becomes one InfluxDB line: measurement `client_perf`; tags
   `addr, proto, op, node`; fields `time_avg_us=48200.0` (float), `ops=35i` (integer), `reason="peak"` (string),
   `selected=true` (boolean). Each field keeps one type, and times stay in µs (48,200 µs = 48.2 ms).
5. **The run receipt.** One card per poll: start and end, status (ok, partial or timeout), rows seen, kept and
   dropped, and the response fingerprint (the same one the row's address carries).
6. **A five-minute window** at one poll every 5 s holds 60 polls. Gaps (a timeout, a missing poll) stay gaps:
   missing means unknown, not zero, and the summary says "58 of 60 polls".
7. **The finding** ("client latency high") opens its trail backwards: statistic → window → poll receipt → selected
   row → raw response.
8. **Two evidence paths.** The existing Python collection writes rows to InfluxDB without keeping the device
   response, so its trail starts at the database. The native Node collector keeps the captured response, its
   fingerprint and a receipt, so its trail starts at the device response (built for clients, drives and system
   statistics; not yet switched on).

<!--section:evidence-->

Every poll leaves a **receipt**: the response bytes, source, read times, fingerprint and outcome. A receipt can
explain a failed or partial poll; without one, an empty database window cannot say why data is missing.
**Missing means unknown, not zero.**

The trail runs from a **finding** back through its **statistic** and the **saved rows** to the **captured
response**:

1. Capture: response bytes, source, read times, fingerprint and outcome;
2. Identify: collection run, response and exact row, keeping resource identifiers;
3. Derive: code applies documented conversion, selection and statistic rules;
4. Check requirements: is the evidence this claim needs present and valid?
5. Explain: follow the record back through the actual inputs and decisions.

Direct capture reaches the saved PowerScale response. Reading existing InfluxDB data, the trail stops at the
saved query result unless the collection-run join and archived response are available and verified; those joins
remain work ahead. A trace of our processing is not a trace of the application's file request, and not proof of
physical cause. Python's additive evidence and raw-response archiving are separate, default-off options.

<!--section:investigation-->

*An illustrative investigation, not a measurement from a real system.*

- **Known:** the saved PowerScale response reports this client's average read latency as 12 ms.
- **Not sure:** which VM produced that traffic.
- **Why:** the time-valid client-to-VM mapping is missing. A timed-out poll is the same kind of gap: the answer
  names it rather than filling it in.

Only the VM claim is blocked; the latency fact remains usable. Saying *why* the scan was slow needs more
evidence again: a simultaneous job or warning is a clue, not proof of cause. Clicking the known fact opens its
trail back to the captured response.

<!--section:status-->

From the saved project checks of 20 October 2026, not a live deployment monitor.

**Built:** Node writers for client, drive and system performance statistics, reusing the shared writer and
producing traceable evidence, but **inactive** (nothing starts them; the existing Python collection continues,
and VM mapping stays off); the evidence trail; compression.

**Pending:** confirming the operator's schedules against the deployed settings; retention; the throughput fix.
Also ahead: an approved storage policy, an independent service and a separate-bucket live comparison; Node
writers for the remaining performance data (protocol statistics, node details, heat, network/TCP, jobs and
sessions); compatibility and evidence work for configuration, protection and events; the receipt and archive
joins. The next gate is deciding evidence per run versus per window, then one small writer change at a time.

Reviewed implementation changes: clients #29 · drives #31 · system #34 · remaining performance
characterisation #30.

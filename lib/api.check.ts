/**
 * Smallest thing that fails if the mock API's real logic breaks: the queue
 * state machine, the rolling average, and the publish gate.
 * Run with `npm run check` (Node strips the types, no test framework).
 */
import assert from "node:assert/strict";
import {
  advanceApplication,
  callNext,
  compileService,
  createApplication,
  getQueue,
  joinQueue,
  publishService,
  resetQueue,
  searchServices,
  verifyService,
} from "./api.ts";

const QUEUE = "q-tehsil-huzur-revenue";

// --- search finds services in either language --------------------------------
assert.equal((await searchServices("domicile")).length, 1);
assert.equal((await searchServices("मूल निवासी")).length, 1);
assert.ok((await searchServices("")).length >= 3, "empty query lists everything");

// --- queue lifecycle ---------------------------------------------------------
await resetQueue(QUEUE);
const a = await joinQueue(QUEUE, "A");
const b = await joinQueue(QUEUE, "B");
assert.deepEqual([a?.number, b?.number], [1, 2], "tokens number sequentially");

let v = (await getQueue(QUEUE))!;
assert.equal(v.waiting, 2);
assert.equal(v.now_serving, null);

v = (await callNext(QUEUE))!;
assert.equal(v.now_serving?.id, a!.id, "lowest waiting token is called first");
assert.equal(v.waiting, 1);

v = (await callNext(QUEUE))!;
assert.equal(v.now_serving?.id, b!.id, "calling next closes the previous token");
assert.equal(v.tokens.find((t) => t.id === a!.id)?.status, "done");
assert.equal(v.waiting, 0);

v = (await callNext(QUEUE))!;
assert.equal(v.now_serving, null, "nothing left to call, previous one closed");

// Baseline is used until at least two tokens have been served with real times;
// here both completed instantly, so the average floors at 1 minute.
assert.equal(v.avg_service_minutes, 1);

await resetQueue(QUEUE);
assert.equal((await getQueue(QUEUE))!.tokens.length, 0, "reset clears the queue");
assert.equal((await joinQueue(QUEUE, "C"))?.number, 1, "reset restarts numbering");

// --- application timeline ----------------------------------------------------
const app = await createApplication("domicile-certificate", "Test User");
assert.match(app.reference_no, /^DEMO-/, "reference numbers are marked simulated");
assert.equal(app.status, "submitted");
assert.equal((await advanceApplication(app.id))?.status, "document_check");
await advanceApplication(app.id);
const approved = await advanceApplication(app.id);
assert.equal(approved?.status, "approved");
assert.equal(approved?.timeline.length, 4);
assert.equal((await advanceApplication(app.id))?.status, "approved", "stops at approved");

// --- publish gate ------------------------------------------------------------
const stub = await compileService({ name: "Ration Card Transfer", department: "Food" });
const bad = (await verifyService(stub.slug))!;
assert.ok(bad.counts.BLOCKER > 0, "an empty stub must produce blockers");
assert.equal(bad.verdict, "BLOCKER");
assert.equal((await publishService(stub.slug)).ok, false, "blocked spec cannot publish");

const good = await compileService({ slug: "income-certificate", name: "", department: "" });
const ok = (await verifyService(good.slug))!;
assert.equal(ok.counts.BLOCKER, 0, "a complete spec has no blockers");
assert.equal((await publishService(good.slug)).ok, true);

console.log("api.check.ts: all assertions passed");

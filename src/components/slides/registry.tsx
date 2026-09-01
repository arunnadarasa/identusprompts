import type { ReactNode } from "react";
import { SlideLayout, Card, Bullets, Title } from "./slide-layout";

export type SlideProps = { page: number; total: number };

type Slide = {
  id: string;
  title: string;
  Component: (props: SlideProps) => ReactNode;
};

const Mono = ({ children }: { children: ReactNode }) => (
  <span className="font-mono text-primary">{children}</span>
);

function Pre({ children }: { children: string }) {
  return (
    <pre className="slide-caption overflow-hidden whitespace-pre border border-border bg-card/60 p-7 font-mono leading-[1.45] text-muted-foreground">
      {children}
    </pre>
  );
}

export const SLIDES: Slide[] = [
  {
    id: "title",
    title: "Identus, shipped",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Community call" page={page} total={total}>
        <span className="slide-kicker text-primary">Hyperledger Identus · 1 September 2026</span>
        <h1 className="slide-title-lg mt-8 font-display text-foreground">
          Identus, <span className="italic text-primary">shipped</span>.
        </h1>
        <p className="slide-body-lg mt-10 max-w-[1250px] text-muted-foreground">
          Three apps built on the Cloud Agent — a 1,000-idea catalyst, an NHS-facing hub, and a
          clinical summary anchored to a ledger. What worked, what hurt, and what we would hand a
          newcomer.
        </p>
        <p className="slide-body mt-12 text-foreground">
          Arun Nadarasa · StreetKode Fam
        </p>
        <p className="slide-caption mt-3 font-mono text-primary">github.com/arunnadarasa</p>

      </SlideLayout>
    ),
  },
  {
    id: "why",
    title: "Why this talk",
    Component: ({ page, total }) => (
      <SlideLayout kicker="The problem" page={page} total={total}>
        <Title>SSI stalls twice before line one.</Title>
        <div className="mt-14 flex gap-10">
          <Card title="The idea gap" accent>
            "Verifiable credentials" is an architecture, not a product. Teams stare at the trust
            triangle and cannot name a thing worth building this week.
          </Card>
          <Card title="The infrastructure gap">
            Cloud Agent + PRISM node + Postgres + published DIDs with the right key purposes — all
            before a single credential is issued.
          </Card>
        </div>
        <p className="slide-body mt-12 text-muted-foreground">
          Every project below is an attempt to close one of those gaps for someone else.
        </p>
      </SlideLayout>
    ),
  },
  {
    id: "three-projects",
    title: "Three projects, one thread",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Overview" page={page} total={total}>
        <Title>Three projects, one thread.</Title>
        <div className="mt-14 flex gap-8">
          <Card title="Catalyst" accent>
            1,000 build-ready ideas, each with a self-contained mega-prompt and three ways to run an
            agent.
            <div className="slide-caption mt-5 font-mono text-primary">identusprompts.lovable.app</div>
            <div className="slide-caption font-mono text-muted-foreground">
              github.com/arunnadarasa/identusprompts
            </div>
          </Card>
          <Card title="Identus Hub / NHS">
            Explainer, developer docs and a live console: DIDs, issuance, verification, ZK proof and
            agentic-commerce demos.
            <div className="slide-caption mt-5 font-mono text-primary">identus.lovable.app</div>
            <div className="slide-caption font-mono text-muted-foreground">
              github.com/arunnadarasa/identus
            </div>
          </Card>
          <Card title="IPS Compass">
            FHIR patient summary → digest → Identus credential → Midnight anchor, with infra
            provisioned from inside the app.
            <div className="slide-caption mt-5 font-mono text-primary">ipsmidnight.lovable.app</div>
            <div className="slide-caption font-mono text-muted-foreground">
              github.com/arunnadarasa/ipsmidnight
            </div>
          </Card>

        </div>
        <p className="slide-body mt-12 text-muted-foreground">
          Ideation → first-mile tooling → a real regulated-domain workflow.
        </p>
      </SlideLayout>
    ),
  },
  {
    id: "catalyst",
    title: "Identus Catalyst",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Project 1" page={page} total={total}>
        <Title>Identus Catalyst — 1,000 ideas, evenly mapped.</Title>
        <Bullets
          items={[
            <>10 creative disciplines × 100 ideas — dance, music, film, fashion, games and more.</>,
            <>
              Every idea is bound to exactly one primitive: <Mono>identus-did</Mono>,{" "}
              <Mono>identus-connection</Mono>, <Mono>identus-credential</Mono>,{" "}
              <Mono>identus-verify</Mono>.
            </>,
            <>Strict round-robin: 25 ideas per primitive per theme, so no filter ever returns zero.</>,
            <>Each idea page ships a copy-paste mega-prompt for the participant's own AI builder.</>,
          ]}
        />
      </SlideLayout>
    ),
  },
  {
    id: "mega-prompt",
    title: "Anatomy of a mega-prompt",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Project 1" page={page} total={total}>
        <Title>The mega-prompt is the product.</Title>
        <div className="mt-12 flex gap-10">
          <div className="flex-1">
            <Pre>{`┌ brief ─────────────── what to build, for whom
├ runtime conventions ─ framework, server fns, env
├ Identus primer ────── trust triangle in 8 lines
├ Cloud Agent API ───── endpoints · payloads
│                        state machines · RFC-7807
├ <<MODE_BLOCK>> ────── simulated | docker | fly
├ code snippet ──────── the chosen primitive
└ references ────────── docs + /llms-full.txt`}</Pre>
          </div>
          <div className="w-[720px]">
            <Bullets
              items={[
                <>No hidden skill, no private context — it stands alone.</>,
                <>13–16 KB per prompt depending on the mode block.</>,
                <>The mode token is substituted in the browser when you switch modes.</>,
              ]}
            />
          </div>
        </div>
      </SlideLayout>
    ),
  },
  {
    id: "modes",
    title: "Three agent modes",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Project 1" page={page} total={total}>
        <Title>Same prompt, three ways to run an agent.</Title>
        <div className="mt-14 flex gap-8">
          <Card title="Simulated">
            In-app fixtures that mirror Cloud Agent response shapes. Zero setup, demoable offline,
            SSR-safe.
          </Card>
          <Card title="Docker" accent>
            Compose stack: cloud-agent 1.40.0, prism-node 2.5.0, postgres 13-alpine, on{" "}
            <Mono>localhost:8085</Mono>.
          </Card>
          <Card title="Fly.io">
            Three machines — db, prism-node, cloud-agent — 4 GB, process-group DNS, public HTTPS.
          </Card>
        </div>
        <p className="slide-body mt-12 text-muted-foreground">
          Start simulated in the first hour; swap one block to go real without rewriting the app.
        </p>
      </SlideLayout>
    ),
  },
  {
    id: "gotchas",
    title: "Gotchas we paid for",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Hard-won" page={page} total={total}>
        <Title>Five things that cost us hours.</Title>
        <Bullets
          items={[
            <>
              <Mono>postgres:13-alpine</Mono>, not 16 — Flyway migrations fail on newer majors.
            </>,
            <>
              The agent needs three roles created up front:{" "}
              <Mono>pollux-</Mono>, <Mono>connect-</Mono> and <Mono>agent-application-user</Mono>.
            </>,
            <>
              An issuer DID must carry an <Mono>assertionMethod</Mono> key and be published — filter
              for it, or issuance fails late and cryptically.
            </>,
            <>
              A deterministic <Mono>DEFAULT_WALLET_SEED</Mono> keeps DIDs stable across restarts.
            </>,
            <>Cap readiness polling at 60 s and surface RFC-7807 error bodies verbatim.</>,
          ]}
        />
      </SlideLayout>
    ),
  },
  {
    id: "llms",
    title: "/llms-full.txt",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Project 1" page={page} total={total}>
        <Title>Hand your knowledge base to their LLM.</Title>
        <div className="mt-12 flex gap-10">
          <div className="w-[900px]">
            <Bullets
              items={[
                <>
                  One plain-text route — <Mono>/llms-full.txt</Mono> — with primitives, mode recipes,
                  API reference and gotchas.
                </>,
                <>Participants paste the URL into their own assistant and skip the first mile.</>,
                <>Generated from the same data the site renders, so it cannot drift.</>,
              ]}
            />
          </div>
          <div className="flex-1">
            <Pre>{`$ curl https://identusprompts.lovable.app/llms-full.txt

# Hyperledger Identus Catalyst
## Primitives
## Agent modes: simulated | docker | fly
## Cloud Agent REST reference
## Gotchas`}</Pre>
          </div>
        </div>
      </SlideLayout>
    ),
  },
  {
    id: "nhs",
    title: "Identus Hub / NHS",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Project 2" page={page} total={total}>
        <Title>Identus Hub — the first mile, collapsed.</Title>
        <Bullets
          items={[
            <>Public explainer plus a worked NHS Single Patient Record scenario for non-developers.</>,
            <>
              Live console: create PRISM DIDs, auto-publish issuers, issue connection-based or
              connectionless credentials, verify presentations, and read an activity log.
            </>,
            <>In-browser zero-knowledge age proof bound to a credential JWT by SHA-256 commitment.</>,
            <>Agentic-commerce demos — A2A, AP2, UCP, x402 — credentials as delegated authority.</>,
            <>Every row RLS-scoped per account, so the sandbox is safe to share publicly.</>,
          ]}
        />
      </SlideLayout>
    ),
  },
  {
    id: "ips",
    title: "IPS Compass",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Project 3" page={page} total={total}>
        <Title>IPS Compass — credential over a clinical digest.</Title>
        <div className="mt-10 flex gap-10">
          <div className="flex-1">
            <Pre>{`FHIR IPS bundle
   │  validate against the IPS guide
   ▼
SHA-256 digest        (no patient data leaves)
   │
   ├─▶ Identus credential over the digest
   │
   └─▶ Midnight anchor (Compact contract)
          │
          ▼
   verifier: existed + unchanged`}</Pre>
          </div>
          <div className="w-[760px]">
            <Bullets
              items={[
                <>Fly Machines provisioned from inside the app — no local Docker, no CI.</>,
                <>Fly token and agent admin key never leave server functions.</>,
                <>Identus proves who said it; Midnight proves it existed unchanged.</>,
              ]}
            />
          </div>
        </div>
      </SlideLayout>
    ),
  },
  {
    id: "dx",
    title: "What this says about Identus DX",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Feedback" page={page} total={total}>
        <Title>What the Cloud Agent gets right — and what bites.</Title>
        <div className="mt-14 flex gap-10">
          <Card title="Pleasant" accent>
            A clean REST surface with honest state machines. Once an issuer DID is published, issue
            → offer → accept → present reads exactly like the docs.
          </Card>
          <Card title="Sharp edges">
            Boot-time coupling: Postgres major, database roles, wallet seed and key purposes each
            fail late, far from their cause.
          </Card>
          <Card title="Would help most">
            A pinned, single-command reference stack; boot-time preflight errors that name the
            missing role or key purpose.
          </Card>
        </div>
      </SlideLayout>
    ),
  },
  {
    id: "links",
    title: "Try it",
    Component: ({ page, total }) => (
      <SlideLayout kicker="Over to you" page={page} total={total}>
        <Title>Try it, fork it, break it.</Title>
        <div className="mt-14 flex gap-10">
          <Card title="Apps" accent>
            identusprompts.lovable.app
            <br />
            identus.lovable.app
            <br />
            ipsmidnight.lovable.app
          </Card>
          <Card title="Source">
            github.com/arunnadarasa/identus
            <br />
            github.com/arunnadarasa/ipsmidnight
          </Card>
          <Card title="For your LLM">
            identusprompts.lovable.app/llms-full.txt
            <br />
            identus.io/documentation/develop
          </Card>
        </div>
        <p className="slide-body mt-12 text-muted-foreground">
          Questions — especially the uncomfortable ones about the sharp edges.
        </p>
      </SlideLayout>
    ),
  },
];

export const TOTAL_SLIDES = SLIDES.length;

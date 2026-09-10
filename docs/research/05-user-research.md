# 05 — User Research

> **Project:** Xeyy  
> **Research stage:** User discovery and validation  
> **Status:** Research plan + evidence synthesis  
> **Purpose:** Determine who Xeyy should serve, what problems are worth solving, which product assumptions are real, and what evidence is required before V1 implementation.

---

## 1. Executive Summary

Xeyy should not begin by assuming that developers want “shadcn/ui for StyleX.” The product thesis must be validated against the actual problems developers experience when building or adopting StyleX applications.

The Master Blueprint explicitly calls for research across StyleX users, React developers, Next.js developers, design-system engineers, frontend engineers, accessibility engineers, and AI-assisted developers. It also identifies questions around current tooling, repeated component work, source ownership, CLI/registry demand, barriers to StyleX adoption, switching triggers, AI-agent compatibility, contribution, and organizational approval. [Source: Master Blueprint, §77 User Research.]

The research therefore has two jobs:

1. **Discover problems** rather than ask users to approve predetermined features.
2. **Validate product hypotheses** strongly enough to decide what belongs in V1.

No fabricated interviews, survey responses, or customer quotes belong in this document. The current findings below are evidence from public research and explicit hypotheses to validate with real users.

---

## 2. Research Objectives

### Primary objectives

1. Identify the highest-value problems experienced by current StyleX developers.
2. Understand why developers adopt or reject StyleX.
3. Determine whether the current StyleX ecosystem has meaningful gaps in UI components, tooling, documentation, tokens, theming, setup, and migration.
4. Determine whether source-owned UI is materially valuable to StyleX developers.
5. Determine whether a StyleX-specific CLI and registry solve a real workflow problem.
6. Understand how teams evaluate accessibility, maintainability, customization, and governance.
7. Determine whether AI-assisted development changes the requirements for a StyleX UI ecosystem.
8. Identify the smallest product that users would actually adopt.

### Secondary objectives

- Identify recurring components developers repeatedly build.
- Identify setup/configuration friction.
- Identify documentation gaps.
- Identify migration concerns.
- Understand team-level approval requirements.
- Identify potential contributors and early adopters.
- Identify reasons developers would switch from existing UI systems.

---

## 3. Research Principles

### 3.1 Problems before features

Do not ask:

> “Would you use an Xeyy registry?”

Ask:

> “How do you currently add shared UI components to a StyleX project?”

The second question reveals the existing workflow; the first merely measures stated interest in a proposed solution.

### 3.2 Behavior before opinion

Prioritize:

- what users actually built
- what they recently struggled with
- what tools they currently use
- what they copied or rewrote
- what they abandoned
- what they had to configure manually
- what they searched for
- what they would not adopt

### 3.3 Separate current users from potential users

A StyleX expert and a React developer considering StyleX have different problems.

Do not combine them into one average persona.

### 3.4 Record evidence

For every meaningful finding, record:

- source
- date
- user segment
- problem
- observed behavior
- severity
- frequency
- confidence
- implication for Xeyy

The Blueprint explicitly requires important findings to retain their source URLs and dates. [Source: Master Blueprint research-source guidance.]

---

# 4. Target User Segments

The Blueprint identifies seven useful research groups.

## Persona A — StyleX Developer

**Profile**

A developer or team already using StyleX in a real application.

**Primary needs to investigate**

- production-ready components
- documentation
- examples
- tokens
- theming
- predictable component conventions
- easier setup
- easier maintenance

**Key research question**

> What prevents a StyleX project from having the same UI-development velocity as the developer's preferred alternative?

---

## Persona B — React Developer Considering StyleX

**Profile**

A React developer who understands modern React tooling but has not committed to StyleX.

**Needs to investigate**

- education
- setup simplicity
- migration guidance
- templates
- proof that StyleX is practical
- ecosystem confidence

**Key research question**

> What would make StyleX worth choosing for a new project?

---

## Persona C — Next.js Developer

**Profile**

A React/Next.js developer evaluating or already using StyleX.

**Needs to investigate**

- Next.js integration
- development workflow
- build configuration
- SSR/RSC considerations
- component installation
- templates
- migration

**Key research question**

> Where does StyleX fit cleanly into the developer's existing Next.js workflow, and where does it create friction?

---

## Persona D — Design-System Engineer

**Profile**

An engineer responsible for shared UI, tokens, themes, component APIs, or design-system governance.

**Needs to investigate**

- token architecture
- themes
- customization
- governance
- consistency
- component contracts
- accessibility
- versioning and migration

**Key research question**

> Can Xeyy become infrastructure for a design system rather than merely a collection of components?

---

## Persona E — Frontend Engineer

**Profile**

A professional React/frontend developer who may use different styling systems.

**Needs to investigate**

- component development speed
- debugging
- customization
- maintainability
- styling ergonomics
- ecosystem maturity

**Key research question**

> What problem is sufficiently painful that a frontend engineer would change their current workflow?

---

## Persona F — Accessibility Engineer

**Profile**

An engineer or specialist focused on accessible interaction patterns and compliance.

**Needs to investigate**

- primitive quality
- keyboard behavior
- focus management
- semantics
- ARIA usage
- interaction testing
- accessibility documentation

**Key research question**

> What must Xeyy guarantee so that source ownership does not become an excuse for poor accessibility?

---

## Persona G — AI-Assisted Developer

**Profile**

A developer who regularly uses coding agents such as Claude Code, Codex, Cursor, or similar tools.

**Needs to investigate**

- source discoverability
- predictable file structure
- machine-readable metadata
- conventions
- validation
- agent instructions
- component selection
- code modification

**Key research question**

> Does a structured StyleX ecosystem actually make agent-assisted UI development better, or is that only a theoretical advantage?

---

# 5. Current Evidence From Public Developer Discussions

These findings are **signals, not representative survey results**.

## 5.1 StyleX has historically had a learning curve

A 2023 React discussion included developers describing StyleX as useful for large teams but also mentioning unintuitive typing, a learning curve around theming, and the unusual nature of its constraints. Another participant described the lack of descendant selectors as initially strange even while seeing the architectural rationale. citeturn0reddit58

**Research implication:** Xeyy should investigate whether a UI ecosystem can hide unnecessary learning friction without hiding StyleX itself.

---

## 5.2 Setup and tooling friction has been a recurring concern

A 2024 Next.js discussion included an early StyleX user describing development-server and setup problems, as well as frustration with cases where StyleX's “no styles at a distance” model became inhibiting. The commenter also acknowledged that the tooling may have improved since their experience. citeturn0reddit60

Current GitHub discussions still contain questions around monorepo setup, version differences, node_modules transpilation, TypeScript usage, RTL, and related tooling concerns. citeturn0search1

**Research implication:** Setup and integration should be tested as first-class user problems, not treated as documentation-only problems.

---

## 5.3 StyleX itself recognizes convenience/verbosity as an area for improvement

The StyleX v1 roadmap explicitly describes verbosity as a common complaint and lists work around inline styles, a transformed `stylex.props`/`sx()` experience, project creation, and validation behavior. citeturn0search4

**Research implication:** Xeyy should not duplicate StyleX's core APIs blindly. It should investigate where the ecosystem can provide ergonomic conventions without fighting StyleX's architecture.

---

## 5.4 Advanced theming can produce configuration friction

A 2026 StyleX ecosystem issue describing a theme-builder experience reported that cross-package `createTheme()` resolution could fail with cryptic `nonStaticValue` errors when aliases were not configured correctly. The report specifically recommends stronger documentation or generated configuration. citeturn0search5

**Research implication:** Xeyy should investigate whether `init`, diagnostics, generated configuration, or `doctor` tooling can eliminate recurring configuration failures.

---

## 5.5 Developers are actively building StyleX versions of the source-first UI model

A 2026 community post introduced Blenx as a StyleX + Base UI + React + TypeScript registry-first component platform emphasizing source ownership and customization. citeturn0reddit57

Another 2026 community project, shadcn-cssinjs, explicitly targets a shadcn-like experience built on StyleX and Base UI, with source copying, CLI setup, and a registry. citeturn0reddit59

**Research implication:** “Source ownership + registry + CLI” is not sufficient differentiation. Users must identify a deeper unmet problem.

---

## 5.6 The AI hypothesis has credible signals but is not yet user-validated

Linear's current StyleX migration article connects explicit styling boundaries with a codebase increasingly influenced by coding agents. Linear describes the migration as combining deterministic tooling, agents, and human judgment. citeturn0search6

This supports investigating AI-friendly StyleX infrastructure, but it does **not** prove that developers will choose Xeyy because of AI compatibility.

**Research implication:** AI compatibility must be tested as a measurable workflow advantage.

---

# 6. Core Problem Hypotheses

These are hypotheses, not established facts.

| ID | Hypothesis | Evidence needed |
|---|---|---|
| H1 | StyleX developers repeatedly rebuild common UI components | Interviews + code/repo examples |
| H2 | Existing StyleX UI options do not fully solve source-owned production UI needs | Competitive usage interviews |
| H3 | StyleX setup/integration remains a meaningful adoption barrier | Interviews + issue analysis |
| H4 | Developers value a StyleX-specific component registry | Workflow interviews |
| H5 | Developers value a CLI that installs source into their application | Prototype usability test |
| H6 | Strong tokens/themes are more valuable than a large component count | Design-system interviews |
| H7 | Accessibility is a major adoption requirement | Team interviews |
| H8 | Source ownership reduces customization and maintenance friction | Comparative interviews |
| H9 | AI agents perform better with structured StyleX component source and metadata | Controlled benchmark |
| H10 | Teams would adopt Xeyy without needing a huge component catalog | MVP test |
| H11 | Developers considering StyleX need better proof/templates/examples | Interviews + landing-page experiment |
| H12 | Xeyy can differentiate beyond “shadcn for StyleX” | Concept testing |

---

# 7. Interview Questions

## Opening

1. Tell me about the React applications you currently work on.
2. What styling system do you use?
3. What UI/component system do you use?
4. How large is the team?
5. Are you working on a product, internal tool, design system, or personal project?

## Current workflow

6. When you need a new component, what do you normally do?
7. Which components do you repeatedly build?
8. Which components are hardest to build correctly?
9. Where do you get component implementations from?
10. What do you customize most often?
11. What causes the most friction in your current UI workflow?

## StyleX-specific

12. Are you currently using StyleX?
13. If yes, why did you choose it?
14. What do you like most about it?
15. What do you dislike most?
16. What was hardest to understand?
17. What setup or build problems have you encountered?
18. What documentation did you rely on?
19. What did you have to build yourself?

## If not using StyleX

20. Have you evaluated StyleX?
21. What stopped you from adopting it?
22. What would need to change for you to consider it?
23. What would you need to see before trusting it in production?

## Source ownership

24. Do you prefer importing components from a package or installing their source into your project?
25. Tell me about the last time you modified a third-party component.
26. What happened when you needed behavior the library did not support?
27. How important is it to own the component source?

## CLI and registry

28. How do you currently install shared UI?
29. Would a CLI improve that workflow? Why?
30. What would you expect a UI registry to provide?
31. What would make you distrust a registry?
32. Would you rather install one large package or individual source components?

## Design systems

33. How do you manage tokens?
34. How do you manage themes?
35. Who owns design-system decisions on your team?
36. What happens when a component needs to diverge from the design system?
37. How do you handle accessibility testing?

## AI-assisted development

38. Do you use coding agents?
39. What UI tasks do you give them?
40. Where do agents make mistakes when modifying UI?
41. Would machine-readable component metadata help?
42. Would predictable component structure help?
43. What would make you trust an agent to modify UI source?

## Adoption

44. What would make you try Xeyy?
45. What would make you stop using it?
46. What would prevent your company from approving it?
47. Would you contribute components or fixes?
48. Would you recommend it to another developer?
49. What would Xeyy need to do exceptionally well?

---

# 8. Questions to Avoid

Avoid leading questions such as:

- “Would you use Xeyy's amazing registry?”
- “Don't you think source ownership is better?”
- “Would AI-friendly components make development faster?”
- “Would you prefer Xeyy over shadcn?”
- “Would 100 components solve your problem?”

These questions bias the respondent toward the product thesis.

Instead ask about current behavior and recent experiences.

---

# 9. Research Method

## Phase 1 — Exploratory interviews

Target:

- 5–8 current StyleX users
- 5–8 React/Next.js developers who do not currently use StyleX
- 3–5 design-system engineers
- 2–3 AI-heavy frontend developers

These are initial discovery targets, not statistical sample requirements.

### Interview format

- 30–45 minutes
- semi-structured
- recent-project examples preferred
- no product demo during the first half
- record consent and notes
- distinguish direct observations from opinions

---

## Phase 2 — Workflow observation

Where possible, ask users to demonstrate:

1. starting a StyleX project
2. adding a component
3. customizing a component
4. creating a token
5. creating a theme
6. debugging a styling problem
7. asking an AI agent to modify a component

The objective is to observe friction rather than rely on memory.

---

## Phase 3 — Concept testing

Only after exploratory research should Xeyy concepts be shown.

Test concepts independently:

- source-owned components
- StyleX-native tokens
- registry
- CLI
- templates
- accessibility-first primitives
- machine-readable metadata
- AI-agent documentation
- diagnostics/migration tooling

Do not present all features as one bundled solution initially.

---

## Phase 4 — Prototype validation

Build a narrow prototype around the strongest validated problem.

Examples:

- `xeyy add button`
- `xeyy init`
- token/theme setup
- StyleX project diagnostics
- component metadata
- AI context generation

Measure whether the prototype reduces task time or errors.

---

# 10. Research Metrics

Track quantitative signals where possible.

## Adoption intent

- percentage willing to try
- percentage willing to use in a real project
- percentage willing to recommend
- percentage willing to contribute

## Problem severity

Score each problem:

- **0** — no problem
- **1** — minor inconvenience
- **2** — recurring friction
- **3** — significant productivity loss
- **4** — adoption blocker
- **5** — severe business/engineering problem

## Frequency

- never
- rarely
- monthly
- weekly
- daily

## Current workaround

Record whether the user:

- ignores the problem
- searches documentation
- asks an AI agent
- builds an internal abstraction
- copies code
- forks a library
- changes libraries
- writes custom tooling

A painful problem with a strong workaround may be less valuable than a moderately painful problem with no good workaround.

---

# 11. Evidence Scoring

Every research finding should receive a confidence level.

### High confidence

Supported by:

- multiple independent interviews
- repeated observed behavior
- public evidence from multiple sources
- measurable prototype results

### Medium confidence

Supported by:

- several users
- credible community discussions
- repeated but not yet observed patterns

### Low confidence

Supported only by:

- one user
- one Reddit post
- founder intuition
- theoretical reasoning

### Hypothesis

A proposition that has not yet been validated.

Do not convert hypotheses into product requirements without evidence.

---

# 12. Research Synthesis Template

For each finding:

```text
Finding:
User segment:
Problem:
Context:
Observed behavior:
Current workaround:
Frequency:
Severity:
Evidence:
Confidence:
Existing alternatives:
Opportunity:
Product implication:
Open question:
```

Example:

```text
Finding:
StyleX developers struggle with recurring setup/configuration issues.

User segment:
StyleX developers / design-system engineers

Problem:
Configuration errors can be difficult to diagnose.

Context:
Cross-package themes and compiler configuration.

Observed behavior:
Developers inspect configuration and search GitHub/issues.

Current workaround:
Manual configuration and community research.

Frequency:
To be validated.

Severity:
To be validated.

Evidence:
Public StyleX ecosystem issue.

Confidence:
Medium.

Opportunity:
StyleX-aware diagnostics and generated configuration.

Product implication:
Investigate xeyy init / xeyy doctor.

Open question:
How often does this occur in real projects?
```

---

# 13. Jobs To Be Done

These should be tested rather than assumed.

## JTBD 1 — Build production UI

> When I am building a serious React application with StyleX, I want reliable accessible components so that I do not have to rebuild common interaction patterns.

## JTBD 2 — Own the implementation

> When a component does not exactly fit my product, I want to modify its source directly so that I am not blocked by library abstractions.

## JTBD 3 — Establish a design system

> When my team needs consistent UI, I want tokens, themes, and component conventions that can scale across the application.

## JTBD 4 — Start StyleX quickly

> When I evaluate StyleX for a project, I want a proven setup and working examples so that ecosystem uncertainty does not become the deciding factor.

## JTBD 5 — Customize safely

> When I modify a component, I want clear APIs and predictable styling behavior so that customization does not create hidden regressions.

## JTBD 6 — Work with coding agents

> When an AI agent modifies UI code, I want predictable source structure and explicit conventions so that the agent makes fewer incorrect changes.

---

# 14. What We Need to Learn About Competitors From Users

Competitive research tells us what products offer.

User research should tell us **why users choose them**.

For each alternative, investigate:

| Alternative | Questions |
|---|---|
| shadcn/ui | What makes the source-first workflow valuable? |
| Tailwind ecosystems | Is speed the primary reason for adoption? |
| MUI | Why is a packaged component system preferred? |
| Radix/Base UI | How important are primitives versus styled components? |
| Kanso | What attracts StyleX users to an existing StyleX-native system? |
| shadcn-cssinjs | Does a shadcn-like StyleX port already solve the core problem? |
| Custom design system | Why do teams build internally instead of adopting libraries? |
| CSS Modules/vanilla CSS | When is a component ecosystem considered unnecessary? |

The key question is not:

> “Can Xeyy provide more components?”

It is:

> “What outcome are users getting from their current choice that Xeyy must match or exceed?”

---

# 15. Community Validation

Before building a large component catalog, validate the concept publicly.

The Master Blueprint explicitly recommends publishing the concept, prototype, architecture, benchmark, landing page, and GitHub repository and measuring developer reactions before building dozens of components.

### Validation assets

1. landing page
2. GitHub repository
3. working `xeyy init`
4. working `xeyy add`
5. 3–5 high-quality components
6. token/theme example
7. Next.js example
8. Vite example
9. documentation
10. AI-agent context example

### Measure

- GitHub stars
- forks
- issues
- discussions
- registry installs
- CLI installs
- repeat usage
- documentation visits
- component additions
- qualitative feedback
- requests for missing components
- actual project adoption

Stars alone are not sufficient evidence of product demand.

---

# 16. Research Decision Gates

## Gate A — Is there a real problem?

Proceed only if multiple users describe recurring problems around:

- UI implementation
- StyleX adoption
- setup
- components
- tokens/themes
- customization
- accessibility
- or another clearly defined pain point

## Gate B — Is Xeyy solving a meaningful problem?

A feature should have evidence that it improves a real workflow.

## Gate C — Is source ownership actually valuable?

Do not assume.

Compare:

- package import
- source installation
- internal component
- direct custom implementation

## Gate D — Is the registry valuable?

Test the actual workflow rather than asking whether users like the idea.

## Gate E — Is AI differentiation real?

Run controlled tasks:

- component creation
- component modification
- styling bug fix
- token change
- accessibility fix
- migration

Compare an agent working with ordinary StyleX code against an agent using Xeyy's structured context.

## Gate F — Is there enough demand for V1?

The strongest evidence is not:

> “This looks cool.”

The strongest evidence is:

> “I installed it and used it in my project.”

---

# 17. Early Research Risks

### Risk 1 — Interviewing only StyleX enthusiasts

This creates false confidence.

**Mitigation:** include developers who rejected StyleX.

### Risk 2 — Feature-request bias

Users may ask for components because components are easy to request.

**Mitigation:** investigate the underlying workflow and outcome.

### Risk 3 — Founder confirmation bias

The team may interpret every positive comment as validation.

**Mitigation:** maintain explicit evidence levels.

### Risk 4 — Overweighting Reddit

Reddit is useful for qualitative signals but is not representative of the whole developer market.

**Mitigation:** triangulate Reddit with GitHub, interviews, project usage, and behavioral experiments.

### Risk 5 — AI hype

Developers may say AI compatibility is interesting without changing their behavior.

**Mitigation:** benchmark real tasks.

### Risk 6 — Confusing ecosystem activity with demand

GitHub stars, comments, and social engagement do not necessarily equal production adoption.

**Mitigation:** measure installation, retention, project usage, and repeat workflows.

---

# 18. Current Research Conclusions

Based on the current evidence, the following should **not** yet be treated as proven:

- that StyleX developers universally want a shadcn-like ecosystem
- that source ownership is the decisive reason to adopt Xeyy
- that a registry is necessary
- that a CLI is a must-have
- that AI compatibility will drive adoption
- that developers will switch from existing StyleX projects
- that Xeyy needs a large component catalog

However, the research supports investigating several areas seriously:

1. **StyleX workflow friction** is a credible research target.
2. **Setup/configuration** deserves dedicated investigation.
3. **Component ecosystem gaps** are worth validating.
4. **Source-first StyleX UI** already has community interest, so Xeyy must differentiate beyond the basic model.
5. **Design tokens and theming** deserve design-system-level research.
6. **AI-friendly structured UI code** is a credible hypothesis worth benchmarking.
7. **Migration and diagnostics** may be more differentiated than another generic component library.

---

# 19. Initial Product Hypothesis

Until user research provides stronger evidence, the working hypothesis should be:

> **Xeyy is a StyleX-native UI infrastructure layer that helps React teams adopt, build, customize, and maintain production UI through source-owned components, tokens, themes, tooling, and machine-readable conventions.**

This is intentionally broader than:

> “shadcn/ui for StyleX.”

The latter describes an interaction model that competitors already pursue. The research must determine whether Xeyy's deeper value is the infrastructure surrounding StyleX development.

---

# 20. Required Research Deliverables

Before finalizing product requirements, produce:

- [ ] 10–20+ qualitative interviews or equivalent high-quality evidence
- [ ] interview notes
- [ ] user-segment matrix
- [ ] problem-frequency matrix
- [ ] pain-severity matrix
- [ ] competitor workflow matrix
- [ ] top Jobs To Be Done
- [ ] adoption blockers
- [ ] switching triggers
- [ ] V1 feature evidence matrix
- [ ] AI workflow benchmark
- [ ] concept-test results
- [ ] community validation results
- [ ] final evidence-backed personas

---

# 21. Final Decision Framework

Every proposed Xeyy feature should eventually answer:

| Question | Required evidence |
|---|---|
| Who needs it? | Named user segment |
| What problem does it solve? | Repeated observed problem |
| How severe is the problem? | Severity evidence |
| How often does it happen? | Frequency evidence |
| What do users do today? | Existing workflow |
| Why are current alternatives insufficient? | Competitive/workflow evidence |
| Why is Xeyy uniquely suited to solve it? | Product/technical evidence |
| Can we measure improvement? | Defined metric |
| Does it belong in V1? | Evidence + strategic fit |

If a feature cannot answer these questions, it should remain a hypothesis rather than become a V1 requirement.

---

## Sources

- StyleX official GitHub repository and issue/discussion activity. citeturn0search7turn0search1turn0search2
- Meta Engineering — StyleX at scale. citeturn0search3
- StyleX v1 roadmap. citeturn0search4
- StyleX/Astryx theme-builder experience report. citeturn0search5
- Linear — styling migration to StyleX. citeturn0search6
- Community discussion: StyleX developer experience. citeturn0reddit58turn0reddit60turn0reddit61
- Community projects: StyleX source-first UI ecosystems. citeturn0reddit57turn0reddit59

> **Source discipline:** Public discussions are qualitative signals, not representative market statistics. User claims should not be promoted to facts until validated through direct research or stronger behavioral evidence.

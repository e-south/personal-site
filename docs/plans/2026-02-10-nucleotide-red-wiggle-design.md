# Nucleotide Red Wiggle Design

## Objective

Improve the top-banner nucleotide hover effect so it feels intentional and premium while remaining robust under zoom/viewport changes.

## Locked Aesthetic Decisions

- Style direction: blend of refined + organic.
- Effect scope: letters only; no strip-level overlay or fill.
- Motion profile: hybrid.
- Hybrid definition:
  - elastic micro-wiggle as baseline behavior.
  - light ripple only when cursor movement is fast.
- Influence radius: +/- 5 letters.
- Palette: deep crimson red only.
- Idle behavior: no ambient motion when cursor is not interacting.

## Interaction Spec

- At rest, the nucleotide string is visually stable.
- On hover, letters near cursor gain:
  - red color shift within a deep-crimson range.
  - micro deformation (translate/scale) with viscous feel.
  - tiny per-letter halo only (very small blur radius, low alpha).
- On fast pointer movement:
  - a brief ripple trail appears across neighboring letters.
  - ripple decays quickly to preserve readability.
- On leave:
  - all hover styles are fully cleared from active letters.

## Runtime and Mapping Constraints

- Hover index resolution must be based on measured character centers (not proportional container mapping).
- Mapping must remain centered under:
  - browser zoom changes.
  - visual viewport size changes.
  - regular window resize.
- Sequence sizing must be tied to measured character stride and visible edge width.

## Guardrails

- Red-only hue lock.
- No container-level lens/overlay pseudo-elements.
- Tight halo controls to prevent continuous highlighted band appearance.
- Update only active letter window to preserve performance.

## Validation Plan

- Runtime tests for:
  - red-only hover color/glow invariants.
  - resize/zoom remap behavior.
  - visible-slice activation.
  - leave cleanup (no stale transform/filter/shadow).
  - no idle motion without interaction.
- Manual QA:
  - test hover centering across left/center/right of strip.
  - test after zoom in/out via trackpad.
  - verify readability and no band-like red fill.

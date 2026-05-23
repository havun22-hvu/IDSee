---
title: IDSee Handover
type: claude
scope: idsee
last_updated: 2026-05-23
---

# IDSee — Handover

> Vul dit aan aan het einde van elke sessie.

## Huidige status

**Branch:** master (schoon)
**Openstaande items:** geen

## Architectuurprincipes

- Gemini = architect (groot contextvenster, blauwdrukken via `/arch`)
- Claude = validator + executor (implementatie via `/mpc`)
- Blueprint flow: `/arch [opdracht]` → `.claude/blueprint.md` → `/mpc ga maar`

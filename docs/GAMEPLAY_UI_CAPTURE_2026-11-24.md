# Gameplay UI and capture changes
- Speaker-specific active and historical messages share the same color, width and alignment; operator is right aligned, EVE/staff left. Original image files and their paths are preserved.
- CGs, endings and story archives use containment and responsive scrollable frames without pixel scaling on high-res art.
- Non-tutorial search identifies an animal without automatically catching it. Capture has three distinct routes: net (timed pointer release controls radius; exact-cell click accessible), trap (gear required, movement and affinity drive actual entry; six-turn life), and calming (low fear + observed nearby animal, two or three contacts). Save state holds trap and approach progress.
- Capture UI displays techniques, fear, reverse pursuit, approach progress and timing; no new assets.
- Previous failing causal follow-up test fixed without removing relevant state eligibility.
- Verification requires CI: build, test:all, balance and browser scenarios. Manual end-to-end play and visual comparisons remain unverified.

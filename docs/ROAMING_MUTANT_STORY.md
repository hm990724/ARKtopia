# Roaming field threats and encounter art

- The field already defines three combat enemy identities: `mutant`, `slime`, and `echo`. All three can now patrol, react to player cues, pursue, interrupt capture, enter combat, and resume a saved hunt after retreat or combat.
- The special roaming MUTANT remains one unique individual, distinct from M-00. Securing/transferring/archiving that specimen prevents the MUTANT from spawning again; it does not disable the roaming slime or neural echo. Existing old saves without a threat kind load as MUTANT, preserving their prior encounter.
- Region mixes sequence the first available threat and then cycle the region's existing enemy types. Slime follows strong movement vibration, the neural echo follows a wider flashlight beam and sound, and the MUTANT retains line-of-sight/noise search plus its spore trail.
- Each threat stores its identity in the field save. Each type's first mobile encounter shows its own reveal still:
  - MUTANT: `public/assets/cinematics/field-threats/roaming-mutant/reveal.png`
  - slime: `public/assets/cinematics/field-threats/roaming-slime/reveal.png`
  - neural echo: `public/assets/cinematics/field-threats/roaming-echo/reveal.png`
- Existing sprite files remain the in-field and combat fallback assets. Existing SCN_08 stays a fallback for the MUTANT still; SCN_09 remains the optional Wolf last-stand scene and is only available for mobile MUTANT combat at round 2+, integrity <=35, with a living Wolf companion.
- Existing story routes 01–19, ending images, epilogue images, and cinematic images were not edited. The three new field-threat stills are separate gameplay encounter art.

## Verification

The roaming-type logic and first encounter scenes have regression coverage in `scripts/test-roaming-mutant.cjs` and `tests/browser-v73.spec.cjs`. Final focused and integrated results are recorded in `NEXT_STEPS_README.md` after the grouped regression run.

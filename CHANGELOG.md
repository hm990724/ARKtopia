# Changelog

## 2026-11-25 — Gameplay implementation in progress

- Added autonomous enemy ticks so patrol and search continue while the player is stationary. Noise, flashlight, sight, concealment, and last-seen position influence pursuit.
- Connected an incoming enemy encounter to an active hunt by preserving capture state through combat and restoring it afterward.
- Added sector-based sound feedback and mouse drag/aim for net throws while keeping hidden creature coordinates concealed.
- Reworked emergency and field calibration interactions into distinct search, generator, decontamination, and signal reconstruction decisions.
- Improved the opening loop explanation and expedition dashboard layout. Tracking pressure at 100% remains dangerous but does not forcibly end the run.
- Ignored local archive bundles and improved the GitHub file-size guard for indexed and untracked source files.
- Consolidated current gameplay requirements and handoff into `docs/REQUIREMENTS_GAMEPLAY.md` and `NEXT_STEPS_README.md`.

Final type, build, logic, save-compatibility, asset-reference, and browser verification is pending until the implementation pass is complete. No images or ending/cinematic artwork were changed.

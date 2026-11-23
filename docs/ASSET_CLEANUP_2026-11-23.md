# ARKtopia image asset cleanup — 2026-11-23

## Canonical runtime naming

Active image paths now use stable descriptive names without revision suffixes. This includes protagonist and EVE expressions, staff portraits, origin-story scenes, event illustrations, field sprites, the origin-lab background, and the ranger walk atlas. All 19 ending routes continue to resolve to their unique `ending_*_cinematic.png` assets.

## Removed files

- Removed 5 byte-identical animal-image aliases. The unversioned runtime masters and the archived M-00 source remain.
- Removed 57 unreferenced ending derivatives tagged v75/v76/v77. The 19 current cinematic backgrounds and the 8 original handoff WebP files remain.
- Removed 22 unreferenced version-tagged animal/protagonist alternatives. The current unversioned runtime images remain the masters.

## Preserved source images

- The prior origin-lab family-photo image is preserved as `public/assets/archive/bg_origin_lab_family_photo.png`; the active, empty origin-lab background now uses `public/assets/backgrounds/bg_origin_lab.png`.
- The five earlier origin-story scenes are preserved under `public/assets/archive/origin-zero-scenes/` while their current runtime versions use the canonical filenames in `public/assets/cinematics/origin-zero/`.
- Original ending handoff art is retained as eight WebP files. New ending scenes are separate assets and do not overwrite those originals.
- No animal species master or staff-arrival/termination original was removed.

## Verification policy

The runtime reference audit was performed against source, styles, scripts, and dynamic filename builders. Versioned alternatives with no runtime use were removed; they were not promoted merely because their suffix number was higher. New canonical paths are checked through the existing ending, asset, and browser regression tests.

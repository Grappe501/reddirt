Production Pass 05D v0.3 repair trigger

Source baseline: frozen v0.2 proof/compositor and Reader v0.4.
Confirmed defect: raw Markdown PART headings were retained inside the preceding chapter by parse_reader while designed part-divider pages were also generated from PARTS.
Repair: filter source-level # PART headings during composition only; do not alter frozen Reader prose or conceptual figure anchors.
Regression: Chapters 1-16 present; Chapter 17 absent; protected final aperture present; Figures 02-16 present; designed Part I-VI dividers exactly once; zero raw # PART markup leaks.
Output: v0.3 proof + anchors + regression report + rendered repaired transitions.

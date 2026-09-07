#!/usr/bin/env python3
"""Run the v0.2 proof compositor with the verified Figure 07 prose anchor override.

This is intentionally tiny: the base compositor remains auditable, while Figure 07 is
bound to frozen Reader v0.4 prose rather than relying on an inline production marker
that did not survive the first fail-closed build path.
"""
from pathlib import Path
import importlib.util

HERE = Path(__file__).resolve().parent
BASE = HERE / 'build-book-one-proof-v02.py'

spec = importlib.util.spec_from_file_location('macroscopic_life_proof_v02', BASE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

module.AFTER_SUBSTRING['07'] = 'The mechanism, not the metaphor, has to earn that interpretation.'
module.MARKER_FIGURES.discard('07')

module.main()

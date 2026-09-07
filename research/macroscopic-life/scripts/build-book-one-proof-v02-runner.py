#!/usr/bin/env python3
"""Run the v0.2 proof compositor with the verified Figure 07 prose anchor override.

The base compositor remains auditable. Figure 07 is bound to an exact sentence that
exists in frozen Reader v0.4 and establishes Chapter 4's language/mechanism firewall.
"""
from pathlib import Path
import importlib.util

HERE = Path(__file__).resolve().parent
BASE = HERE / 'build-book-one-proof-v02.py'

spec = importlib.util.spec_from_file_location('macroscopic_life_proof_v02', BASE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

module.AFTER_SUBSTRING['07'] = 'Nothing about the machine changed while we were talking. Only the verbs did.'
module.MARKER_FIGURES.discard('07')

module.main()

#!/usr/bin/env python3
from pathlib import Path
import re, json, hashlib

ROOT = Path(__file__).resolve().parents[1]
MAN = ROOT / 'manuscript'
BASE = MAN / 'BOOK-ONE-READER-MATERIALIZED-v0.2.md'
OUT = MAN / 'BOOK-ONE-READER-MATERIALIZED-v0.3.md'
REPORT = MAN / 'PASS-18I-D1-READER-v0.3-MATERIALIZATION-REPORT.json'

text = BASE.read_text(encoding='utf-8')
original = text

# --- reader-stream cleanup: remove chapter-local note blocks from main body ---
notes_split = text.split('\n# NOTES\n', 1)
body = notes_split[0]
back = notes_split[1] if len(notes_split) == 2 else ''

chapter_pat = re.compile(r'(?m)^## Chapter (\d+) — .+$')
matches = list(chapter_pat.finditer(body))
extracted = {}
rebuilt = []
last = 0
for i, m in enumerate(matches):
    start = m.start()
    end = matches[i+1].start() if i+1 < len(matches) else len(body)
    seg = body[start:end]
    ch = int(m.group(1))
    nm = re.search(r'(?m)^## (?:Chapter \d+ Endnotes[^\n]*|Working Endnotes|Prefreeze Control|Prefreeze control notes)\s*$', seg)
    if nm:
        extracted[ch] = seg[nm.start():].strip()
        seg = seg[:nm.start()].rstrip() + '\n\n'
    rebuilt.append(body[last:start])
    rebuilt.append(seg)
    last = end
rebuilt.append(body[last:])
body = ''.join(rebuilt)

repls = {
    "Tomorrow is one problem.\n\nA preferred tomorrow is another.":
        "Tomorrow is one problem; a preferred tomorrow is another.",
    "The physical implementation is distributed.\n\nThat does not make the collective decision unreal. It tells us something about how the decision is produced.":
        "The physical implementation is distributed. That does not make the collective decision unreal; it tells us how the decision is produced.",
    "We can make our switch more impressive. Add memory. Let its current state depend partly on what happened before. Give it many inputs and many possible outputs. Let thresholds change. Let it operate probabilistically so the same measured input does not always produce the same result. We can make its behavior complicated enough that a human observer cannot predict the next output by inspection.\n\nNone of that gives us a shortcut. Unpredictability is not freedom. Randomness can make a system harder to predict without making the randomness a chooser. At the same time, determinism does not automatically rule agency out under legitimate scientific frameworks. The question here is not whether an action escaped physics. It is how physical organization produced the action and whether a proposed higher level adds something testable to that explanation.\n\nA fixed controller can also look flexible. It may select from hundreds of responses according to a stable mapping that incorporates input, internal state, and history. An adaptive controller can alter that mapping as conditions change. A learning algorithm can update action probabilities after experience. Those are genuine differences in capability, but none lets us skip the level question.\n\nWhat selected? A component? Distributed component interactions? A controller we have already identified? Environmental forcing? Or a larger system whose organization provides a stable causal variable that improves prospective prediction, intervention, or explanatory compression against fair rivals?":
        "We can make the switch much more impressive: give it memory, many inputs and outputs, changing thresholds, probabilistic behavior, and enough internal state that a human observer cannot predict the next output by inspection. None of that creates a shortcut. Unpredictability is not freedom, randomness is not a chooser, and determinism does not automatically rule agency out under legitimate scientific frameworks. The question is how physical organization produced the action and whether a proposed higher level adds something testable to that explanation.\n\nFixed controllers can look flexible; adaptive controllers can alter their mappings; learning systems can update action probabilities after experience. Those are real differences in capability, but the level question remains: what selected—a component, distributed interactions, environmental forcing, an already identified controller, or a larger system whose organization adds stable causal and predictive work?",
    "The forest remains a composite hypothetical system. We have not discovered a forest that chooses. We are constructing the experiment that would make such language costly enough to become scientifically interesting.\n\nSuppose Chapter 10 has already identified a measurable candidate system-level constraint, G, with a pre-specified tolerance, time horizon, boundary, and failure criterion. Suppose further that several distinct response trajectories could preserve G after a disturbance. Growth might slow in one region. Water use could change. Phenology could shift. Species contributions could change. Resource exchange could reorganize. These are candidate response trajectories, not evidence that the forest selected them.\n\nThe question has changed from the previous chapter. We are no longer asking only whether G is maintained or recovered. We ask whether the proposed whole contributes causal organization to which viable response trajectory occurs.":
        "Return to the same hypothetical forest, now carrying forward the candidate constraint G from Chapter 10. Suppose several physically realizable response trajectories could preserve it after disturbance—changes in growth, water use, phenology, species contribution, or resource exchange. The new question is not whether G is maintained, but whether organization of the proposed whole contributes causally to which viable trajectory occurs.",
    "A higher-level claim requires no new physical force. Any forest-level state is implemented through trees, fungi, microbes, water, atmosphere, soils, chemistry, and physical flows. We cannot manipulate an abstract forest variable while somehow leaving its physical realization untouched.\n\nThe useful question is whether a higher-level variable remains stable and scientifically productive across implementation differences.":
        "Any forest-level state is physically implemented through trees, fungi, microbes, water, atmosphere, soils, chemistry, and flows. The higher-level question is not whether we found a new force, but whether a prospectively defined variable remains scientifically productive across changes in its lower-level implementation.",
    "The prediction target is fixed prospectively. Rivals receive comparable information, data, tuning opportunity, and model capacity appropriate to the scientific question. Evaluation occurs on held-out or genuinely new conditions. Performance differences are reported with uncertainty and calibration appropriate to the task.\n\nIf `PA_choice > 0`, the higher-level action-selection model has demonstrated predictive utility under the test. That is not yet proof that the forest is an individual, conscious, free, intelligent, purposeful, or an agent under every scientific definition. Stronger ownership also requires independent boundary and causal/intervention evidence.":
        "The Chapter 5 Prediction Advantage rules still apply: prospective target, fair rival resources, genuinely new evaluation, and visible uncertainty. Positive `PA_choice` earns predictive utility for the action-selection model; stronger ownership still requires independent boundary and causal evidence.",
    "Now we can risk the forest again—not a forest we have already decided is an organism, but a composite hypothetical system built to expose the experiment.\n\nCall the proposed forest boundary H. Before looking for confirming evidence, specify competing boundaries H1, H2, and H3.":
        "Now risk the same hypothetical forest again, this time as an individuality candidate. Call the proposed boundary H and specify serious alternatives before confirmation—H1, H2, H3, or other empirically motivated partitions.",
    "The target is prospective. Rival resources are fair. Evaluation occurs in held-out or genuinely new conditions. Uncertainty and calibration remain visible. A positive `PA_individual` means H has earned predictive utility for that task. It does not mean we have discovered an organism in the woods.":
        "The familiar Prediction Advantage discipline applies. Positive `PA_individual` means H has earned predictive utility for that task; it does not mean we have discovered an organism in the woods.",
    "Memory asks whether the past remains causally available later. Heredity asks whether ancestry helps generate or constrain descendant state across generations.\n\nThey can share mechanisms. They are not the same property.":
        "Memory asks whether an earlier event remains causally available within a continuing system. Heredity adds a generational boundary: ancestry must help generate or constrain descendant state. The mechanisms can overlap; the properties do not.",
    "The four-part Prediction Advantage discipline remains unchanged: the target is chosen prospectively; rivals receive fair information and model capacity; evaluation occurs in held-out or genuinely new conditions; and calibration and uncertainty remain visible.":
        "The established Prediction Advantage discipline still applies: prospective target, fair rival resources, genuinely new evaluation, and visible uncertainty.",
    "The target is prospective. Rival models receive fair information and capacity. Evaluation occurs under held-out or genuinely new conditions. Calibration and uncertainty remain visible.\n\nPositive PA means higher-level variables improve prediction on that task. It does not prove causal ownership.":
        "The established Prediction Advantage discipline applies. Positive PA means higher-level variables improve prediction on that task; it does not prove causal ownership.",
    "The target must be prospective, rival models must receive fair information and modeling resources, evaluation must occur under held-out or genuinely new conditions, and calibration and uncertainty must remain visible. Positive Prediction Advantage means higher-level variables have earned scientific work on that target. It does not prove a historical transition.":
        "The established Prediction Advantage discipline applies. Positive `PA_transition` means higher-level variables earn scientific work on the specified present-day target; it does not prove the historical S0→S1 transition.",
}

applied = []
for old, new in repls.items():
    if old in body:
        body = body.replace(old, new)
        applied.append(old[:80])

model_sig = '**MODEL B IS A DISCOVERY, NOT A CONSOLATION PRIZE.**'
parts = body.split(model_sig)
if len(parts) > 2:
    body = parts[0] + model_sig + 'Model B remains a discovery rather than a consolation prize.'.join(parts[1:])

body = body.replace(
    "A goal tells us what counts as success.\n\nIt does not yet tell us who selects among possible paths.",
    "A goal tells us what counts as success, but it does not yet tell us who selects among possible paths."
)

if back:
    for ch, raw in extracted.items():
        raw_body = re.sub(r'(?s)^## (?:Chapter \d+ Endnotes[^\n]*|Working Endnotes|Prefreeze Control|Prefreeze control notes)\s*\n+', '', raw).strip()
        raw_body = re.split(r'(?m)^## (?:Prefreeze Control|Prefreeze control notes)\s*$', raw_body)[0].strip()
        marker = f'## Notes to Chapter {ch} — '
        idx = back.find(marker)
        if idx >= 0:
            sec_start = idx
            nxt = back.find('\n## Notes to Chapter ', idx + len(marker))
            sec_end = nxt if nxt >= 0 else len(back)
            sec = back[sec_start:sec_end]
            sec = re.sub(r'No chapter-specific notes were embedded in the canonical manuscript source\.\s*', '', sec)
            if raw_body and raw_body not in sec:
                sec = sec.rstrip() + '\n\n' + raw_body + '\n'
            back = back[:sec_start] + sec + back[sec_end:]

text = body.rstrip() + '\n\n# NOTES\n' + back.lstrip() if back else body.rstrip() + '\n'

chapter_heads = re.findall(r'(?m)^## Chapter (\d+) — ', text)
assert chapter_heads == [str(i) for i in range(1,17)], chapter_heads
assert '## Chapter 4 — The Verb' in text
assert '## Chapter 11 — The Choice' in text
assert 'Chapter 17' not in text
assert '**If individuality can be reorganized across levels, what determines where a new individual can—and cannot—emerge?**' in text
assert 'FIGURE 14' not in body.upper() or 'QUARANTINED' in text.upper()
assert 'This manuscript is NOT FROZEN.' not in body
assert 'Required next gate:' not in body
assert 'Prefreeze Control' not in body

OUT.write_text(text, encoding='utf-8')

def words(s):
    return len(re.findall(r"\b[\w’'-]+\b", s))

report = {
    'status': 'PASS',
    'base': str(BASE.relative_to(ROOT)),
    'output': str(OUT.relative_to(ROOT)),
    'base_sha256': hashlib.sha256(original.encode()).hexdigest(),
    'output_sha256': hashlib.sha256(text.encode()).hexdigest(),
    'base_bytes': len(original.encode()),
    'output_bytes': len(text.encode()),
    'base_words': words(original),
    'output_words': words(text),
    'word_reduction': words(original)-words(text),
    'word_reduction_pct': round((words(original)-words(text))*100/words(original), 3),
    'exact_replacements_applied': len(applied),
    'chapter_local_note_sections_moved': sorted(extracted.keys()),
    'gates': {
        'chapters_1_16_exact': True,
        'chapter4_the_verb': True,
        'chapter11_the_choice': True,
        'no_chapter17': True,
        'final_question_preserved': True,
        'no_prefreeze_control_in_body': True,
        'no_required_next_gate_in_body': True,
    }
}
REPORT.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))

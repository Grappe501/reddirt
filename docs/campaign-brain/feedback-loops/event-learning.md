# Event Outcome Learning

> Was the recommendation correct?

Log outcomes in [`data/campaign-brain/event-outcomes.json`](../../data/campaign-brain/event-outcomes.json).

---

## Calibration

| Metric | Value |
| ------ | ----- |
| Outcomes logged | 3 |
| Mean absolute error | 18 |
| Over-predicted (>10 pts) | 1 |
| Under-predicted (>10 pts) | 1 |

---

## Predicted vs actual

| Event | Predicted | Actual | Delta |
| ----- | --------: | -----: | ----: |
| Little Rock Chamber Lunch | 74 | 41 | -33 |
| Little Rock Rotary Club Meeting | 68 | 88 | +20 |
| Pulaski County Fair | 100 | 100 | +0 |


## Insights

- Under-predicted: Little Rock Rotary Club Meeting — consider boosting relationship/chamber event weights.
- Over-predicted: Little Rock Chamber Lunch — verify attendance assumptions.

---

## Outcome fields (per event)

- Attended (Y/N)
- Estimated attendance
- New contacts · Volunteer signups · Registration forms
- Faith leaders engaged · Clerk relationship advanced · Earned media

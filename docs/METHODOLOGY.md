# PrithviProof Methodology

## Emission Factors
We source emission factors from reputable scientific and government databases:
- EPA GHG Emission Factors Hub
- DEFRA Conversion Factors
- Peer-reviewed literature (e.g., Poore & Nemecek 2018 for food)

All factors include:
- `value`: Baseline emissions per unit (kgCO2e)
- `uncertaintyPercent`: A static uncertainty bound reflecting the inherent variability of the category (e.g., farming practices for beef).

## Unit Normalization
Pure function conversions ensure inputs match the factor unit before calculation.

## Uncertainty Propagation
Total relative error is calculated using the Root Sum Square method:
`sqrt((activityError)^2 + (factorError)^2)`

Data quality scores (0-100) are mapped linearly to activity errors (50% to 0%).

## Adaptive Questioning
Questions are prioritized based on:
1. Contribution to total variance (highest variance targeted first).
2. The intrinsic information gain potential of the question itself.

## Constraint-Aware Recommendations
Recommendations are filtered using `UserConstraints` (budget, housing, ownership). They are ranked heuristically by maximizing expected reduction and confidence, while minimizing cost and effort.

## The Evidence Ledger
The ledger enforces strict state transitions:
`Estimated -> Planned -> In-Progress -> Verified`
(Rejection can happen from any state).
Verified savings only accrue in the `verified` state.

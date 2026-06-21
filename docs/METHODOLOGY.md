# Methodology

PrithviProof calculates carbon emissions using a standard Factor x Value equation, but adds a layer of **Uncertainty Analysis**.

## Uncertainty
Instead of a single number, we provide:
- **Low**: The best-case scenario.
- **Central**: The most likely scenario.
- **High**: The worst-case scenario.

Uncertainty is derived from the **Data Quality Score (0-100)** provided by the user. A score of 100 means metered data (e.g. utility bill), which yields 0% uncertainty. A score of 0 means a pure guess, which yields maximum uncertainty.

## The Evidence Ledger
To avoid greenwashing, users must verify their actions.
1. `estimated`: The action is suggested.
2. `planned`: The user commits to the action.
3. `in_progress`: The user has started the action.
4. `verified`: The user has provided evidence (e.g., a photo of a smart thermostat installation).

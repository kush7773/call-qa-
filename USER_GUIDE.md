# SoundSense Call QA Surface — Evaluator Guide

Welcome to the **Call QA Review Surface**. This guide explains how to use the review interface to evaluate AI-generated call summaries against raw call transcripts and UK debt collection compliance rules.

---

## 1. Application Layout

The application is structured into four main areas:

```
┌────────────────────────────────────────────────────────────────────────┐
│  HEADER: Call Selector · Direction Tag · Progress Bar · Rules · Export │
├───────────────────────────────────┬────────────────────────────────────┤
│                                   │                                    │
│   TRANSCRIPT PANE (Left 50%)      │   AI SUMMARY PANE (Right 50%)      │
│   • Turn IDs (T01, T02...)        │   • Highlight text to tag          │
│   • Timestamps & speaker badges   │   • 4 Color-coded classifications  │
│   • Interactive turn citation     │   • "+ Add Omission" button        │
│                                   │                                    │
├───────────────────────────────────┴────────────────────────────────────┤
│  AUDIT TRAY (Bottom): Notes · Evidence Chips · Definite/Uncertain      │
│                       Overall Verdict · Single / Batch Export          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Review Instructions

### Step 1: Select a Call
* Use the **`<`** and **`>`** arrow buttons or the **call dropdown** in the top header to choose one of the 20 calls.
* You can also press **`[`** and **`]`** on your keyboard to navigate between calls.
* The header displays:
  * **Call ID** (e.g. `CALL-019`)
  * **Call Direction**: `Inbound` (Customer called) or `Outbound` (Company called)
  * **Call Duration** and **Call Date**
  * **Overall Progress Counter** (e.g. `4/20 done`)

---

### Step 2: Consult Compliance Rules
Click the **`Rules`** button in the header (or press `Esc` to close) to open the **Summary Rules Checklist** slide-over panel. Use the search box to check specific policies:
* **Arrears Figures**: Stating numerical arrears or balance amounts (e.g. *"arrears of £460"*) is strictly forbidden. The summary may only mention that *"arrears were discussed"*.
* **Immediate Payments**: Payments taken during the call must use the phrase *"Payment made."* (never include numerical amounts).
* **Situational Costs**: Numerical amounts for car repairs (e.g. *£800 turbo repair*) or future promises (*£100 on Friday*) are permitted.
* **Entity Redactions**: Private employers and garages must be generalized/redacted (e.g. *"changed jobs"*, not *"works for Cedar Lane Distribution"*).
* **Named Advice Bodies**: Referrals to StepChange, Citizens Advice, or MoneyHelper must be retained by name.
* **Vulnerability Consent**: Must use the exact phrase *"Consent gained to record vulnerability"* when the customer agrees.
* **British English**: UK spelling is required (*authorised*, *programme*, *centre*).

---

### Step 3: Flag Summary Spans
In the **AI Summary** pane (right side), select any phrase or sentence with your mouse. A popover menu will appear:

| Action Button | Tag | When to Use |
| :---: | :--- | :--- |
| <span style="color:#16a34a">✓</span> | **Accurate** (Green) | The statement is completely factual, supported by transcript, and compliant with all rules. |
| <span style="color:#dc2626">✗</span> | **Hallucination** (Red) | The AI invented facts or directly contradicted what occurred in the transcript. |
| <span style="color:#d97706">⚠</span> | **Omission** (Yellow) | Required information was discussed in the call but left out of the summary. Click **`+ Add Omission`** if there is no text in the summary to highlight. |
| <span style="color:#9333ea">⚡</span> | **Rule Breach** (Purple) | The underlying fact is true, but a formatting/compliance rule was broken (e.g., balance amount stated, unredacted garage name, US spelling). |

---

### Step 4: Cite Transcript Turn Evidence
1. Once an item is tagged, the left-hand transcript enters **Evidence Citation Mode** (*"Click turns to cite evidence"*).
2. Click any turn bubble (`T01`, `T04`, `T08`...) in the transcript to link it as evidence to the active item.
3. Cited turns will display an indigo ring and a **`cited`** badge.
4. **To remove a citation:** Click the turn again in the transcript, or click the small **`×`** on the turn badge inside the bottom audit tray.

---

### Step 5: Add Reviewer Notes & Set Severity
In the bottom tray:
* **Evaluator Note**: Add a brief note explaining your finding.
* **Severity Toggle**: Click to toggle between:
  * **`Definite`**: A clear, demonstrable error or breach.
  * **`Uncertain`**: A borderline or ambiguous case.

---

### Step 6: Assign Overall Verdict & Submit
In the bottom-right corner:
1. Select an overall call verdict:
   * **`✓ Accurate`**: The summary is faithful and compliant.
   * **`✗ Inaccurate`**: Contains hallucinations, material omissions, or critical rule breaches.
   * **`? Needs Review`**: Requires supervisor escalation.
2. Click **`Submit Review`**:
   * Marks the call as complete (shows `✓` in dropdown and updates the progress bar).
   * Automatically downloads a structured JSON audit file (`review-CALL-019.json`).

---

## 3. Exporting All 20 Reviews (Batch Report)

To export your complete audit across all reviewed calls at once:
* Click the **`Export All (X)`** button in the top header.
* Generates and downloads **`soundsense-batch-review-report-[date].json`** containing:
  * Overall accuracy statistics (% accurate vs inaccurate).
  * Aggregate counts of hallucinations, omissions, and rule breaches across the dataset.
  * Complete per-call audit trails with turn-level citations.

---

## 4. Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **`[`** or **`Alt + ←`** | Navigate to Previous Call |
| **`]`** or **`Alt + →`** | Navigate to Next Call |
| **`Esc`** | Close Rules Drawer / Clear Active Citation Mode |

---

## 5. Persistence & Data Safety

* All your work, notes, and citations **auto-save instantly** in your browser's local session.
* Refreshing or closing the tab will not lose any completed reviews.
* To reset a review for a specific call, click the **`↺`** reset button in the bottom bar.

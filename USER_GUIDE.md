# SoundSense Call QA Surface — User & Evaluator Guide

Welcome to the **Call QA Review Surface**. This specialized evaluation application enables human reviewers to systematically audit AI-generated call summaries against raw transcripts and UK debt collection compliance rules.

---

## 1. Quick Start

### Running Locally
```bash
# Clone the repository
git clone https://github.com/kush7773/call-qa-.git
cd call-qa-

# Install dependencies & run
npm install
npm run dev
```
Open **`http://localhost:5173`** in any modern web browser.

### Cloud Deployment
Deployable in 1 click to **Vercel** or **Netlify**:
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**: None required (Zero-config static deployment)

---

## 2. Interface Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│  HEADER: Call Selector · Direction Tag · Progress Bar · Rules · Export │
├───────────────────────────────────┬────────────────────────────────────┤
│                                   │                                    │
│   TRANSCRIPT PANE (Left 50%)      │   AI SUMMARY PANE (Right 50%)      │
│   • Turn IDs (T01, T02...)        │   • Highlight text to tag          │
│   • Agent / Customer bubbles      │   • 4 Color-coded classifications  │
│   • Click-to-cite evidence mode   │   • "+ Add Omission" button        │
│                                   │                                    │
├───────────────────────────────────┴────────────────────────────────────┤
│  AUDIT BANNER (Bottom): Notes · Evidence Chips · Definite/Uncertain    │
│                         Verdict (Accurate / Inaccurate) · Submit       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Review Workflow

### Step 1: Select a Call
* Navigate through the **20 synthetic collections calls** using the `<` and `>` buttons, the dropdown selector in the header, or keyboard shortcuts (`[` and `]`).
* The header displays the **Call ID**, **Call Date**, **Estimated Duration**, **Direction** (`Inbound` vs `Outbound`), and overall progress (`X/20 done`).

### Step 2: Consult Summary Rules
* Click the **`Rules`** button in the header (or press `Esc` to dismiss) to open the **Summary Rules Checklist**.
* Use the live search to check compliance rules:
  * **Numerical balances**: Arrears numbers (e.g. "arrears of £460") are strictly forbidden. Only mention that "arrears were discussed".
  * **Payment amounts**: Never state amounts for payments made during the call. Always use "Payment made."
  * **Entity Redaction**: Employers and car garages must be redacted (e.g. "works for Cedar Lane Distribution" must be generalized to "changed jobs").
  * **Named Advice Bodies**: Referrals to StepChange, Citizens Advice, or MoneyHelper must be retained by name.
  * **Consent phrase**: Must state "Consent gained to record vulnerability" when customer agrees.
  * **British English**: Check for UK spelling (e.g. *authorised*, *programme*, *centre*).

### Step 3: Flag Annotations
Highlight any sentence or phrase in the **AI Summary** pane. A floating popover menu will appear:

| Tag | Color | Meaning |
| :--- | :---: | :--- |
| **Accurate** | 🟢 Green | The claim is completely factual, supported by transcript, and compliant with all rules. |
| **Hallucination** | 🔴 Red | The AI invented facts or directly contradicted what was said in the transcript. |
| **Omission** | 🟡 Yellow | Information required by the rules was discussed but omitted from the summary. Click **`+ Add Omission`** if there is no text in the summary to highlight. |
| **Rule Breach** | 🟣 Purple | The underlying fact is correct, but a formatting/procedural rule was violated (e.g., stating numerical arrears figures, unredacted garage name, American spelling). |

### Step 4: Cite Supporting Transcript Turns (Evidence)
* When an annotation is created or clicked, the transcript pane enters **Evidence Citation Mode** (*"Click turns to cite evidence"*).
* Click any turn bubble in the transcript (`T01`, `T08`, etc.) to attach it as evidence.
* Cited turns will display an indigo ring and a `cited` badge.
* To remove a cited turn, click the turn again in the transcript, or click the small `×` on the turn badge inside the bottom tray.

### Step 5: Add Notes & Set Severity
In the expandable bottom audit tray:
* **Evaluator Notes**: Type brief reasoning for why the claim was flagged.
* **Severity Toggle**: Click to toggle between **Definite** (clear, demonstrable error) and **Uncertain** (ambiguous or borderline interpretation).

### Step 6: Select Verdict & Submit
* Select an overall verdict for the call:
  * **`✓ Accurate`**: The summary is faithful and compliant.
  * **`✗ Inaccurate`**: Contains hallucinations, major omissions, or critical rule breaches.
  * **`? Needs Review`**: Borderline cases requiring secondary review.
* Click **`Submit Review`**:
  * Saves the completed review to browser storage.
  * Marks the call as complete (`✓` in dropdown and header progress bar).
  * Automatically downloads a formatted individual JSON audit file (`review-CALL-019.json`).

---

## 4. Batch Exporting (All 20 Calls)

Once multiple or all 20 calls have been audited:
* Click the **`Export All (X)`** button in the header.
* Generates and downloads **`soundsense-batch-review-report-[date].json`** containing:
  * Overall compliance statistics (Total Accurate, Inaccurate, and Needs Review counts).
  * Aggregate breakdown of Hallucinations, Omissions, and Rule Breaches across the entire dataset.
  * Full per-call audit trails with turn-level citations.

---

## 5. Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `[` or `Alt + ←` | Jump to Previous Call |
| `]` or `Alt + →` | Jump to Next Call |
| `Esc` | Close Rules Drawer / Clear Active Selection |

---

## 6. Data Storage & Privacy

* **Zero Cloud Dependency**: All reviews are saved in your browser's private `localStorage`.
* **Complete Portability**: Reviews persist across page reloads and browser sessions.
* **Easy Reset**: Click the reset icon (`↺`) in the bottom tray to clear annotations for the active call if you wish to start over.

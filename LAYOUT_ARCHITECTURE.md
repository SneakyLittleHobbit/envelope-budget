# Envelope Budget App — Layout Architecture Document
### For React Implementation (Mobile-First, LAN-Hosted)
*Consolidated from functional spec + 4 screenshot documentation batches*
*Confidence: ~90% faithful to original app. Low-confidence areas marked with [INFERRED].*

---

## 1. DESIGN PHILOSOPHY & PRINCIPLES

### Core Hierarchy (Everything revolves around this)
```
Accounts  →  contain  →  Envelopes  →  contain  →  Transactions
(where money is)        (the main unit)            (leaf items)
```
- **Envelopes are the primary UX focus.** The default screen is the envelope list. Every action resolves back to an envelope impact.
- **Accounts are infrastructure.** Users think in envelopes, not accounts.
- **Transactions are the record.** Every money movement creates a transaction.

### UI Principles
- **Mobile-first.** Thumb-zone design. Large tap targets (min 44px). Bottom navigation.
- **Consistency first.** Same action always in same position:
  - Edit/reorder mode = top-left `Edit` button on all list screens
  - Add new item = top-right pencil/+ icon on all list screens
  - Cancel modal = top-left X in green circle
  - Save modal = top-right green pill `Save` button
  - Drill into detail = tap row body
  - Sub-screen navigation = `<` back chevron top-left
- **Dark theme throughout.** Near-black background (`#0D1310`), dark card surfaces (`#1C2B22`), green headers.
- **Immediate feedback.** Balances update instantly. Overspent envelopes turn red immediately.
- **Picker pattern.** All dropdown selections open as full screens (not modals/sheets), with `<` back navigation and auto-close on tap (or Save for complex pickers).

---

## 2. COLOR SYSTEM

| Token | Hex (approx) | Usage |
|---|---|---|
| `bg-primary` | `#0D1310` | Main screen background |
| `bg-card` | `#1C2B22` | Form fields, section cards |
| `bg-section-header` | `#162318` | Date group headers, section labels |
| `green-header` | `#2D6A4F` | Top header bar background |
| `green-accent` | `#3CB371` | Active tab, save buttons, positive amounts, balance bars, toggles ON |
| `green-pill` | `#3CB371` | Save button, icon backgrounds |
| `red-alert` | `#E53935` | Overspent envelope bar, negative balances |
| `text-primary` | `#FFFFFF` | Main labels, amounts, payee names |
| `text-secondary` | `#8A9E8F` | Sub-labels, budget amounts, placeholders, section headers |
| `text-positive` | `#3CB371` | Income/fill amounts (+prefix) |
| `text-negative` | `#E53935` | Overspent amounts |
| `blue-select` | `#2979FF` | Selected state checkmark, text links |
| `divider` | `#2A3D30` | Row separators |
| `red-delete` | `#FF3B30` | Delete circle button in edit mode |

---

## 3. NAVIGATION ARCHITECTURE

### Bottom Tab Bar (Always Visible, 5 Tabs)
```
[ Envelopes ] [ Transactions ] [ Accounts ] [ Reports* ] [ More* ]
```
- Icons above labels. Active = green icon + green label text.
- Inactive = white/gray icon + gray label text.
- *Reports and More = placeholder screens ("Coming Soon" or basic stub).

### Full Navigation Mental Map
```
APP ROOT
│
├── TAB 1: ENVELOPES (default/home)
│   ├── [Header: Edit | Envelopes | + icon]
│   ├── Envelope List (groups → envelopes → Available row)
│   │   └── Tap envelope row → ENVELOPE DETAIL
│   │         ├── [Header: < | Envelope Name | pencil icon]
│   │         ├── Summary card (balance, bar, status message)
│   │         ├── Transaction list (date-grouped)
│   │         │   └── Tap transaction → EDIT TRANSACTION FORM
│   │         └── Tap pencil → EDIT ENVELOPE FORM
│   ├── Tap [Edit] → EDIT BUDGET SCREEN
│   │     ├── [Header: | Edit Budget | Done]
│   │     ├── Envelope list (delete — | name | budget | ≡ drag)
│   │     ├── Tap envelope name → EDIT ENVELOPE FORM
│   │     ├── Tap [+ Add Envelope] → ADD ENVELOPE FORM
│   │     └── Footer: [Monthly >] [Total Budgeted XXXX]
│   └── Tap [+ icon] → ADD ENVELOPE FORM
│
├── TAB 2: TRANSACTIONS
│   ├── [Header: 🔍 | Transactions | pencil icon]
│   ├── Upcoming section (scheduled transactions)
│   ├── Transaction list (date-grouped, newest first)
│   │   └── Tap row → EDIT TRANSACTION FORM
│   ├── Tap [🔍] → SEARCH TRANSACTIONS SCREEN
│   └── Tap [pencil icon] → ADD TRANSACTION FORM
│
├── TAB 3: ACCOUNTS
│   ├── [Header: Edit | Accounts | pencil icon]
│   ├── Account list (grouped: Checking/Savings/Cash | Debt)
│   │   └── Tap account row → ACCOUNT DETAIL
│   │         ├── [Header: < | Account Name | pencil icon]
│   │         ├── Account balance summary
│   │         ├── Transaction list for this account
│   │         │   └── Tap transaction → EDIT TRANSACTION FORM
│   │         └── Tap pencil → EDIT ACCOUNT FORM
│   ├── Tap [Edit] → EDIT ACCOUNTS MODE (inline delete + reorder)
│   └── Tap [pencil icon] → ADD ACCOUNT FORM
│
├── TAB 4: REPORTS [PLACEHOLDER]
│   └── "Coming Soon" stub screen
│
└── TAB 5: MORE [PLACEHOLDER]
    └── Stub (settings, about — minimal)

GLOBAL OVERLAPPING FLOWS:
│
├── ADD TRANSACTION FORM (from any + button or pencil icon)
│   ├── Tap [Type >] → SELECT TYPE SCREEN (7 options)
│   ├── Tap [Payee >] → PAYEE INPUT SCREEN (text input)  
│   ├── Tap [Envelope >] → ENVELOPE PICKER SCREEN
│   │     └── Tap [--Split to Multiple--] → SPLIT TRANSACTION SCREEN [INFERRED]
│   ├── Tap [Account >] → ACCOUNT PICKER SCREEN
│   ├── Tap [Date >] → DATE PICKER SCREEN
│   └── Tap [Schedule >] → SCHEDULE THIS SCREEN (11 options)
│
└── ADD INCOME FORM (when Type = "Add Income" — special 3-step flow)
    ├── Step 1: Income details (Amount, Payer, Account, Date)
    ├── Step 2: Destination picker ("In my Envelopes" card)
    └── Step 3: Fill envelopes (envelope list with amounts)
          └── Tap [>] on envelope → ENVELOPE FILL SUB-SCREEN
                (No Change | Add Budget Amount | Add Specific Amount + input)
```

---

## 4. SCREEN SPECIFICATIONS

---

### LAYER 1: THE 5 MAIN TAB SCREENS

---

#### 4.1 ENVELOPES SCREEN (Tab 1 — Default Home)

```
┌─────────────────────────────────┐
│  [Edit]    Envelopes    [✎]    │  ← Green header
├─────────────────────────────────┤
│            All Envelopes: X,XX  │  ← Right-aligned, gray, small
│                                 │
│  GROUP NAME            X XXX,00 │  ← Bold large, group total right
│  Envelope Name         X XXX,00 │
│  [███████░░░░░░░░░░░░░] X XXX,00│  ← Bar + budget amount
│  Envelope Name             0,00 │
│  [█░░░░░░░░░░░░░░░░░░░]   XXX,00│
│  Envelope Name           -XX,00 │  ← Red if negative
│  [░░░░████████░░░░░░░░]   XXX,00│  ← Red bar if overspent
│                                 │
│  Available              X XXX,00│  ← Bold, always last, no bar
├─────────────────────────────────┤
│  [Envelopes][Trans][Accounts][Reports][More] │
└─────────────────────────────────┘
```

**Envelope Row Detail:**
- Line 1: `Name` (left, white, 16px) — `X,XX` (right, white, 16px)
- Line 2: Progress bar (full width, 4px tall, rounded)
  - Green fill = current balance as % of budget
  - Red fill = if balance is negative (bar fills red from left)
  - Gray = remaining unfilled portion
- Line 3 (below bar): `(blank)` — `X,XX` (right, gray 13px — budget amount)

**Available Row:**
- `Available` (left, bold, white, 18px) — `X,XX` (right, bold, white, 18px)
- No bar. Visually heavier than envelope rows. Always pinned last.

**Group Header Row:**
- `GROUP NAME` (left, bold, white, 18px) — `X,XX` (right, bold, white, 18px — sum of group envelopes)
- Slightly different background from envelope rows to visually separate

**Interactions:**
- Tap envelope row → Envelope Detail
- Tap group header → [INFERRED: no action, or collapse/expand group]
- Tap `Edit` → Edit Budget Screen
- Tap `✎` → Add Envelope Form

---

#### 4.2 TRANSACTIONS SCREEN (Tab 2)

```
┌─────────────────────────────────┐
│  [🔍]   Transactions    [✎]   │  ← Green header
├─────────────────────────────────┤
│ Upcoming                        │  ← Dark band header (if scheduled exist)
│ [+] [Scheduled] Monthly Fill +7 500,00│
│     03/01/2026 | [Multiple]     │
├─────────────────────────────────┤
│ Sat                  Feb 21,2026│  ← Date group header
│ Payee Name              XXX,00  │
│ Envelope | Account              │
│ ─────────────────────────────── │
│ Payee Name              XXX,00  │
│ Envelope | Account              │
├─────────────────────────────────┤
│ Fri                  Feb 13,2026│
│ Income            +7 500,00     │  ← Green + prefix for income
│ [Multiple] | My Account         │
├─────────────────────────────────┤
│  [Envelopes][Trans✓][Accounts][Reports][More] │
└─────────────────────────────────┘
```

**Transaction Row:**
- Line 1: Payee name (left, white, 16px) — Amount (right, white, 16px)
- Line 2: `Envelope | Account` (left, gray, 13px)
- Income/fill rows: amount in green with `+` prefix
- Expense rows: amount in white, no sign

**Upcoming Row:**
- `[+]` circle icon left (tap = post/confirm scheduled transaction early)
- `[Scheduled]` italic gray prefix + transaction name
- Amount right (white)
- Sub-line: `Date | [Multiple or Envelope]`

**Date Group Header:**
- Full-width dark band: `Day` (left, white bold) — `Month DD, YYYY` (right, white bold)

**Interactions:**
- Tap transaction row → Edit Transaction Form (same form, pre-populated)
- Tap `[+]` on Upcoming row → Confirm/post scheduled transaction
- Tap `🔍` → Search Transactions
- Tap `✎` → Add Transaction Form

---

#### 4.3 ACCOUNTS SCREEN (Tab 3)

```
┌─────────────────────────────────┐
│  [Edit]    Accounts      [✎]   │  ← Green header
├─────────────────────────────────┤
│               All Accounts: X,XX│  ← Right-aligned, gray, small
│ Checking, Savings, Cash   X,XX  │  ← Section header (gray)
│ My Account                X,XX  │  ← Account row
│ ─────────────────────────────── │
│ Debt                      X,XX  │  ← Section header
│ ⓘ Tap Edit to add a Debt Account│  ← Hint when section empty
│   Track your debt balance...    │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [Envelopes][Trans][Accounts✓][Reports][More] │
└─────────────────────────────────┘
```

**Account Row:**
- `Account Name` (left, white, 16px) — `X,XX` (right, white, 16px)

**Section Header Row:**
- `Section Name` (left, gray, 14px) — `X,XX` (right, gray, 14px — section total)

**Hint Row (empty section):**
- ⓘ icon + two-line gray text

**Interactions:**
- Tap account row → Account Detail Screen [INFERRED from pattern]
- Tap `Edit` → Edit Accounts mode (inline delete + reorder)
- Tap `✎` → Add Account Form

---

#### 4.4 REPORTS SCREEN (Tab 4) — PLACEHOLDER

```
┌─────────────────────────────────┐
│         Reports                 │
├─────────────────────────────────┤
│                                 │
│    📊 Reports coming soon       │
│                                 │
├─────────────────────────────────┤
│  [Envelopes][Trans][Accounts][Reports✓][More] │
└─────────────────────────────────┘
```

---

#### 4.5 MORE SCREEN (Tab 5) — PLACEHOLDER

```
┌─────────────────────────────────┐
│         More                    │
├─────────────────────────────────┤
│  Household Name          >      │
│  ─────────────────────────────  │
│  Clear All Data                 │
├─────────────────────────────────┤
│  [Envelopes][Trans][Accounts][Reports][More✓] │
└─────────────────────────────────┘
```

---

### LAYER 2: DETAIL / DRILL-DOWN SCREENS

---

#### 4.6 ENVELOPE DETAIL SCREEN

```
┌─────────────────────────────────┐
│  [<]    Groceries        [✎]   │  ← Green header
├─────────────────────────────────┤
│  [🏠icon]  Groceries   4 085,00 │
│            [████████░░░]5 800,00│  ← Thicker bar
│            Great! Ahead by X,XX │  ← Dynamic status message
├─────────────────────────────────┤
│ Sat                  Feb 21,2026│
│ Dischem                  176,00 │
│ My Account                      │
│ ─────────────────────────────── │
│ Woolworths               275,00 │
│ My Account                      │
├─────────────────────────────────┤
│ Fri                  Feb 13,2026│
│ Income           +5 800,00      │  ← Green
│ Groceries | My Account          │
├─────────────────────────────────┤
│  [Envelopes✓][Trans][Accounts][Reports][More] │
└─────────────────────────────────┘
```

**Summary Card:**
- Icon: Envelope mascot (decorative, fixed)
- Name: bold white, 18px
- Balance bar: same green/red logic, thicker (6px), more prominent
- Status message options (dynamic):
  - Positive surplus: `Great! You're ahead by X,XX`
  - Zero or on track: `On track`
  - Overspent: `Over budget by X,XX` (red text)

**Transaction List:** Same format as Transactions tab but filtered to this envelope only.

**Transaction Row in Envelope Detail:**
- Line 1: Payee (left) — Amount (right)
- Line 2: Account name only (no envelope — implied by context)
- For income/fill rows: `Envelope | Account` on line 2

**Interactions:**
- Tap `<` → back to Envelopes list
- Tap `✎` → Edit Envelope Form
- Tap transaction row → Edit Transaction Form

---

#### 4.7 ACCOUNT DETAIL SCREEN [INFERRED]

```
┌─────────────────────────────────┐
│  [<]    My Account       [✎]   │
├─────────────────────────────────┤
│  My Account             X,XX    │  ← Account name + balance
├─────────────────────────────────┤
│ Sat                  Feb 21,2026│
│ Dischem                  176,00 │
│ Groceries                       │  ← Envelope name (no account — implied)
├─────────────────────────────────┤
│  [Envelopes][Trans][Accounts✓][Reports][More] │
└─────────────────────────────────┘
```

Transaction rows show `Envelope` on line 2 (no account — implied by context).

---

### LAYER 3: FORMS — ADD / EDIT SCREENS

---

#### 4.8 ADD / EDIT TRANSACTION FORM

**Header:**
- Left: X (cancel)
- Center: `Add Transaction` / `Edit Transaction`
- Right: `Save` (grayed until required fields filled; required = Amount + type-specific fields)

**Field layout varies by Type. Base template:**

```
┌─────────────────────────────────┐
│  [X]  Add Transaction   [Save]  │
├─────────────────────────────────┤
│ Type                Expense   > │
├───────────────── (gap) ─────────┤
│ Payee    Who received payment? >│
│ Amount                      Amt │
│ Envelope                      > │
│ Account                       > │
├──────── Details ────────────────┤
│ Date              02/22/2026  > │
│ Schedule...             Never > │
│ Check Num                       │
│ Note                            │
│ Expense/Credit        Expense > │
├─────────────────────────────────┤
│ Save location to transaction  ⬤ │  ← Toggle ON (omit in web build)
└─────────────────────────────────┘
```

**Field Matrix by Transaction Type:**

| Field | Expense | Add Income | Fill From Available | Envelope Transfer | Account Transfer | Debt Payment | Interest/Fee/Charge |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Type | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Payee | ✅ | → Payer | ❌ | ❌ | ❌ | ❌ | ❌ |
| Amount | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Description | ❌ | ❌ | ❌ | ✅ pre-filled | ✅ pre-filled | ❌ | ❌ |
| Envelope | ✅ | ❌* | ✅ | ❌ | ❌ | ❌ | ❌ |
| From | ❌ | ❌ | ❌ | ✅ envelope | ✅ account | ❌ | ❌ |
| To | ❌ | ❌ | ❌ | ✅ envelope | ✅ account | ❌ | ❌ |
| Account | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Debt Account | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Date | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Schedule | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check Num | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Note | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Expense/Credit | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

*Add Income handles envelope filling via the 3-step flow instead.
*Fill From Available skips to Step 3 fill UI (no income details).

**Required fields for Save to activate:**
- Expense: Amount + Envelope + Account
- Add Income: Amount + Account (Step 3 fill optional)
- Fill From Available: at least one envelope fill amount entered
- Envelope Transfer: Amount + From + To
- Account Transfer: Amount + From + To
- Debt Payment: Amount + Account + Debt Account
- Interest/Fee/Charge: Amount + Debt Account

---

#### 4.9 ADD INCOME — 3-STEP SCROLLABLE FORM

Single scrollable screen. One `Save` commits all steps.

```
┌─────────────────────────────────┐
│  [X]    Edit Income     [Save]  │
├─────────────────────────────────┤
│           Step 1                │
│    Tell us about your income    │
│ Amount                  7500,00 │
│ Payer                   Income  │
│ Account           My Account  > │
│ Date              02/13/2026  > │
├─────────────────────────────────┤
│           Step 2                │
│    Where do you want it to go?  │
│                                 │
│    ┌──────────────────────┐     │
│    │  [✉ icon]            │     │
│    │  In my Envelopes     │     │
│    └──────────────────────┘     │
│                                 │
├─────────────────────────────────┤
│           Step 3                │
│    Let's fill your envelopes    │
│                                 │
│  GROUP NAME                     │
│  Envelope Name       4085,00  > │
│  [████████░░] Add specific 5800 │
│  ...                            │
│                                 │
│  Sweep          [Available][0,00]>│
│  Add the remaining 0,00         │
│                                 │
│  Note                           │
├─────────────────────────────────┤
│     [🗑 trash icon (delete)]    │  ← Centered, bottom
└─────────────────────────────────┘
```

**Step 2 "In my Envelopes" card:**
- Light green rounded rectangle, centered
- Envelope icon (open envelope)
- Text: `In my Envelopes`
- Tapping selects this destination and scrolls to Step 3

**Step 3 Envelope Fill Rows:**
- Line 1: Name (left) — Current balance (right) — `>` chevron
- Line 2: Progress bar
- Line 3: `Add specific amount of X,XX` (left, gray) — Budget amount (right, gray)
- Colors: green bar, red bar if overspent

**Sweep Row (always last in Step 3):**
- `Sweep` (left, white) — `[Available][X,XX]` (right, white) — `>`
- `Add the remaining X,XX` (left, gray, sub-label)

**Trash icon:** Bottom center. Deletes this income transaction entirely (only on Edit, not Add).

---

#### 4.10 ENVELOPE FILL SUB-SCREEN (Tap `>` on Envelope in Step 3)

```
┌─────────────────────────────────┐
│  [<]     Groceries       [✓]   │  ← ✓ confirm (not Save)
├─────────────────────────────────┤
│ No Change                       │
│ ─────────────────────────────── │
│ Add Monthly Budget Amount 5 800,00│
│ ─────────────────────────────── │
│ Add Specific Amount ...      ✓  │  ← Blue ✓ = currently selected
├───────────────── (gap) ─────────┤
│ Amount                  5800,00 │  ← Editable numeric
└─────────────────────────────────┘
```

**Logic:**
- "No Change" = 0 fill for this envelope this run
- "Add Monthly Budget Amount X" = fills exactly the budget regardless of current balance
- "Add Specific Amount" = custom input; defaults to budget amount
- `✓` button confirms and returns to Step 3 with this row's pending fill updated

---

#### 4.11 ADD / EDIT ENVELOPE FORM

```
┌─────────────────────────────────┐
│  [X]   Edit Envelope    [Save]  │
├─────────────────────────────────┤
│ Name                 Groceries >│
│ Budget                  5800,00 │  ← Direct numeric input
├───────────────── (gap) ─────────┤
│ Group                     Abi > │
│ Frequency             Monthly > │
├─────────────────────────────────┤
│ Monthly: 5/10 Free Left         │  ← Omit plan limits in our build
└─────────────────────────────────┘
```

**Fields:**
- `Name` — chevron → Name Input Screen (text field, full screen)
- `Budget` — direct numeric input, right-aligned
- `Group` — chevron → Group Picker (list of existing groups + "New Group" option)
- `Frequency` — chevron → Envelope Period Screen

---

#### 4.12 ENVELOPE PERIOD SCREEN

```
┌─────────────────────────────────┐
│  [X]  Envelope Period   [Save]  │
├─────────────────────────────────┤
│ Monthly                      ✓  │
│ Every Two Months                │
│ Every Three Months              │
│ Every Six Months                │
│ Annual                          │
│ Goal                            │
├───────────────── (gap) ─────────┤
│ Due on the (Optional)        ⬤ │  ← Toggle (reveals date picker when ON)
└─────────────────────────────────┘
```

**Period options:** Monthly | Every Two Months | Every Three Months | Every Six Months | Annual | Goal
**Save required** (does not auto-close on tap).

---

#### 4.13 ADD / EDIT ACCOUNT FORM

Two variants depending on account type. Type is selected before the form opens [INFERRED: type picker shown first, then form].

**Variant A — Regular Account (Checking/Savings/Cash) [INFERRED]:**
```
┌─────────────────────────────────┐
│  [X]    Add Account     [Save]  │
├─────────────────────────────────┤
│ Checking, Savings, Cash         │  ← Section label (gray)
│ Name             Account Name   │
│ Account Type         Checking > │  ← Picker: Checking/Savings/Cash
│ Balance         Current Balance │
└─────────────────────────────────┘
```

**Variant B — Debt Account:**
```
┌─────────────────────────────────┐
│  [X]    Add Account     [Save]  │
├─────────────────────────────────┤
│ Debt                            │  ← Section label
│ Name             Account Name   │
│ Balance         Current Balance │
├───────────────── (gap) ─────────┤
│ Status      Working to pay off >│
│ Envelope                      > │  ← Links payoff envelope
│ Monthly Payment            Amt  │
│ Interest Rate (Optional)   APR% │
│ Due on the (Optional)        ⬤ │
└─────────────────────────────────┘
```

**Account Type Selector [INFERRED — shown before or at top of form]:**
Options: Checking | Savings | Cash | Credit Card | Debt

---

### LAYER 3: PICKER / SUB-SCREENS

---

#### 4.14 SELECT TYPE SCREEN

```
┌─────────────────────────────────┐
│  [<]     Select Type            │
├─────────────────────────────────┤
│ Expense                      ✓  │  ← Blue ✓ = current selection
│ Add Income                      │
│ Fill From Available             │
├──── Transfers ──────────────────┤
│ Envelope Transfer               │
│ Account Transfer                │
├──── Debt ───────────────────────┤
│ Debt Payment                    │
│ Interest, Fee, or New Charge    │
└─────────────────────────────────┘
```

Auto-closes and returns to form on tap. No Save needed.

---

#### 4.15 ENVELOPE PICKER SCREEN

```
┌─────────────────────────────────┐
│  [<]      Envelope              │
├─────────────────────────────────┤
│ --Split to Multiple--           │  ← Special option, italic gray
│                                 │
│ GROUP NAME                      │
│ Groceries [4 085,00]            │
│ Donsie [0,00]                   │
│ Cleaners [-90,00]               │
│ ...                             │
└─────────────────────────────────┘
```

Format: `Name [current balance]` — white text, thin dividers between rows.
Auto-closes on tap.

---

#### 4.16 ACCOUNT PICKER SCREEN

```
┌─────────────────────────────────┐
│  [<]      Account               │
├─────────────────────────────────┤
│ My Account [4 465,00]           │
│ ...                             │
└─────────────────────────────────┘
```

Format: `Name [current balance]` — same as envelope picker.
Only on-budget accounts shown (no Debt accounts in standard picker).
Auto-closes on tap.

---

#### 4.17 SCHEDULE THIS SCREEN

```
┌─────────────────────────────────┐
│  [X]    Schedule This   [Save]  │
├─────────────────────────────────┤
│ Never                        ✓  │
│ Once                            │
│ Weekly                          │
│ Every 2 Weeks                   │
│ Every 4 Weeks                   │
│ Every Month                     │
│ Last Day of Month               │
│ Every 2 Months                  │
│ Every 3 Months                  │
│ Every 6 Months                  │
│ Every Year                      │
└─────────────────────────────────┘
```

Save required.

---

#### 4.18 SEARCH TRANSACTIONS SCREEN

```
┌─────────────────────────────────┐
│  [<]  Search Transactions [📅] │  ← Calendar icon = date range filter
├─────────────────────────────────┤
│  [🔍 Search by keyword, amount…]│  ← Auto-focused, keyboard opens
│                                 │
│  [results appear here as typed] │
└─────────────────────────────────┘
```

---

#### 4.19 EDIT BUDGET SCREEN (Envelopes Edit Mode)

```
┌─────────────────────────────────┐
│         Edit Budget      [Done] │
├─────────────────────────────────┤
│ GROUP NAME                      │
│ [—] Groceries        5800   [≡] │
│ [—] Donsie            300   [≡] │
│ [—] Toilet paper      130   [≡] │
│ ...                             │
│                                 │
│ + Add Envelope                  │  ← Blue text link
├─────────────────────────────────┤
│ Monthly >  │  Total Budgeted 7500│ ← Footer bar, amount in green
└─────────────────────────────────┘
```

**Row elements:**
- `[—]` red circle minus (left) = delete with confirmation
- Envelope name (center-left, white)
- Budget amount (center-right, white, numeric only)
- `[≡]` drag handle (right) = long-press to reorder

**Footer:** Fixed to bottom above tab bar.
- Left: `Monthly >` — period selector
- Right: `Total Budgeted XXXX` — "Total Budgeted" white, number in green

---

## 5. INTERACTION PATTERNS (GLOBAL)

### 5.1 Picker Pattern
All pickers = full new screen (not bottom sheet). Navigation via `<` back.
- **Auto-close pickers** (tap = select + return): Type, Envelope, Account, Payee
- **Save-required pickers** (must tap Save): Envelope Period, Schedule This, Date
- Selected item shows blue ✓ on right

### 5.2 Edit Mode (List Screens)
Triggered by `Edit` button (top-left). Activates:
- Red `—` delete circles appear left of each row
- `≡` drag handles appear right of each row
- Tap `—` → shows delete confirmation inline or shifts row for swipe-delete
- Long-press `≡` → drag to reorder
- `Done` button replaces `Edit` when active

### 5.3 Form Save State
`Save` button (top-right):
- Grayed/disabled = required fields empty
- Green/active = required fields filled
- Tapping Save → validates → saves → dismisses form → returns to previous screen

### 5.4 Negative Balance Handling
- Envelope balance goes negative = allowed (no block)
- Visual response: balance bar turns red, amount text turns red
- System does not prevent the user from overspending — only shows it

### 5.5 Amount Display Format
- Use `,` as decimal separator (matching original app: `4 085,00`)
- Thousands separator: space (`4 465,00`)
- Currency symbol: omitted inline, implied by context [INFERRED: add currency setting in More]
- Positive income/fill amounts: green, `+` prefix
- Negative: red, `-` prefix

### 5.6 Add Transaction — Global Access
Add Transaction is accessible from:
- Transactions tab header pencil icon
- Accounts tab header pencil icon [INFERRED]
- Inside Envelope Detail (via pencil or FAB) [INFERRED]
- [INFERRED: consider a floating action button on main screens for quick add]

---

## 6. DATA MODEL (Implementation Reference)

```
Household
├── id, name
│
├── Accounts[]
│   ├── id, name, type (checking|savings|cash|credit|debt), balance
│   ├── isOnBudget (debt = false)
│   └── [debt only]: status, linkedEnvelopeId, monthlyPayment, interestRate, dueDate
│
├── EnvelopeGroups[]
│   ├── id, name, sortOrder
│   └── Envelopes[]
│       ├── id, groupId, name, budgetAmount, frequency, balance, sortOrder
│       └── [annual/goal]: dueDate
│
├── Available (computed: sum of on-budget account balances − sum of envelope balances)
│
└── Transactions[]
    ├── id, type, date, amount, note, isScheduled, scheduleFrequency
    ├── [expense]: payeeId, envelopeId, accountId, isCredit, checkNum
    ├── [income]: payer, accountId, fills[]={envelopeId, amount}
    ├── [fill]: fills[]={envelopeId, amount}, note
    ├── [envelope transfer]: fromEnvelopeId, toEnvelopeId
    ├── [account transfer]: fromAccountId, toAccountId
    └── [debt]: accountId, debtAccountId
```

**Computed Values (never stored, always calculated):**
- `envelope.balance` = sum of all fills into envelope − sum of all expenses from envelope
- `Available` = sum of all on-budget account balances − sum of all envelope balances
- `group.total` = sum of envelope balances in group
- `allEnvelopes.total` = sum of all envelope balances

---

## 7. SCREEN INVENTORY (Complete List)

| # | Screen | Layer | Trigger |
|---|---|---|---|
| 1 | Envelopes (Home) | Tab 1 | Default |
| 2 | Transactions | Tab 2 | Tab bar |
| 3 | Accounts | Tab 3 | Tab bar |
| 4 | Reports (stub) | Tab 4 | Tab bar |
| 5 | More (stub) | Tab 5 | Tab bar |
| 6 | Envelope Detail | L2 detail | Tap envelope row |
| 7 | Account Detail | L2 detail | Tap account row |
| 8 | Edit Budget | L2 | Tap Edit on Envelopes |
| 9 | Add/Edit Transaction | L3 form | Pencil icon / tap transaction |
| 10 | Add Income (3-step) | L3 form | Type = Add Income |
| 11 | Add/Edit Envelope | L3 form | + Add / tap name in Edit Budget |
| 12 | Add/Edit Account | L3 form | Pencil on Accounts / Edit mode |
| 13 | Select Type | L3 picker | Tap Type in transaction form |
| 14 | Envelope Picker | L3 picker | Tap Envelope in form |
| 15 | Account Picker | L3 picker | Tap Account in form |
| 16 | Schedule This | L3 picker | Tap Schedule in form |
| 17 | Envelope Period | L3 picker | Tap Frequency in envelope form |
| 18 | Date Picker | L3 picker | Tap Date in any form |
| 19 | Envelope Fill Sub-screen | L3 sub | Tap > on envelope in Step 3 |
| 20 | Search Transactions | L3 utility | Tap 🔍 on Transactions |
| 21 | Group Picker | L3 picker | Tap Group in envelope form |
| 22 | Payee Input | L3 picker | Tap Payee in transaction form |

**Total screens: 22** (excluding Reports/More stubs)

---

## 8. IMPLEMENTATION NOTES FOR REACT

### Tech Recommendations
- **React Router** — for screen navigation (push/pop)
- **Zustand or Context API** — global state (household data)
- **localStorage or IndexedDB** — persistence (no backend needed for LAN use)
- **date-fns** — date formatting/manipulation
- **Tailwind CSS** — utility styling (dark theme custom tokens)

### Mobile-First Layout Shell
```jsx
// App shell
<div className="h-screen flex flex-col bg-primary max-w-md mx-auto">
  <Header />           // fixed top, green bg
  <main className="flex-1 overflow-y-auto">
    <RouterOutlet />   // screen content
  </main>
  <BottomTabBar />     // fixed bottom, 5 tabs
</div>
```

### Key Component List
- `BottomTabBar` — 5 tab navigation
- `AppHeader` — green header with configurable left/center/right slots
- `EnvelopeRow` — name + balance + progress bar + budget
- `EnvelopeGroup` — group header + list of EnvelopeRows
- `TransactionRow` — payee + amount + envelope|account
- `DateGroupHeader` — day + date band
- `ProgressBar` — green/red fill with props
- `PickerScreen` — reusable full-screen picker with radio items
- `FormField` — label + value + optional chevron row
- `FormSection` — grouped FormFields with optional label
- `Toggle` — iOS-style toggle switch
- `SaveButton` — green pill, disabled state
- `CancelButton` — X in green circle
- `AddIncomeFlow` — 3-step scrollable form
- `FillSubScreen` — 3-option fill picker with amount input
- `EditBudgetScreen` — list with delete/drag/reorder

### Data Flow for Available Calculation
```
Available = 
  Accounts.filter(a => a.isOnBudget).reduce(sum of balances)
  −
  Envelopes.reduce(sum of balances)
```
This must recompute on every transaction save, delete, or edit.

### Number Formatting
```js
// Format: space thousands, comma decimal
const fmt = (n) => 
  n.toLocaleString('af-ZA', { minimumFractionDigits: 2 });
// 4085 → "4 085,00"
// -90 → "-90,00"
```

### Schedule Recurrence Options (exact values for implementation)
```
never | once | weekly | every_2_weeks | every_4_weeks | 
monthly | last_day_month | every_2_months | every_3_months | 
every_6_months | yearly
```

### Envelope Period Options
```
monthly | every_2_months | every_3_months | 
every_6_months | annual | goal
```

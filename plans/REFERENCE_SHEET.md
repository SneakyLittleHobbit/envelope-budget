# Envelope Budget App — Codebase Reference Sheet

**Quick lookup reference for internal use.** Generated: 2026-02-22

---

## 1. File Quick Reference Table

### Core Library Files (`lib/*`)

| File | Purpose | Key Exports |
|------|---------|-------------|
| [`lib/types.ts`](lib/types.ts) | All TypeScript definitions | `Account`, `Envelope`, `EnvelopeGroup`, `Transaction`, `TransactionType`, `EnvelopeFill`, `Household`, `ScheduleFrequency`, `EnvelopeFrequency`, `AccountType` + label maps |
| [`lib/store.ts`](lib/store.ts) | Zustand store with persistence | `useBudgetStore`, `BudgetStore` interface, all CRUD actions |
| [`lib/computed.ts`](lib/computed.ts) | Derived state calculations | `getEnvelopeBalance()`, `getAllEnvelopeBalances()`, `getAvailable()`, `getGroupTotal()`, `getAllEnvelopesTotal()`, `getGroupedEnvelopes()`, `getTransactionsGroupedByDate()`, `getUpcomingTransactions()`, `getOnBudgetAccountTotal()`, `getDebtAccountTotal()`, `getTotalBudgeted()` |
| [`lib/format.ts`](lib/format.ts) | ZAR currency/date formatting | `formatZAR()`, `formatSignedZAR()`, `parseZARInput()`, `formatDateGroupDay()`, `formatDateGroupFull()`, `formatDateShort()`, `todayISO()` |
| [`lib/use-store-hydration.ts`](lib/use-store-hydration.ts) | SSR hydration guard | `useStoreHydration()` |
| [`lib/seed.ts`](lib/seed.ts) | Demo/initial data | `seedHousehold`, `seedAccounts`, `seedEnvelopeGroups`, `seedEnvelopes`, `seedTransactions` |
| [`lib/utils.ts`](lib/utils.ts) | Tailwind class utility | `cn()` |

### Page Files (`app/(app)/*`)

| Path | Purpose |
|------|---------|
| [`app/(app)/layout.tsx`](app/(app)/layout.tsx) | App shell with hydration guard + BottomTabBar |
| [`app/(app)/envelopes/page.tsx`](app/(app)/envelopes/page.tsx) | Envelope list (home screen) |
| [`app/(app)/envelopes/[id]/page.tsx`](app/(app)/envelopes/[id]/page.tsx) | Envelope detail view |
| [`app/(app)/envelopes/[id]/edit/page.tsx`](app/(app)/envelopes/[id]/edit/page.tsx) | Edit envelope form |
| [`app/(app)/envelopes/add/page.tsx`](app/(app)/envelopes/add/page.tsx) | Add envelope form |
| [`app/(app)/envelopes/edit-budget/page.tsx`](app/(app)/envelopes/edit-budget/page.tsx) | Bulk budget editor |
| [`app/(app)/transactions/page.tsx`](app/(app)/transactions/page.tsx) | Transaction list with upcoming section |
| [`app/(app)/transactions/search/page.tsx`](app/(app)/transactions/search/page.tsx) | Transaction search |
| [`app/(app)/transactions/add/page.tsx`](app/(app)/transactions/add/page.tsx) | Add transaction (7 types, 483 lines) |
| [`app/(app)/transactions/add-income/page.tsx`](app/(app)/transactions/add-income/page.tsx) | 3-step income wizard |
| [`app/(app)/transactions/[id]/edit/page.tsx`](app/(app)/transactions/[id]/edit/page.tsx) | Edit transaction form |
| [`app/(app)/transactions/[id]/edit-income/page.tsx`](app/(app)/transactions/[id]/edit-income/page.tsx) | Edit income transaction |
| [`app/(app)/accounts/page.tsx`](app/(app)/accounts/page.tsx) | Account list |
| [`app/(app)/accounts/[id]/page.tsx`](app/(app)/accounts/[id]/page.tsx) | Account detail view |
| [`app/(app)/accounts/[id]/edit/page.tsx`](app/(app)/accounts/[id]/edit/page.tsx) | Edit account form |
| [`app/(app)/accounts/add/page.tsx`](app/(app)/accounts/add/page.tsx) | Add account form |
| [`app/(app)/reports/page.tsx`](app/(app)/reports/page.tsx) | Reports stub (placeholder) |
| [`app/(app)/more/page.tsx`](app/(app)/more/page.tsx) | Settings/household name |

### Custom Components (`components/*`)

| File | Purpose | Key Props |
|------|---------|-----------|
| [`app-header.tsx`](components/app-header.tsx) | Green header with slots | `left?`, `center?`, `right?` |
| [`bottom-tab-bar.tsx`](components/bottom-tab-bar.tsx) | 5-tab navigation | None |
| [`form-field.tsx`](components/form-field.tsx) | Reusable form row | `label`, `value?`, `placeholder?`, `onTap?`, `showChevron?`, `inputMode?`, `inputType?`, `onChange?`, `rightAlign?` |
| [`form-section.tsx`](components/form-section.tsx) | Form field grouping | `title`, `children` |
| [`picker-overlay.tsx`](components/picker-overlay.tsx) | Full-screen picker modal | `title`, `onClose`, `onSave?`, `useX?`, `children` |
| [`envelope-row.tsx`](components/envelope-row.tsx) | Envelope list row | `id`, `name`, `balance`, `budgetAmount` |
| [`envelope-group.tsx`](components/envelope-group.tsx) | Grouped envelope display | `group`, `envelopes`, `balances` |
| [`progress-bar.tsx`](components/progress-bar.tsx) | Visual balance indicator | `current`, `budget`, `height?` |
| [`transaction-row.tsx`](components/transaction-row.tsx) | Transaction display row | `transaction`, `contextIsEnvelope?`, `contextIsAccount?` |
| [`date-group-header.tsx`](components/date-group-header.tsx) | Date section header | `dateStr` |
| [`empty-hint.tsx`](components/empty-hint.tsx) | Empty state hint | `icon`, `title`, `description` |

---

## 2. Type Definitions Quick Reference

### Core Types

```typescript
// Account types
type AccountType = 'checking' | 'savings' | 'cash' | 'credit_card' | 'debt'

interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  isOnBudget: boolean
  sortOrder: number
  // Debt-only fields
  status?: 'working_to_pay_off' | 'paid_off'
  linkedEnvelopeId?: string
  monthlyPayment?: number
  interestRate?: number
  dueDay?: number
}

interface EnvelopeGroup {
  id: string
  name: string
  sortOrder: number
}

type EnvelopeFrequency = 'monthly' | 'every_2_months' | 'every_3_months' | 'every_6_months' | 'annual' | 'goal'

interface Envelope {
  id: string
  groupId: string
  name: string
  budgetAmount: number      // Target allocation, NOT current balance
  frequency: EnvelopeFrequency
  sortOrder: number
  dueDay?: number           // Not currently used
}

interface EnvelopeFill {
  envelopeId: string
  amount: number
}

interface Transaction {
  id: string
  type: TransactionType
  date: string              // ISO date (YYYY-MM-DD)
  amount: number
  note?: string
  isScheduled: boolean
  scheduleFrequency?: ScheduleFrequency
  // Expense fields
  payee?: string
  envelopeId?: string
  accountId?: string
  isCredit?: boolean        // Refund flag (only for expenses)
  checkNum?: string
  // Income fields
  payer?: string
  fills?: EnvelopeFill[]    // How income is distributed
  // Transfer fields
  fromEnvelopeId?: string
  toEnvelopeId?: string
  fromAccountId?: string
  toAccountId?: string
  // Debt fields
  debtAccountId?: string
  // Auto-generated
  description?: string
}

interface Household {
  name: string
}
```

### TransactionType Enum & Usage

| Type | Account Effect | Envelope Effect | Use Case |
|------|---------------|-----------------|----------|
| `expense` | Decreases | Decreases specific envelope | Spending money |
| `add_income` | Increases | Increases via `fills[]` | Receiving money |
| `fill_from_available` | None | Increases envelope | Allocating unassigned money |
| `envelope_transfer` | None | Moves between envelopes | Reallocating budget |
| `account_transfer` | Moves between accounts | None | Moving real money |
| `debt_payment` | Decreases source, increases debt | None | Paying off debt |
| `interest_fee_charge` | Decreases debt | None | Adding to debt balance |

### ScheduleFrequency Values

```typescript
type ScheduleFrequency = 
  | 'never' | 'once' | 'weekly' | 'every_2_weeks' | 'every_4_weeks'
  | 'monthly' | 'last_day_month' | 'every_2_months' | 'every_3_months'
  | 'every_6_months' | 'yearly'
```

---

## 3. Store Actions Quick Reference

### State Slices

```typescript
const household = useBudgetStore((s) => s.household)      // { name: string }
const accounts = useBudgetStore((s) => s.accounts)        // Account[]
const envelopeGroups = useBudgetStore((s) => s.envelopeGroups)  // EnvelopeGroup[]
const envelopes = useBudgetStore((s) => s.envelopes)      // Envelope[]
const transactions = useBudgetStore((s) => s.transactions) // Transaction[]
```

### Account Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `addAccount` | `(account: Omit<Account, 'id'>) => string` | Creates account, returns new ID |
| `updateAccount` | `(id: string, data: Partial<Account>) => void` | Updates account fields |
| `deleteAccount` | `(id: string) => void` | Removes account (does NOT cascade to transactions) |
| `reorderAccounts` | `(ids: string[]) => void` | Updates sortOrder based on array position |

### Envelope Group Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `addEnvelopeGroup` | `(group: Omit<EnvelopeGroup, 'id'>) => string` | Creates group, returns new ID |
| `updateEnvelopeGroup` | `(id: string, data: Partial<EnvelopeGroup>) => void` | Updates group fields |
| `deleteEnvelopeGroup` | `(id: string) => void` | Deletes group AND all its envelopes |

### Envelope Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `addEnvelope` | `(envelope: Omit<Envelope, 'id'>) => string` | Creates envelope, returns new ID |
| `updateEnvelope` | `(id: string, data: Partial<Envelope>) => void` | Updates envelope fields |
| `deleteEnvelope` | `(id: string) => void` | Removes envelope (transactions keep reference) |
| `reorderEnvelopes` | `(groupId: string, ids: string[]) => void` | Updates sortOrder within group |

### Transaction Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `addTransaction` | `(transaction: Omit<Transaction, 'id'>) => string` | Creates txn, applies to account balances, returns ID |
| `updateTransaction` | `(id: string, data: Partial<Transaction>) => void` | Reverses old effect, applies new effect |
| `deleteTransaction` | `(id: string) => void` | Removes txn, reverses account balance effect |

### Household Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `updateHouseholdName` | `(name: string) => void` | Updates household name |
| `clearAllData` | `() => void` | Resets all state to empty (not seed) |

### Persistence

- **localStorage key:** `'envelope-budget-storage'`
- **Scheduled transactions:** Do NOT affect account balances until posted (`isScheduled: false`)

---

## 4. Computed Functions Quick Reference

| Function | Input | Output | Description |
|----------|-------|--------|-------------|
| `getEnvelopeBalance()` | `envelopeId, transactions` | `number` | Sum of fills - expenses for one envelope |
| `getAllEnvelopeBalances()` | `envelopes, transactions` | `Record<string, number>` | Map of all envelope balances |
| `getAvailable()` | `accounts, envelopes, transactions` | `number` | On-budget accounts total - envelope balances total |
| `getGroupTotal()` | `groupId, envelopes, transactions` | `number` | Sum of envelope balances in a group |
| `getAllEnvelopesTotal()` | `envelopes, transactions` | `number` | Sum of all envelope balances |
| `getGroupedEnvelopes()` | `groups, envelopes` | `{ group, envelopes }[]` | Envelopes grouped and sorted |
| `getTransactionsGroupedByDate()` | `transactions` | `{ date, transactions }[]` | Posted txns by date, newest first |
| `getUpcomingTransactions()` | `transactions` | `Transaction[]` | Scheduled txns sorted by date |
| `getOnBudgetAccountTotal()` | `accounts` | `number` | Sum of on-budget account balances |
| `getDebtAccountTotal()` | `accounts` | `number` | Sum of debt account balances |
| `getTotalBudgeted()` | `envelopes, frequency?` | `number` | Sum of budgetAmounts by frequency |

### Key Equation

```
Available = On-Budget Accounts Total - Envelope Balances Total
```

---

## 5. Route Map

| Route | Purpose | Parameters |
|-------|---------|------------|
| `/` | Redirects to `/envelopes` | — |
| `/envelopes` | Envelope list (home) | — |
| `/envelopes/[id]` | Envelope detail | `id` - envelope ID |
| `/envelopes/[id]/edit` | Edit envelope | `id` - envelope ID |
| `/envelopes/add` | Add new envelope | — |
| `/envelopes/edit-budget` | Bulk budget editor | — |
| `/transactions` | Transaction list | — |
| `/transactions/search` | Search transactions | — |
| `/transactions/add` | Add transaction (7 types) | — |
| `/transactions/add-income` | 3-step income wizard | — |
| `/transactions/[id]/edit` | Edit transaction | `id` - transaction ID |
| `/transactions/[id]/edit-income` | Edit income transaction | `id` - transaction ID |
| `/accounts` | Account list | — |
| `/accounts/[id]` | Account detail | `id` - account ID |
| `/accounts/[id]/edit` | Edit account | `id` - account ID |
| `/accounts/add` | Add new account | — |
| `/reports` | Reports (stub) | — |
| `/more` | Settings/household | — |

---

## 6. Component Library Quick Reference

### AppHeader

```tsx
<AppHeader 
  left={<BackButton />}      // Optional left slot
  center="Page Title"        // Optional center title
  right={<SaveButton />}     // Optional right slot
/>
```

### FormField

```tsx
// Tap-to-pick mode (default)
<FormField
  label="Envelope"
  value={envelopeName}
  placeholder="Select..."
  onTap={() => setShowPicker(true)}
  showChevron
/>

// Direct input mode
<FormField
  label="Amount"
  inputMode
  inputType="text"
  value={amount}
  onChange={setAmount}
  rightAlign
/>
```

### PickerOverlay & PickerRow

```tsx
<PickerOverlay
  title="Select Envelope"
  onClose={() => setShowPicker(false)}
  onSave={handleSave}        // Optional: shows Save button
  useX={false}               // Use X instead of < for close
>
  {envelopes.map(env => (
    <PickerRow
      key={env.id}
      label={env.name}
      sublabel={formatZAR(balance)}  // Optional
      isSelected={selectedId === env.id}
      onTap={() => setSelectedId(env.id)}
      disabled={false}               // Optional
    />
  ))}
</PickerOverlay>
```

### ProgressBar

```tsx
<ProgressBar 
  current={balance}    // Current envelope balance
  budget={budgetAmount} // Target budget amount
  height={4}           // Optional, default 4px
/>
// Green fill if balance >= 0, red if overspent
```

### EnvelopeRow

```tsx
<EnvelopeRow
  id={envelope.id}
  name={envelope.name}
  balance={computedBalance}    // Must compute first!
  budgetAmount={envelope.budgetAmount}
/>
// Renders: name | balance | progress bar | budget amount
```

### TransactionRow

```tsx
<TransactionRow
  transaction={tx}
  contextIsEnvelope={false}  // Show account name only
  contextIsAccount={false}   // Show envelope name only
/>
// Auto-determines display name, amount color, sub-line based on type
// Links to edit or edit-income based on type
```

---

## 7. Common Patterns

### Reading from Store

```tsx
// Subscribe to specific slice (re-renders on change)
const envelopes = useBudgetStore((s) => s.envelopes)

// Subscribe to multiple slices
const { envelopes, transactions } = useBudgetStore((s) => ({
  envelopes: s.envelopes,
  transactions: s.transactions,
}))

// Get action for mutation
const addEnvelope = useBudgetStore((s) => s.addEnvelope)
```

### Updating Store

```tsx
// Always use actions, never mutate directly
const handleSave = () => {
  addEnvelope({
    groupId: selectedGroupId,
    name: envelopeName,
    budgetAmount: parseZARInput(amountStr),
    frequency: 'monthly',
    sortOrder: envelopes.length,
  })
  router.back()
}
```

### Computing Derived Data

```tsx
// In component body - recomputes every render
const envelopeBalances = getAllEnvelopeBalances(envelopes, transactions)
const available = getAvailable(accounts, envelopes, transactions)

// For single envelope
const balance = getEnvelopeBalance(envelopeId, transactions)
```

### Handling Hydration

```tsx
// In app shell or any page using store
const hydrated = useStoreHydration()

if (!hydrated) {
  return <LoadingSpinner />
}

// Safe to render with store data
return <PageContent />
```

### ZAR Currency Formatting

```tsx
// Display
const display = formatZAR(4085.5)  // "4 085,50"

// Signed display (for transactions)
const signed = formatSignedZAR(-90, true)  // "-90,00"
const positive = formatSignedZAR(100, true)  // "+100,00"

// Parse user input
const amount = parseZARInput("4 085,50")  // 4085.5
```

---

## 8. Bug/Issue Registry

### Critical Issues

| Issue | Location | Impact |
|-------|----------|--------|
| TypeScript build errors ignored | [`next.config.mjs`](next.config.mjs) | Type errors can slip into production |
| Date input uses browser prompt | [`transactions/add/page.tsx:278`](app/(app)/transactions/add/page.tsx:278) | Poor UX, blocked by some browsers |
| No form validation library used | All forms | Despite `react-hook-form` + `zod` installed, using manual `useState` |

### Missing Features

| Feature | Status | Notes |
|---------|--------|-------|
| Reports tab | Stub only | Shows "coming soon" |
| Scheduled transaction auto-posting | Not implemented | Must manually post |
| Split transactions | Deferred | v2 per design decisions |
| Drag-to-reorder | UI exists, no logic | Drag handles visible but non-functional |
| Due date logic | Not implemented | `dueDay` field exists but unused |

### Technical Debt

| Issue | Location | Notes |
|-------|----------|-------|
| Unused dependencies | `package.json` | `react-hook-form`, `zod`, `@hookform/resolvers` installed but not used |
| Unused theme provider | [`theme-provider.tsx`](components/theme-provider.tsx) | App is always-dark, no theme switching |
| Duplicate code | Transaction forms | Add/Edit share ~80% code but separate files |
| No error boundaries | App-wide | No error handling UI |
| No loading states | Pages | Only hydration spinner exists |
| No memoization | [`computed.ts`](lib/computed.ts) | All values recalculate every render |
| Native confirm dialogs | Delete actions | Uses `confirm()` instead of custom modal |
| No undo mechanism | All delete actions | Deleting is permanent |

### UX Issues

| Issue | Notes |
|-------|-------|
| No offline indicator | No feedback if localStorage fails |
| Seed data always present | New users see demo data, no "first run" detection |

---

## 9. Environment & Config

### NPM Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Environment Variables

**None.** The application is fully client-side with no external API calls.

### Key Config Files

| File | Purpose |
|------|---------|
| [`next.config.mjs`](next.config.mjs) | Next.js config (⚠️ `ignoreBuildErrors: true`) |
| [`tsconfig.json`](tsconfig.json) | TypeScript strict mode, path alias `@/*` |
| [`components.json`](components.json) | shadcn/ui config: new-york style, lucide icons |
| [`postcss.config.mjs`](postcss.config.mjs) | PostCSS for Tailwind v4 |
| [`app/globals.css`](app/globals.css) | Tailwind imports + custom theme tokens |

### Theme Tokens (CSS Variables)

```css
--budget-bg          /* Background color */
--budget-card        /* Card background */
--budget-header      /* Header background */
--budget-text        /* Primary text */
--budget-text-secondary /* Secondary text */
--budget-divider     /* Border color */
--budget-green       /* Positive/active color */
--budget-blue        /* Selection color */
--budget-red         /* Negative/overspent color */
--budget-positive    /* Income color */
--budget-negative    /* Expense color */
```

### localStorage Key

```
envelope-budget-storage
```

---

## 10. Quick Decision Trees

### Adding a New Transaction Type

1. Add to `TransactionType` union in [`lib/types.ts`](lib/types.ts)
2. Add to `TRANSACTION_TYPE_LABELS` in [`lib/types.ts`](lib/types.ts)
3. Add case to `applyTransactionToAccounts()` in [`lib/store.ts`](lib/store.ts)
4. Add case to `reverseTransactionFromAccounts()` in [`lib/store.ts`](lib/store.ts)
5. Add case to `getEnvelopeBalance()` in [`lib/computed.ts`](lib/computed.ts) (if envelope-affecting)
6. Add form fields in [`transactions/add/page.tsx`](app/(app)/transactions/add/page.tsx)
7. Add edit fields in [`transactions/[id]/edit/page.tsx`](app/(app)/transactions/[id]/edit/page.tsx)
8. Add display logic in [`transaction-row.tsx`](components/transaction-row.tsx)

### Adding a New Field to Envelopes

1. Add field to `Envelope` interface in [`lib/types.ts`](lib/types.ts)
2. Add form field in [`envelopes/add/page.tsx`](app/(app)/envelopes/add/page.tsx)
3. Add form field in [`envelopes/[id]/edit/page.tsx`](app/(app)/envelopes/[id]/edit/page.tsx)
4. Update display in [`envelope-row.tsx`](components/envelope-row.tsx) if needed
5. Handle default value for existing envelopes

### Changing Balance Calculation Logic

⚠️ **HIGH RISK** - Must update in sync:
1. [`lib/computed.ts`](lib/computed.ts) - `getEnvelopeBalance()`, `getAvailable()`
2. [`lib/store.ts`](lib/store.ts) - `applyTransactionToAccounts()`, `reverseTransactionFromAccounts()`

**Critical test:** `apply(reverse(apply(tx)))` must equal `apply(tx)`

---

*End of Reference Sheet*

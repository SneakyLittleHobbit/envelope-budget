# Envelope Budget App — Comprehensive Bug Report

**Generated:** 2026-02-22  
**Analyzed Files:** 25+ source files across `lib/`, `app/`, and `components/`

---

## Executive Summary

| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 4 | Data corruption, broken functionality, security risks |
| **High** | 6 | Missing features, incorrect behavior |
| **Medium** | 12 | UX issues, technical debt, missing validation |
| **Low** | 10 | Code quality, unused code, minor inconsistencies |
| **Total** | 32 | |

---

## Critical Issues (Severity: Critical)

### CRIT-1: `fill_from_available` Transaction Edit Breaks Envelope Balance

**File:** [`app/(app)/transactions/[id]/edit/page.tsx:97-114`](app/(app)/transactions/[id]/edit/page.tsx:97)

**Description:** When editing a `fill_from_available` transaction, the `fills` array is not preserved or recreated. The transaction is saved with only `envelopeId` set, but the envelope balance calculation in [`getEnvelopeBalance()`](lib/computed.ts:14) relies on the `fills` array.

**Impact:** Editing a `fill_from_available` transaction will cause envelope balances to become incorrect. The fill will no longer contribute to the envelope's balance.

**Root Cause:** The edit page does not have special handling for `fill_from_available` type. It sets `envelopeId` but not `fills`:

```typescript
// Line 102 - Missing fills array
envelopeId: txType === 'expense' || txType === 'fill_from_available' ? envelopeId : undefined,
// fills is never set for fill_from_available
```

**Suggested Fix:** Add special handling for `fill_from_available` in the edit page, similar to the add page:

```typescript
if (txType === 'fill_from_available') {
  fills: [{ envelopeId, amount }]
}
```

---

### CRIT-2: TypeScript Build Errors Ignored

**File:** [`next.config.mjs`](next.config.mjs:1)

**Description:** The Next.js configuration has `typescript.ignoreBuildErrors: true`, which allows the production build to succeed even when there are TypeScript errors.

**Impact:** Type errors can slip into production, potentially causing runtime errors. This defeats the purpose of using TypeScript.

**Suggested Fix:** Remove `ignoreBuildErrors: true` and fix all TypeScript errors properly.

---

### CRIT-3: Date Input Uses Browser Prompt

**Files:**
- [`app/(app)/transactions/add/page.tsx:278-280`](app/(app)/transactions/add/page.tsx:278)
- [`app/(app)/transactions/[id]/edit/page.tsx:183`](app/(app)/transactions/[id]/edit/page.tsx:183)
- [`app/(app)/transactions/add-income/page.tsx:119`](app/(app)/transactions/add-income/page.tsx:119)
- [`app/(app)/transactions/[id]/edit-income/page.tsx:121`](app/(app)/transactions/[id]/edit-income/page.tsx:121)

**Description:** Date selection uses `prompt('Enter date (YYYY-MM-DD):')` instead of a proper date picker component.

**Impact:**
- Poor user experience
- Some browsers may block the prompt
- No validation of date format
- Users can enter invalid dates

**Suggested Fix:** Use the existing `Calendar` component from `components/ui/calendar.tsx` with a `Popover` for proper date selection.

---

### CRIT-4: Account Balance Can Be Directly Edited

**File:** [`app/(app)/accounts/[id]/edit/page.tsx:54`](app/(app)/accounts/[id]/edit/page.tsx:54)

**Description:** The account edit form allows direct modification of account balance, which breaks the core invariant that account balances should only change through transactions.

**Impact:** 
- Breaks the audit trail
- Can cause "Available" calculation to become incorrect
- Violates the envelope budgeting principle that transactions are the source of truth

**Suggested Fix:** Remove balance editing from the account edit form, or add a compensating transaction when balance is changed.

---

## High Severity Issues (Severity: High)

### HIGH-1: Missing `description` Field Update in Transaction Edit

**File:** [`app/(app)/transactions/[id]/edit/page.tsx:97-114`](app/(app)/transactions/[id]/edit/page.tsx:97)

**Description:** When editing an `envelope_transfer` or `account_transfer` transaction, the `description` field is not regenerated with the new envelope/account names.

**Impact:** Transfer descriptions will show stale names if envelopes/accounts are renamed during edit.

**Suggested Fix:** Add `description` field generation in `handleSave()`:

```typescript
description:
  txType === 'envelope_transfer'
    ? `${fromEnvelope?.name || ''} -> ${toEnvelope?.name || ''}`
    : txType === 'account_transfer'
      ? `${fromAccount?.name || ''} -> ${toAccount?.name || ''}`
      : undefined,
```

---

### HIGH-2: No Redirect for `add_income` Type in Edit Page

**File:** [`app/(app)/transactions/[id]/edit/page.tsx`](app/(app)/transactions/[id]/edit/page.tsx)

**Description:** The add transaction page redirects `add_income` type to `/transactions/add-income`, but the edit page does not redirect to `/transactions/[id]/edit-income`. This means income transactions can be edited through the wrong form.

**Impact:** Income transactions edited through the regular edit page will lose their `fills` array and other income-specific fields.

**Suggested Fix:** Add redirect in edit page:

```typescript
if (tx?.type === 'add_income') {
  router.replace(`/transactions/${id}/edit-income`)
  return
}
```

---

### HIGH-3: No Form Validation Despite Installed Libraries

**Files:** All form pages

**Description:** `react-hook-form` and `zod` are installed in `package.json` but not used. All forms use manual `useState` with only basic `canSave()` checks.

**Impact:**
- No validation error messages shown to users
- Invalid data can be submitted (e.g., negative amounts, empty strings)
- Poor user experience

**Suggested Fix:** Implement proper form validation using `react-hook-form` with `zod` schemas.

---

### HIGH-4: Reports Tab Is a Stub

**File:** [`app/(app)/reports/page.tsx`](app/(app)/reports/page.tsx)

**Description:** The Reports tab shows only "Reports coming soon" with no actual functionality.

**Impact:** Users cannot view spending reports, trends, or financial insights.

**Suggested Fix:** Implement basic reporting features using the `recharts` library (already installed).

---

### HIGH-5: Scheduled Transactions Require Manual Posting

**File:** [`app/(app)/transactions/page.tsx:74-78`](app/(app)/transactions/page.tsx:74)

**Description:** Scheduled transactions must be manually posted by tapping the `+` button. There is no automatic posting when the scheduled date arrives.

**Impact:** Users may forget to post scheduled transactions, causing incorrect balance calculations.

**Suggested Fix:** Implement automatic posting logic that runs on app load or via a background check.

---

### HIGH-6: Missing Validation for Same-Entity Transfers

**Files:**
- [`app/(app)/transactions/add/page.tsx`](app/(app)/transactions/add/page.tsx)
- [`app/(app)/transactions/[id]/edit/page.tsx`](app/(app)/transactions/[id]/edit/page.tsx)

**Description:** No validation prevents users from selecting the same envelope for both "From" and "To" in envelope transfers, or the same account for account transfers.

**Impact:** Creates meaningless zero-effect transactions.

**Suggested Fix:** Add validation in `canSave()`:

```typescript
case 'envelope_transfer': return !!(fromEnvelopeId && toEnvelopeId && fromEnvelopeId !== toEnvelopeId)
case 'account_transfer': return !!(fromAccountId && toAccountId && fromAccountId !== toAccountId)
```

---

## Medium Severity Issues (Severity: Medium)

### MED-1: Drag-to-Reorder UI Exists Without Functionality

**Files:**
- [`app/(app)/accounts/page.tsx:104`](app/(app)/accounts/page.tsx:104)
- [`app/(app)/envelopes/edit-budget/page.tsx:114`](app/(app)/envelopes/edit-budget/page.tsx:114)

**Description:** `GripVertical` icons are displayed for drag handles, but no drag-and-drop functionality is implemented.

**Impact:** Users may expect to be able to drag to reorder but cannot.

**Suggested Fix:** Either implement drag-and-drop using a library like `@dnd-kit/core`, or remove the grip icons.

---

### MED-2: `dueDay` Field Exists But Is Unused

**File:** [`lib/types.ts:41`](lib/types.ts:41)

**Description:** The `Envelope` interface has a `dueDay` field that is never used anywhere in the application.

**Impact:** Dead code, potential confusion for developers.

**Suggested Fix:** Either implement due date functionality or remove the field.

---

### MED-3: No Error Boundaries

**Files:** App-wide

**Description:** No error boundary components are implemented to catch and handle runtime errors gracefully.

**Impact:** Unhandled errors cause the entire app to crash with no user feedback.

**Suggested Fix:** Add React error boundaries around major sections.

---

### MED-4: No Loading States

**Files:** All pages

**Description:** Only the hydration spinner exists in [`app/(app)/layout.tsx`](app/(app)/layout.tsx). Individual pages have no loading states for async operations.

**Impact:** Users have no feedback during operations.

**Suggested Fix:** Add loading indicators for form submissions and data operations.

---

### MED-5: No Memoization of Computed Values

**File:** [`lib/computed.ts`](lib/computed.ts)

**Description:** All computed values recalculate on every render with no memoization.

**Impact:** Performance degradation with large datasets. `getEnvelopeBalance()` is called O(n*m) times where n=envelopes and m=transactions.

**Suggested Fix:** Use `useMemo` in components or implement a caching layer.

---

### MED-6: Native Confirm Dialogs

**Files:** Multiple (delete actions)

**Description:** All delete actions use native `confirm()` dialogs instead of custom modals.

**Impact:**
- Inconsistent UI
- Cannot be styled
- May be blocked by some browsers

**Suggested Fix:** Use the existing `AlertDialog` component from `components/ui/alert-dialog.tsx`.

---

### MED-7: No Undo Mechanism

**Files:** All delete actions

**Description:** Deleting transactions, accounts, or envelopes is permanent with no way to undo.

**Impact:** Users can accidentally lose data with no recovery option.

**Suggested Fix:** Implement an undo stack or soft-delete with trash bin.

---

### MED-8: No Offline Indicator

**Files:** App-wide

**Description:** No feedback if localStorage fails or the app is in an error state.

**Impact:** Users may not realize their data is not being saved.

**Suggested Fix:** Add try-catch around localStorage operations and show error toasts.

---

### MED-9: Seed Data Always Present

**File:** [`lib/store.ts:147-151`](lib/store.ts:147)

**Description:** New users always see demo/seed data. There is no "first run" detection.

**Impact:** New users see someone else's budget data, which may be confusing.

**Suggested Fix:** Check if localStorage has data before seeding, or add a "first run" flag.

---

### MED-10: Missing `isCredit` Display for Expense Transactions

**File:** [`components/transaction-row.tsx:50-57`](components/transaction-row.tsx:50)

**Description:** Credit (refund) transactions are shown with `+` prefix but there's no visual indicator that it's a credit vs income.

**Impact:** Users may not understand why an expense shows as positive.

**Suggested Fix:** Add a label or icon to indicate credit/refund status.

---

### MED-11: Transaction Row Sub-line Missing for `fill_from_available`

**File:** [`components/transaction-row.tsx:65-68`](components/transaction-row.tsx:65)

**Description:** When `contextIsEnvelope` is true for `fill_from_available`, the code uses `tx.envelopeId` which is undefined for this transaction type (it uses `fills` array instead).

**Impact:** Envelope name won't display correctly in envelope detail view for `fill_from_available` transactions.

**Suggested Fix:** Check `tx.fills` array for `fill_from_available` type.

---

### MED-12: Search Doesn't Include Transfer Descriptions

**File:** [`app/(app)/transactions/search/page.tsx:26-35`](app/(app)/transactions/search/page.tsx:26)

**Description:** The search function doesn't search the `description` field of transfer transactions.

**Impact:** Users cannot find transfers by searching for envelope/account names in the description.

**Suggested Fix:** Add `tx.description?.toLowerCase().includes(q)` to search logic.

---

## Low Severity Issues (Severity: Low)

### LOW-1: Unused Dependencies

**File:** [`package.json`](package.json)

**Description:** The following dependencies are installed but not actively used:
- `react-hook-form` (forms use manual `useState`)
- `zod` (no validation schemas)
- `@hookform/resolvers` (no form integration)
- `next-themes` (app is always-dark, no theme switching)

**Impact:** Increased bundle size, maintenance burden.

**Suggested Fix:** Either use these packages or remove them.

---

### LOW-2: Unused Theme Provider

**File:** [`components/theme-provider.tsx`](components/theme-provider.tsx)

**Description:** A theme provider component exists but is not used. The app is always in dark mode.

**Impact:** Dead code.

**Suggested Fix:** Remove if theme switching is not planned.

---

### LOW-3: Duplicate Code in Transaction Forms

**Files:**
- [`app/(app)/transactions/add/page.tsx`](app/(app)/transactions/add/page.tsx)
- [`app/(app)/transactions/[id]/edit/page.tsx`](app/(app)/transactions/[id]/edit/page.tsx)

**Description:** Add and edit transaction forms share approximately 80% identical code.

**Impact:** Maintenance burden, risk of inconsistent behavior.

**Suggested Fix:** Extract common logic into a custom hook or shared component.

---

### LOW-4: Credit Card Accounts in Both Sections

**File:** [`app/(app)/accounts/page.tsx:21`](app/(app)/accounts/page.tsx:21)

**Description:** Credit card accounts are filtered as debt accounts but could also be on-budget accounts depending on configuration.

**Impact:** Potential confusion in account categorization.

**Suggested Fix:** Clarify credit card handling or add separate section.

---

### LOW-5: Missing Type Safety for Transaction Fields

**File:** [`lib/types.ts:58-84`](lib/types.ts:58)

**Description:** The `Transaction` interface has many optional fields that are only valid for specific transaction types, but there's no type discrimination.

**Impact:** No compile-time checking for transaction-type-specific fields.

**Suggested Fix:** Use discriminated unions for transaction types.

---

### LOW-6: No Null Check for Envelope Group

**File:** [`app/(app)/envelopes/add/page.tsx:24`](app/(app)/envelopes/add/page.tsx:24)

**Description:** `envelopeGroups[0]?.id` is used as default, but if there are no groups, the form shows an empty group field with no way to create one inline (though the picker does allow creating groups).

**Impact:** Minor UX issue.

**Suggested Fix:** Auto-create a default group if none exist.

---

### LOW-7: Inconsistent Date Formatting

**File:** [`lib/format.ts:42-52`](lib/format.ts:42)

**Description:** `formatDateShort()` and `formatScheduleDate()` are identical functions with different names.

**Impact:** Code duplication, potential confusion.

**Suggested Fix:** Consolidate into a single function.

---

### LOW-8: No Amount Formatting on Input

**Files:** All amount input fields

**Description:** Amount inputs accept raw numbers without formatting. Users see "4085.5" instead of "4 085,50".

**Impact:** Inconsistent with display formatting, potential user confusion.

**Suggested Fix:** Format amounts on blur and parse on change.

---

### LOW-9: Missing Accessibility Labels

**Files:** All interactive components

**Description:** No ARIA labels or accessibility attributes on custom components.

**Impact:** Poor screen reader support.

**Suggested Fix:** Add accessibility attributes to all interactive elements.

---

### LOW-10: Hardcoded Currency

**File:** [`lib/format.ts`](lib/format.ts)

**Description:** Currency is hardcoded to ZAR (South African Rand) with no way to change it.

**Impact:** Users in other regions cannot use their local currency.

**Suggested Fix:** Add currency setting to the More/Settings page.

---

## Prioritized Fix Order

### Immediate (Critical - Fix First)
1. **CRIT-1:** Fix `fill_from_available` edit bug (data corruption)
2. **CRIT-3:** Replace date prompt with proper date picker
3. **CRIT-2:** Remove `ignoreBuildErrors` and fix TypeScript errors
4. **CRIT-4:** Remove or fix direct account balance editing

### Short-term (High - Fix Within Sprint)
5. **HIGH-2:** Add redirect for income edit
6. **HIGH-6:** Add same-entity transfer validation
7. **HIGH-1:** Fix description field update in edit
8. **HIGH-3:** Implement form validation

### Medium-term (Medium - Fix Within Month)
9. **MED-6:** Replace confirm dialogs with AlertDialog
10. **MED-5:** Add memoization to computed values
11. **MED-9:** Add first-run detection
12. **MED-11:** Fix transaction row display for fills

### Long-term (Low - Technical Debt)
13. **LOW-3:** Refactor duplicate transaction form code
14. **LOW-1:** Remove or use unused dependencies
15. **LOW-5:** Add discriminated unions for transactions

---

## Testing Recommendations

After fixing issues, test the following scenarios:

1. **Transaction CRUD:** Create, edit, and delete all 7 transaction types
2. **Balance Verification:** Verify account and envelope balances after each operation
3. **Scheduled Transactions:** Create, edit, post, and delete scheduled transactions
4. **Edge Cases:**
   - Empty state (no accounts/envelopes/transactions)
   - Negative balances
   - Zero-amount transactions
   - Same-entity transfers (should be blocked after fix)
5. **Data Persistence:** Refresh page and verify data is preserved
6. **Form Validation:** Try submitting invalid data

---

## Appendix: Files Analyzed

| File | Lines | Purpose |
|------|-------|---------|
| `lib/types.ts` | 143 | Type definitions |
| `lib/store.ts` | 306 | State management |
| `lib/computed.ts` | 176 | Derived state |
| `lib/format.ts` | 70 | Formatting utilities |
| `lib/seed.ts` | 198 | Demo data |
| `app/(app)/transactions/add/page.tsx` | 483 | Add transaction form |
| `app/(app)/transactions/[id]/edit/page.tsx` | 280 | Edit transaction form |
| `app/(app)/transactions/add-income/page.tsx` | 271 | Income wizard |
| `app/(app)/transactions/[id]/edit-income/page.tsx` | 202 | Edit income |
| `app/(app)/transactions/page.tsx` | 123 | Transaction list |
| `app/(app)/transactions/search/page.tsx` | 87 | Search |
| `app/(app)/accounts/page.tsx` | 162 | Account list |
| `app/(app)/accounts/[id]/page.tsx` | 100 | Account detail |
| `app/(app)/accounts/[id]/edit/page.tsx` | 110 | Edit account |
| `app/(app)/accounts/add/page.tsx` | 132 | Add account |
| `app/(app)/envelopes/page.tsx` | 73 | Envelope list |
| `app/(app)/envelopes/[id]/page.tsx` | 145 | Envelope detail |
| `app/(app)/envelopes/[id]/edit/page.tsx` | 124 | Edit envelope |
| `app/(app)/envelopes/add/page.tsx` | 200 | Add envelope |
| `app/(app)/envelopes/edit-budget/page.tsx` | 181 | Bulk budget edit |
| `app/(app)/reports/page.tsx` | 18 | Reports stub |
| `app/(app)/more/page.tsx` | 85 | Settings |
| `components/transaction-row.tsx` | 126 | Transaction display |

---

*End of Bug Report*

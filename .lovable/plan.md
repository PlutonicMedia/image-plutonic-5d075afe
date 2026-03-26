

# Rename Customer to Client + UI Refinements

## Overview
Rename all "Customer" references to "Client" throughout the codebase, add a delete button for clients, and update Input Column labels. The existing `customers` database table stays as-is — only code-level naming changes.

---

## 1. Types (`src/types/index.ts`)

- Rename `Customer` interface to `Client` (lines 3-9): same fields, just rename the type
- Update `Project.customer_id` comment/docs but keep the field name (it maps to DB column)
- Remove the legacy `Client` interface (lines 54-60) since the new `Client` replaces it

## 2. Database Strategy

**No migration needed.** The `customers` table already exists with the right schema. Code will query `supabase.from('customers')` but use the TypeScript type `Client`. This avoids a risky table rename.

## 3. Component Updates (Customer → Client renaming)

**`src/components/dashboard/CustomerProjectSelector.tsx`** → rename file to `ClientProjectSelector.tsx`
- Rename all props: `customers` → `clients`, `selectedCustomer` → `selectedClient`, `onSelectCustomer` → `onSelectClient`, `onAddCustomer` → `onAddClient`
- UI label: "Customer" → "Client"
- Add a delete button (Trash2 icon) next to each client in the dropdown, with an `AlertDialog` confirmation before calling `onDeleteClient(id)`

**`src/components/dashboard/InputColumn.tsx`**
- Update imports and props to use `Client` naming
- Rename section headers: "Product Hub" → "Product Images", "Model Hub" → "Model Images"
- Remove the italic AI reference text
- Remove the "Coming Soon" badge under Model Images (keep it clean)

**`src/components/dashboard/DashboardLayout.tsx`**
- Update all prop names and types from Customer to Client
- Pass new `onDeleteClient` prop through

**`src/pages/Index.tsx`**
- Rename state: `customers` → `clients`, `selectedCustomer` → `selectedClient`
- Rename handlers: `loadCustomers` → `loadClients`, `addCustomer` → `addClient`
- Add `deleteClient` handler: delete from `customers` table, remove from local state, clear selection if deleted client was selected
- Supabase queries stay as `supabase.from('customers')` — only variable names change

## 4. Input Column Label Changes (`InputColumn.tsx`)

- "Product Hub" → "Product Images"
- "Model Hub" → "Model Images"  
- Remove: `<p className="text-[10px]...">AI uses all images as structural reference...</p>`

## 5. Delete Client Feature (`ClientProjectSelector.tsx`)

- Add `onDeleteClient: (id: string) => void` prop
- Show a small Trash2 icon button next to each client in the Select dropdown
- On click, show an AlertDialog: "Delete [client name]? This will also delete all associated projects and generations."
- On confirm, call `onDeleteClient(id)`
- In `Index.tsx`, the handler deletes from `customers` table (cascading to projects/generations via FK), removes from local state, and resets selection

## 6. Files Changed

| File | Change |
|------|--------|
| `src/types/index.ts` | Rename `Customer` → `Client`, remove legacy `Client` |
| `src/pages/Index.tsx` | Rename all state/handlers, add `deleteClient` |
| `src/components/dashboard/DashboardLayout.tsx` | Rename props |
| `src/components/dashboard/InputColumn.tsx` | Rename props + labels |
| `src/components/dashboard/CustomerProjectSelector.tsx` | Rename to `ClientProjectSelector.tsx`, add delete |


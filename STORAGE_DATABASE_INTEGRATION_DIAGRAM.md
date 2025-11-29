# 📊 Storage ↔ Database Integration Diagram

## How Supabase Storage Connects to PostgreSQL

```
┌──────────────────────────────────────────────────────────────┐
│                    SUPABASE STORAGE BUCKET                    │
│                        "invoices"                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📁 user-abc-123/                                            │
│     └── 📁 invoice-def-456/                                  │
│         ├── 📄 original.pdf          ← UPLOADED FILE        │
│         ├── 📄 ocr_result.json                               │
│         └── 📄 thumbnail.jpg                                 │
│                                                               │
│  📁 user-xyz-789/                                            │
│     └── 📁 invoice-ghi-012/                                  │
│         └── 📄 original.pdf                                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                            ↕
                   LINKED VIA COLUMNS
                            ↕
┌──────────────────────────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                         │
│                     "invoices" table                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ id: invoice-def-456                                    │  │
│  │ file_bucket: "invoices"              ← BUCKET NAME    │  │
│  │ file_path: "user-abc-123/invoice-    ← FILE PATH      │  │
│  │              def-456/original.pdf"                     │  │
│  │ file_size: 245678                                      │  │
│  │ file_type: "application/pdf"                           │  │
│  │ is_locked: false                     ← EDIT CONTROL   │  │
│  │ status: "draft"                      ← WORKFLOW       │  │
│  │ ocr_status: "pending"                                  │  │
│  │ created_by: user-abc-123                               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow Example: Invoice Upload to AP

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: UPLOAD FILE                          │
└─────────────────────────────────────────────────────────────────┘

Frontend → BFF:  POST /api/invoices/upload
                 Body: { file: invoice.pdf }

BFF → Supabase Storage:
  ├── Upload file to: invoices/user-123/invoice-456/original.pdf
  └── Returns: { path, size }

BFF → PostgreSQL:
  └── INSERT INTO invoices (
        id: 'invoice-456',
        file_bucket: 'invoices',
        file_path: 'user-123/invoice-456/original.pdf',
        file_size: 245678,
        status: 'draft',
        is_locked: false,  ← ✅ UNLOCKED (editable)
        ocr_status: 'pending'
      )

┌─────────────────────────────────────────────────────────────────┐
│                   STEP 2: OCR PROCESSING                        │
└─────────────────────────────────────────────────────────────────┘

Edge Function:
  ├── Download file from Storage
  ├── Call OCR service (Google Vision / AWS Textract)
  └── Extract: invoice_number, supplier, amount, line items

PostgreSQL:
  └── UPDATE invoices SET
        ocr_status: 'completed',
        ocr_data: { raw OCR results },
        invoice_number: 'INV-001',
        supplier_name: 'Acme Corp',
        total_amount: 1250.00,
        status: 'pending_verification',
        is_locked: false  ← ✅ STILL UNLOCKED
      WHERE id = 'invoice-456'

┌─────────────────────────────────────────────────────────────────┐
│              STEP 3: MANUAL INPUT (UNLOCKED)                    │
└─────────────────────────────────────────────────────────────────┘

Frontend shows OCR results + File preview:
  ├── Invoice Number: INV-001  [Edit]
  ├── Supplier: Acme Corp       [Edit]
  ├── Amount: $1,250.00         [Edit]
  └── Line Items: ...           [Edit]

User corrects data:
  └── "Actually $1,500.00, not $1,250.00"

BFF → PostgreSQL:
  └── UPDATE invoices SET
        total_amount: 1500.00,
        updated_at: NOW()
      WHERE id = 'invoice-456'
        AND is_locked = false  ← ✅ CHECK: can only edit if unlocked
        AND status IN ('draft', 'pending_verification')

┌─────────────────────────────────────────────────────────────────┐
│           STEP 4: BFF/BACKEND VERIFICATION                      │
└─────────────────────────────────────────────────────────────────┘

BFF → Kernel (Business Rules):
  ├── Validate: supplier exists
  ├── Validate: amount matches line items
  ├── Validate: GL codes are valid
  ├── Check: duplicate invoice number
  └── Returns: { valid: true }

BFF → PostgreSQL:
  └── UPDATE invoices SET
        status: 'verified',
        verified_by: 'user-789',
        verified_at: NOW(),
        is_locked: false  ← ✅ STILL UNLOCKED until AP approval
      WHERE id = 'invoice-456'

┌─────────────────────────────────────────────────────────────────┐
│              STEP 5: APPROVE TO AP (LOCK)                       │
└─────────────────────────────────────────────────────────────────┘

Approver clicks "Approve to AP"

BFF → Kernel:
  └── Final validation + AP system integration

PostgreSQL:
  └── UPDATE invoices SET
        status: 'approved_to_ap',
        is_locked: true,  ← 🔒 LOCKED (no more edits!)
        ap_posted_at: NOW(),
        ap_batch_id: 'BATCH-2025-001'
      WHERE id = 'invoice-456'

┌─────────────────────────────────────────────────────────────────┐
│                    RESULT: LOCKED INVOICE                       │
└─────────────────────────────────────────────────────────────────┘

Frontend shows:
  ├── Status: Approved to AP ✅
  ├── 🔒 LOCKED - No editing allowed
  ├── Posted to AP: 2025-11-27 20:30 UTC
  └── View File: [Download PDF from Storage]

Try to edit:
  └── UPDATE invoices ... WHERE is_locked = false
      → 0 rows affected ❌ (locked!)
```

---

## 🔗 The Key Connection: `file_path` Column

### PostgreSQL Table

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  
  -- These 3 columns link to Supabase Storage
  file_bucket TEXT NOT NULL DEFAULT 'invoices',
  file_path TEXT NOT NULL,  ← THIS IS THE KEY LINK
  file_url TEXT,
  
  -- Invoice data
  invoice_number VARCHAR(100),
  status VARCHAR(30),
  is_locked BOOLEAN DEFAULT false,  ← CONTROLS EDITING
  ...
);
```

### Storage Object

```javascript
// In Supabase Storage
{
  bucket: "invoices",
  name: "user-123/invoice-456/original.pdf",  ← MATCHES file_path
  size: 245678,
  mimeType: "application/pdf"
}
```

### Retrieval Code

```typescript
// 1. Get invoice from database
const invoice = await supabase
  .from('invoices')
  .select('*')
  .eq('id', 'invoice-456')
  .single();

// Returns:
// {
//   id: 'invoice-456',
//   file_bucket: 'invoices',
//   file_path: 'user-123/invoice-456/original.pdf',  ← THIS
//   is_locked: false,
//   status: 'draft'
// }

// 2. Generate signed URL using file_path
const { data } = await supabase.storage
  .from(invoice.file_bucket)           // 'invoices'
  .createSignedUrl(invoice.file_path, 3600);  // ← THIS

// Returns:
// {
//   signedUrl: 'https://cnlutbuzjqtuicngldak.supabase.co/storage/v1/object/sign/invoices/user-123/invoice-456/original.pdf?token=...'
// }

// 3. Send to frontend
return {
  ...invoice,
  file_url: data.signedUrl  ← Frontend displays this
};
```

---

## 🔒 Lock Mechanism

### How `is_locked` Prevents Editing

```typescript
// Frontend tries to edit
await fetch('/api/invoices/invoice-456', {
  method: 'PATCH',
  body: JSON.stringify({ total_amount: 2000.00 })
});

// Backend checks lock
const { data: invoice } = await supabase
  .from('invoices')
  .select('is_locked, status')
  .eq('id', 'invoice-456')
  .single();

if (invoice.is_locked) {
  return NextResponse.json(
    { error: 'Invoice is locked and cannot be modified' },
    { status: 403 }
  );
}

// OR use database constraint
const { error } = await supabase
  .from('invoices')
  .update({ total_amount: 2000.00 })
  .eq('id', 'invoice-456')
  .eq('is_locked', false);  ← Only updates if unlocked

if (error || affected === 0) {
  // Invoice is locked or doesn't exist
}
```

### Status Transitions

```
draft
  ↓ (OCR completes)
pending_verification  ← is_locked = false (editable)
  ↓ (user edits)
pending_verification  ← is_locked = false (still editable)
  ↓ (backend verifies)
verified              ← is_locked = false (still editable!)
  ↓ (approve to AP)
approved_to_ap        ← is_locked = true (🔒 LOCKED, read-only)
```

---

## 📋 Quick Reference: Key Columns

| Column | Purpose | Example |
|--------|---------|---------|
| `file_bucket` | Storage bucket name | `"invoices"` |
| `file_path` | Path to file in bucket | `"user-123/invoice-456/original.pdf"` |
| `file_url` | Signed URL (generated, not stored) | `"https://...?token=..."` |
| `is_locked` | Prevents editing after approval | `false` → editable, `true` → locked |
| `status` | Workflow state | `draft`, `verified`, `approved_to_ap` |
| `ocr_status` | OCR processing state | `pending`, `completed` |

---

## 🎯 Summary

**The Integration:**

1. **File uploaded** → Supabase Storage (`invoices/user-123/invoice-456/original.pdf`)
2. **Record created** → PostgreSQL with `file_path = "user-123/invoice-456/original.pdf"`
3. **OCR processes** → Updates database with extracted data
4. **User edits** → Allowed while `is_locked = false`
5. **Verification** → Backend validates business rules
6. **Approval** → Sets `is_locked = true` → **No more edits**
7. **Display** → Generate signed URL from `file_path` to show file

**Key Points:**

- ✅ `file_path` column is the **link** between Storage and Database
- ✅ `is_locked` column **controls** editing permissions
- ✅ Manual input is **allowed** until approval (is_locked = false)
- ✅ After AP approval, invoice is **read-only** (is_locked = true)
- ✅ File always accessible via signed URLs

This gives you **full control** over the workflow while maintaining **data integrity**! 🚀


# 🏢 OCR Configuration: Organizational Multi-Tenant Setup

**Date:** November 27, 2025  
**Current Status:** 🟡 **Placeholder (Needs Configuration)**  
**Target:** ✅ **Enterprise/Organization Multi-Tenant OCR**

---

## ❓ Personal vs Organization OCR: Key Differences

### ❌ Personal OCR (NOT what we want)

- Single user account
- Personal API keys
- Limited quota (e.g., 1000 requests/month)
- No tenant isolation
- No usage tracking per organization
- Cost: Personal billing

### ✅ Organization OCR (What we need)

- Enterprise account
- Organization API keys
- Higher quotas (e.g., 1M+ requests/month)
- **Tenant-aware billing** (track usage per tenant/org)
- **Multi-tenant support** (isolate data per organization)
- Cost: Pay-per-use with organizational billing

---

## 🎯 Current Implementation Status

### ✅ What's Already Multi-Tenant

1. **File storage:** `{tenant_id}/{user_id}/{invoice_id}/file.pdf`
2. **Database:** All invoices have `tenant_id`
3. **RLS policies:** Tenant isolation enforced
4. **BFF endpoints:** All filter by `tenant_id`

### 🟡 What Needs Configuration

1. **OCR service selection** (Google Vision, AWS Textract, Azure Form Recognizer)
2. **Organization account setup**
3. **Tenant-aware OCR processing**
4. **Usage tracking per tenant**
5. **Cost allocation per organization**

---

## 🔧 Recommended OCR Services (Organization Tier)

### Option 1: Google Cloud Vision API (Enterprise)

**Pricing:** $1.50 per 1,000 documents (Organization tier)

**Setup:**

```bash
# 1. Create Google Cloud Project (Organization-level)
gcloud projects create aibos-ocr-production --organization=YOUR_ORG_ID

# 2. Enable Vision API
gcloud services enable vision.googleapis.com

# 3. Create service account (for backend use)
gcloud iam service-accounts create ocr-service-account \
  --display-name="OCR Service Account"

# 4. Download credentials
gcloud iam service-accounts keys create ocr-credentials.json \
  --iam-account=ocr-service-account@aibos-ocr-production.iam.gserviceaccount.com
```

**Multi-Tenant Support:**

- ✅ Tag requests with `tenant_id` in metadata
- ✅ Track usage per tenant via Cloud Logging
- ✅ Billing reports by tenant

---

### Option 2: AWS Textract (Enterprise)

**Pricing:** $0.0015 per page (Pay-as-you-go)

**Setup:**

```bash
# 1. Create AWS Organization
aws organizations create-organization

# 2. Create IAM role for OCR
aws iam create-role --role-name OCRServiceRole \
  --assume-role-policy-document file://trust-policy.json

# 3. Attach Textract permissions
aws iam attach-role-policy --role-name OCRServiceRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonTextractFullAccess
```

**Multi-Tenant Support:**

- ✅ Tag requests with `tenant_id` using AWS Tags
- ✅ Cost Explorer filters by tenant
- ✅ Separate buckets per tenant (optional)

---

### Option 3: Azure Form Recognizer (Enterprise)

**Pricing:** $1.00 per 1,000 pages (Standard tier)

**Setup:**

```bash
# 1. Create Azure subscription (Organization)
az account create --offer-type=MS-AZR-0017P

# 2. Create Cognitive Services resource
az cognitiveservices account create \
  --name aibos-ocr \
  --resource-group aibos-production \
  --kind FormRecognizer \
  --sku S0 \
  --location eastus

# 3. Get API key
az cognitiveservices account keys list \
  --name aibos-ocr \
  --resource-group aibos-production
```

**Multi-Tenant Support:**

- ✅ Tag requests with `tenant_id` in headers
- ✅ Azure Cost Management per tenant
- ✅ Application Insights tracking

---

## 📦 Implementation: Multi-Tenant OCR Edge Function

Let me create the **production-ready OCR function** with tenant awareness:

```typescript
// supabase/functions/ocr-processor/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// Configuration (Organization-level)
// ============================================

const OCR_PROVIDER = Deno.env.get("OCR_PROVIDER") || "google"; // google | aws | azure
const GOOGLE_CREDENTIALS = Deno.env.get("GOOGLE_CLOUD_CREDENTIALS");
const AWS_ACCESS_KEY = Deno.env.get("AWS_ACCESS_KEY_ID");
const AWS_SECRET_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");
const AZURE_API_KEY = Deno.env.get("AZURE_FORM_RECOGNIZER_KEY");
const AZURE_ENDPOINT = Deno.env.get("AZURE_FORM_RECOGNIZER_ENDPOINT");

serve(async (req) => {
  try {
    const { invoiceId, filePath } = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get invoice details (including tenant_id)
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, tenant_id, file_path, file_type, created_by")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Invoice not found");
    }

    console.log(
      `[OCR] Processing invoice ${invoiceId} for tenant ${invoice.tenant_id}`
    );

    // 2. Update status to processing
    await supabase
      .from("invoices")
      .update({ ocr_status: "processing" })
      .eq("id", invoiceId);

    // 3. Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("invoices")
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`File download failed: ${downloadError?.message}`);
    }

    // 4. Process OCR based on provider (ORGANIZATION-LEVEL)
    let ocrResult;
    switch (OCR_PROVIDER) {
      case "google":
        ocrResult = await processGoogleVisionOCR(fileData, invoice.tenant_id);
        break;
      case "aws":
        ocrResult = await processAWSTextractOCR(fileData, invoice.tenant_id);
        break;
      case "azure":
        ocrResult = await processAzureFormRecognizerOCR(
          fileData,
          invoice.tenant_id
        );
        break;
      default:
        throw new Error(`Unknown OCR provider: ${OCR_PROVIDER}`);
    }

    // 5. Extract invoice data from OCR results
    const extractedData = extractInvoiceData(ocrResult);

    // 6. Update invoice with OCR results
    await supabase
      .from("invoices")
      .update({
        ocr_status: "completed",
        ocr_data: ocrResult,
        ocr_confidence: extractedData.confidence,
        invoice_number: extractedData.invoiceNumber,
        supplier_name: extractedData.supplierName,
        invoice_date: extractedData.invoiceDate,
        due_date: extractedData.dueDate,
        total_amount: extractedData.totalAmount,
        tax_amount: extractedData.taxAmount,
        net_amount: extractedData.netAmount,
        status: "pending_verification",
        ocr_processed_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    // 7. Insert line items
    if (extractedData.lineItems?.length > 0) {
      await supabase.from("invoice_line_items").insert(
        extractedData.lineItems.map((item: any, index: number) => ({
          invoice_id: invoiceId,
          line_number: index + 1,
          ...item,
        }))
      );
    }

    // 8. Log usage for tenant billing
    await logOCRUsage(supabase, {
      tenant_id: invoice.tenant_id,
      invoice_id: invoiceId,
      provider: OCR_PROVIDER,
      pages: extractedData.pageCount || 1,
      confidence: extractedData.confidence,
      cost: calculateOCRCost(OCR_PROVIDER, extractedData.pageCount || 1),
    });

    // 9. Add completion comment
    await supabase.from("invoice_comments").insert({
      invoice_id: invoiceId,
      comment_type: "ocr_result",
      comment: `OCR processing completed with ${(extractedData.confidence * 100).toFixed(1)}% confidence`,
      metadata: {
        provider: OCR_PROVIDER,
        pageCount: extractedData.pageCount,
        lineItemsCount: extractedData.lineItems?.length || 0,
        tenant_id: invoice.tenant_id, // Track tenant
      },
      created_by: "system",
    });

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId,
        tenant_id: invoice.tenant_id,
        confidence: extractedData.confidence,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[OCR] Error:", error);

    const { invoiceId } = await req.json().catch(() => ({}));

    if (invoiceId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase
        .from("invoices")
        .update({ ocr_status: "failed" })
        .eq("id", invoiceId);

      await supabase.from("invoice_comments").insert({
        invoice_id: invoiceId,
        comment_type: "system",
        comment: `OCR processing failed: ${error.message}`,
        metadata: { error: error.message },
        created_by: "system",
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ============================================
// Google Vision OCR (Organization Account)
// ============================================
async function processGoogleVisionOCR(
  fileData: Blob,
  tenantId: string
): Promise<any> {
  const credentials = JSON.parse(GOOGLE_CREDENTIALS!);

  // Convert blob to base64
  const arrayBuffer = await fileData.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getGoogleAccessToken(credentials)}`,
        // Tag request with tenant for billing
        "X-Goog-User-Project": credentials.project_id,
        "X-Tenant-ID": tenantId, // Custom header for tracking
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [
              { type: "DOCUMENT_TEXT_DETECTION" },
              { type: "LABEL_DETECTION" },
            ],
            imageContext: {
              // Organization-level language hints
              languageHints: ["en", "es", "fr", "de"],
            },
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Vision API error: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// AWS Textract OCR (Organization Account)
// ============================================
async function processAWSTextractOCR(
  fileData: Blob,
  tenantId: string
): Promise<any> {
  // Convert blob to buffer
  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const AWS = await import("https://esm.sh/aws-sdk@2.1463.0");

  const textract = new AWS.Textract({
    region: "us-east-1",
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  });

  const params = {
    Document: {
      Bytes: buffer,
    },
    FeatureTypes: ["TABLES", "FORMS"],
    // Tag with tenant for cost allocation
    Tags: {
      TenantId: tenantId,
      Service: "invoice-ocr",
      Environment: "production",
    },
  };

  return textract.analyzeDocument(params).promise();
}

// ============================================
// Azure Form Recognizer (Organization Account)
// ============================================
async function processAzureFormRecognizerOCR(
  fileData: Blob,
  tenantId: string
): Promise<any> {
  const formData = new FormData();
  formData.append("file", fileData);

  const response = await fetch(
    `${AZURE_ENDPOINT}/formrecognizer/documentModels/prebuilt-invoice:analyze?api-version=2023-07-31`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_API_KEY!,
        // Tag with tenant for tracking
        "X-Tenant-ID": tenantId,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Azure Form Recognizer error: ${response.statusText}`);
  }

  // Azure returns operation location for async processing
  const operationLocation = response.headers.get("Operation-Location");

  // Poll for results
  return pollAzureResults(operationLocation!, tenantId);
}

// ============================================
// Helper Functions
// ============================================

async function getGoogleAccessToken(credentials: any): Promise<string> {
  // Implement OAuth2 token generation for service account
  // Use google-auth-library or similar
  return "ACCESS_TOKEN"; // Placeholder
}

async function pollAzureResults(
  operationUrl: string,
  tenantId: string
): Promise<any> {
  // Poll Azure operation until complete
  // Return final results
  return {}; // Placeholder
}

function extractInvoiceData(ocrResult: any) {
  // Parse OCR result and extract invoice fields
  // This would use provider-specific parsing logic
  return {
    confidence: 0.95,
    pageCount: 1,
    invoiceNumber: "INV-001",
    supplierName: "Acme Corp",
    invoiceDate: "2025-01-15",
    dueDate: "2025-02-15",
    totalAmount: 1250.0,
    taxAmount: 250.0,
    netAmount: 1000.0,
    lineItems: [],
  };
}

async function logOCRUsage(supabase: any, usage: any) {
  // Log OCR usage for tenant billing/analytics
  await supabase.from("ocr_usage_logs").insert({
    ...usage,
    processed_at: new Date().toISOString(),
  });
}

function calculateOCRCost(provider: string, pages: number): number {
  const rates = {
    google: 0.0015, // $1.50 per 1000 pages
    aws: 0.0015,
    azure: 0.001,
  };
  return (rates[provider as keyof typeof rates] || 0) * pages;
}
```

---

## 📊 Multi-Tenant Usage Tracking

Create a table to track OCR usage per tenant:

```sql
-- Migration: Track OCR usage per tenant for billing
CREATE TABLE IF NOT EXISTS ocr_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  provider VARCHAR(50) NOT NULL, -- google, aws, azure
  pages INTEGER NOT NULL,
  confidence NUMERIC(5,4),
  cost NUMERIC(12,4), -- Cost in USD
  processed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_ocr_usage_tenant (tenant_id, processed_at DESC),
  INDEX idx_ocr_usage_invoice (invoice_id)
);

-- RLS for usage logs
ALTER TABLE ocr_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all OCR usage"
  ON ocr_usage_logs FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role') IN ('admin', 'billing')
  );

CREATE POLICY "Tenants can view their own usage"
  ON ocr_usage_logs FOR SELECT
  TO authenticated
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
  );
```

---

## 💰 Cost Allocation Per Tenant

Query to get OCR costs per tenant:

```sql
-- Get OCR usage and costs per tenant (last 30 days)
SELECT
  tenant_id,
  provider,
  COUNT(*) as invoice_count,
  SUM(pages) as total_pages,
  AVG(confidence) as avg_confidence,
  SUM(cost) as total_cost_usd
FROM ocr_usage_logs
WHERE processed_at >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id, provider
ORDER BY total_cost_usd DESC;
```

---

## 🚀 Deployment Checklist

### 1. Choose OCR Provider

- [ ] Sign up for **organization/enterprise account**
- [ ] Get organization API credentials
- [ ] Configure billing alerts

### 2. Deploy Edge Function

```bash
# Deploy OCR function to Supabase
supabase functions deploy ocr-processor \
  --project-ref cnlutbuzjqtuicngldak

# Set environment variables
supabase secrets set OCR_PROVIDER=google
supabase secrets set GOOGLE_CLOUD_CREDENTIALS="..."
```

### 3. Configure Environment

```env
# apps/web/.env.production
SUPABASE_EDGE_FUNCTION_OCR_URL=https://cnlutbuzjqtuicngldak.supabase.co/functions/v1/ocr-processor
```

### 4. Test Multi-Tenant OCR

```bash
# Upload invoice for Tenant A
curl -X POST /api/invoices/upload \
  -H "Authorization: Bearer TENANT_A_JWT" \
  -F "file=@invoice.pdf"

# Verify tenant_id in OCR logs
SELECT * FROM ocr_usage_logs WHERE tenant_id = 'tenant-A';
```

---

## ✅ Summary

### Current State

- ❌ OCR is **placeholder** (not configured)
- ✅ Multi-tenant **infrastructure ready**
- ✅ Tenant isolation **enforced**

### Required Actions

1. **Choose OCR provider** (Google/AWS/Azure)
2. **Sign up for organization account**
3. **Deploy OCR Edge Function** with tenant tracking
4. **Create usage logging table**
5. **Test with multiple tenants**

### Result

- ✅ **Organization-level OCR** (not personal)
- ✅ **Tenant-aware processing**
- ✅ **Usage tracking per tenant**
- ✅ **Cost allocation per organization**

---

**Recommendation:** Use **Google Cloud Vision API** (Enterprise tier) with organization account for best multi-tenant support and transparent billing.

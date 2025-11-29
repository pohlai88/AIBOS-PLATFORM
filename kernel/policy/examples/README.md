# Policy Examples

This directory contains example policy manifests demonstrating the **C-6 Policy Precedence** system in AI-BOS Kernel.

## Policy Precedence Hierarchy

**Legal > Industry > Internal** (3 > 2 > 1)

1. **Legal Policies** (Precedence: 3) - Highest priority
   - GDPR, HIPAA, CCPA, etc.
   - Regulatory compliance requirements
   - **Cannot be overridden**

2. **Industry Policies** (Precedence: 2) - Medium priority
   - SOC 2, ISO 27001, PCI DSS, etc.
   - Industry-standard best practices
   - Override internal policies

3. **Internal Policies** (Precedence: 1) - Lowest priority
   - Company-specific rules
   - Team guidelines
   - Can be overridden by legal/industry policies

## Example Policies

### 1. `gdpr-data-protection.json` (Legal)
- **Precedence:** Legal (3)
- **Framework:** GDPR
- **Purpose:** EU data protection compliance
- **Rules:**
  - Consent required for personal data processing
  - Right to be forgotten (user deletion requests)

### 2. `soc2-access-control.json` (Industry)
- **Precedence:** Industry (2)
- **Framework:** SOC 2 Type II
- **Purpose:** Access control and security
- **Rules:**
  - Production database access requires admin role
  - Sensitive operations require MFA

### 3. `internal-rate-limiting.json` (Internal)
- **Precedence:** Internal (1)
- **Framework:** Internal
- **Purpose:** API fair usage and performance
- **Rules:**
  - Rate limiting (100 req/min)
  - Burst protection (50 req/sec)

## How to Register Policies

### Via HTTP API
```bash
curl -X POST http://localhost:3000/policies \
  -H "Content-Type: application/json" \
  -d @gdpr-data-protection.json
```

### Programmatically
```typescript
import { policyRegistry } from "./policy/registry/policy-registry";
import gdprPolicy from "./policy/examples/gdpr-data-protection.json";

await policyRegistry.register(gdprPolicy);
```

### Via Bootstrap
Place policies in `kernel/policy/examples/` and they will be automatically loaded during kernel bootstrap.

## Policy Conflict Resolution

When multiple policies apply to the same action:

1. **Highest Precedence Wins:** Legal > Industry > Internal
2. **Same Precedence:** Deny > Allow (most restrictive wins)
3. **Tie-Breaker:** Most recently registered policy

### Example Conflict
```
Action: "delete user data"

Policies Applied:
- GDPR (Legal, Allow) ✅ WINS
- SOC2 (Industry, Deny)
- Internal (Internal, Allow)

Result: ALLOWED (Legal precedence wins)
```

## Testing Policies

```typescript
import { policyEngine } from "./policy/engine/policy-engine";

const result = await policyEngine.evaluate({
  action: "read",
  orchestra: "db",
  context: {
    dataType: "personal",
    userConsent: false,
  },
});

console.log(result.allowed); // false (GDPR denies)
console.log(result.winningPolicy.policyName); // "GDPR Data Protection Policy"
```

## Creating Custom Policies

See `kernel/policy/schemas/policy-manifest.schema.ts` for the full schema.

### Minimal Example
```json
{
  "id": "my-custom-policy",
  "name": "My Custom Policy",
  "version": "1.0.0",
  "description": "Description",
  "precedence": 1,
  "status": "active",
  "enforcementMode": "enforce",
  "scope": {
    "orchestras": ["db"]
  },
  "rules": [
    {
      "id": "rule-01",
      "description": "Block action X",
      "conditions": [
        {
          "field": "action",
          "operator": "eq",
          "value": "dangerous-action"
        }
      ],
      "effect": "deny"
    }
  ]
}
```

## Supported Operators

- `eq`, `ne` - Equals, not equals
- `gt`, `lt`, `gte`, `lte` - Greater/less than
- `in`, `nin` - In array, not in array
- `contains` - String/array contains
- `regex` - Regular expression match

## Enforcement Modes

- **enforce:** Block violations (default)
- **warn:** Log violations but allow
- **monitor:** Track violations only

---

**GRCD-KERNEL v4.0.0 | C-6 Policy Precedence System**


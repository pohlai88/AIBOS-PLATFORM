# Secret Rotation Automation

**Status:** ✅ **ENHANCED**  
**Priority:** 🚀 **High** - Security & compliance  
**Reference:** AWS Secrets Manager rotation patterns

---

## Overview

The Secret Rotation Automation system provides automatic rotation of API keys, tokens, and certificates with zero-downtime, expiration monitoring, and compliance audit trails.

---

## Features

- ✅ **Automatic Rotation** - Scheduled rotation based on policies
- ✅ **Zero-Downtime** - Dual-key mode with grace period
- ✅ **Expiration Alerts** - Proactive alerts before expiration
- ✅ **Compliance Audit** - Full audit trail for SOC2/ISO 27001
- ✅ **REST API** - Manage rotations via HTTP endpoints

---

## Usage

### Automatic Rotation

Automatic rotation starts when the Kernel boots:

```typescript
import { AutoRotationService } from "./security/secret-rotation";
import { secretManager } from "./security/secret-rotation";

// Initialize auto-rotation service
const autoRotation = AutoRotationService.getInstance(secretManager);
await autoRotation.initialize();

// Rotation happens automatically based on schedules
```

### Manual Rotation

```typescript
// Rotate a specific secret
const result = await autoRotation.rotateSecret("jwt", "tenant-1");

if (result.success) {
  console.log("Secret rotated successfully");
} else {
  console.error("Rotation failed:", result.error);
}
```

### Check Expirations

```typescript
// Check for expiring secrets
const alerts = await autoRotation.checkExpirations();

for (const alert of alerts) {
  console.log(`${alert.secretType} expires in ${alert.daysUntilExpiration} days`);
  console.log(`Alert level: ${alert.alertLevel}`);
}
```

### Register Custom Schedule

```typescript
autoRotation.registerSchedule({
  secretType: "jwt",
  cronExpression: "0 0 * * *", // Daily at midnight
  intervalDays: 30,
  alertDaysBeforeExpiration: 7,
  enabled: true,
});
```

---

## REST API Endpoints

### GET /secrets/status

Get status of all secrets and expiration alerts.

**Response:**
```json
{
  "alerts": [
    {
      "secretType": "jwt",
      "expiresAt": "2025-12-06T10:30:00Z",
      "daysUntilExpiration": 5,
      "alertLevel": "critical"
    }
  ],
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### POST /secrets/:secretType/rotate

Manually rotate a secret.

**Request:**
```json
{
  "tenantId": "tenant-1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Secret jwt rotated successfully",
  "nextRotationAt": "2025-12-29T10:30:00Z"
}
```

### GET /secrets/:secretType/expiration

Get expiration info for a specific secret.

**Response:**
```json
{
  "secretType": "jwt",
  "nextRotationAt": "2025-12-29T10:30:00Z",
  "alert": {
    "expiresAt": "2025-12-06T10:30:00Z",
    "daysUntilExpiration": 5,
    "alertLevel": "critical"
  }
}
```

---

## Default Rotation Schedules

| Secret Type | Interval | Alert Days | Grace Period |
|-------------|----------|------------|--------------|
| JWT | 30 days | 7 days | 24 hours |
| API Keys | 90 days | 14 days | 72 hours |
| DB Passwords | 90 days | 14 days | 48 hours |
| Encryption Keys | 180 days | 30 days | 168 hours (7 days) |

---

## Zero-Downtime Rotation

The system uses dual-key mode:

1. **Active Key** - Currently used for signing/verification
2. **Next Key** - Prepared for next rotation
3. **Grace Period** - Both keys work during transition
4. **Promotion** - Next key becomes active after grace period

This ensures zero downtime during rotation.

---

## Expiration Monitoring

The system monitors secret expiration and sends alerts:

- **Warning** - 7 days before expiration (default)
- **Critical** - 3 days before expiration (default)
- **Expired** - Triggers emergency rotation

Alerts are sent via:
- Event bus (`security.secret.expiring`)
- Audit logs
- REST API status endpoint

---

## Compliance

All rotations are audited for:
- SOC2 compliance
- ISO 27001 compliance
- GDPR compliance (if applicable)

Audit trail includes:
- Rotation timestamp
- Secret type
- Tenant ID
- System load at rotation
- Success/failure status

---

## Configuration

### Rotation Schedule

```typescript
const schedule: RotationSchedule = {
  secretType: "jwt",
  cronExpression: "0 0 1 * *", // Monthly on 1st
  intervalDays: 30,
  alertDaysBeforeExpiration: 7,
  enabled: true,
};
```

### Expiration Monitor

```typescript
const monitor = new ExpirationMonitor({
  checkInterval: 60 * 60 * 1000, // 1 hour
  alertThresholds: {
    warning: 7, // days
    critical: 3, // days
  },
});
```

---

## Best Practices

1. **Set Appropriate Intervals** - Balance security vs. operational overhead
2. **Monitor Alerts** - Set up alerting for expiration warnings
3. **Test Rotations** - Test rotation in staging before production
4. **Review Audit Logs** - Regularly review rotation audit logs
5. **Emergency Procedures** - Have procedures for emergency rotations

---

## References

- **Feature Gap Analysis:** See `FEATURE-GAP-ANALYSIS.md` for context
- **Market Strategy:** See `MARKET-STRATEGY-REPORT.md` for prioritization
- **AWS Secrets Manager:** https://docs.aws.amazon.com/secretsmanager/
- **Zero-Downtime Rotation:** Industry best practices

---

**Last Updated:** November 29, 2025  
**Status:** ✅ Enhanced - Automatic rotation and expiration monitoring added


/**
 * Metadata Routes
 *
 * Endpoints for metadata and catalog access.
 * Phase 2: Extended with lineage, impact analysis, and governance endpoints.
 */

import type { Hono } from 'hono';
import { z } from 'zod';
import { lineageService } from '../../metadata/lineage';
import { impactAnalysisService } from '../../metadata/impact';
import { governanceTierService, metadataService } from '../../metadata/services';
import { baseLogger } from '../../observability/logger';

const logger = baseLogger.child({ module: 'metadata-routes' });

// Helper to get tenant ID from request
function getTenantId(c: any): string | null {
  return c.req.header('x-tenant-id') ?? null;
}

// Helper to get requester from request
function getRequester(c: any): string | null {
  return c.req.header('x-requester') ?? c.get('principal')?.id ?? null;
}

export function registerMetadataRoutes(app: Hono) {
  // ─────────────────────────────────────────────────────────────
  // Legacy Metadata Endpoint
  // ─────────────────────────────────────────────────────────────

  app.get('/metadata/:entityId', async (c) => {
    const entityId = c.req.param('entityId');
    const tenantId = getTenantId(c);

    // TODO: Implement metadata registry lookup
    return c.json({
      entityId,
      tenantId,
      metadata: null,
      message: 'Metadata registry lookup not yet implemented',
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Lineage Routes (Phase 2.2)
  // ─────────────────────────────────────────────────────────────

  // GET /metadata/lineage/:urn - Get lineage graph for a URN
  const GetLineageParams = z.object({
    urn: z.string().min(1),
  });

  app.get('/metadata/lineage/:urn', async (c) => {
    try {
      const { urn } = GetLineageParams.parse({ urn: c.req.param('urn') });
      const tenantId = getTenantId(c);
      const direction = (c.req.query('direction') as 'upstream' | 'downstream' | 'both') || 'both';
      const depth = parseInt(c.req.query('depth') || '10', 10);

      const graph = await lineageService.getLineageGraph(tenantId, urn, {
        direction,
        depth,
      });

      return c.json({
        urn,
        direction,
        depth,
        nodes: graph.nodes,
        edges: graph.edges,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get lineage graph');
      return c.json({ error: 'Failed to get lineage graph' }, 500);
    }
  });

  // GET /metadata/lineage/:urn/upstream - Get upstream dependencies
  app.get('/metadata/lineage/:urn/upstream', async (c) => {
    try {
      const { urn } = GetLineageParams.parse({ urn: c.req.param('urn') });
      const tenantId = getTenantId(c);
      const depth = parseInt(c.req.query('depth') || '10', 10);

      const upstream = await lineageService.getUpstream(tenantId, urn, depth);

      return c.json({
        urn,
        upstream,
        count: upstream.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get upstream lineage');
      return c.json({ error: 'Failed to get upstream lineage' }, 500);
    }
  });

  // GET /metadata/lineage/:urn/downstream - Get downstream dependents
  app.get('/metadata/lineage/:urn/downstream', async (c) => {
    try {
      const { urn } = GetLineageParams.parse({ urn: c.req.param('urn') });
      const tenantId = getTenantId(c);
      const depth = parseInt(c.req.query('depth') || '10', 10);

      const downstream = await lineageService.getDownstream(tenantId, urn, depth);

      return c.json({
        urn,
        downstream,
        count: downstream.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get downstream lineage');
      return c.json({ error: 'Failed to get downstream lineage' }, 500);
    }
  });

  // POST /metadata/lineage/nodes - Create lineage node
  const CreateLineageNodeBody = z.object({
    entityId: z.string().uuid(),
    entityType: z.enum(['business_term', 'data_contract', 'field_dictionary']),
    urn: z.string().min(1),
    nodeType: z.enum(['field', 'entity', 'kpi', 'report', 'transformation', 'source']),
    metadata: z.record(z.any()).optional(),
  });

  app.post('/metadata/lineage/nodes', async (c) => {
    try {
      const body = await c.req.json();
      const validated = CreateLineageNodeBody.parse(body);
      const tenantId = getTenantId(c);

      const node = await lineageService.createNodeFromEntity(
        tenantId,
        validated.entityId,
        validated.entityType,
        validated.urn,
        validated.nodeType,
        validated.metadata || {}
      );

      return c.json(node, 201);
    } catch (error) {
      logger.error({ error }, 'Failed to create lineage node');
      return c.json({ error: 'Failed to create lineage node' }, 500);
    }
  });

  // POST /metadata/lineage/edges - Create lineage edge
  const CreateLineageEdgeBody = z.object({
    sourceUrn: z.string().min(1),
    targetUrn: z.string().min(1),
    edgeType: z.enum(['produces', 'consumes', 'derived_from', 'transforms', 'references']),
    transformation: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  });

  app.post('/metadata/lineage/edges', async (c) => {
    try {
      const body = await c.req.json();
      const validated = CreateLineageEdgeBody.parse(body);
      const tenantId = getTenantId(c);

      const edge = await lineageService.addEdge(
        tenantId,
        validated.sourceUrn,
        validated.targetUrn,
        validated.edgeType,
        validated.transformation,
        validated.metadata || {}
      );

      return c.json(edge, 201);
    } catch (error) {
      logger.error({ error }, 'Failed to create lineage edge');
      return c.json({ error: 'Failed to create lineage edge' }, 500);
    }
  });

  // GET /metadata/lineage/:urn/coverage - Check lineage coverage
  app.get('/metadata/lineage/:urn/coverage', async (c) => {
    try {
      const { urn } = GetLineageParams.parse({ urn: c.req.param('urn') });
      const tenantId = getTenantId(c);

      const hasCoverage = await lineageService.hasLineageCoverage(tenantId, urn);

      return c.json({
        urn,
        hasCoverage,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to check lineage coverage');
      return c.json({ error: 'Failed to check lineage coverage' }, 500);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Impact Analysis Routes (Phase 2.3)
  // ─────────────────────────────────────────────────────────────

  // POST /metadata/impact/analyze - Analyze impact of metadata change
  const AnalyzeImpactBody = z.object({
    urn: z.string().min(1),
    changeType: z.enum(['field_update', 'field_delete', 'sot_change', 'kpi_change', 'tier_change', 'entity_delete', 'schema_change']),
    maxDepth: z.number().int().min(1).max(20).optional(),
    includeUpstream: z.boolean().optional(),
    includeDownstream: z.boolean().optional(),
    filterByTier: z.array(z.enum(['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5'])).optional(),
    filterByType: z.array(z.enum(['field', 'entity', 'kpi', 'report', 'transformation', 'source'])).optional(),
  });

  app.post('/metadata/impact/analyze', async (c) => {
    try {
      const body = await c.req.json();
      const validated = AnalyzeImpactBody.parse(body);
      const tenantId = getTenantId(c);

      const report = await impactAnalysisService.analyzeImpact(
        tenantId,
        validated.urn,
        validated.changeType,
        {
          maxDepth: validated.maxDepth,
          includeUpstream: validated.includeUpstream,
          includeDownstream: validated.includeDownstream,
          filterByTier: validated.filterByTier,
          filterByType: validated.filterByType,
        }
      );

      return c.json(report);
    } catch (error) {
      logger.error({ error }, 'Failed to analyze impact');
      return c.json({ error: 'Failed to analyze impact' }, 500);
    }
  });

  // GET /metadata/impact/:urn/affected - Get affected assets for a URN
  app.get('/metadata/impact/:urn/affected', async (c) => {
    try {
      const { urn } = GetLineageParams.parse({ urn: c.req.param('urn') });
      const tenantId = getTenantId(c);
      const maxDepth = parseInt(c.req.query('depth') || '10', 10);

      const affected = await impactAnalysisService.getAffectedAssets(tenantId, urn, {
        maxDepth,
      });

      return c.json({
        urn,
        affected,
        count: affected.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get affected assets');
      return c.json({ error: 'Failed to get affected assets' }, 500);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Governance Routes (Phase 2.1)
  // ─────────────────────────────────────────────────────────────

  // GET /metadata/governance/tiers - Get tier requirements
  app.get('/metadata/governance/tiers', async (c) => {
    try {
      const tiers = ['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5'] as const;
      const requirements = tiers.map((tier) => ({
        tier,
        requirements: governanceTierService.getTierRequirements(tier),
      }));

      return c.json({ tiers: requirements });
    } catch (error) {
      logger.error({ error }, 'Failed to get tier requirements');
      return c.json({ error: 'Failed to get tier requirements' }, 500);
    }
  });

  // POST /metadata/governance/validate - Validate tier compliance
  const ValidateTierComplianceBody = z.object({
    tier: z.enum(['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5']),
    urn: z.string().optional(),
    hasLineage: z.boolean().optional(),
    hasProfiling: z.boolean().optional(),
    hasStandardPack: z.boolean().optional(),
    hasOwner: z.boolean().optional(),
    hasSteward: z.boolean().optional(),
  });

  app.post('/metadata/governance/validate', async (c) => {
    try {
      const body = await c.req.json();
      const validated = ValidateTierComplianceBody.parse(body);
      const tenantId = getTenantId(c);

      const compliance = await governanceTierService.validateTierCompliance(
        validated.tier,
        {
          urn: validated.urn,
          tenantId,
          hasLineage: validated.hasLineage,
          hasProfiling: validated.hasProfiling,
          hasStandardPack: validated.hasStandardPack,
          hasOwner: validated.hasOwner,
          hasSteward: validated.hasSteward,
        }
      );

      return c.json(compliance);
    } catch (error) {
      logger.error({ error }, 'Failed to validate tier compliance');
      return c.json({ error: 'Failed to validate tier compliance' }, 500);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Catalog Routes (Phase 1 - Extended)
  // ─────────────────────────────────────────────────────────────

  // GET /metadata/catalog/business-terms - List business terms
  app.get('/metadata/catalog/business-terms', async (c) => {
    try {
      const tenantId = getTenantId(c);
      const domain = c.req.query('domain');
      const governanceTier = c.req.query('governanceTier') as string | undefined;
      const standardPackId = c.req.query('standardPackId');

      const terms = await metadataService.listBusinessTerms(tenantId, {
        domain: domain || undefined,
        governanceTier,
        standardPackId: standardPackId || undefined,
      });

      return c.json({
        terms,
        count: terms.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to list business terms');
      return c.json({ error: 'Failed to list business terms' }, 500);
    }
  });

  // GET /metadata/catalog/data-contracts - List data contracts
  app.get('/metadata/catalog/data-contracts', async (c) => {
    try {
      const tenantId = getTenantId(c);
      const governanceTier = c.req.query('governanceTier') as string | undefined;
      const standardPackId = c.req.query('standardPackId');

      const contracts = await metadataService.listDataContracts(tenantId, {
        governanceTier,
        standardPackId: standardPackId || undefined,
      });

      return c.json({
        contracts,
        count: contracts.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to list data contracts');
      return c.json({ error: 'Failed to list data contracts' }, 500);
    }
  });

  // GET /metadata/catalog/field-dictionary - List field dictionary entries
  app.get('/metadata/catalog/field-dictionary', async (c) => {
    try {
      const tenantId = getTenantId(c);
      const governanceTier = c.req.query('governanceTier') as string | undefined;
      const standardPackId = c.req.query('standardPackId');

      const fields = await metadataService.listFieldDictionaries(tenantId, {
        governanceTier,
        standardPackId: standardPackId || undefined,
      });

      return c.json({
        fields,
        count: fields.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to list field dictionary entries');
      return c.json({ error: 'Failed to list field dictionary entries' }, 500);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Profiling Routes (Phase 3.1)
  // ─────────────────────────────────────────────────────────────

  // POST /metadata/profiling/profile - Trigger profiling for a field
  const ProfileFieldBody = z.object({
    fieldId: z.string().uuid(),
    tableName: z.string().optional(),
    columnName: z.string().optional(),
    options: z.object({
      includeTopValues: z.boolean().optional(),
      topValuesLimit: z.number().int().min(1).max(100).optional(),
      includeDistribution: z.boolean().optional(),
      sampleSize: z.number().int().min(1).optional(),
      timeoutMs: z.number().int().min(1000).optional(),
    }).optional(),
  });

  app.post('/metadata/profiling/profile', async (c) => {
    try {
      const body = await c.req.json();
      const validated = ProfileFieldBody.parse(body);
      const tenantId = getTenantId(c);

      const { profilingService } = await import('../../metadata/profiling');

      const stats = await profilingService.profileField(
        validated.fieldId,
        validated.tableName,
        validated.columnName,
        validated.options || {}
      );

      return c.json(stats, 201);
    } catch (error) {
      logger.error({ error }, 'Failed to profile field');
      return c.json({ error: 'Failed to profile field' }, 500);
    }
  });

  // GET /metadata/profiling/:fieldId/stats - Get latest profiling statistics
  const GetProfilingStatsParams = z.object({
    fieldId: z.string().uuid(),
  });

  app.get('/metadata/profiling/:fieldId/stats', async (c) => {
    try {
      const { fieldId } = GetProfilingStatsParams.parse({ fieldId: c.req.param('fieldId') });
      const tenantId = getTenantId(c);

      const { profilingService } = await import('../../metadata/profiling');

      const stats = await profilingService.getLatestStats(tenantId, fieldId);

      if (!stats) {
        return c.json({ error: 'No profiling statistics found' }, 404);
      }

      return c.json(stats);
    } catch (error) {
      logger.error({ error }, 'Failed to get profiling statistics');
      return c.json({ error: 'Failed to get profiling statistics' }, 500);
    }
  });

  // GET /metadata/profiling/:fieldId/history - Get profiling history
  app.get('/metadata/profiling/:fieldId/history', async (c) => {
    try {
      const { fieldId } = GetProfilingStatsParams.parse({ fieldId: c.req.param('fieldId') });
      const tenantId = getTenantId(c);
      const limit = parseInt(c.req.query('limit') || '10', 10);

      const { profilingRepository } = await import('../../metadata/profiling');

      const history = await profilingRepository.getProfilingHistory(tenantId, fieldId, limit);

      return c.json({
        fieldId,
        history,
        count: history.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get profiling history');
      return c.json({ error: 'Failed to get profiling history' }, 500);
    }
  });

  // POST /metadata/profiling/schedule - Schedule profiling for a field
  const ScheduleProfilingBody = z.object({
    fieldId: z.string().uuid(),
    governanceTier: z.enum(['tier_1', 'tier_2']),
  });

  app.post('/metadata/profiling/schedule', async (c) => {
    try {
      const body = await c.req.json();
      const validated = ScheduleProfilingBody.parse(body);
      const tenantId = getTenantId(c);

      const { profilingService } = await import('../../metadata/profiling');

      await profilingService.scheduleProfiling(
        tenantId,
        validated.fieldId,
        validated.governanceTier
      );

      return c.json({
        message: 'Profiling scheduled successfully',
        fieldId: validated.fieldId,
        governanceTier: validated.governanceTier,
      }, 201);
    } catch (error) {
      logger.error({ error }, 'Failed to schedule profiling');
      return c.json({ error: 'Failed to schedule profiling' }, 500);
    }
  });

  // GET /metadata/profiling/:fieldId/has-profiling - Check if field has profiling
  app.get('/metadata/profiling/:fieldId/has-profiling', async (c) => {
    try {
      const { fieldId } = GetProfilingStatsParams.parse({ fieldId: c.req.param('fieldId') });
      const tenantId = getTenantId(c);

      const { profilingService } = await import('../../metadata/profiling');

      const hasProfiling = await profilingService.hasProfiling(tenantId, fieldId);

      return c.json({
        fieldId,
        hasProfiling,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to check profiling status');
      return c.json({ error: 'Failed to check profiling status' }, 500);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Quality Routes (Phase 3.2)
  // ─────────────────────────────────────────────────────────────

  // POST /metadata/quality/rules - Define a quality rule
  const CreateQualityRuleBody = z.object({
    fieldId: z.string().uuid(),
    ruleType: z.enum(['not_null', 'unique', 'min_value', 'max_value', 'min_length', 'max_length', 'pattern', 'enum', 'referential_integrity', 'custom_sql']),
    ruleName: z.string().min(1),
    description: z.string().nullable().optional(),
    config: z.record(z.any()).optional(),
    threshold: z.number().nullable().optional(),
    pattern: z.string().nullable().optional(),
    enumValues: z.array(z.string()).nullable().optional(),
    customSql: z.string().nullable().optional(),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
    isActive: z.boolean().optional(),
  });

  app.post('/metadata/quality/rules', async (c) => {
    try {
      const body = await c.req.json();
      const validated = CreateQualityRuleBody.parse(body);
      const tenantId = getTenantId(c);

      const { qualityService } = await import('../../metadata/quality');

      // Get field to get URN
      const field = await metadataService.getFieldDictionary(tenantId, validated.fieldId);
      if (!field) {
        return c.json({ error: 'Field not found' }, 404);
      }

      const rule = await qualityService.defineRule({
        tenantId,
        fieldId: validated.fieldId,
        fieldUrn: field.entityUrn || `urn:metadata:field:${field.canonicalKey}`,
        ruleType: validated.ruleType,
        ruleName: validated.ruleName,
        description: validated.description || null,
        config: validated.config || {},
        threshold: validated.threshold || null,
        pattern: validated.pattern || null,
        enumValues: validated.enumValues || null,
        customSql: validated.customSql || null,
        severity: validated.severity || 'medium',
        isActive: validated.isActive !== undefined ? validated.isActive : true,
        createdBy: getRequester(c),
      });

      return c.json(rule, 201);
    } catch (error) {
      logger.error({ error }, 'Failed to create quality rule');
      return c.json({ error: 'Failed to create quality rule' }, 500);
    }
  });

  // GET /metadata/quality/rules/:fieldId - Get quality rules for a field
  const GetQualityRulesParams = z.object({
    fieldId: z.string().uuid(),
  });

  app.get('/metadata/quality/rules/:fieldId', async (c) => {
    try {
      const { fieldId } = GetQualityRulesParams.parse({ fieldId: c.req.param('fieldId') });
      const tenantId = getTenantId(c);
      const activeOnly = c.req.query('activeOnly') === 'true';

      const { qualityService } = await import('../../metadata/quality');

      const rules = await qualityService.getRulesByField(tenantId, fieldId, activeOnly);

      return c.json({
        fieldId,
        rules,
        count: rules.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get quality rules');
      return c.json({ error: 'Failed to get quality rules' }, 500);
    }
  });

  // POST /metadata/quality/checks - Run quality checks for a field
  const RunQualityChecksBody = z.object({
    fieldId: z.string().uuid(),
    tableName: z.string().optional(),
    columnName: z.string().optional(),
  });

  app.post('/metadata/quality/checks', async (c) => {
    try {
      const body = await c.req.json();
      const validated = RunQualityChecksBody.parse(body);
      const tenantId = getTenantId(c);

      const { qualityService } = await import('../../metadata/quality');

      const report = await qualityService.runQualityChecks(
        tenantId,
        validated.fieldId,
        validated.tableName,
        validated.columnName
      );

      return c.json(report);
    } catch (error) {
      logger.error({ error }, 'Failed to run quality checks');
      return c.json({ error: 'Failed to run quality checks' }, 500);
    }
  });

  // GET /metadata/quality/violations/:fieldId - Get unresolved violations for a field
  app.get('/metadata/quality/violations/:fieldId', async (c) => {
    try {
      const { fieldId } = GetQualityRulesParams.parse({ fieldId: c.req.param('fieldId') });
      const tenantId = getTenantId(c);

      const { qualityService } = await import('../../metadata/quality');

      const violations = await qualityService.getUnresolvedViolations(tenantId, fieldId);

      return c.json({
        fieldId,
        violations,
        count: violations.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get quality violations');
      return c.json({ error: 'Failed to get quality violations' }, 500);
    }
  });

  // POST /metadata/quality/violations/:violationId/resolve - Resolve a violation
  const ResolveViolationParams = z.object({
    violationId: z.string().uuid(),
  });

  const ResolveViolationBody = z.object({
    resolutionNotes: z.string().optional(),
  });

  app.post('/metadata/quality/violations/:violationId/resolve', async (c) => {
    try {
      const { violationId } = ResolveViolationParams.parse({ violationId: c.req.param('violationId') });
      const body = await c.req.json();
      const validated = ResolveViolationBody.parse(body);
      const resolvedBy = getRequester(c) || 'system';

      const { qualityService } = await import('../../metadata/quality');

      const violation = await qualityService.resolveViolation(
        violationId,
        resolvedBy,
        validated.resolutionNotes
      );

      if (!violation) {
        return c.json({ error: 'Violation not found' }, 404);
      }

      return c.json(violation);
    } catch (error) {
      logger.error({ error }, 'Failed to resolve violation');
      return c.json({ error: 'Failed to resolve violation' }, 500);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Analytics Routes (Phase 3.3)
  // ─────────────────────────────────────────────────────────────

  // POST /metadata/analytics/log - Log usage activity
  const LogUsageBody = z.object({
    assetUrn: z.string().min(1),
    assetType: z.enum(['business_term', 'data_contract', 'field_dictionary', 'kpi', 'report', 'transformation']),
    action: z.enum(['view', 'query', 'export', 'update', 'create', 'delete', 'download', 'share']),
    userId: z.string().min(1),
    userName: z.string().nullable().optional(),
    userEmail: z.string().nullable().optional(),
    context: z.record(z.any()).optional(),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
    durationMs: z.number().int().min(0).nullable().optional(),
    success: z.boolean().optional(),
    errorMessage: z.string().nullable().optional(),
  });

  app.post('/metadata/analytics/log', async (c) => {
    try {
      const body = await c.req.json();
      const validated = LogUsageBody.parse(body);
      const tenantId = getTenantId(c);

      const { analyticsService } = await import('../../metadata/analytics');

      const log = await analyticsService.logUsage({
        tenantId,
        assetUrn: validated.assetUrn,
        assetType: validated.assetType,
        action: validated.action,
        userId: validated.userId,
        userName: validated.userName || null,
        userEmail: validated.userEmail || null,
        context: validated.context || null,
        ipAddress: validated.ipAddress || null,
        userAgent: validated.userAgent || null,
        durationMs: validated.durationMs || null,
        success: validated.success !== undefined ? validated.success : true,
        errorMessage: validated.errorMessage || null,
      });

      return c.json(log, 201);
    } catch (error) {
      logger.error({ error }, 'Failed to log usage');
      return c.json({ error: 'Failed to log usage' }, 500);
    }
  });

  // GET /metadata/analytics/stats/:assetUrn - Get usage statistics for an asset
  const GetUsageStatsParams = z.object({
    assetUrn: z.string().min(1),
  });

  app.get('/metadata/analytics/stats/:assetUrn', async (c) => {
    try {
      const { assetUrn } = GetUsageStatsParams.parse({ assetUrn: decodeURIComponent(c.req.param('assetUrn')) });
      const tenantId = getTenantId(c);
      const days = parseInt(c.req.query('days') || '30', 10);

      const { analyticsService } = await import('../../metadata/analytics');

      const stats = await analyticsService.getUsageStats(tenantId, assetUrn, days);

      return c.json(stats);
    } catch (error) {
      logger.error({ error }, 'Failed to get usage statistics');
      return c.json({ error: 'Failed to get usage statistics' }, 500);
    }
  });

  // GET /metadata/analytics/logs/:assetUrn - Get usage logs for an asset
  app.get('/metadata/analytics/logs/:assetUrn', async (c) => {
    try {
      const { assetUrn } = GetUsageStatsParams.parse({ assetUrn: decodeURIComponent(c.req.param('assetUrn')) });
      const tenantId = getTenantId(c);
      const limit = parseInt(c.req.query('limit') || '100', 10);
      const offset = parseInt(c.req.query('offset') || '0', 10);

      const { analyticsService } = await import('../../metadata/analytics');

      const logs = await analyticsService.getUsageLogs(tenantId, assetUrn, limit, offset);

      return c.json({
        assetUrn,
        logs,
        count: logs.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get usage logs');
      return c.json({ error: 'Failed to get usage logs' }, 500);
    }
  });

  // GET /metadata/analytics/trend/:assetUrn - Get usage trend for an asset
  app.get('/metadata/analytics/trend/:assetUrn', async (c) => {
    try {
      const { assetUrn } = GetUsageStatsParams.parse({ assetUrn: decodeURIComponent(c.req.param('assetUrn')) });
      const tenantId = getTenantId(c);
      const period = (c.req.query('period') as 'daily' | 'weekly' | 'monthly') || 'daily';
      const days = parseInt(c.req.query('days') || '30', 10);

      const { analyticsService } = await import('../../metadata/analytics');

      const trend = await analyticsService.getUsageTrend(tenantId, assetUrn, period, days);

      return c.json(trend);
    } catch (error) {
      logger.error({ error }, 'Failed to get usage trend');
      return c.json({ error: 'Failed to get usage trend' }, 500);
    }
  });

  // GET /metadata/analytics/popular - Get popular assets
  app.get('/metadata/analytics/popular', async (c) => {
    try {
      const tenantId = getTenantId(c);
      const limit = parseInt(c.req.query('limit') || '10', 10);
      const days = parseInt(c.req.query('days') || '30', 10);

      const { analyticsService } = await import('../../metadata/analytics');

      const assets = await analyticsService.getPopularAssets(tenantId, limit, days);

      return c.json({
        assets,
        count: assets.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get popular assets');
      return c.json({ error: 'Failed to get popular assets' }, 500);
    }
  });

  // GET /metadata/analytics/users/:userId - Get user activity
  const GetUserActivityParams = z.object({
    userId: z.string().min(1),
  });

  app.get('/metadata/analytics/users/:userId', async (c) => {
    try {
      const { userId } = GetUserActivityParams.parse({ userId: c.req.param('userId') });
      const tenantId = getTenantId(c);
      const days = parseInt(c.req.query('days') || '30', 10);

      const { analyticsService } = await import('../../metadata/analytics');

      const activity = await analyticsService.getUserActivity(tenantId, userId, days);

      if (!activity) {
        return c.json({ error: 'User activity not found' }, 404);
      }

      return c.json(activity);
    } catch (error) {
      logger.error({ error }, 'Failed to get user activity');
      return c.json({ error: 'Failed to get user activity' }, 500);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Search Routes (Next Development)
  // ─────────────────────────────────────────────────────────────

  // POST /metadata/search - Search metadata across all entities
  const SearchMetadataBody = z.object({
    query: z.string().min(1),
    filters: z.object({
      domain: z.string().optional(),
      governanceTier: z.enum(['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5']).optional(),
      standardPackId: z.string().uuid().optional(),
      standardPackName: z.string().optional(),
      owner: z.string().optional(),
      steward: z.string().optional(),
      entityType: z.enum(['business_term', 'data_contract', 'field_dictionary', 'standard_pack']).optional(),
      hasLineage: z.boolean().optional(),
      hasProfiling: z.boolean().optional(),
      hasQualityRules: z.boolean().optional(),
      createdAfter: z.string().optional(),  // ISO date string
      createdBefore: z.string().optional(),
      updatedAfter: z.string().optional(),
      updatedBefore: z.string().optional(),
    }).optional(),
    options: z.object({
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      sortBy: z.enum(['relevance', 'createdAt', 'updatedAt', 'label']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      includeInactive: z.boolean().optional(),
      minRelevanceScore: z.number().min(0).max(1).optional(),
    }).optional(),
  });

  app.post('/metadata/search', async (c) => {
    try {
      const body = await c.req.json();
      const validated = SearchMetadataBody.parse(body);
      const tenantId = getTenantId(c);

      const { metadataSearchService } = await import('../../metadata/search');

      // Parse date strings to Date objects
      const filters = validated.filters ? {
        ...validated.filters,
        createdAfter: validated.filters.createdAfter ? new Date(validated.filters.createdAfter) : undefined,
        createdBefore: validated.filters.createdBefore ? new Date(validated.filters.createdBefore) : undefined,
        updatedAfter: validated.filters.updatedAfter ? new Date(validated.filters.updatedAfter) : undefined,
        updatedBefore: validated.filters.updatedBefore ? new Date(validated.filters.updatedBefore) : undefined,
      } : {};

      const results = await metadataSearchService.search(
        tenantId,
        validated.query,
        filters,
        validated.options || {}
      );

      return c.json(results);
    } catch (error) {
      logger.error({ error }, 'Failed to search metadata');
      return c.json({ error: 'Failed to search metadata' }, 500);
    }
  });

  // GET /metadata/search/lookup/:canonicalKey - Lookup metadata by canonical key
  const LookupMetadataParams = z.object({
    canonicalKey: z.string().min(1),
  });

  app.get('/metadata/search/lookup/:canonicalKey', async (c) => {
    try {
      const { canonicalKey } = LookupMetadataParams.parse({
        canonicalKey: decodeURIComponent(c.req.param('canonicalKey')),
      });
      const tenantId = getTenantId(c);
      const entityType = c.req.query('entityType') as 'business_term' | 'data_contract' | 'field_dictionary' | undefined;

      const result = await metadataService.lookupByCanonicalKey(
        tenantId,
        canonicalKey,
        entityType
      );

      if (!result) {
        return c.json({ error: 'Metadata not found' }, 404);
      }

      return c.json(result);
    } catch (error) {
      logger.error({ error }, 'Failed to lookup metadata');
      return c.json({ error: 'Failed to lookup metadata' }, 500);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Composite KPI Routes (Option 2: Composite KPI Modeling)
  // ─────────────────────────────────────────────────────────────

  // POST /metadata/kpi - Create composite KPI
  const CreateKPIBody = z.object({
    canonicalKey: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    numerator: z.object({
      fieldId: z.string().uuid(),
      expression: z.string().nullable().optional(),
      standardPackId: z.string().uuid(),
      description: z.string().nullable().optional(),
    }),
    denominator: z.object({
      fieldId: z.string().uuid(),
      expression: z.string().nullable().optional(),
      standardPackId: z.string().uuid(),
      description: z.string().nullable().optional(),
    }),
    governanceTier: z.enum(['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5']),
    owner: z.string().nullable().optional(),
    steward: z.string().nullable().optional(),
    entityUrn: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isDeprecated: z.boolean().optional(),
  });

  app.post('/metadata/kpi', async (c) => {
    try {
      const body = await c.req.json();
      const validated = CreateKPIBody.parse(body);
      const tenantId = getTenantId(c);

      const { compositeKpiService } = await import('../../metadata/kpi');

      const kpi = await compositeKpiService.createKPI(tenantId, validated);

      return c.json(kpi, 201);
    } catch (error) {
      logger.error({ error }, 'Failed to create KPI');
      return c.json({ error: 'Failed to create KPI' }, 500);
    }
  });

  // GET /metadata/kpi/:id - Get KPI by ID
  const GetKPIParams = z.object({
    id: z.string().uuid(),
  });

  app.get('/metadata/kpi/:id', async (c) => {
    try {
      const { id } = GetKPIParams.parse(c.req.param());
      const tenantId = getTenantId(c);

      const { compositeKpiService } = await import('../../metadata/kpi');

      const kpi = await compositeKpiService.getKPI(tenantId, id);

      if (!kpi) {
        return c.json({ error: 'KPI not found' }, 404);
      }

      return c.json(kpi);
    } catch (error) {
      logger.error({ error }, 'Failed to get KPI');
      return c.json({ error: 'Failed to get KPI' }, 500);
    }
  });

  // GET /metadata/kpi/canonical/:canonicalKey - Get KPI by canonical key
  app.get('/metadata/kpi/canonical/:canonicalKey', async (c) => {
    try {
      const canonicalKey = decodeURIComponent(c.req.param('canonicalKey'));
      const tenantId = getTenantId(c);

      const { compositeKpiService } = await import('../../metadata/kpi');

      const kpi = await compositeKpiService.getKPIByCanonicalKey(tenantId, canonicalKey);

      if (!kpi) {
        return c.json({ error: 'KPI not found' }, 404);
      }

      return c.json(kpi);
    } catch (error) {
      logger.error({ error }, 'Failed to get KPI by canonical key');
      return c.json({ error: 'Failed to get KPI by canonical key' }, 500);
    }
  });

  // GET /metadata/kpi - List KPIs
  app.get('/metadata/kpi', async (c) => {
    try {
      const tenantId = getTenantId(c);
      const governanceTier = c.req.query('governanceTier') as string | undefined;
      const domain = c.req.query('domain');
      const isActive = c.req.query('isActive') === 'true' ? true : c.req.query('isActive') === 'false' ? false : undefined;

      const { compositeKpiService } = await import('../../metadata/kpi');

      const kpis = await compositeKpiService.listKPIs(tenantId, {
        governanceTier,
        domain: domain || undefined,
        isActive,
      });

      return c.json({
        kpis,
        count: kpis.length,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to list KPIs');
      return c.json({ error: 'Failed to list KPIs' }, 500);
    }
  });

  // PUT /metadata/kpi/:id - Update KPI
  const UpdateKPIBody = z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    numerator: z.object({
      fieldId: z.string().uuid(),
      expression: z.string().nullable().optional(),
      standardPackId: z.string().uuid(),
      description: z.string().nullable().optional(),
    }).optional(),
    denominator: z.object({
      fieldId: z.string().uuid(),
      expression: z.string().nullable().optional(),
      standardPackId: z.string().uuid(),
      description: z.string().nullable().optional(),
    }).optional(),
    governanceTier: z.enum(['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5']).optional(),
    owner: z.string().nullable().optional(),
    steward: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isDeprecated: z.boolean().optional(),
  });

  app.put('/metadata/kpi/:id', async (c) => {
    try {
      const { id } = GetKPIParams.parse(c.req.param());
      const body = await c.req.json();
      const validated = UpdateKPIBody.parse(body);
      const tenantId = getTenantId(c);

      const { compositeKpiService } = await import('../../metadata/kpi');

      const kpi = await compositeKpiService.updateKPI(tenantId, id, validated);

      return c.json(kpi);
    } catch (error) {
      logger.error({ error }, 'Failed to update KPI');
      return c.json({ error: 'Failed to update KPI' }, 500);
    }
  });

  // DELETE /metadata/kpi/:id - Delete KPI
  app.delete('/metadata/kpi/:id', async (c) => {
    try {
      const { id } = GetKPIParams.parse(c.req.param());
      const tenantId = getTenantId(c);

      const { compositeKpiService } = await import('../../metadata/kpi');

      await compositeKpiService.deleteKPI(tenantId, id);

      return c.json({ message: 'KPI deleted successfully' }, 200);
    } catch (error) {
      logger.error({ error }, 'Failed to delete KPI');
      return c.json({ error: 'Failed to delete KPI' }, 500);
    }
  });

  // POST /metadata/kpi/:id/validate - Validate KPI compliance
  app.post('/metadata/kpi/:id/validate', async (c) => {
    try {
      const { id } = GetKPIParams.parse(c.req.param());
      const tenantId = getTenantId(c);

      const { compositeKpiService } = await import('../../metadata/kpi');

      const kpi = await compositeKpiService.getKPI(tenantId, id);
      if (!kpi) {
        return c.json({ error: 'KPI not found' }, 404);
      }

      const validation = await compositeKpiService.validateKPI(tenantId, kpi);

      return c.json(validation);
    } catch (error) {
      logger.error({ error }, 'Failed to validate KPI');
      return c.json({ error: 'Failed to validate KPI' }, 500);
    }
  });
}


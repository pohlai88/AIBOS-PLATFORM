/**
 * Lineage Repository
 *
 * CRUD operations for Lineage Nodes and Edges.
 * GRCD v4.1.0 Compliant: Lineage tracking for metadata entities
 * Phase 2.2: Data lineage system
 */

import { getDB } from "../../storage/db";
import type { LineageNode, LineageEdge, CreateLineageNode, CreateLineageEdge } from "./types";
import { ZLineageNode, ZLineageEdge, ZCreateLineageNode, ZCreateLineageEdge } from "./types";

export class LineageRepository {
    // ─────────────────────────────────────────────────────────────
    // Node Operations
    // ─────────────────────────────────────────────────────────────

    /**
     * Create a lineage node.
     */
    async createNode(input: CreateLineageNode): Promise<LineageNode> {
        const validated = ZCreateLineageNode.parse(input);
        const db = getDB().getClient();

        const res = await db.query<LineageNode>(
            `
      INSERT INTO mdm_lineage_nodes (
        tenant_id, urn, type, entity_id, entity_type, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        urn,
        type,
        tenant_id AS "tenantId",
        entity_id AS "entityId",
        entity_type AS "entityType",
        metadata,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
            [
                validated.tenantId,
                validated.urn,
                validated.type,
                validated.entityId,
                validated.entityType,
                JSON.stringify(validated.metadata),
            ],
        );

        return ZLineageNode.parse({
            ...res.rows[0],
            metadata: res.rows[0].metadata || {},
            createdAt: new Date(res.rows[0].createdAt),
            updatedAt: new Date(res.rows[0].updatedAt),
        });
    }

    /**
     * Find node by URN.
     */
    async findNodeByUrn(tenantId: string | null, urn: string): Promise<LineageNode | null> {
        const db = getDB().getClient();

        const res = await db.query<LineageNode>(
            `
      SELECT
        id,
        urn,
        type,
        tenant_id AS "tenantId",
        entity_id AS "entityId",
        entity_type AS "entityType",
        metadata,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_lineage_nodes
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND urn = $2
      `,
            [tenantId, urn],
        );

        if (res.rowCount === 0) return null;

        return ZLineageNode.parse({
            ...res.rows[0],
            metadata: res.rows[0].metadata || {},
            createdAt: new Date(res.rows[0].createdAt),
            updatedAt: new Date(res.rows[0].updatedAt),
        });
    }

    /**
     * Find node by entity ID and type.
     */
    async findNodeByEntity(
        tenantId: string | null,
        entityId: string,
        entityType: string,
    ): Promise<LineageNode | null> {
        const db = getDB().getClient();

        const res = await db.query<LineageNode>(
            `
      SELECT
        id,
        urn,
        type,
        tenant_id AS "tenantId",
        entity_id AS "entityId",
        entity_type AS "entityType",
        metadata,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_lineage_nodes
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND entity_id = $2
        AND entity_type = $3
      `,
            [tenantId, entityId, entityType],
        );

        if (res.rowCount === 0) return null;

        return ZLineageNode.parse({
            ...res.rows[0],
            metadata: res.rows[0].metadata || {},
            createdAt: new Date(res.rows[0].createdAt),
            updatedAt: new Date(res.rows[0].updatedAt),
        });
    }

    /**
     * List nodes by type.
     */
    async listNodesByType(
        tenantId: string | null,
        type: string,
        limit: number = 100,
        offset: number = 0,
    ): Promise<LineageNode[]> {
        const db = getDB().getClient();

        const res = await db.query<LineageNode>(
            `
      SELECT
        id,
        urn,
        type,
        tenant_id AS "tenantId",
        entity_id AS "entityId",
        entity_type AS "entityType",
        metadata,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_lineage_nodes
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND type = $2
      ORDER BY urn ASC
      LIMIT $3 OFFSET $4
      `,
            [tenantId, type, limit, offset],
        );

        return res.rows.map((row) =>
            ZLineageNode.parse({
                ...row,
                metadata: row.metadata || {},
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
            }),
        );
    }

    /**
     * Update node metadata.
     */
    async updateNode(urn: string, metadata: Record<string, any>): Promise<LineageNode | null> {
        const db = getDB().getClient();

        const res = await db.query<LineageNode>(
            `
      UPDATE mdm_lineage_nodes
      SET metadata = $1, updated_at = NOW()
      WHERE urn = $2
      RETURNING
        id,
        urn,
        type,
        tenant_id AS "tenantId",
        entity_id AS "entityId",
        entity_type AS "entityType",
        metadata,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
            [JSON.stringify(metadata), urn],
        );

        if (res.rowCount === 0) return null;

        return ZLineageNode.parse({
            ...res.rows[0],
            metadata: res.rows[0].metadata || {},
            createdAt: new Date(res.rows[0].createdAt),
            updatedAt: new Date(res.rows[0].updatedAt),
        });
    }

    /**
     * Delete node (and cascade delete edges).
     */
    async deleteNode(urn: string): Promise<boolean> {
        const db = getDB().getClient();

        // Delete edges first (cascade)
        await db.query(
            `DELETE FROM mdm_lineage_edges WHERE source_urn = $1 OR target_urn = $1`,
            [urn],
        );

        // Delete node
        const res = await db.query(
            `DELETE FROM mdm_lineage_nodes WHERE urn = $1`,
            [urn],
        );

        return (res.rowCount ?? 0) > 0;
    }

    // ─────────────────────────────────────────────────────────────
    // Edge Operations
    // ─────────────────────────────────────────────────────────────

    /**
     * Create a lineage edge.
     */
    async createEdge(input: CreateLineageEdge): Promise<LineageEdge> {
        const validated = ZCreateLineageEdge.parse(input);
        const db = getDB().getClient();

        const res = await db.query<LineageEdge>(
            `
      INSERT INTO mdm_lineage_edges (
        tenant_id, source_urn, target_urn, edge_type, transformation, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        source_urn AS "sourceUrn",
        target_urn AS "targetUrn",
        edge_type AS "edgeType",
        transformation,
        tenant_id AS "tenantId",
        metadata,
        created_at AS "createdAt"
      `,
            [
                validated.tenantId,
                validated.sourceUrn,
                validated.targetUrn,
                validated.edgeType,
                validated.transformation,
                JSON.stringify(validated.metadata),
            ],
        );

        return ZLineageEdge.parse({
            ...res.rows[0],
            metadata: res.rows[0].metadata || {},
            createdAt: new Date(res.rows[0].createdAt),
        });
    }

    /**
     * Find edges by source URN.
     */
    async findEdgesBySource(tenantId: string | null, sourceUrn: string): Promise<LineageEdge[]> {
        const db = getDB().getClient();

        const res = await db.query<LineageEdge>(
            `
      SELECT
        id,
        source_urn AS "sourceUrn",
        target_urn AS "targetUrn",
        edge_type AS "edgeType",
        transformation,
        tenant_id AS "tenantId",
        metadata,
        created_at AS "createdAt"
      FROM mdm_lineage_edges
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND source_urn = $2
      ORDER BY edge_type, target_urn
      `,
            [tenantId, sourceUrn],
        );

        return res.rows.map((row) =>
            ZLineageEdge.parse({
                ...row,
                metadata: row.metadata || {},
                createdAt: new Date(row.createdAt),
            }),
        );
    }

    /**
     * Find edges by target URN.
     */
    async findEdgesByTarget(tenantId: string | null, targetUrn: string): Promise<LineageEdge[]> {
        const db = getDB().getClient();

        const res = await db.query<LineageEdge>(
            `
      SELECT
        id,
        source_urn AS "sourceUrn",
        target_urn AS "targetUrn",
        edge_type AS "edgeType",
        transformation,
        tenant_id AS "tenantId",
        metadata,
        created_at AS "createdAt"
      FROM mdm_lineage_edges
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND target_urn = $2
      ORDER BY edge_type, source_urn
      `,
            [tenantId, targetUrn],
        );

        return res.rows.map((row) =>
            ZLineageEdge.parse({
                ...row,
                metadata: row.metadata || {},
                createdAt: new Date(row.createdAt),
            }),
        );
    }

    /**
     * Delete edge.
     */
    async deleteEdge(sourceUrn: string, targetUrn: string, edgeType: string): Promise<boolean> {
        const db = getDB().getClient();

        const res = await db.query(
            `
      DELETE FROM mdm_lineage_edges
      WHERE source_urn = $1 AND target_urn = $2 AND edge_type = $3
      `,
            [sourceUrn, targetUrn, edgeType],
        );

        return (res.rowCount ?? 0) > 0;
    }
}

export const lineageRepository = new LineageRepository();


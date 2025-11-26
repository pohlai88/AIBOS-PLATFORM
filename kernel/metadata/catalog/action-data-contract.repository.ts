/**
 * Action ↔ Data Contract Link Repository
 *
 * Maps actions to the data contracts they touch (read/write/read-write).
 */

import { getDB } from "../../storage/db";
import type { ActionDataContractLink, CreateActionDataContractLink } from "./types";
import { ZActionDataContractLink, ZCreateActionDataContractLink } from "./types";

export class ActionDataContractRepository {
  /**
   * Create a new action ↔ data contract link.
   */
  async create(input: CreateActionDataContractLink): Promise<ActionDataContractLink> {
    const validated = ZCreateActionDataContractLink.parse(input);
    const db = getDB().getClient();

    const res = await db.query<ActionDataContractLink>(
      `
      INSERT INTO kernel_action_data_contracts (
        tenant_id, action_id, data_contract_id, access_type
      ) VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        tenant_id AS "tenantId",
        action_id AS "actionId",
        data_contract_id AS "dataContractId",
        access_type AS "accessType",
        created_at AS "createdAt"
      `,
      [
        validated.tenantId,
        validated.actionId,
        validated.dataContractId,
        validated.accessType,
      ],
    );

    return ZActionDataContractLink.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
    });
  }

  /**
   * List all data contracts linked to an action.
   */
  async listContractsForAction(
    tenantId: string | null,
    actionId: string,
  ): Promise<ActionDataContractLink[]> {
    const db = getDB().getClient();

    const res = await db.query<ActionDataContractLink>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        action_id AS "actionId",
        data_contract_id AS "dataContractId",
        access_type AS "accessType",
        created_at AS "createdAt"
      FROM kernel_action_data_contracts
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND action_id = $2
      `,
      [tenantId, actionId],
    );

    return res.rows.map((row) =>
      ZActionDataContractLink.parse({
        ...row,
        createdAt: new Date(row.createdAt),
      }),
    );
  }

  /**
   * List all actions that touch a data contract.
   */
  async listActionsForContract(
    tenantId: string | null,
    dataContractId: string,
  ): Promise<ActionDataContractLink[]> {
    const db = getDB().getClient();

    const res = await db.query<ActionDataContractLink>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        action_id AS "actionId",
        data_contract_id AS "dataContractId",
        access_type AS "accessType",
        created_at AS "createdAt"
      FROM kernel_action_data_contracts
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND data_contract_id = $2
      `,
      [tenantId, dataContractId],
    );

    return res.rows.map((row) =>
      ZActionDataContractLink.parse({
        ...row,
        createdAt: new Date(row.createdAt),
      }),
    );
  }

  /**
   * Delete a link.
   */
  async delete(id: string): Promise<boolean> {
    const db = getDB().getClient();

    const res = await db.query(
      `DELETE FROM kernel_action_data_contracts WHERE id = $1`,
      [id],
    );

    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Delete all links for an action.
   */
  async deleteAllForAction(tenantId: string | null, actionId: string): Promise<number> {
    const db = getDB().getClient();

    const res = await db.query(
      `
      DELETE FROM kernel_action_data_contracts
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND action_id = $2
      `,
      [tenantId, actionId],
    );

    return res.rowCount ?? 0;
  }
}

export const actionDataContractRepository = new ActionDataContractRepository();


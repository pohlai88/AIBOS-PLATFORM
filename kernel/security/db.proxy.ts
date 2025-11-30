import { getDB } from "../storage/db";

export function createDbProxy(tenant: string) {
  const db = getDB();

  return {
    insert: async (model: string, data: any) => {
      return (db as any).from(`${tenant}_${model}`).insert(data);
    },
    update: async (model: string, id: string, data: any) => {
      return (db as any).from(`${tenant}_${model}`).update(data).eq("id", id);
    },
    list: async (model: string) => {
      return (db as any).from(`${tenant}_${model}`).select("*");
    },
    findById: async (model: string, id: string) => {
      return (db as any).from(`${tenant}_${model}`).select("*").eq("id", id).single();
    }
  };
}


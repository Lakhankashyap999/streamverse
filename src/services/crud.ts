import { supabase } from './supabaseClient';
import { demoDelay, demoStore, type DemoTable } from './demoStore';
import { FriendlyError, uid } from '../utils/misc';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Query = any;

interface Row {
  id: string;
  created_at: string;
}

export interface CrudOptions<T extends Row> {
  table: DemoTable;
  /** Explicit column list (avoid select('*') where column privileges apply). */
  columns?: string;
  order: { column: keyof T & string; ascending: boolean };
  /** Supabase filter for public reads (RLS enforces the same rule server-side). */
  publicQuery?: (q: Query) => Query;
  /** Equivalent filter for demo mode. */
  publicFilter?: (row: T) => boolean;
  label: string;
}

export interface CrudService<T extends Row> {
  listPublic(): Promise<T[]>;
  listAll(): Promise<T[]>;
  create(input: Partial<T>): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

export function logDev(err: unknown) {
  if (import.meta.env.DEV) console.error(err);
}

function sortRows<T>(rows: T[], column: keyof T, ascending: boolean): T[] {
  return [...rows].sort((a, b) => {
    const av = (a[column] ?? '') as string;
    const bv = (b[column] ?? '') as string;
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (ascending ? 1 : -1);
  });
}

export function createCrudService<T extends Row>(o: CrudOptions<T>): CrudService<T> {
  const cols = o.columns ?? '*';

  return {
    async listPublic() {
      const getFallbackRows = () => {
        const rows = demoStore.read<T>(o.table).filter(o.publicFilter ?? (() => true));
        return sortRows(rows, o.order.column, o.order.ascending);
      };
      if (!supabase) {
        await demoDelay();
        return getFallbackRows();
      }
      let q = supabase.from(o.table).select(cols);
      if (o.publicQuery) q = o.publicQuery(q);
      const { data, error } = await q.order(o.order.column, { ascending: o.order.ascending });
      if (error) {
        logDev(error);
        return getFallbackRows();
      }
      const result = (data ?? []) as unknown as T[];
      return result.length > 0 ? result : getFallbackRows();
    },

    async listAll() {
      if (!supabase) {
        await demoDelay(150);
        return sortRows(demoStore.read<T>(o.table), o.order.column, o.order.ascending);
      }
      const { data, error } = await supabase
        .from(o.table)
        .select(cols)
        .order(o.order.column, { ascending: o.order.ascending });
      if (error) {
        logDev(error);
        throw new FriendlyError(`Couldn't load ${o.label}. Check your connection or sign in again.`);
      }
      return (data ?? []) as unknown as T[];
    },

    async create(input) {
      if (!supabase) {
        await demoDelay(150);
        const ts = new Date().toISOString();
        const row = { ...input, id: uid(), created_at: ts, updated_at: ts } as unknown as T;
        demoStore.write(o.table, [row, ...demoStore.read<T>(o.table)]);
        return row;
      }
      const { data, error } = await (supabase.from(o.table) as any).insert(input as any).select(cols).single();
      if (error) {
        logDev(error);
        throw new FriendlyError(`Couldn't save. Please check the details and try again.`);
      }
      return data as unknown as T;
    },

    async update(id, patch) {
      if (!supabase) {
        await demoDelay(120);
        const rows = demoStore.read<T>(o.table);
        let updated: T | undefined;
        const next = rows.map((r) => {
          if (r.id !== id) return r;
          updated = { ...r, ...patch, updated_at: new Date().toISOString() };
          return updated;
        });
        if (!updated) throw new FriendlyError('That item no longer exists.');
        demoStore.write(o.table, next);
        return updated;
      }
      const { data, error } = await (supabase.from(o.table) as any).update(patch as any).eq('id', id).select(cols).single();
      if (error) {
        logDev(error);
        throw new FriendlyError(`Couldn't save changes. Please try again.`);
      }
      return data as unknown as T;
    },

    async remove(id) {
      if (!supabase) {
        await demoDelay(120);
        demoStore.write(
          o.table,
          demoStore.read<T>(o.table).filter((r) => r.id !== id),
        );
        return;
      }
      const { error } = await supabase.from(o.table).delete().eq('id', id);
      if (error) {
        logDev(error);
        throw new FriendlyError(`Couldn't delete this item. Please try again.`);
      }
    },
  };
}

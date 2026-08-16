import crypto from 'crypto';
import request from 'sync-request';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const memoryTables = new Map<string, any[]>();

function normalizeTableName(table: string): string {
  return table.replace(/^\/+|\/+$/g, '');
}

function syncMemory(method: string, route: string, body?: any): any {
  const table = normalizeTableName(route.split('?')[0]);
  const store = memoryTables.get(table) || [];

  switch (method.toUpperCase()) {
    case 'GET': {
      const params = new URLSearchParams(route.split('?')[1] || '');
      let rows = [...store];
      for (const [key, value] of params.entries()) {
        if (key === 'select') continue;
        if (key === 'id') {
          const target = value.replace(/^eq\./, '');
          rows = rows.filter((row) => String(row.id) === String(target));
        } else if (key === 'profile_id') {
          rows = rows.filter((row) => String(row.profile_id) === String(value));
        } else {
          rows = rows.filter((row) => String((row as any)[key]) === String(value));
        }
      }
      return rows;
    }
    case 'POST': {
      const row = { ...(body || {}), id: body?.id || crypto.randomUUID(), created_at: body?.created_at || new Date().toISOString(), updated_at: body?.updated_at || new Date().toISOString() };
      const next = [...store, row];
      memoryTables.set(table, next);
      return [row];
    }
    case 'PATCH': {
      const id = (new URLSearchParams(route.split('?')[1] || '')).get('id')?.replace(/^eq\./, '');
      if (!id) return [];
      const next = store.map((row) => String(row.id) === String(id) ? { ...row, ...body, updated_at: new Date().toISOString() } : row);
      memoryTables.set(table, next);
      return next.filter((row) => String(row.id) === String(id));
    }
    case 'DELETE': {
      const id = (new URLSearchParams(route.split('?')[1] || '')).get('id')?.replace(/^eq\./, '');
      if (!id) return [];
      const next = store.filter((row) => String(row.id) !== String(id));
      memoryTables.set(table, next);
      return [];
    }
    default:
      return store;
  }
}

function syncSupabase(method: string, route: string, body?: any): any {
  if (!supabaseUrl || !supabaseKey) {
    return syncMemory(method, route, body);
  }

  const url = `${supabaseUrl}/rest/v1/${route}`;
  try {
    const res = request(method as any, url, {
      headers: {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      json: body !== undefined ? body : undefined
    });

    if (res.statusCode >= 400) {
      console.error('syncSupabase HTTP Error:', res.statusCode, res.getBody('utf8'));
      return null;
    }

    const output = res.getBody('utf8');
    if (!output) return null;
    return JSON.parse(output);
  } catch (e: any) {
    console.error('syncSupabase error:', e.message);
    return syncMemory(method, route, body);
  }
}

class Database {
  public generateId(): string {
    return crypto.randomUUID();
  }

  public now(): string {
    return new Date().toISOString();
  }

  public find<T = any>(collectionName: string, predicate?: (item: any) => boolean): T[] {
    const data = syncSupabase('GET', `${normalizeTableName(collectionName)}?select=*`);
    let list = Array.isArray(data) ? data : [];
    if (predicate) {
      list = list.filter(predicate);
    }
    return list as T[];
  }

  public findById<T = any>(collectionName: string, id: string): T | undefined {
    const data = syncSupabase('GET', `${normalizeTableName(collectionName)}?id=eq.${id}&select=*`);
    if (Array.isArray(data) && data.length > 0) return data[0] as T;
    return undefined;
  }

  public insert<T = any>(collectionName: string, item: Partial<T>): T & { id: string } {
    const idToUse = (item as any).id || this.generateId();
    const fullItem: any = { ...item, id: idToUse };

    if (!fullItem.created_at) fullItem.created_at = this.now();
    if (!fullItem.updated_at) fullItem.updated_at = this.now();

    const data = syncSupabase('POST', `${normalizeTableName(collectionName)}?select=*`, fullItem);
    if (Array.isArray(data) && data.length > 0) return data[0] as T & { id: string };
    return fullItem as T & { id: string };
  }

  public update<T = any>(collectionName: string, id: string, updates: Partial<T>): T | undefined {
    const fullUpdates = { ...updates, updated_at: this.now() };
    const data = syncSupabase('PATCH', `${normalizeTableName(collectionName)}?id=eq.${id}&select=*`, fullUpdates);
    if (Array.isArray(data) && data.length > 0) return data[0] as T;
    return undefined;
  }

  public delete(collectionName: string, id: string): boolean {
    syncSupabase('DELETE', `${normalizeTableName(collectionName)}?id=eq.${id}`);
    return true;
  }

  public resetDatabase(): void {
    memoryTables.clear();
  }

  public getRaw(): any {
    return Object.fromEntries(memoryTables.entries());
  }

  public logAudit(action: string, entity: string, entity_id?: string, user_email?: string, profile_id?: string, details?: any) {
    try {
      this.insert('audit_logs', {
        profile_id,
        user_email: user_email || 'system',
        action,
        entity,
        entity_id,
        details: typeof details === 'string' ? details : JSON.stringify(details)
      });
    } catch (e) {}
  }

  public createNotification(profile_id: string, title: string, message: string, type: string = 'INFO', link_url?: string) {
    try {
      return this.insert('notifications', {
        profile_id,
        title,
        message,
        type,
        link_url,
        is_read: false,
        created_at: this.now()
      });
    } catch (e) {}
  }
}

export const db = new Database();

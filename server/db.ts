import crypto from 'crypto';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const syncHelperPath = path.join(process.cwd(), 'sync_fetch.js');
if (!fs.existsSync(syncHelperPath)) {
  fs.writeFileSync(syncHelperPath, `
    const args = process.argv.slice(2);
    const url = args[0];
    const method = args[1];
    const key = args[2];
    const bodyStr = args[3];
    
    fetch(url, {
      method,
      headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: bodyStr ? bodyStr : undefined
    })
    .then(r => r.text())
    .then(t => { console.log(t); process.exit(0); })
    .catch(e => { console.error(e); process.exit(1); });
  `);
}

function syncSupabase(method: string, route: string, body?: any): any {
  if (!supabaseUrl || !supabaseKey) return null;
  const url = `${supabaseUrl}/rest/v1/${route}`;
  const bodyStr = body ? JSON.stringify(body) : '';
  
  try {
    const escapedBody = bodyStr.replace(/"/g, '\\"');
    const cmd = `node "${syncHelperPath}" "${url}" "${method}" "${supabaseKey}" "${escapedBody}"`;
    const output = execSync(cmd, { 
      encoding: 'utf-8', 
      stdio: ['pipe', 'pipe', 'ignore'] 
    });
    if (!output) return null;
    return JSON.parse(output.trim());
  } catch (e) {
    return null;
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
    const data = syncSupabase('GET', `${collectionName}?select=*`);
    let list = Array.isArray(data) ? data : [];
    if (predicate) {
      list = list.filter(predicate);
    }
    return list as T[];
  }

  public findById<T = any>(collectionName: string, id: string): T | undefined {
    const data = syncSupabase('GET', `${collectionName}?id=eq.${id}&select=*`);
    if (Array.isArray(data) && data.length > 0) return data[0] as T;
    return undefined;
  }

  public insert<T = any>(collectionName: string, item: Partial<T>): T & { id: string } {
    const idToUse = (item as any).id || this.generateId();
    const fullItem: any = {
      ...item,
      id: idToUse,
    };
    
    if (!fullItem.created_at) fullItem.created_at = this.now();
    if (!fullItem.updated_at) fullItem.updated_at = this.now();

    const data = syncSupabase('POST', `${collectionName}?select=*`, fullItem);
    if (Array.isArray(data) && data.length > 0) return data[0] as T & { id: string };
    return fullItem as T & { id: string };
  }

  public update<T = any>(collectionName: string, id: string, updates: Partial<T>): T | undefined {
    const fullUpdates = { ...updates, updated_at: this.now() };
    const data = syncSupabase('PATCH', `${collectionName}?id=eq.${id}&select=*`, fullUpdates);
    if (Array.isArray(data) && data.length > 0) return data[0] as T;
    return undefined;
  }

  public delete(collectionName: string, id: string): boolean {
    syncSupabase('DELETE', `${collectionName}?id=eq.${id}`);
    return true;
  }

  public resetDatabase(): void {}

  public getRaw(): any {
    return {};
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

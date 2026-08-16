import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DBData {
  profiles: any[];
  students: any[];
  teachers: any[];
  administrators: any[];
  departments: any[];
  courses: any[];
  course_modules: any[];
  course_lessons: any[];
  lesson_progress: any[];
  classes: any[];
  class_students: any[];
  enrollments: any[];
  assignments: any[];
  assignment_submissions: any[];
  quizzes: any[];
  quiz_attempts: any[];
  nptel_tracking: any[];
  external_courses: any[];
  examinations: any[];
  exam_results: any[];
  attendance_sessions: any[];
  attendance_records: any[];
  academic_insights: any[];
  ai_recommendations: any[];
  notifications: any[];
  audit_logs: any[];
  inquiries: any[];
  support_tickets: any[];
  feedback: any[];
}

const DATA_DIR = process.env.VERCEL === '1' ? '/tmp/data' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'edusense_db.json');

function getInitialDB(): DBData {
  return {
    profiles: [],
    students: [],
    teachers: [],
    administrators: [],
    departments: [],
    courses: [],
    course_modules: [],
    course_lessons: [],
    lesson_progress: [],
    classes: [],
    class_students: [],
    enrollments: [],
    assignments: [],
    assignment_submissions: [],
    quizzes: [],
    quiz_attempts: [],
    nptel_tracking: [],
    external_courses: [],
    examinations: [],
    exam_results: [],
    attendance_sessions: [],
    attendance_records: [],
    academic_insights: [],
    ai_recommendations: [],
    notifications: [],
    audit_logs: [],
    inquiries: [],
    support_tickets: [],
    feedback: []
  };
}

class Database {
  private data: DBData;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DBData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...getInitialDB(), ...parsed };
      }
    } catch (err) {
      console.error('Error loading DB file, initializing fresh:', err);
    }
    const initial = getInitialDB();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DBData) {
    try {
      this.ensureDirectory();
      const target = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(target, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing DB file:', err);
    }
  }

  public getRaw(): DBData {
    return this.data;
  }

  public generateId(): string {
    return crypto.randomUUID();
  }

  public now(): string {
    return new Date().toISOString();
  }

  // Generic helpers
  public find<T = any>(collectionName: keyof DBData, predicate?: (item: any) => boolean): T[] {
    const list = this.data[collectionName] || [];
    if (!predicate) return [...list] as T[];
    return list.filter(predicate) as T[];
  }

  public findById<T = any>(collectionName: keyof DBData, id: string): T | undefined {
    const list = this.data[collectionName] || [];
    return list.find((item: any) => item.id === id) as T | undefined;
  }

  public insert<T = any>(collectionName: keyof DBData, item: Partial<T>): T & { id: string } {
    const fullItem = {
      id: (item as any).id || this.generateId(),
      created_at: (item as any).created_at || this.now(),
      updated_at: (item as any).updated_at || this.now(),
      ...item
    } as any;

    if (!this.data[collectionName]) {
      this.data[collectionName] = [];
    }
    this.data[collectionName].push(fullItem);
    this.saveData();
    return fullItem;
  }

  public update<T = any>(collectionName: keyof DBData, id: string, updates: Partial<T>): T | undefined {
    const list = this.data[collectionName] || [];
    const index = list.findIndex((item: any) => item.id === id);
    if (index === -1) return undefined;

    const existing = list[index];
    const updated = {
      ...existing,
      ...updates,
      updated_at: this.now()
    };
    list[index] = updated;
    this.saveData();
    return updated as T;
  }

  public delete(collectionName: keyof DBData, id: string): boolean {
    const list = this.data[collectionName] || [];
    const initialLen = list.length;
    this.data[collectionName] = list.filter((item: any) => item.id !== id);
    const deleted = this.data[collectionName].length < initialLen;
    if (deleted) {
      this.saveData();
    }
    return deleted;
  }

  public resetDatabase(): void {
    this.data = getInitialDB();
    this.saveData();
  }

  // AUDIT LOG HELPER
  public logAudit(action: string, entity: string, entity_id?: string, user_email?: string, profile_id?: string, details?: any) {
    this.insert('audit_logs', {
      profile_id,
      user_email: user_email || 'system',
      action,
      entity,
      entity_id,
      details,
      created_at: this.now()
    });
  }

  // NOTIFICATION HELPER
  public createNotification(profile_id: string, title: string, message: string, type: 'INFO' | 'ASSIGNMENT' | 'EXAM' | 'ATTENDANCE' | 'AI_INSIGHT' | 'ALERT' = 'INFO', link_url?: string) {
    return this.insert('notifications', {
      profile_id,
      title,
      message,
      type,
      link_url,
      is_read: false,
      created_at: this.now()
    });
  }
}

export const db = new Database();

import { google } from "googleapis";

const SPREADSHEET_ID = "1bDfRZ-j4zdYJmnzHTC69grtNLlSfFnf4DxemRPL6KwY";

async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return auth;
}

async function readSheet(sheetName: string): Promise<string[][]> {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });
  return res.data.values || [];
}

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || "";
    });
    return obj;
  });
}

export interface Task {
  id: string;
  title: string;
  text: string;
  status: string;
  priority: string;
  dueDate: string;
  source: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionLog {
  id: string;
  project: string;
  request: string;
  completed: string;
  next_steps: string;
  learned: string;
  notes: string;
  created_at: string;
}

export interface DailySnapshot {
  date: string;
  total_tasks: string;
  completed: string;
  in_progress: string;
  pending: string;
  on_hold: string;
  sessions_count: string;
  observations_count: string;
}

export async function getTasks(): Promise<Task[]> {
  const rows = await readSheet("Tasks");
  return rowsToObjects(rows).filter((r) => r.title) as unknown as Task[];
}

export async function getSessionLogs(): Promise<SessionLog[]> {
  const rows = await readSheet("SessionLog");
  return rowsToObjects(rows)
    .filter((r) => r.id)
    .slice(0, 50) as unknown as SessionLog[];
}

export async function getSnapshots(): Promise<DailySnapshot[]> {
  const rows = await readSheet("DailySnapshot");
  return rowsToObjects(rows).filter(
    (r) => r.date
  ) as unknown as DailySnapshot[];
}

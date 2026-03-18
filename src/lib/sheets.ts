const SPREADSHEET_ID = "1bDfRZ-j4zdYJmnzHTC69grtNLlSfFnf4DxemRPL6KwY";
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=`;

async function readSheet(sheetName: string): Promise<string[][]> {
  const res = await fetch(BASE_URL + encodeURIComponent(sheetName), {
    next: { revalidate: 300 },
  });
  const csv = await res.text();
  return parseCSV(csv);
}

function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"' && csv[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current);
        current = "";
      } else if (ch === "\n" || (ch === "\r" && csv[i + 1] === "\n")) {
        row.push(current);
        current = "";
        if (row.some((c) => c)) rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }
  if (current || row.length) {
    row.push(current);
    if (row.some((c) => c)) rows.push(row);
  }
  return rows;
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

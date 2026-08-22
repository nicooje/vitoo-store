import fs from 'fs';
import { google } from 'googleapis';

const env = {};
for (const line of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"([\s\S]*)"\s*$|^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (!m) continue;
  env[m[1] || m[3]] = (m[2] || m[4] || '').trim();
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.CLIENT_EMAIL,
    private_key: env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: env.SHEET_ID,
  range: 'A2:N',
});
const rows = res.data.values || [];
fs.writeFileSync('sheet-backup.json', JSON.stringify(rows, null, 1));
console.log('Filas en Sheet:', rows.length);

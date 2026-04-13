const fs = require('fs');
const { google } = require('googleapis');

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '');
});

async function run() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: { 
                client_email: process.env.CLIENT_EMAIL, 
                private_key: process.env.PRIVATE_KEY?.replace(/\\\\n/g, '\\n') 
            }, 
            scopes: ['https://www.googleapis.com/auth/spreadsheets'] 
        }); 
        
        const sheets = google.sheets({ version: 'v4', auth }); 
        const res = await sheets.spreadsheets.values.get({ 
            spreadsheetId: process.env.SHEET_ID, 
            range: 'A2:N10' 
        }); 
        console.log(JSON.stringify(res.data.values, null, 2)); 
    } catch(e) { 
        console.error(e);
    } 
}
run();

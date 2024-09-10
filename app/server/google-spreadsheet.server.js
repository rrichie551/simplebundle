import { google } from 'googleapis';
import credentials from '../../simplebundleapp.json';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: SCOPES,
  });

  return auth.getClient();
}

export async function submitToGoogleSheets({ email, message, requestType, timestamp, shopDomain }) {
  try {

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const values = [[timestamp, shopDomain, email, requestType, message]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: "1EEhSxCkCmkxtm2zkz_9qmmWpjSDgpwcfx79cIgIo5m4",
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    if (response.status === 200) {
      return { success: true };
    } else {
      throw new Error('Failed to submit to Google Sheets');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

# Google Sheets Integration Setup Guide

This guide will help you set up automatic contact form submissions to Google Sheets for the Dache website.

## Prerequisites

1. A Google account
2. Access to Google Drive
3. Basic knowledge of Google Apps Script

## Step 1: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Dache Contact Form Submissions" (or any name you prefer)
4. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - The long string after `/d/` and before `/edit` is your Spreadsheet ID

## Step 2: Set Up Google Apps Script

1. In your Google Spreadsheet, go to **Extensions** → **Apps Script**
2. Replace the default code with the content from `google-apps-script.js`
3. Update the `SPREADSHEET_ID` constant with your actual Spreadsheet ID
4. Save the script with a name like "Dache Contact Form Handler"
5. Click **Deploy** → **New deployment**
6. Choose **Web app** as the type
7. Set **Execute as**: "Me"
8. Set **Who has access**: "Anyone"
9. Click **Deploy**
10. Copy the Web app URL (this is your webhook URL)

## Step 3: Configure Environment Variables

Add these environment variables to your server configuration:

```bash
# Enable Google Sheets integration
ENABLE_GOOGLE_SHEETS=true

# Google Apps Script webhook URL
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### For Local Development (.env file)
```env
ENABLE_GOOGLE_SHEETS=true
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### For Production (PM2 ecosystem)
```javascript
module.exports = {
  apps: [{
    name: 'dache-server',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      ENABLE_GOOGLE_SHEETS: 'true',
      GOOGLE_SHEETS_WEBHOOK_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
    }
  }]
}
```

## Step 4: Test the Integration

1. Start your server
2. Submit a test contact form
3. Check your Google Spreadsheet for new entries
4. Check server logs for Google Sheets integration status

## Step 5: Customize the Spreadsheet

The script will automatically create a sheet named "Contact Submissions" with these columns:

| Column | Description |
|--------|-------------|
| Timestamp | When the form was submitted |
| Name | Contact person's name |
| Birthdate | Contact person's birthdate |
| Phone | Contact phone number |
| Email | Contact email address |
| Gender | Selected gender |
| Education | Selected education level |
| Region | Selected region |
| Occupation | Contact person's occupation |
| Income | Selected income range |
| Meeting Time 1 | First preferred meeting time |
| Meeting Time 2 | Second preferred meeting time |
| IP Address | Submitter's IP address |
| User Agent | Submitter's browser info |
| Status | Submission status (New) |

## Troubleshooting

### Common Issues

1. **"Google Sheets integration not configured"**
   - Check if `ENABLE_GOOGLE_SHEETS=true`
   - Verify `GOOGLE_SHEETS_WEBHOOK_URL` is set correctly

2. **"Network error"**
   - Check if the Google Apps Script is deployed as a web app
   - Verify the webhook URL is accessible
   - Check server's internet connectivity

3. **"Invalid response from Google Sheets"**
   - Check Google Apps Script logs
   - Verify the script is working correctly

### Debugging

1. **Check Server Logs**
   ```bash
   tail -f server.log
   ```

2. **Check Google Apps Script Logs**
   - In Apps Script editor, go to **Executions** tab
   - View execution logs for errors

3. **Test Google Apps Script Manually**
   - Use the test function in the script
   - Check if it can connect to your spreadsheet

## Security Considerations

1. **Access Control**: The Google Apps Script web app is set to "Anyone" access. Consider restricting this if needed.
2. **Data Validation**: The script includes basic validation, but consider adding more robust validation.
3. **Rate Limiting**: Google Apps Script has execution limits. Monitor usage if you expect high volume.

## Advanced Customization

### Modify Column Headers
Edit the `headers` array in the `createSheetWithHeaders` function to change column names.

### Add Data Processing
Add custom logic in the `doPost` function to process data before adding to sheets.

### Multiple Sheets
Modify the script to create multiple sheets for different types of submissions.

### Email Notifications
Add email notifications when new submissions are received using Gmail API.

## Support

If you encounter issues:
1. Check the server logs first
2. Verify all environment variables are set correctly
3. Test the Google Apps Script manually
4. Ensure your Google account has necessary permissions

## Notes

- The integration is designed to be fault-tolerant: if Google Sheets fails, the contact form submission still succeeds
- All form data is logged on the server for debugging purposes
- The script automatically creates the sheet if it doesn't exist
- Timestamps are automatically added for each submission

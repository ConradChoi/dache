/**
 * Test script for Google Sheets integration
 * Run this to test if your Google Apps Script is working correctly
 */

const https = require('https');
const http = require('http');

// Configuration - Update these values
const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE'; // Replace with your actual webhook URL
const TEST_DATA = {
    name: 'Test User',
    birthdate: '1990-01-01',
    phone: '010-1234-5678',
    email: 'test@example.com',
    gender: 'male',
    education: 'bachelor',
    region: 'seoul',
    occupation: 'Software Engineer',
    income: '50-70',
    meeting1: '2025-01-15T14:00',
    meeting2: '2025-01-16T15:00',
    ip_address: '127.0.0.1',
    user_agent: 'Test Script'
};

function testGoogleSheetsIntegration() {
    console.log('🧪 Testing Google Sheets Integration...');
    console.log('📤 Sending test data:', JSON.stringify(TEST_DATA, null, 2));
    
    const postData = JSON.stringify(TEST_DATA);
    const url = new URL(WEBHOOK_URL);
    
    const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
        console.log(`📥 Response Status: ${res.statusCode}`);
        console.log(`📥 Response Headers:`, res.headers);
        
        let responseData = '';
        
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(responseData);
                console.log('✅ Success Response:', JSON.stringify(response, null, 2));
                
                if (response.success) {
                    console.log('🎉 Google Sheets integration is working correctly!');
                    console.log('📊 Check your Google Spreadsheet for the new entry.');
                } else {
                    console.log('❌ Google Sheets integration failed:', response.message);
                }
            } catch (error) {
                console.log('⚠️  Raw response:', responseData);
                console.log('❌ Error parsing response:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Request error:', error.message);
        console.log('💡 Make sure your webhook URL is correct and accessible.');
    });

    req.write(postData);
    req.end();
}

// Check if webhook URL is configured
if (WEBHOOK_URL === 'YOUR_WEBHOOK_URL_HERE') {
    console.log('❌ Please update the WEBHOOK_URL in this script first!');
    console.log('📝 Follow the setup guide in GOOGLE_SHEETS_SETUP.md');
    process.exit(1);
}

// Run the test
testGoogleSheetsIntegration();

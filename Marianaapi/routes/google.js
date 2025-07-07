module.exports = (oauth2Client) => {
  const express = require('express');
  const router = express.Router();
  const { google } = require('googleapis');

  // 1. Auth Endpoint - Initiate Google OAuth flow
  router.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      prompt: 'consent',
      // Add redirect_uri explicitly for security
      redirect_uri: process.env.GOOGLE_REDIRECT_URI 
    });
    res.redirect(authUrl);
  });

  // 2. Callback Endpoint - Handle OAuth response
  router.post('/callback', async (req, res) => { // Changed to POST
    try {
      const { code } = req.body;

      if (!code) {
        throw new Error('Authorization code missing');
      }

      // Exchange code for tokens with redirect_uri validation
      const { tokens } = await oauth2Client.getToken({
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI // Must match initial request
      });

      if (!tokens.access_token) {
        throw new Error('No access token received');
      }

      oauth2Client.setCredentials(tokens);

      // Fetch user data
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      // Fetch calendar events
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const events = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      });

      res.json({
        user: userInfo.data,
        events: events.data.items,
        tokens: tokens
      });

    } catch (error) {
      console.error('OAuth Error:', error);
      res.status(400).json({ // Changed to 400 for client errors
        error: 'authentication_failed',
        details: error.message.includes('invalid_grant') 
          ? 'Expired or invalid authorization code' 
          : error.message
      });
    }
  });

  return router;
};
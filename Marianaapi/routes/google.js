module.exports = (oauth2Client) => {
  const express = require('express');
  const router = express.Router();
  const { google } = require('googleapis');

  // 1. Auth Endpoint - Initiate Google OAuth flow
  router.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.events', // <-- changed to allow adding events
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      prompt: 'consent',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI 
    });
    res.redirect(authUrl);
  });

  // 2. Callback Endpoint - Handle OAuth response
  router.post('/callback', async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) throw new Error('Authorization code missing');

      const { tokens } = await oauth2Client.getToken({
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      });

      if (!tokens.access_token) throw new Error('No access token received');

      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

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
        tokens
      });

    } catch (error) {
      console.error('OAuth Error:', error);
      res.status(400).json({
        error: 'authentication_failed',
        details: error.message.includes('invalid_grant') 
          ? 'Expired or invalid authorization code' 
          : error.message
      });
    }
  });

  // ✅ NEW: Add event to Google Calendar
  router.post('/calendar/create', async (req, res) => {
    try {
      const { accessToken, summary, location, description, startDateTime, endDateTime } = req.body;

      if (!accessToken) {
        return res.status(401).json({ error: "Missing access token" });
      }

      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary,
        location,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'America/New_York',
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      res.status(201).json({
        success: true,
        eventLink: response.data.htmlLink,
      });
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
      res.status(500).json({ error: "Failed to add event" });
    }
  });

  // ✅ Make sure this is last
  return router;
};

import axios from 'axios';

const API_BASE = ''; // empty because of proxy "http://localhost:9000" in package.json

export async function fetchEventAnswers(eventId) {
  try {
    const response = await axios.get(`/api/events/${eventId}/answers`);
    return response.data;  // array of answers
  } catch (error) {
    console.error('Error fetching event answers:', error);
    throw error;
  }
}

export async function submitRSVP({ eventId, isGoing }) {
  try {
    const res = await fetch('http://localhost:9000/eventattendees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.token, // assuming auth is handled
      },
      body: JSON.stringify({
        event_id: eventId,
        is_going: isGoing,
      }),
    });

    return await res.json();
  } catch (err) {
    console.error('Error submitting RSVP:', err);
    return { success: false };
  }
}
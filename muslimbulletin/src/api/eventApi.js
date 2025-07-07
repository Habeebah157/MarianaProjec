import axios from 'axios';

const API_BASE = 'http://localhost:9000/'; // empty because of proxy "http://localhost:9000" in package.json

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
    const res = await fetch(`${API_BASE}eventAttendance`, {
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

export async function checkIfUserHasAnswered({ eventId }) {
  try {                         
    const res = await fetch(`http://localhost:9000/eventAttendance/event-attendees/${eventId}/user/has-answered`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.token, // Optional: if your backend uses token auth
      },
    });

    const data = await res.json();
    console.log("DATA", data)

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch answer status');
    }

    return data; // { success: true, has_answered: true/false }
  } catch (err) {
    console.error('Error checking RSVP status:', err);
    return { success: false };
  }
}

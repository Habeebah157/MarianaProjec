import axios from 'axios';

const API_BASE = 'http://localhost:9000/';

export async function fetchCommunities() {
  try {
    const response = await axios.get(`${API_BASE}communities`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            token: localStorage.token, // If your route is protected
            },
    });
    return response.data;

  } catch (error) {
    console.error('Error fetching event answers:', error);
    throw error;
  }
}
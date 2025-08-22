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

export async function fetchCommunityPosts(communityId) {
  try {
    const token = localStorage.getItem("token"); 

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE}communitypost/${communityId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.token, 
      },
    });

    const data = await response.json();


    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch posts");
    }

    return data; 
  } catch (error) {
    console.error("Error fetching community posts:", error.message);
    throw error;
  }
}
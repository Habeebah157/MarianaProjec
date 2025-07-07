const API_BASE = 'http://localhost:9000/'; // empty because of proxy "http://localhost:9000" in package.json

export async function addBusiness({
  name, description, category, website,
  email, phone, address, hours, shipping
}) {
  try {
    const res = await fetch(`${API_BASE}businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.token, // Assuming JWT auth
      },
      body: JSON.stringify({
        name,
        description,
        category,
        website,
        email,
        phone,
        address,
        hours,
        shipping,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to add business');
    }

    return data;
  } catch (err) {
    console.error('Error adding business:', err);
    return { success: false, message: err.message };
  }
}


export async function getBusinesses() {
  try {
    const res = await fetch(`${API_BASE}businesses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.token, // If your route is protected
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch businesses');
    }

    return data; // { success: true, data: [...] }
  } catch (err) {
    console.error('Error fetching businesses:', err);
    return { success: false, message: err.message };
  }
}









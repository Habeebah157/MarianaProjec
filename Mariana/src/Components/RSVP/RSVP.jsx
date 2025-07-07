import React, { useState, useEffect } from 'react';
import { submitRSVP, checkIfUserHasAnswered } from '../../api/eventApi'; // Adjust path if needed

export default function RSVP({ eventId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    async function checkRSVP() {
      const result = await checkIfUserHasAnswered({ eventId });
      if (result.success && result.has_answered) {
        setHasAnswered(true);
      }
      setLoading(false);
    }

    checkRSVP();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isGoing = attending === 'true';

    try {
      const json = await submitRSVP({ eventId, isGoing });

      if (json.success) {
        console.log('RSVP submitted:', { name, email, isGoing });
        setSubmitted(true);
        setName('');
        setEmail('');
        setAttending('');
      } else {
        alert('There was a problem submitting your RSVP.');
      }
    } catch (err) {
      console.error('RSVP error:', err);
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return <p className="text-center mt-12">Loading RSVP status...</p>;
  }

  if (hasAnswered || submitted) {
    return (
      <div className="max-w-sm mx-auto mt-12 p-8 bg-green-50 border border-green-300 rounded-lg shadow-lg text-center text-green-800 font-semibold text-lg space-y-4">
        <p>Thanks for your RSVP! We look forward to seeing you.</p>
        <button
          type="button"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg shadow-md transition-colors duration-300"
          onClick={() => {
            /* Placeholder: Implement change RSVP logic here */
          }}
        >
          Change RSVP
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-12 bg-gray-50 border border-gray-300 rounded-xl shadow-lg p-8 space-y-6"
    >
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">RSVP</h2>

      <div>
        <label htmlFor="name" className="block mb-1 text-gray-700 font-medium">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your full name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition"
        />
      </div>

      <div>
        <label htmlFor="email" className="block mb-1 text-gray-700 font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition"
        />
      </div>

      <div>
        <label htmlFor="attending" className="block mb-1 text-gray-700 font-medium">Will you attend?</label>
        <select
          id="attending"
          value={attending}
          onChange={(e) => setAttending(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-300 transition"
        >
          <option value="" disabled>Please select an option</option>
          <option value="true">Yes, I’ll be there</option>
          <option value="false">No, can’t make it</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors duration-300"
      >
        Send RSVP
      </button>
    </form>
  );
}

import React, { useState } from 'react';

export default function RSVP() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email, attending });
    setSubmitted(true);
    setName('');
    setEmail('');
    setAttending('');
  };

  if (submitted) {
    return (
      <div className="max-w-sm mx-auto mt-12 p-8 bg-green-50 border border-green-300 rounded-lg shadow-lg text-center text-green-800 font-semibold text-lg">
        Thanks for your RSVP! We look forward to seeing you.
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
        <label htmlFor="name" className="block mb-1 text-gray-700 font-medium">
          Name
        </label>
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
        <label htmlFor="email" className="block mb-1 text-gray-700 font-medium">
          Email
        </label>
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
        <label htmlFor="attending" className="block mb-1 text-gray-700 font-medium">
          Will you attend?
        </label>
        <select
          id="attending"
          value={attending}
          onChange={(e) => setAttending(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-300 transition"
        >
          <option value="" disabled>
            Please select an option
          </option>
          <option value="yes">Yes, I’ll be there</option>
          <option value="no">No, can’t make it</option>
          <option value="maybe">Maybe, not sure yet</option>
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

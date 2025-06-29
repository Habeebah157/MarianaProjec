import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    details: "",
    contact: "",
    image: "https://picsum.photos/600/400", // Placeholder image
  });

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    const start_time = `${form.date}T${form.time}:00`;
    const end_time = `${form.date}T${form.time}:00`;

    const eventPayload = {
      title: form.title,
      description: form.details,
      location: form.location,
      start_time,
      end_time,
    };

    try {
      const response = await fetch("http://localhost:9000/events/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token, // include token for authorization
        },
        body: JSON.stringify(eventPayload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForm({
          title: "",
          date: "",
          time: "",
          location: "",
          details: "",
          contact: "",
          image: "https://picsum.photos/600/400",
        });
        navigate("/events"); // navigate back after successful submit
      } else {
        alert("Failed to create event: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  const handleBack = () => {
    navigate("/events");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-12">
      <button
        onClick={handleBack}
        className="mb-4 text-indigo-600 hover:underline"
      >
        ← Back to Events
      </button>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Create a New Event
      </h2>

      <form
        onSubmit={handleCreateEvent}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={form.title}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Info"
          value={form.contact}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        />
        <textarea
          name="details"
          placeholder="Event Details"
          value={form.details}
          onChange={handleInputChange}
          className="border p-2 rounded col-span-1 md:col-span-2"
          rows={3}
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 col-span-1 md:col-span-2"
        >
          Add Event
        </button>
      </form>
    </div>
  );
}

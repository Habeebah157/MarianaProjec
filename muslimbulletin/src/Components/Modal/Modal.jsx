import React, { useState } from "react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Modal = ({ show, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shipping, setShipping] = useState(false);

  // hours: an object where each day has { closed: bool, open: "HH:mm", close: "HH:mm" }
  const [hours, setHours] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { closed: false, open: "09:00", close: "17:00" };
      return acc;
    }, {})
  );

  if (!show) return null;

  const handleHoursChange = (day, field, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleClosedToggle = (day) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const businessData = {
      name,
      description,
      category,
      website,
      email,
      phone,
      address,
      hours,
      shipping,
    };

    console.log("Submitting business data:", businessData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[80vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 id="modal-title" className="text-2xl font-bold mb-4">
          Add Business
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-semibold mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="w-full border border-gray-300 rounded p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold mb-1" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="w-full border border-gray-300 rounded p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Cafes">Cafes</option>
              <option value="Groceries">Groceries</option>
              <option value="Services">Services</option>
              {/* Add more if needed */}
            </select>
          </div>

          {/* Website */}
          <div>
            <label className="block font-semibold mb-1" htmlFor="website">
              Website
            </label>
            <input
              id="website"
              type="url"
              className="w-full border border-gray-300 rounded p-2"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-semibold mb-1" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              className="w-full border border-gray-300 rounded p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold mb-1" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              className="w-full border border-gray-300 rounded p-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Hours */}
          <div>
            <label className="block font-semibold mb-1">Hours</label>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Day</th>
                  <th className="border p-2">Closed</th>
                  <th className="border p-2">Open Time</th>
                  <th className="border p-2">Close Time</th>
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map((day) => (
                  <tr key={day} className="border-t">
                    <td className="border p-2 font-medium">{day}</td>
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={hours[day].closed}
                        onChange={() => handleClosedToggle(day)}
                        aria-label={`${day} closed`}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="time"
                        value={hours[day].open}
                        disabled={hours[day].closed}
                        onChange={(e) =>
                          handleHoursChange(day, "open", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded p-1"
                        aria-label={`${day} open time`}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="time"
                        value={hours[day].close}
                        disabled={hours[day].closed}
                        onChange={(e) =>
                          handleHoursChange(day, "close", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded p-1"
                        aria-label={`${day} close time`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shipping */}
          <div className="flex items-center space-x-2">
            <input
              id="shipping"
              type="checkbox"
              checked={shipping}
              onChange={(e) => setShipping(e.target.checked)}
            />
            <label htmlFor="shipping" className="font-semibold">
              Allow Shipping
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;

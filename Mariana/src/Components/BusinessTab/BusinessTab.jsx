import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { getBusinesses } from "../../api/businessesApi";

export function BusinessTab() {
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [businessesByCategory, setBusinessesByCategory] = useState({});

  useEffect(() => {
    async function fetchData() {
      const result = await getBusinesses();
      console.log(result);
      if (result.success) {
        const grouped = result.data.reduce((acc, business) => {
          const cat = business.category || "Uncategorized";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(business);
          return acc;
        }, {});
        setBusinessesByCategory(grouped);
        if (!activeTab && Object.keys(grouped).length > 0) {
          setActiveTab(Object.keys(grouped)[0]);
        }
      } else {
        console.error(result.message);
      }
    }

    fetchData();
  }, []);

  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handleAddBusiness = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const filteredBusinesses =
    businessesByCategory[activeTab]?.filter((business) =>
      business.name.toLowerCase().includes(searchQuery)
    ) || [];

  const getTimeInMinutes = (distance) => {
    const avgSpeed = 30; // mph
    return Math.round((distance / avgSpeed) * 60);
  };

  const getTimeColor = (minutes) => {
    if (minutes <= 20) return "text-green-600";
    if (minutes <= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const orderedDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Tabs & Add Business */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex space-x-2 sm:space-x-4">
          {Object.keys(businessesByCategory).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-2 font-semibold rounded-full transition ${
                activeTab === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddBusiness}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 transition"
        >
          + Add Business
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for businesses"
        value={searchQuery}
        onChange={handleSearch}
        className="w-full border border-gray-300 rounded p-3 mb-6"
      />

      {/* Business Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((business) => {
          const time = getTimeInMinutes(business.distance || 1);
          const timeColor = getTimeColor(time);
          return (
            <div
              key={business.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
            >
              <img
                src={
                  business.image?.trim() ||
                  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop"
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=300&fit=crop";
                }}
                alt={business.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-1">{business.name}</h3>
                <p className={`mb-1 ${timeColor}`}>
                  {business.category}
                  <span className="text-sm ml-1">
                    • {business.distance || "N/A"} mi • ~{time} min
                  </span>
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    business.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mb-1 text-sm"
                >
                  {business.address}
                </a>
                <p className="text-sm text-gray-800 mb-1">
                  Contact:{" "}
                  <a href={`tel:${business.phone}`} className="text-blue-700">
                    {business.phone}
                  </a>
                </p>
                <div className="text-sm text-gray-800 mb-2 space-y-1">
                  {typeof business.hours === "object"
                    ? orderedDays.map((day) => {
                        const dayHours = business.hours[day];
                        if (!dayHours) return null;
                        const { open, close, closed } = dayHours;
                        return (
                          <div key={day}>
                            <strong>{day}:</strong>{" "}
                            {closed ? "Closed" : `${open} - ${close}`}
                          </div>
                        );
                      })
                    : business.hours}
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex items-center text-green-600 text-sm">
                    {business.shipping ? (
                      <>
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Shipping Available
                      </>
                    ) : (
                      <span className="text-red-500">No Shipping</span>
                    )}
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-lg shadow-md transition duration-300 ease-in-out text-sm">
                    Message
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Modal show={showModal} onClose={handleCloseModal}></Modal>
    </div>
  );
}

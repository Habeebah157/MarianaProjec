import React, { useState } from "react";
import Modal from "../Modal/Modal";

const businessData = {
  Cafes: [
    {
      id: 1,
      name: "Subset Cafe",
      category: "Coffee Shop",
      distance: 0.3,
      address: "123 Main St, City, State",
      contact: "123-456-7890",
      hours: "Mon-Fri 2am–5pm",
      image:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
      shipping: true,
    },
    {
      id: 2,
      name: "Brew & Bean",
      category: "Cafe",
      distance: 0.5,
      address: "456 Bean St, City, State",
      contact: "555-234-6789",
      hours: "Daily 7am–7pm",
      image:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80",
      shipping: false,
    },
  ],
  Groceries: [
    {
      id: 3,
      name: "GreenMart",
      category: "Grocery Store",
      distance: 1.2,
      address: "789 Market Rd, City, State",
      contact: "987-654-3210",
      hours: "Mon-Sun 8am–9pm",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
      shipping: true,
    },
    {
      id: 4,
      name: "Fresh Basket",
      category: "Organic Market",
      distance: 0.9,
      address: "12 Orchard Ave, City, State",
      contact: "321-654-0987",
      hours: "Mon-Fri 10am–6pm",
      image:
        "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=600&q=80",
      shipping: false,
    },
  ],
  Services: [
    {
      id: 5,
      name: "FixIt Electronics",
      category: "Electronics Repair",
      distance: 2.1,
      address: "101 Circuit St, City, State",
      contact: "888-777-6666",
      hours: "Mon-Fri 9am–5pm",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
      shipping: false,
    },
    {
      id: 6,
      name: "Quick Clean",
      category: "Dry Cleaning",
      distance: 1.5,
      address: "202 Clean Ave, City, State",
      contact: "222-333-4444",
      hours: "Mon-Sat 9am–6pm",
      image:
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80",
      shipping: true,
    },
  ],
};

export function BusinessTab() {
  const [activeTab, setActiveTab] = useState("Cafes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handleAddBusiness = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const filteredBusinesses = businessData[activeTab].filter((business) =>
    business.name.toLowerCase().includes(searchQuery)
  );

  const getTimeInMinutes = (distance) => {
    const avgSpeed = 30; // mph
    return Math.round((distance / avgSpeed) * 60);
  };

  const getTimeColor = (minutes) => {
    if (minutes <= 20) return "text-green-600";
    if (minutes <= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Tabs & Add Business */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex space-x-2 sm:space-x-4">
          {Object.keys(businessData).map((category) => (
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
          const time = getTimeInMinutes(business.distance);
          const timeColor = getTimeColor(time);
          return (
            <div
              key={business.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
            >
              <img
                src={business.image}
                alt={business.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-1">{business.name}</h3>
                <p className={`mb-1 ${timeColor}`}>
                  {business.category}
                  <span className="text-sm ml-1">
                    • {business.distance} mi • ~{time} min
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
                  <a href={`tel:${business.contact}`} className="text-blue-700">
                    {business.contact}
                  </a>
                </p>
                <p className="text-sm text-gray-800 mb-2">{business.hours}</p>
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

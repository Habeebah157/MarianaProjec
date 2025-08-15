import React, { useState, useEffect } from "react";
import { getBusinesses } from "../../api/businessesApi";

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await getBusinesses();
      if (response.success) {
        setBusinesses(response.data);
      } else {
        setError(response.message);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleAddBusiness = () => {
    // Add your logic for adding a new business here
    console.log("Add Business button clicked!");
    // Example: Redirect to a form or open a modal
    // window.location.href = '/add-business';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-blue-600 font-semibold">Loading businesses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-red-600 font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-800">
          Muslim Businesses Around You
        </h1>
        <button
          onClick={handleAddBusiness}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Business
        </button>
      </div>

      {businesses.length === 0 ? (
        <p className="text-center text-gray-500">No businesses found.</p>
      ) : (
        <div className="flex overflow-x-auto gap-6 p-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="flex-shrink-0 w-64 bg-white border border-blue-200 rounded-xl shadow hover:shadow-lg transition duration-300"
            >
             <img
                src={biz.image?.trim() || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=300&fit=crop";
                }}
                alt={biz.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 flex flex-col justify-between h-56">
                <div>
                  <h2 className="text-lg font-bold text-blue-900 mb-2">
                    {biz.name}
                  </h2>
                  <p className="text-sm text-blue-700 leading-snug line-clamp-4">
                    {biz.description}
                  </p>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded shadow hover:bg-blue-700 transition">
                  Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

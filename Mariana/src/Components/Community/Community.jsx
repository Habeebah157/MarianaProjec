import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { fetchCommunities } from '../../api/communityApi' // Adjust path as needed

export default function CommunitiesList() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const data = await fetchCommunities(); 
        console.log("Fetched communities:", data);

        if (data.success && Array.isArray(data.communities)) {
          // Map the data to include a mock 'members' count for now
          const formatted = data.communities.map(community => ({
            id: community.id,
            name: community.name,
            description: community.description,
            members: "10k", // 🔔 Placeholder — replace with real count later if available
            is_public: community.is_public
          }));
          setCommunities(formatted);
        } else {
          setCommunities([]);
        }
      } catch (err) {
        console.error("Failed to load communities", err);
        // Optional: fallback to mock data
        setCommunities([
          {
            id: "fallback-1",
            name: "Web Dev Enthusiasts",
            description: "A community for passionate web developers...",
            members: "10k"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
  }, []);

  const handleClick = (communityName) => {
    navigate(`/community/${communityName}`);
  };

  if (loading) {
    return <div className="text-center p-4">Loading communities...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Explore Communities</h1>

      {communities.length === 0 ? (
        <p className="text-gray-500">No communities found.</p>
      ) : (
        <div className="space-y-4">
          {communities.map((community) => (
            <div
              key={community.id}
              className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between mb-1">
                <h2
                  className="text-sm font-semibold hover:underline cursor-pointer"
                  onClick={() => handleClick(community.name)}
                >
                  {community.name}
                </h2>
                <span className="text-xs text-gray-500">
                  {community.members} members
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{community.description}</p>
              <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Join
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
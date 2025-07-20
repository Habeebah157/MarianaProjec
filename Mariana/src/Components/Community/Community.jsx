import React from "react";

const communitiesData = {
  recomendadas: [
    {
      id: "r/gwinnett",
      name: "Gwinnett",
      members: "47k",
      description: "Subreddit of Gwinnett County, GA.",
    },
    {
      id: "r/nextfuckinglevel",
      name: "NextFuckingLevel",
      members: "9.7M",
      description: "Amazing skills and moments.",
    },
  ],
  sideProject: [
    {
      id: "r/django",
      name: "Django",
      members: "151k",
      description: "Web development with Django.",
    },
    {
      id: "r/androiddev",
      name: "AndroidDev",
      members: "257k",
      description: "Android development community.",
    },
  ],
};

export default function CommunitiesList() {
  const allCommunities = [
    ...(communitiesData.recomendadas || []),
    ...(communitiesData.sideProject || []),
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Explore Communities</h1>

      <div className="space-y-4">
        {allCommunities.map((community) => (
          <div
            key={community.id}
            className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold">{community.name}</h2>
              <span className="text-xs text-gray-500">{community.members} members</span>
            </div>
            <p className="text-xs text-gray-600 mb-2">{community.description}</p>
            <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

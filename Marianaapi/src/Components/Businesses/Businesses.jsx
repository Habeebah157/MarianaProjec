import React from "react";

export default function Businesses() {
  const businesses = [
    {
      id: 1,
      name: "Halal Grill & Dine",
      description:
        "Serving fresh halal meals with love. Family-friendly and delicious!",
      image: "https://via.placeholder.com/256x160?text=Halal+Grill",
    },
    {
      id: 2,
      name: "Hijab Boutique",
      description:
        "Your go-to shop for modest fashion, hijabs, and accessories.",
      image: "https://via.placeholder.com/256x160?text=Boutique",
    },
    {
      id: 3,
      name: "Noor Bookstore",
      description:
        "Islamic books, prayer mats, and educational resources for all ages.",
      image: "https://via.placeholder.com/256x160?text=Books",
    },
    {
      id: 4,
      name: "Sunnah Barbershop",
      description: "Modern cuts, Sunnah style. Brothers welcome.",
      image: "https://via.placeholder.com/256x160?text=Barbershop",
    },
    {
      id: 5,
      name: "Ummah Sweets",
      description: "Baklava, dates, and traditional sweets for every occasion.",
      image: "https://via.placeholder.com/256x160?text=Sweets",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-center mb-6 text-blue-800">
        Muslim Businesses Around You
      </h1>

      <div className="flex overflow-x-auto gap-6 p-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
        {businesses.map((biz) => (
          <div
            key={biz.id}
            className="flex-shrink-0 w-64 bg-white border border-blue-200 rounded-xl shadow hover:shadow-lg transition duration-300"
          >
            <img
              src={biz.image}
              alt={biz.name}
              className="w-full h-40 object-cover rounded-t-xl"
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
    </div>
  );
}

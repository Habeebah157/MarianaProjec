import React from "react";

export default function Question() {
  return (
    <div>
      <form className="flex flex-col border-8 w-full p-8 md:p-12">
        <label className="block text-xl mb-4 w-full">Ask a Question</label>
        <input
          type="text"
          placeholder="Enter your question"
          className="w-full border border-gray-400 rounded p-3 mb-4"
        />
        <textarea
          placeholder="Details"
          className="w-full border border-gray-400 rounded p-3 mb-4 min-h-[150px]"
        ></textarea>
        <button type="submit" className="bg-blue-500 text-white rounded p-2">
          Submit
        </button>
      </form>
    </div>
  );
}

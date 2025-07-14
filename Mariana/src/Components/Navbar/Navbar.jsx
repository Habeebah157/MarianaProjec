import React from "react";
import { Link } from "react-router-dom";

function Navbar({ isAuthenticated, setAuth }) {
  function onClick() {
    localStorage.removeItem("token");
    setAuth(false);
  }

  return (
    <nav className="fixed top-0 left-0 h-full w-56 bg-gray-800 text-white flex flex-col">
      {/* Logo / title */}
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        Mariana Community
      </div>

      {/* Navigation Links */}
      <ul className="flex flex-col mt-4 space-y-2 px-4">
        <li>
          <Link
            to="/"
            className="block px-3 py-2 rounded hover:bg-gray-700"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/question"
            className="block px-3 py-2 rounded hover:bg-gray-700"
          >
            Questions
          </Link>
        </li>
        <li>
          <Link
            to="/events"
            className="block px-3 py-2 rounded hover:bg-gray-700"
          >
            Events
          </Link>
        </li>
        <li>
          <Link
            to="/businesses"
            className="block px-3 py-2 rounded hover:bg-gray-700"
          >
            Businesses
          </Link>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <Link
                to="/messages"
                className="block px-3 py-2 rounded hover:bg-gray-700"
              >
                Messages
              </Link>
            </li>
            <li>
              <button
                onClick={onClick}
                className="w-full text-left px-3 py-2 rounded hover:bg-red-700 bg-red-600"
              >
                Log Out
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link
              to="/SignUp"
              className="block px-3 py-2 rounded hover:bg-gray-700"
            >
              Signup
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;

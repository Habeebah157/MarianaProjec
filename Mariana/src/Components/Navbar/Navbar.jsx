import React from "react";
import { Link } from "react-router-dom";

function Navbar({ isAuthenticated, setAuth }) {
  function onClick() {
    localStorage.removeItem("token");
    setAuth(false);
  }

  return (
    <div className="flex justify-between items-center bg-gray-800 text-white p-4">
      <div>
        <h1>Mariana Community</h1>
      </div>
      <div>
        {isAuthenticated ? (
          <ul className="flex space-x-4">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/question">Questions</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/businesses">Businesses</Link></li>
            <li><Link to="/messages">Messages</Link></li> {/* ✅ Added this */}
            <button onClick={onClick}><li>Log Out</li></button>
          </ul>
        ) : (
          <ul className="flex space-x-4">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/question">Questions</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/businesses">Businesses</Link></li>
            <li><Link to="/SignUp">Signup</Link></li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default Navbar;

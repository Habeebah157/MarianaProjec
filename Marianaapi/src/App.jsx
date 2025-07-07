import Navbar from "./Components/Navbar/Navbar";
import "./App.css";
import Questiontab from "./Components/Questiontab/Questiontab";
import Footer from "./Components/Footer/Footer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Community from "./Components/Community/Community";
import Businesses from "./Components/Businesses/Businesses";
import Question from "./Components/Question/Question";
import Events from "./Components/Events/Events";
import { BusinessTab } from "/src/Components/BusinessTab/BusinessTab.jsx";
import Signup from "./Components/Signup/Signup";
import Login from "./Components/Login/Login";
import { useEffect } from "react";
import { useState } from "react";
import QuestionPanel from "./Components/QuestionPanel/QuestionPanel";
import CreatePost from "./Components/CreatePost/CreatePost";
import EditQuestion from "./Components/EditQuestion/EditQuestion";
import UserProfile from "./Components/UserProfile/UserProfile";
import NewEvent from "./Components/NewEvent/NewEvent";
import EventDetail from "./Components/EventDetail/EventDetail";
import PrayerTime from "./Components/PrayerTime/PrayerTime";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const checkAuthenticated = async () => {
    try {
      const res = await fetch("http://localhost:9000/auth/verify", {
        method: "GET",
        headers: { token: localStorage.token },
      });
      const parseRes = await res.json();
      console.log(parseRes);
      if (parseRes === true) {
        await setIsAuthenticated(true);
        console.log("User is authenticated");
      } else {
        await setIsAuthenticated(false);
        console.log("isAuthenticated 2: ", isAuthenticated);
      }
      console.log("isAuthenticated: ", isAuthenticated);
      console.log(parseRes);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    checkAuthenticated();
  }, []);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
    console.log("isAuthenticated: ", isAuthenticated);
  };

  return (
    <BrowserRouter>
      <Navbar isAuthenticated={isAuthenticated} setAuth={setAuth} />
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1 className="text-3xl font-bold underline text-center mt-10">
                Welcome to the Muslim Bulletin
                {isAuthenticated}
              </h1>
              <p className="text-center mt-5">
                Your one-stop solution for all your community needs.
              </p>
              <PrayerTime />
              {/* <Question /> */}
              <Community />
              <Businesses />
            </div>
          }
        />

        <Route
          path="/question"
          element={
            isAuthenticated ? (
              <Questiontab setAuth={setAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/events"
          element={
            isAuthenticated ? (
              <Events setAuth={setAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/businesses"
          element={
            isAuthenticated ? (
              <BusinessTab setAuth={setAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/question/:number"
          element={
            isAuthenticated ? (
              <QuestionPanel setAuth={setAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/questions/:number/edit" element={<EditQuestion />} />
        <Route
          path="createPost"
          element={
            isAuthenticated ? (
              <CreatePost setAuth={setAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="profile/:userId"
          element={
            isAuthenticated ? <UserProfile /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/EventDetail/:eventId"
          element={
            isAuthenticated ? <EventDetail /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/createEvent"
          element={
            isAuthenticated ? (
              <NewEvent setAuth={setAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* <Route path="/events" element={props => <Events {...props} />} /> */}
        {/* <Route path="/businesses" render={props => <BusinessTab {...props}/>} /> */}
        <Route path="/SignUp" element={<Signup setAuth={setAuth} />} />
        <Route path="/login" element={<Login setAuth={setAuth} />} />
      </Routes>
      <Footer /> {/* Appears on every page */}
    </BrowserRouter>
  );
}

export default App;

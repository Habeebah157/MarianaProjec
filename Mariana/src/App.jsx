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
import { useEffect, useState } from "react";
import QuestionPanel from "./Components/QuestionPanel/QuestionPanel";
import CreatePost from "./Components/CreatePost/CreatePost";
import EditQuestion from "./Components/EditQuestion/EditQuestion";
import UserProfile from "./Components/UserProfile/UserProfile";
import NewEvent from "./Components/NewEvent/NewEvent";
import EventDetail from "./Components/EventDetail/EventDetail";
import PrayerTime from "./Components/PrayerTime/PrayerTime";
import NotificationBells from "./Components/NotificationBells/NotificationBells";
import Messages from "./Components/Messages/Message";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const checkAuthenticated = async () => {
    try {
      const res = await fetch("http://localhost:9000/auth/verify", {
        method: "GET",
        headers: { token: localStorage.token },
      });
      const parseRes = await res.json();
      if (parseRes === true) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    checkAuthenticated();
  }, []);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  return (
    <BrowserRouter>
      <Navbar isAuthenticated={isAuthenticated} setAuth={setAuth} />
      <div className="ml-56 p-6">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1 className="text-3xl font-bold underline text-center mt-10">
                  Welcome to the Muslim Bulletin {isAuthenticated.toString()}
                </h1>
                <p className="text-center mt-5">
                  Your one-stop solution for all your community needs.
                </p>
                <PrayerTime />
                <NotificationBells />
                {/* <Community /> */}
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
              isAuthenticated ? (
                <UserProfile />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/EventDetail/:eventId"
            element={
              isAuthenticated ? (
                <EventDetail />
              ) : (
                <Navigate to="/" replace />
              )
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
         <Route
            path="/messages"
            element={
              isAuthenticated ? (
                <Messages />
              ) : (
                <Navigate to="/" replace />
              )
            }
          /> 
          <Route
            path="community"
            element={
              isAuthenticated ? (
                <Community />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/SignUp" element={<Signup setAuth={setAuth} />} />
          <Route path="/login" element={<Login setAuth={setAuth} />} />
        </Routes>
      </div>
      <Footer /> {/* Appears on every page */}
    </BrowserRouter>
  );
}

export default App;

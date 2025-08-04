/* eslint-disable react/jsx-pascal-case */
import React from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/user/Login";
import Dashboard from "./pages/user/Dashboard";
import Register from "./pages/user/Register";
import AuthMiddleware from "./middlewares/authGoogleMiddleware";
import Task from "./pages/user/Task";

import MyProject from "./pages/user/MyProject";
import Create_Project from "./pages/user/Create-Project";
import HomePage from "./pages/user/HomePage";
import AboutUs from "./pages/user/AboutUs";
import Profile from "./pages/user/Profile";
import Backlog from "./pages/user/Backlog";
import Progress from "./pages/user/Progress";
import Summary from "./pages/user/Summary";
import Timeline from "./pages/user/Timeline";
import Comments from "./pages/user/Comments";
import Documents from "./pages/user/Documents";
import People from "./pages/user/People";
import AdminUsers from "./pages/admin/AdminUser";
import AdminProject from "./pages/admin/AdminProject";
// import Aboutus from "./pages/user/AboutUs";
import {
  NotificationProvider,
  NotificationContext,
} from "./context/NotificationContext";
import { UserProvider } from "./context/UserContext";
import ProjectTask from "./components/Project_Task";
import CustomCursor from "./components/CustomCursor";
import TaskDetails from "./pages/user/TaskDetail";
// import CustomCursor from "./components/CustomCursor";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Notification />
        <UserProvider>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route
                path="/loginSuccess"
                element={<AuthMiddleware>{null}</AuthMiddleware>}
              />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <AuthMiddleware>
                    <Dashboard />
                  </AuthMiddleware>
                }
              />
              <Route
                path="/task"
                element={
                  <AuthMiddleware>
                    <Task />
                  </AuthMiddleware>
                }
              />
              <Route
                path="/task/:id"
                element={
                  <AuthMiddleware>
                    <TaskDetails />
                  </AuthMiddleware>
                }
              />

              <Route
                path="/myProject"
                element={
                  <AuthMiddleware>
                    <MyProject />
                  </AuthMiddleware>
                }
              />
              <Route
                path="/project-task/:id"
                element={
                  <AuthMiddleware>
                    <ProjectTask />
                  </AuthMiddleware>
                }
              >
                <Route path="summary" element={<Summary />} />
                <Route path="backlog" element={<Backlog />} />
                <Route path="progress" element={<Progress />} />
                <Route path="timeline" element={<Timeline />} />
                <Route path="comments" element={<Comments />} />
                <Route path="documents" element={<Documents />} />
                <Route path="people" element={<People />} />
              </Route>
              <Route
                path="/create-project"
                element={
                  <AuthMiddleware>
                    <Create_Project />
                  </AuthMiddleware>
                }
              />
              <Route
                path="/my_profile"
                element={
                  <AuthMiddleware>
                    <Profile />
                  </AuthMiddleware>
                }
              />
              <Route
                path="/adminuser"
                element={
                  <AuthMiddleware>
                    <AdminUsers />
                  </AuthMiddleware>
                }
              />
              <Route
                path="/adminprojects"
                element={
                  <AuthMiddleware>
                    <AdminProject />
                  </AuthMiddleware>
                }
              />
            </Routes>
          </div>
        </UserProvider>
      </Router>
    </NotificationProvider>
  );
}

const Notification = () => {
  const { showSuccess, successMessage, showError, errorMessage } =
    React.useContext(NotificationContext);
  return showSuccess || showError ? (
    <div className="success-notification">
      <div className={`success-content ${showSuccess ? "success" : "error"}`}>
        <div className="success-circle">
          <svg
            className="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle
              className="checkmark-circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              className="checkmark-check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>
        <p>{showSuccess ? successMessage : errorMessage}</p>
      </div>
    </div>
  ) : null;
};

export default App;

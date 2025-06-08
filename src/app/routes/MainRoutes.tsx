import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import PageNotFound from "../layouts/PageNotFound/PageNotFound";
import CommonLayout from "../layouts/CommonLayout/CommonLayout";
import HeaderOnlyLayout from "../layouts/HeaderOnlyLayout/HeaderOnlyLayout";
import LoginForm from "../pages/Home/partials/Login/LoginForm";
import RegisterForm from "../pages/Home/partials/Register/RegisterForm";
import VerifyEmail from "../pages/Home/partials/Register/partials/VerifyEmail/VerifyEmail";
import Staff from "../pages/Staff/Staff";
import  {ChatLobby}  from "../components/Test/Chat/ChatLobby";
import { PrivateChatRoom } from "../components/Test/Chat/PrivateChatRoom";

const useAuth = () => {
  const user = localStorage.getItem("userInfo")
  return user ? JSON.parse(user) : null
}
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useAuth();
  return user ? children : <Navigate to="/login" />
}
export default function MainRoutes() {
  const currentUser = useAuth();
  const token = localStorage.getItem("token")
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CommonLayout/>}>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/verifyEmail" element={<VerifyEmail />} />
        </Route>

        <Route 
                        path="/chat" 
                        element={
                            <ProtectedRoute>
                                <ChatLobby currentUser={currentUser} token={token} />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/chat-room/:roomId" 
                        element={
                            <ProtectedRoute>
                                <PrivateChatRoom currentUser={currentUser} token={token} />
                            </ProtectedRoute>
                        } 
                    />
        <Route element={<HeaderOnlyLayout/>}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        <Route path="/staff" element={<Staff />} />

        
      </Routes>
    </BrowserRouter>
  );
}

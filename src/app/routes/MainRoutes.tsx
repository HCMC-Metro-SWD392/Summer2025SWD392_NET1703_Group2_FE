import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import PageNotFound from "../layouts/PageNotFound/PageNotFound";
import LoginForm from "../pages/Login/LoginForm";
import RegisterForm from "../pages/Register/RegisterForm";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

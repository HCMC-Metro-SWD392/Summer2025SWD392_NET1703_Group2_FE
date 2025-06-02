import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import PageNotFound from "../layouts/PageNotFound/PageNotFound";
import CommonLayout from "../layouts/CommonLayout/CommonLayout";
import HeaderOnlyLayout from "../layouts/HeaderOnlyLayout/HeaderOnlyLayout";
import SideBarLayout from "../layouts/SideBarLayout/SideBarLayout";
import LoginForm from "../pages/Home/partials/Login/LoginForm";
import RegisterForm from "../pages/Home/partials/Register/RegisterForm";
import VerifyEmail from "../pages/Home/partials/Register/partials/VerifyEmail/VerifyEmail";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CommonLayout/>}>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/verifyEmail" element={<VerifyEmail />} />
        </Route>

        
        <Route element={<HeaderOnlyLayout/>}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        <Route element={<SideBarLayout/>}>
          <Route path="/test" element={<LoginForm />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

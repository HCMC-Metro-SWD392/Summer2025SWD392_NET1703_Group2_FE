import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import PageNotFound from "../layouts/PageNotFound/PageNotFound";
import LoginForm from "../pages/Login/LoginForm";
import RegisterForm from "../pages/Register/RegisterForm";
import CommonLayout from "../layouts/CommonLayout/CommonLayout";
import HeaderOnlyLayout from "../layouts/HeaderOnlyLayout/HeaderOnlyLayout";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
import ManagerLayout from "../layouts/ManagerLayout/ManagerLayout";
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import StaffList from "../pages/Manager/StaffManagement/StaffList";
import RevenueReport from "../pages/Manager/RevenueManagement/RevenueReport";
import CreatePromotion from "../pages/Manager/PromotionManagement/CreatePromotion";
import PromotionList from "../pages/Manager/PromotionManagement/PromotionList";

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

        <Route element={<ManagerLayout/>}>
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/staffs" element={<StaffList />} />
        <Route path="/manager/revenue" element={<RevenueReport />} />
        <Route path="/manager/create-promotion" element={<CreatePromotion />} />
        <Route path="/manager/promotion" element={<PromotionList />} />
      </Route>
      
      </Routes>


    </BrowserRouter>
  );
}

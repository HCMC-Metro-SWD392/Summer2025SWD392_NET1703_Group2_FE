import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import PageNotFound from "../layouts/PageNotFound/PageNotFound";
import CommonLayout from "../layouts/CommonLayout/CommonLayout";
import HeaderOnlyLayout from "../layouts/HeaderOnlyLayout/HeaderOnlyLayout";
import LoginForm from "../pages/Home/partials/Login/LoginForm";
import RegisterForm from "../pages/Home/partials/Register/RegisterForm";
import VerifyEmail from "../pages/Home/partials/Register/partials/VerifyEmail/VerifyEmail";
import ManagerLayout from "../layouts/ManagerLayout/ManagerLayout";
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import StaffList from "../pages/Manager/StaffManagement/StaffList";
import RevenueReport from "../pages/Manager/RevenueManagement/RevenueReport";
import CreatePromotion from "../pages/Manager/PromotionManagement/CreatePromotion";
import PromotionList from "../pages/Manager/PromotionManagement/PromotionList";
import StaffDetails from "../pages/Manager/StaffManagement/StaffDetails";
import AssignStaffShift from "../pages/Manager/StaffManagement/AssignStaffShift";
import EditStaff from "../pages/Manager/StaffManagement/EditStaff";
import CreateSubscriptionTicket from "../pages/Manager/TicketManagement/CreateSubscriptionTicket";
import FareRule from "../pages/Manager/FareManagement/FareRule";
import StationDetails from "../pages/Manager/StationManagement/StationDetails";
import StationList from "../pages/Manager/StationManagement/StationList";
import CreateMetroLine from "../pages/Manager/MetroLineManagement/CreateMetroLine";
import Staff from "../pages/Staff/Staff";
import BuyRouteTicket from "../pages/Customer/partials/BuyRouteTickets/BuyRouteTickets";
import MyTickets from "../pages/Customer/partials/MyTickets/MyTickets";
import VerifyTicketPayment from "../pages/Customer/partials/VerifyTicketPayment/VerifyTicketPayment";
import CustomerInfo from "../pages/Customer/partials/CustomerInfo";
import CreateStation from "../pages/Manager/StationManagement/CreateStation";
import EditStation from "../pages/Manager/StationManagement/EditStation";
import MetroLineList from "../pages/Manager/MetroLineManagement/MetroLineList";
import MetroLineDetails from "../pages/Manager/MetroLineManagement/MetroLineDetails";
import BuyMonthlyTickets from "../pages/Customer/partials/BuyMonthTickets/BuyMonthlyTickets";
import StudentVerificationForm from "../pages/Customer/partials/BuyMonthTickets/partials/StudentVerificationForm";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CommonLayout/>}>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/verifyEmail" element={<VerifyEmail />} />
          <Route path="/tickets">
            <Route path="buy-route" element={<BuyRouteTicket />}/>
            <Route path="buy-monthly" element={<BuyMonthlyTickets />}/>
            <Route path="my-tickets" element={<MyTickets />}/>
            <Route path="verifyTicketPayment" element={<VerifyTicketPayment />}/>
            <Route path="studentVerify" element={<StudentVerificationForm />}/>
          </Route>
          <Route path="/customerInfor" element={<CustomerInfo />} />
        </Route>


        
        <Route element={<HeaderOnlyLayout/>}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        <Route element={<ManagerLayout/>}>
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/staffs" element={<StaffList />} />
        <Route path="/manager/staffs/:id" element={<StaffDetails />} />
        <Route path="/manager/staffs/:id/edit" element={<EditStaff />} />
        <Route path="/manager/staffs/:id/assign-shift" element={<AssignStaffShift />} />
        <Route path="/manager/revenue" element={<RevenueReport />} />
        <Route path="/manager/create-promotion" element={<CreatePromotion />} />
        <Route path="/manager/promotion" element={<PromotionList />} />
        <Route path="/manager/create-subscription-ticket" element={<CreateSubscriptionTicket />} />
        <Route path="/manager/fare-rule" element={<FareRule />} />
        <Route path="/manager/station/:id" element={<StationDetails />} />
        <Route path="/manager/station" element={<StationList />} />
        <Route path="/manager/create-station" element={<CreateStation />} />
        <Route path="/manager/create-metro-line" element={<CreateMetroLine />} />
        <Route path="/manager/station/:id/edit" element={<EditStation />} />
        <Route path="/manager/metro-line" element={<MetroLineList />} />
        <Route path="/manager/metro-line/:id" element={<MetroLineDetails />} />
      </Route>
      


        <Route path="/staff" element={<Staff />} />

        
        
      </Routes>


    </BrowserRouter>
  );
}

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import PageNotFound from "../layouts/PageNotFound/PageNotFound";
import CommonLayout from "../layouts/CommonLayout/CommonLayout";
import HeaderOnlyLayout from "../layouts/HeaderOnlyLayout/HeaderOnlyLayout";
import LoginForm from "../pages/Home/partials/Login/LoginForm";
import RegisterForm from "../pages/Home/partials/Register/RegisterForm";
import VerifyEmail from "../pages/Home/partials/Register/partials/VerifyEmail/VerifyEmail";
import Staff from "../pages/Staff/Staff";
import BuyRouteTicket from "../pages/Customer/partials/BuyRouteTickets/BuyRouteTickets";
import MyTickets from "../pages/Customer/partials/MyTickets/MyTickets";
import VerifyTicketPayment from "../pages/Customer/partials/VerifyTicketPayment/VerifyTicketPayment";

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
            <Route path="my-tickets" element={<MyTickets />}/>
            <Route path="verifyTicketPayment" element={<VerifyTicketPayment />}/>
          </Route>
        </Route>


        
        <Route element={<HeaderOnlyLayout/>}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>


        <Route path="/staff" element={<Staff />} />

        
        
      </Routes>
    </BrowserRouter>
  );
}

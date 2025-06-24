import { BrowserRouter, Route, Routes } from "react-router-dom";
import CommonLayout from "../layouts/CommonLayout/CommonLayout";
import HeaderOnlyLayout from "../layouts/HeaderOnlyLayout/HeaderOnlyLayout";
import ManagerLayout from "../layouts/ManagerLayout/ManagerLayout";
import PageNotFound from "../layouts/PageNotFound/PageNotFound";
import BuyRouteTicket from "../pages/Customer/partials/BuyRouteTickets/BuyRouteTickets";
import BuySubscriptionTicket from "../pages/Customer/partials/BuySubscriptionTicket/BuySubscriptionTicket";
import CustomerInfo from "../pages/Customer/partials/CustomerInfo/CustomerInfo";
import MyTickets from "../pages/Customer/partials/MyTickets/MyTickets";
import VerifyTicketPayment from "../pages/Customer/partials/VerifyTicketPayment/VerifyTicketPayment";
import Home from "../pages/Home";
import LoginForm from "../pages/Home/partials/Login/LoginForm";
import RegisterForm from "../pages/Home/partials/Register/RegisterForm";
import VerifyEmail from "../pages/Home/partials/Register/partials/VerifyEmail/VerifyEmail";
import FareRule from "../pages/Manager/FareManagement/FareRule";
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import CreateMetroLine from "../pages/Manager/MetroLineManagement/CreateMetroLine";
import MetroLineDetails from "../pages/Manager/MetroLineManagement/MetroLineDetails";
import MetroLineList from "../pages/Manager/MetroLineManagement/MetroLineList";
import CreatePromotion from "../pages/Manager/PromotionManagement/CreatePromotion";
import EditPromotion from "../pages/Manager/PromotionManagement/EditPromotion";
import PromotionDetails from "../pages/Manager/PromotionManagement/PromotionDetails";
import PromotionList from "../pages/Manager/PromotionManagement/PromotionList";
import RevenueReport from "../pages/Manager/RevenueManagement/RevenueReport";
import AssignStaffShift from "../pages/Manager/StaffManagement/AssignStaffShift";
import EditStaff from "../pages/Manager/StaffManagement/EditStaff";
import StaffDetails from "../pages/Manager/StaffManagement/StaffDetails";
import StaffList from "../pages/Manager/StaffManagement/StaffList";
import CreateStation from "../pages/Manager/StationManagement/CreateStation";
import EditStation from "../pages/Manager/StationManagement/EditStation";
import StationDetails from "../pages/Manager/StationManagement/StationDetails";
import StationList from "../pages/Manager/StationManagement/StationList";
import CreateSubscriptionTicket from "../pages/Manager/TicketManagement/CreateSubscriptionTicket";
import SubscriptionTicketDetails from "../pages/Manager/TicketManagement/SubsciptionTicketDetails";
import SubscriptionTicketList from "../pages/Manager/TicketManagement/SubscriptionTicketList";
import Staff from "../pages/Staff/Staff";
import TrainScheduleList from "../pages/Manager/TrainSchedule/TrainScheduleList";
import CreateTrainSchedule from "../pages/Manager/TrainSchedule/CreateTrainSchedule";
import TrainScheduleDetails from "../pages/Manager/TrainSchedule/TrainScheduleDetails";
import EditTrainSchedule from "../pages/Manager/TrainSchedule/EditTrainSchedule";
import CaseApproval from "../pages/Staff/partials/CaseApproval";
import SpecialCaseRequestForm from "../pages/Customer/partials/BuySubscriptionTicket/partials/SpecialCaseRequestForm";
import SubmitSuccess from "../pages/Customer/partials/BuySubscriptionTicket/partials/SubmitSuccess";
import CreateStaff from "../pages/Manager/StaffManagement/CreateStaff";
import UnauthorizedPage from "../pages/Home/partials/Unauthorized/UnauthorizedPage";
import MySubmittedRequests from "../pages/Customer/partials/BuySubscriptionTicket/partials/MySubmittedRequests";
import StaffSchedule from "../pages/Manager/StaffManagement/StaffSchedule";

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
            <Route path="buy-subcription" element={<BuySubscriptionTicket />}/>
            <Route path="my-tickets" element={<MyTickets />}/>
            <Route path="verifyTicketPayment" element={<VerifyTicketPayment />}/>
          </Route>
          <Route path="/services">
            <Route path="specialCaseForm" element={<SpecialCaseRequestForm />}/>
            <Route path="mySubmittedRequest" element={<MySubmittedRequests />}/>
            <Route path="submit-success" element={<SubmitSuccess />}/>
          </Route>
          <Route path="/customerInfor" element={<CustomerInfo />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
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
        <Route path="/manager/promotion/:id" element={<PromotionDetails />} />
        <Route path="/manager/promotion/:id/edit" element={<EditPromotion />} />
        <Route path="/manager/create-subscription-ticket" element={<CreateSubscriptionTicket />} />
        <Route path="/manager/subscription-ticket" element={<SubscriptionTicketList />} />
        <Route path="/manager/subscription-ticket/:id" element={<SubscriptionTicketDetails />} />
        <Route path="/manager/fare-rule" element={<FareRule />} />
        <Route path="/manager/station/:id" element={<StationDetails />} />
        <Route path="/manager/station" element={<StationList />} />
        <Route path="/manager/create-station" element={<CreateStation />} />
        <Route path="/manager/create-metro-line" element={<CreateMetroLine />} />
        <Route path="/manager/station/:id/edit" element={<EditStation />} />
        <Route path="/manager/metro-line" element={<MetroLineList />} />
        <Route path="/manager/metro-line/:id" element={<MetroLineDetails />} />
        <Route path="/manager/train-schedule" element={<TrainScheduleList />} />
        <Route path="/manager/create-train-schedule" element={<CreateTrainSchedule />} />
        <Route path="/manager/train-schedule/:id" element={<TrainScheduleDetails />} />
        <Route path="/manager/train-schedule/:id/edit" element={<EditTrainSchedule />} />
        <Route path="/manager/create-staff" element={<CreateStaff />} />
        <Route path="/manager/staff-schedule" element={<StaffSchedule />} />
      </Route>

      <Route path="/staff" element={<Staff />} />

        <Route path="/staff/case-approval" element={<CaseApproval />} />
        
      </Routes>


    </BrowserRouter>
  );
}

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
import FareRule from "../pages/Admin/FareManagement/FareRule";
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import CreateMetroLine from "../pages/Admin/MetroLineManagement/CreateMetroLine";
import MetroLineDetails from "../pages/Admin/MetroLineManagement/MetroLineDetails";
import MetroLineList from "../pages/Admin/MetroLineManagement/MetroLineList";
import CreatePromotion from "../pages/Admin/PromotionManagement/CreatePromotion";
import EditPromotion from "../pages/Admin/PromotionManagement/EditPromotion";
import PromotionDetails from "../pages/Admin/PromotionManagement/PromotionDetails";
import PromotionList from "../pages/Admin/PromotionManagement/PromotionList";
import RevenueReport from "../pages/Manager/RevenueManagement/RevenueReport";
import AssignStaffShift from "../pages/Manager/StaffManagement/AssignStaffShift";
import EditStaff from "../pages/Manager/StaffManagement/EditStaff";
import StaffDetails from "../pages/Manager/StaffManagement/StaffDetails";
import StaffList from "../pages/Manager/StaffManagement/StaffList";
import CreateStation from "../pages/Admin/StationManagement/CreateStation";
import EditStation from "../pages/Admin/StationManagement/EditStation";
import StationDetails from "../pages/Admin/StationManagement/StationDetails";
import StationList from "../pages/Admin/StationManagement/StationList";
import CreateSubscriptionTicket from "../pages/Admin/TicketManagement/CreateSubscriptionTicket";
import SubscriptionTicketDetails from "../pages/Admin/TicketManagement/SubsciptionTicketDetails";
import SubscriptionTicketList from "../pages/Admin/TicketManagement/SubscriptionTicketList";
import Staff from "../pages/Staff/Staff";
import TrainScheduleList from "../pages/Admin/TrainSchedule/TrainScheduleList";
import CreateTrainSchedule from "../pages/Admin/TrainSchedule/CreateTrainSchedule";
import TrainScheduleDetails from "../pages/Admin/TrainSchedule/TrainScheduleDetails";
import EditTrainSchedule from "../pages/Admin/TrainSchedule/EditTrainSchedule";
import CaseApproval from "../pages/Staff/partials/CaseApproval";
import SpecialCaseRequestForm from "../pages/Customer/partials/BuySubscriptionTicket/partials/SpecialCaseRequestForm";
import SubmitSuccess from "../pages/Customer/partials/BuySubscriptionTicket/partials/SubmitSuccess";
import CreateStaff from "../pages/Manager/StaffManagement/CreateStaff";
import UnauthorizedPage from "../pages/Home/partials/Unauthorized/UnauthorizedPage";
import MySubmittedRequests from "../pages/Customer/partials/BuySubscriptionTicket/partials/MySubmittedRequests";
import StaffSchedule from "../pages/Manager/StaffManagement/StaffSchedule";
import ChangePasswordForm from "../pages/Home/partials/ChangePassword/ChangePasswordForm";
import AllMetroLine from "../pages/Customer/partials/MetroLine/partials/AllMetroLine";
import AddMetroLineStation from "../pages/Admin/MetroLineManagement/AddMetroLineStation";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import AdminMain from "../pages/Admin/AdminMain";
import TicketTransactionPage from "../pages/Admin/TicketManagement/TicketTransactionPage";
import RecentLogsPage from "../pages/Admin/LogActivityManagement/RecentLogsPage";
import EmailForm from "../pages/Home/partials/ForgotPassword/EmailForm";
import ResetPasswordForm from "../pages/Home/partials/ForgotPassword/ResetPasswordForm";
import Contact from "../pages/Home/partials/InformationPage/Contact";
import ScrollToTop from "../components/ScrollToTop";
import CreateEmailTemplate from "../pages/Admin/EmailManagement/CreateEmailTemplate";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
          <Route path="/change-password" element={<ChangePasswordForm />} />
          <Route path="/metro-line" element={<AllMetroLine />} />
          <Route path="/contact" element={<Contact />} />
        </Route>


        
        <Route element={<HeaderOnlyLayout/>}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<EmailForm/>} />
          <Route path="/reset-password" element={<ResetPasswordForm/>} />
        </Route>

        <Route element={<ManagerLayout/>}>
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/staffs" element={<StaffList />} />
        <Route path="/manager/staffs/:id" element={<StaffDetails />} />
        <Route path="/manager/staffs/:id/edit" element={<EditStaff />} />
        <Route path="/manager/staffs/:id/assign-shift" element={<AssignStaffShift />} />
        <Route path="/manager/create-staff" element={<CreateStaff />} />
        <Route path="/manager/staff-schedule" element={<StaffSchedule />} />
        <Route path="/manager/revenue" element={<RevenueReport />} />
        <Route path="/manager/create-promotion" element={<CreatePromotion />} />
        <Route path="/manager/promotion" element={<PromotionList />} />
        <Route path="/manager/promotion/:id" element={<PromotionDetails />} />
        <Route path="/manager/promotion/:id/edit" element={<EditPromotion />} />
        <Route path="/manager/create-subscription-ticket" element={<CreateSubscriptionTicket />} />
        <Route path="/manager/subscription-ticket" element={<SubscriptionTicketList />} />
        <Route path="/manager/subscription-ticket/:id" element={<SubscriptionTicketDetails />} />
        <Route path="/manager/transaction-ticket" element={<TicketTransactionPage />} />
      </Route>

      <Route element={<AdminLayout/>}>
        <Route path="/admin" element={<AdminMain />} />
        <Route path="/admin/fare-rule" element={<FareRule />} />
        <Route path="/admin/station/:id" element={<StationDetails />} />
        <Route path="/admin/station" element={<StationList />} />
        <Route path="/admin/create-station" element={<CreateStation />} />
        <Route path="/admin/create-metro-line" element={<CreateMetroLine />} />
        <Route path="/admin/station/:id/edit" element={<EditStation />} />
        <Route path="/admin/metro-line" element={<MetroLineList />} />
        <Route path="/admin/metro-line/:id" element={<MetroLineDetails />} />
        <Route path="/admin/train-schedule" element={<TrainScheduleList />} />
        <Route path="/admin/create-train-schedule" element={<CreateTrainSchedule />} />
        <Route path="/admin/train-schedule/:id" element={<TrainScheduleDetails />} />
        <Route path="/admin/train-schedule/:id/edit" element={<EditTrainSchedule />} />
        <Route path="/admin/add-metro-line-station" element={<AddMetroLineStation />} />
        <Route path="/admin/transaction-ticket" element={<TicketTransactionPage />} />
        <Route path="/admin/log-activity" element={<RecentLogsPage />} />
        <Route path="/admin/create-email-template" element={<CreateEmailTemplate />} />
      </Route>

      <Route path="/staff" element={<Staff />} />

        <Route path="/staff/case-approval" element={<CaseApproval />} />
        
      </Routes>


    </BrowserRouter>
  );
}

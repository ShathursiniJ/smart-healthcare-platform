import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../../layouts/PublicLayout";
import PatientLayout from "../../layouts/PatientLayout";
import DoctorLayout from "../../layouts/DoctorLayout";
import AdminLayout from "../../layouts/AdminLayout";

import HomePage from "../../pages/public/HomePage";
import AboutPage from "../../pages/public/AboutPage";
import LoginPage from "../../pages/public/LoginPage";
import RegisterPage from "../../pages/public/RegisterPage";
import VerifyOtpPage from "../../pages/public/VerifyOtpPage";
import ForgotPasswordPage from "../../pages/public/ForgotPasswordPage";
import ResetPasswordPage from "../../pages/public/ResetPasswordPage";

// Patient pages
import PatientDashboardPage from "../../pages/patient/DashboardPage";
import FindDoctorsPage from "../../pages/patient/FindDoctorsPage";
import MyAppointmentsPage from "../../pages/patient/MyAppointmentsPage";
import MedicalRecordsPage from "../../pages/patient/ReportsPage";
import SymptomCheckerPage from "../../pages/patient/SymptomCheckerPage";
import PatientVideoPage from "../../pages/patient/VideoConsultationPage";
import PaymentsPage from "../../pages/patient/PaymentsPage";
import NotificationsPage from "../../pages/patient/NotificationsPage";

// Doctor pages
import DoctorDashboardPage from "../../pages/doctor/DashboardPage";
import DoctorProfilePage from "../../pages/doctor/ProfilePage";
import AvailabilityPage from "../../pages/doctor/AvailabilityPage";
import DoctorAppointmentsPage from "../../pages/doctor/AppointmentsPage";
import DoctorPatientsPage from "../../pages/doctor/PatientsPage";
import ReportsReviewPage from "../../pages/doctor/ReportsReviewPage";
import PrescriptionPage from "../../pages/doctor/PrescriptionPage";
import DoctorVideoPage from "../../pages/doctor/VideoSessionPage";

// Admin pages
import AdminDashboardPage from "../../pages/admin/DashboardPage";
import VerifyDoctorsPage from "../../pages/admin/VerifyDoctorsPage";
import ManageUsersPage from "../../pages/admin/ManageUsersPage";
import ManageDoctorsPage from "../../pages/admin/ManageDoctorsPage";
import TransactionsPage from "../../pages/admin/TransactionsPage";

import ProtectedRoute from "../../components/auth/ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route path="/patient" element={<PatientLayout />}>
            <Route path="dashboard" element={<PatientDashboardPage />} />
            <Route path="find-doctors" element={<FindDoctorsPage />} />
            <Route path="appointments" element={<MyAppointmentsPage />} />
            <Route path="records" element={<MedicalRecordsPage />} />
            <Route path="symptoms" element={<SymptomCheckerPage />} />
            <Route path="consultation" element={<PatientVideoPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route path="dashboard" element={<DoctorDashboardPage />} />
            <Route path="profile" element={<DoctorProfilePage />} />
            <Route path="schedule" element={<AvailabilityPage />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route path="patients" element={<DoctorPatientsPage />} />
            <Route path="reports" element={<ReportsReviewPage />} />
            <Route path="prescriptions" element={<PrescriptionPage />} />
            <Route path="video" element={<DoctorVideoPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="verify-doctors" element={<VerifyDoctorsPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="manage-doctors" element={<ManageDoctorsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
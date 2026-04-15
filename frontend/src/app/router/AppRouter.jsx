import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PublicLayout       from "../../layouts/PublicLayout";
import PatientLayout      from "../../layouts/PatientLayout";
import DoctorLayout       from "../../layouts/DoctorLayout";
import AdminLayout        from "../../layouts/AdminLayout";
import ProtectedRoute     from "../../components/auth/ProtectedRoute";

// ── Public pages ─────────────────────────────────────────────────────────────
import HomePage           from "../../pages/public/HomePage";
import AboutPage          from "../../pages/public/AboutPage";
import LoginPage          from "../../pages/public/LoginPage";
import RegisterPage       from "../../pages/public/RegisterPage";
import VerifyOtpPage      from "../../pages/public/VerifyOtpPage";
import ForgotPasswordPage from "../../pages/public/ForgotPasswordPage";
import ResetPasswordPage  from "../../pages/public/ResetPasswordPage";

// Patient pages
import PatientDashboardPage from "../../pages/patient/DashboardPage";
import ProfilePage from "../../pages/patient/ProfilePage";
import MedicalHistoryPage from "../../pages/patient/MedicalHistoryPage";
import ReportsPage from "../../pages/patient/ReportsPage";
import PrescriptionsPage from "../../pages/patient/PrescriptionsPage";
import FindDoctorsPage from "../../pages/patient/FindDoctorsPage";
import MyAppointmentsPage from "../../pages/patient/MyAppointmentsPage";
import SymptomCheckerPage from "../../pages/patient/SymptomCheckerPage";
import PatientVideoPage from "../../pages/patient/VideoConsultationPage";
import PaymentsPage from "../../pages/patient/PaymentsPage";
import PaymentReturnPage from "../../pages/patient/PaymentReturnPage";
import NotificationsPage from "../../pages/patient/NotificationsPage";
import AIHealthAssistant from "../../pages/patient/AIHealthAssistant";

// ── Shared pages (patient-accessible) ────────────────────────────────────────
import DoctorListPage        from "../../pages/shared/DoctorListPage";
import DoctorDetailsPage     from "../../pages/shared/DoctorDetailsPage";
import BookAppointmentPage   from "../../pages/shared/BookAppointmentPage";
import ConsultationPage      from "../../pages/shared/ConsultationPage";

// ── Doctor pages ──────────────────────────────────────────────────────────────
import DoctorDashboardPage   from "../../pages/doctor/DashboardPage";
import DoctorProfilePage     from "../../pages/doctor/ProfilePage";
import AvailabilityPage      from "../../pages/doctor/AvailabilityPage";
import DoctorAppointmentsPage from "../../pages/doctor/AppointmentsPage";
import DoctorPatientsPage    from "../../pages/doctor/PatientsPage";
import ReportsReviewPage     from "../../pages/doctor/ReportsReviewPage";
import PrescriptionPage      from "../../pages/doctor/PrescriptionPage";
import DoctorVideoPage       from "../../pages/doctor/VideoSessionPage";

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboardPage    from "../../pages/admin/DashboardPage";
import VerifyDoctorsPage     from "../../pages/admin/VerifyDoctorsPage";
import ManageUsersPage       from "../../pages/admin/ManageUsersPage";
import ManageDoctorsPage     from "../../pages/admin/ManageDoctorsPage";
import AdminAppointmentsPage from "../../pages/admin/AppointmentsPage";
import TransactionsPage      from "../../pages/admin/TransactionsPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Shared public routes */}
          <Route path="/doctors" element={<DoctorListPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
          <Route path="/book-appointment" element={<BookAppointmentPage />} />
          <Route path="/payment" element={<PaymentsPage />} />
          <Route path="/payment-return" element={<PaymentReturnPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
        </Route>

        {/* ── Patient ── */}
        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"              element={<PatientDashboardPage />} />
            <Route path="profile"                element={<ProfilePage />} />
            <Route path="find-doctors"           element={<FindDoctorsPage />} />
            <Route path="find-doctors/:id"       element={<DoctorDetailsPage />} />
            <Route path="book-appointment/:id"   element={<BookAppointmentPage />} />
            <Route path="appointments"           element={<MyAppointmentsPage />} />
            <Route path="records"                element={<ReportsPage />} />
            <Route path="medical-history"        element={<MedicalHistoryPage />} />
            <Route path="prescriptions"          element={<PrescriptionsPage />} />
            <Route path="symptoms"               element={<SymptomCheckerPage />} />
            <Route path="consultation"           element={<PatientVideoPage />} />
            <Route path="consultation/:appointmentId" element={<ConsultationPage />} />
            <Route path="payments"               element={<PaymentsPage />} />
            <Route path="notifications"          element={<NotificationsPage />} />
            <Route path="ai-assistant"           element={<AIHealthAssistant />} />
          </Route>
        </Route>

        {/* ── Doctor ── */}
        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<DoctorDashboardPage />} />
            <Route path="profile"       element={<DoctorProfilePage />} />
            <Route path="schedule"      element={<AvailabilityPage />} />
            <Route path="appointments"  element={<DoctorAppointmentsPage />} />
            <Route path="patients"      element={<DoctorPatientsPage />} />
            <Route path="reports"       element={<ReportsReviewPage />} />
            <Route path="prescriptions" element={<PrescriptionPage />} />
            <Route path="video"         element={<DoctorVideoPage />} />
            <Route path="video/:appointmentId" element={<DoctorVideoPage />} />
          </Route>
        </Route>

        {/* ── Admin ── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"      element={<AdminDashboardPage />} />
            <Route path="verify-doctors" element={<VerifyDoctorsPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="manage-users" element={<ManageUsersPage />} />
            <Route path="manage-doctors" element={<ManageDoctorsPage />} />
            <Route path="appointments"   element={<AdminAppointmentsPage />} />
            <Route path="transactions"   element={<TransactionsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

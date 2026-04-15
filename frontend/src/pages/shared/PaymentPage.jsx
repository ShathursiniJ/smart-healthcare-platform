import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// PaymentPage redirects to the patient payments section
// The full payment flow is in patient/PaymentsPage.jsx
function PaymentPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/patient/payments", { replace: true });
  }, [navigate]);
  return null;
}

export default PaymentPage;

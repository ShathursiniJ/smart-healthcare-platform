# PayHere Payment Integration Guide

## Overview
The smart healthcare platform now uses **PayHere** for secure payment processing. This guide explains how to set up and use the PayHere payment system.

## PayHere Account Setup

### 1. Create PayHere Merchant Account
- Visit [PayHere.lk](https://www.payhere.lk) or use sandbox at [sandbox.payhere.lk](https://sandbox.payhere.lk)
- Create a merchant account
- Verify your business details

### 2. Get Your Credentials
After account creation, you'll get:
- **Merchant ID**: Unique identifier for your account
- **Merchant Secret**: For signing transactions (optional but recommended)

## Environment Configuration

### Backend Setup (.env file for payment-notification-service)

```env
# PayHere Configuration
PAYHERE_MERCHANT_ID=YOUR_MERCHANT_ID_HERE
PAYHERE_MERCHANT_SECRET=YOUR_MERCHANT_SECRET_HERE
PAYHERE_SANDBOX=true  # Set to 'false' for production

# Database
MONGODB_URI=mongodb://localhost:27017/medi-connect
DATABASE_NAME=medi-connect

# Server
PORT=5006
NODE_ENV=development

# Email (for payment receipts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@mediconnect.com
```

## Payment Flow

### 1. Patient Initiates Payment
```
Patient clicks "Pay via PayHere" button
↓
POST /api/payments/initiate
↓
Backend creates Payment record (status: pending)
↓
Frontend receives payhereData object
```

### 2. PayHere Payment Form Submission
```
Frontend creates hidden form with PayHere data
↓
Form POSTs to PayHere checkout:
  - Sandbox: https://sandbox.payhere.lk/pay/checkout
  - Production: https://www.payhere.lk/pay/checkout
↓
Customer enters payment details on PayHere
↓
PayHere processes payment
```

### 3. PayHere Returns to Application
```
Upon success:
  return_url → http://localhost:5173/payment-return
  
Upon cancelation:
  cancel_url → http://localhost:5173/patient/payments

PayHere also sends server-side notification:
  notify_url → http://localhost:5006/api/payments/notify
```

### 4. Payment Verification & Notification
```
PayHere webhook hits /api/payments/notify
↓
Backend validates PayHere signature
↓
If valid and status=2 (success):
  - Update Payment record (status: completed)
  - Create Notification for patient
  - Send email receipt
↓
Create audit log and appointment status update
```

## API Endpoints

### POST /api/payments/initiate
**Purpose**: Start a payment session
**Auth**: Required (Patient)
**Request**:
```json
{
  "appointmentId": "appointment-id",
  "doctorId": "doctor-id",
  "doctorName": "Dr. John Doe",
  "amount": 1500,
  "currency": "LKR",
  "paymentMethod": "payhere",
  "patientName": "John Patient",
  "patientEmail": "patient@example.com"
}
```
**Response** (201):
```json
{
  "success": true,
  "message": "Payment initiated.",
  "data": {
    "payment": { "_id": "...", "status": "pending", ... },
    "payhereData": {
      "merchant_id": "...",
      "order_id": "...",
      "amount": "1500.00",
      "return_url": "...",
      "cancel_url": "...",
      "notify_url": "...",
      ...
    }
  }
}
```

### POST /api/payments/notify (WebHook)
**Purpose**: Handle PayHere server-side notifications
**Auth**: None (PayHere calls this)
**PayHere sends**:
```json
{
  "order_id": "payment-id",
  "payment_id": "payhere-transaction-id",
  "status_code": "2",
  "amount": "1500",
  "currency": "LKR",
  "hash": "md5-hash-for-verification"
}
```

**Status Codes**:
- `2` = Success (completed)
- `1` = Authorized/Pending
- `-1` = Canceled
- `-2` = Failed
- `-3` = Chargebacked

## Payment States

| Status | Meaning | Auto-Action |
|--------|---------|------------|
| `pending` | Awaiting PayHere payment | - |
| `completed` | Payment successful | Send notification, email receipt |
| `failed` | Payment failed or canceled | - |
| `refunded` | Payment refunded | Create refund notification |

## Frontend Implementation

### Payment Form Submission
```javascript
// 1. Initiate payment
const initRes = await initiatePayment({
  appointmentId: "...",
  doctorId: "...",
  // ... other details
});

// 2. Get PayHere data
const payhereData = initRes.data.payhereData;

// 3. Create form and submit
const form = document.createElement('form');
form.method = 'POST';
form.action = payhereData.sandbox 
  ? 'https://sandbox.payhere.lk/pay/checkout'
  : 'https://www.payhere.lk/pay/checkout';

// Add form fields from payhereData
// ... (see PaymentsPage.jsx for full implementation)

// 4. Submit form (redirects to PayHere)
document.body.appendChild(form);
form.submit();
```

### Payment Return Handling
After PayHere completes, user is redirected to `/payment-return`:
- Page polls payment status
- Shows success/error message
- Auto-redirects to payments page after 3 seconds

## Testing with PayHere Sandbox

### Test Card Numbers
- **Success**: 4111 1111 1111 1111
- **Failed**: 4111 1111 1111 1112
- **Declined**: 5555 5555 5555 4444

### CVV
Any 3-digit number (e.g., 123)

### Expiry
Any future date (e.g., 12/25)

## Production Deployment Checklist

- [ ] Set `PAYHERE_SANDBOX=false` in .env
- [ ] Update `PAYHERE_MERCHANT_ID` with production merchant ID
- [ ] Update `PAYHERE_MERCHANT_SECRET` with production secret
- [ ] Update return_url to production domain
- [ ] Update cancel_url to production domain
- [ ] Update notify_url to production domain
- [ ] Enable HTTPS for all payment endpoints
- [ ] Test with real payment cards
- [ ] Configure email service for receipts
- [ ] Set up payment reconciliation cron job
- [ ] Enable payment verification webhook logging

## Troubleshooting

### Payment Not Completing
1. Check `/api/payments/notify` logs
2. Verify `PAYHERE_MERCHANT_SECRET` is correct
3. Check if PayHere webhook can reach your backend
4. Verify browser console for form submission errors

### Email Receipts Not Sending
1. Check SMTP credentials in .env
2. Verify email service is running
3. Check spam folder
4. Enable SMTP in email provider settings

### Hash Validation Failing
1. Ensure `PAYHERE_MERCHANT_SECRET` matches PayHere account
2. Check hash calculation in `payhereUtils.js`
3. Log the hash strings being compared

### Webhook Not Reaching Backend
1. Ensure payhere can reach `notify_url`
2. Check firewall/port forwarding
3. Use ngrok for local testing: `ngrok http 5006`
4. Update `notify_url` with ngrok URL

## Security Notes

1. **Never expose merchant secret** in frontend code
2. **Always validate webhook signatures** (hash verification)
3. **Use HTTPS** in production for all payment flows
4. **Implement rate limiting** on payment endpoints
5. **Audit all payment transactions** for compliance
6. **PCI DSS Compliance**: Never store full card details
7. **Token-based authentication**: Always use JWT for payment APIs

## Monitoring & Analytics

### Key Metrics to Track
- Payment success rate
- Average transaction amount
- Failed payment recovery rate
- Time to payment completion
- Payment method distribution

### Logging
All payment operations are logged with:
- Timestamp
- Transaction ID
- Status
- Amount
- Doctor & Patient names
- Error messages (if any)

## Support

For PayHere API documentation:
- Documentation: https://help.payhere.lk
- Support Email: merchant@payhere.lk
- Merchant Dashboard: https://payhere.lk/merchant

For application-specific issues:
- Check `/var/log/payment-service.log`
- Review `/var/log/appointment-service.log` for appointment updates
- Check email service logs for receipt sending

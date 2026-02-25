# Khalti Payment Integration Setup Guide

## Overview
Khalti payment gateway has been successfully integrated into your CMS. This allows customers to make online payments using Khalti digital wallet.

---

## 🔧 Setup Instructions

### 1. Get Khalti API Keys

1. Visit **Sandbox (Testing)**: https://test-admin.khalti.com
   - OR **Production**: https://admin.khalti.com

2. Sign up for a merchant account
3. Copy your **Secret Key** and **Public Key**
4. Update the `.env` file in the backend:

```env
KHALTI_SECRET_KEY=your_secret_key_here
KHALTI_PUBLIC_KEY=your_public_key_here
KHALTI_API_URL=https://dev.khalti.com/api/v2          # For sandbox/testing
# KHALTI_API_URL=https://khalti.com/api/v2            # For production
WEBSITE_URL=http://localhost:5173                      # Your frontend URL
BACKEND_URL=http://localhost:3000                      # Your backend URL
```

---

## 📊 Payment Flow

```
Customer
    ↓
Click "Khalti" button on Payment page
    ↓
/khalti-payment (frontend page)
    ↓
POST /payments/khalti/initiate (backend)
    ↓
Khalti API initiates payment
    ↓
Khalti payment page (customer pays here)
    ↓
Khalti redirects to /khalti-return?pidx=XXX
    ↓
POST /payments/khalti/verify (backend verifies)
    ↓
Success page with token number & receipt
```

---

## 📁 Files Created/Modified

### Backend
- **Modified**: `.env` - Added Khalti configuration
- **Modified**: `src/controllers/paymentController.js` - Added khaltiInitiate & khaltiVerify functions
- **Modified**: `src/routes/payments.js` - Added Khalti routes

### Frontend
- **Created**: `src/pages/Khalti.jsx` - Khalti payment initiation page
- **Created**: `src/pages/KhaltiReturn.jsx` - Khalti return/verification page
- **Modified**: `src/pages/Payment.jsx` - Updated Khalti button handler
- **Modified**: `src/Routes.jsx` - Added Khalti routes

---

## 🧪 Testing with Khalti Sandbox

### Test Credentials:
- **Phone Number**: `9800000001` (or any 10-digit number)
- **MPIN**: `1111`
- **OTP**: `987654`

### Test Flow:
1. Add items to cart
2. Click "Checkout"
3. Choose "Khalti" payment method
4. Get redirected to Khalti sandbox page
5. Use test credentials to complete payment
6. Get redirected back with receipt and token number

---

## 🔐 API Endpoints

### Backend Endpoints:

**1. Initiate Khalti Payment**
```
POST /api/payments/khalti/initiate
Authorization: Bearer <JWT_TOKEN>

Request Body:
{
  "orderId": 123
}

Response:
{
  "success": true,
  "data": {
    "paymentUrl": "https://dev.khalti.com/payment/?pidx=...",
    "pidx": "bZQLD9wRVWo4...",
    "paymentId": 1,
    "orderId": 123
  }
}
```

**2. Verify Khalti Payment**
```
POST /api/payments/khalti/verify
Authorization: Bearer <JWT_TOKEN>

Request Body:
{
  "pidx": "bZQLD9wRVWo4...",
  "paymentId": 1,
  "orderId": 123
}

Response:
{
  "success": true,
  "data": {
    "order": {...},
    "customer": {...},
    "items": [...],
    "payment": {...},
    "token": {
      "tokenNumber": 1,
      "status": "PREPARING"
    }
  }
}
```

---

## 💡 Key Points

1. **Stock Management**: Stock is automatically deducted when items are added to cart (already fixed from previous issue)

2. **Payment Status Flow**:
   - Order created: `INCART` → `PROCESSING`
   - Payment created with `KHALTI` method and `PENDING` status
   - After verification: Payment status → `PAID`
   - Token created with `PREPARING` status

3. **Amount Conversion**: 
   - Your database stores amounts in NPR
   - Khalti API expects amounts in **paisa** (NPR × 100)
   - This is automatically handled in the code

4. **Security**:
   - All payment verification done server-side
   - Frontend redirects are verified with backend
   - User authentication required for all payment endpoints

---

## 🚀 Production Deployment

When going live:

1. Change `KHALTI_API_URL` in `.env`:
   ```env
   KHALTI_API_URL=https://khalti.com/api/v2
   ```

2. Update `WEBSITE_URL` and `BACKEND_URL` to your production domain

3. Get production API keys from https://admin.khalti.com

4. Test with a real small transaction (e.g., Rs. 10)

---

## 🐛 Troubleshooting

### Payment not initiating?
- Check if `KHALTI_SECRET_KEY` is correct in `.env`
- Verify `KHALTI_API_URL` is correct
- Check backend console for error messages

### Verification failing?
- Ensure you're passing `pidx`, `paymentId`, and `orderId` correctly
- Check if payment already verified (idempotent - safe to retry)
- Check backend logs for API errors

### Customer not getting receipt?
- Verify payment is marked as `PAID` in database
- Check token was created successfully
- Review KhaltiReturn.jsx for UI issues

---

## 📞 Support

For Khalti API issues: https://docs.khalti.com
For integration issues: Check backend console logs and browser network tab

---

## ✅ Checklist Before Going Live

- [ ] Get production Khalti API keys
- [ ] Update `.env` with production URLs and keys
- [ ] Test full payment flow with real transaction
- [ ] Verify email notifications (if configured)
- [ ] Test receipt generation and display
- [ ] Monitor payment status in admin dashboard
- [ ] Set up order status tracking for admin

---

# PrintHive Payment & Escrow Architecture

## Overview
PrintHive features a cryptographically secure, escrow-protected payment architecture integrated with **Razorpay**. 

All payment state updates and signature verifications occur strictly **server-side** to ensure zero tampering from browser client state.

---

## 70 / 15 / 15 Business Calculation Model

For every completed 3D print transaction on PrintHive, funds are split according to the PrintHive Escrow Specification:

| Recipient | Percentage | Description |
| :--- | :--- | :--- |
| **Printer Owner** | **70%** | Manufacturing, filament materials, machine maintenance & labor. |
| **3D Modeler / Designer** | **15%** | Royalties for model design IP and slicing file license. |
| **PrintHive Platform** | **15%** | Platform escrow protection, server hosting, payment gateway fee & support. |

### Mathematical Formula
$$\text{Printer Owner Payout} = \lfloor \text{Total Amount} \times 0.70 \rfloor$$
$$\text{Designer Royalty} = \lfloor \text{Total Amount} \times 0.15 \rfloor$$
$$\text{PrintHive Fee} = \text{Total Amount} - (\text{Printer Payout} + \text{Designer Royalty})$$

---

## Server-Side API Endpoints

### 1. Create Payment Order (`POST /api/payments/create-order`)
* **Purpose**: Generates a server-validated Razorpay order ID and records initial transaction status.
* **Monetary Units**: Request amounts and breakdown totals are in **INR Rupees (₹)**. Razorpay's `amount` field is in **Integer Paisa** (100 paise = ₹1 INR).
* **Payload**:
  ```json
  {
    "orderId": "d1-order-uuid"
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "razorpayOrderId": "order_Kj98xL2s",
    "keyId": "rzp_live_xxx",
    "amount": 45000,
    "currency": "INR",
    "breakdown": {
      "total": 450,
      "printerPayout": 315,
      "designerRoyalty": 67,
      "platformFee": 68
    }
  }
  ```

---

### 2. Verify Payment Signature (`POST /api/payments/verify`)
* **Purpose**: Server-side HMAC-SHA256 cryptographic verification of Razorpay payment responses.
* **Security Verification**:
  ```typescript
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  ```
* **Database Atomicity & Idempotency**:
  1. Partial unique index on `transactions(razorpay_payment_id)` and `escrow_payouts(order_id, role)` prevents double capture.
  2. Writes captured record to `public.transactions`.
  3. Inserts Escrow hold records with recipient IDs (`printer_owner_id`, `designer_id`) to `public.escrow_payouts`.
  4. Transitions order status: `PAYMENT_CONFIRMED` $\rightarrow$ `FINDING_PRINTER`.

---

### 3. Refund Payment (`POST /api/payments/refund`)
* **Purpose**: Issues full refunds for pre-dispatch order cancellations via Razorpay REST API (`POST /v1/payments/{payment_id}/refund`).
* **Database Updates**:
  1. Records refund transaction log in `public.transactions`.
  2. Marks all matching `public.escrow_payouts` rows for the order as `refunded`.
  3. Transitions order lifecycle state to `REFUNDED`.

---

## Environment Variables Required (`.env.local`)

```env
# Razorpay Credentials (Keep Secrets Server-Only)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_key
```

> [!CAUTION]
> Never expose `RAZORPAY_KEY_SECRET` in client-side code (`NEXT_PUBLIC_`). Keep all secret key evaluations in Next.js Server Components and API route handlers (`app/api/payments/*`).

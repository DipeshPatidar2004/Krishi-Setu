import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Punjab National Bank",
  "Axis Bank", "Union Bank of India", "Canara Bank", "Bank of Baroda",
  "Yes Bank", "Kotak Mahindra Bank", "Bank of India", "Indian Bank",
];

const STEPS = ["Method", "Details", "Review", "Processing", "Receipt"];

export default function PaymentModal({ bidData, bidType, userEmail, userName, onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [bank, setBank] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [error, setError] = useState("");
  const [paymentRecord, setPaymentRecord] = useState(null);

  const amount = bidType === "crop" ? bidData.bidAmount : bidData.bidingAmount;
  const itemName = bidType === "crop" ? bidData.cropName : null;
  const tenderNo = bidType === "tender" ? bidData.tenderNo : null;

  // For crop bids: buyer pays farmer
  const payerEmail = bidType === "crop" ? bidData.buyerEmail : bidData.email;
  const payerName  = bidType === "crop" ? bidData.buyerName  : bidData.name;
  const payeeEmail = bidType === "crop" ? bidData.farmerEmail : bidData.buyerEmail;
  const payeeName  = bidType === "crop" ? "Farmer" : "Buyer";

  // ─── Card number formatting (4-4-4-4) ───
  const formatCard = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  // ─── UPI mock verify ───
  const handleVerifyUpi = () => {
    if (!upiId.includes("@")) { setError("Enter a valid UPI ID (e.g. name@upi)"); return; }
    setError("");
    setUpiVerifying(true);
    setTimeout(() => { setUpiVerifying(false); setUpiVerified(true); }, 1400);
  };

  // ─── Step validations ───
  const canProceedFromDetails = () => {
    if (method === "upi") return upiVerified;
    if (method === "netbanking") return bank !== "";
    if (method === "card") {
      const digits = cardNumber.replace(/\s/g, "");
      const [m, y] = cardExpiry.split("/");
      return digits.length === 16 && cardHolder.trim() && m && y && cardCvv.length === 3;
    }
    return false;
  };

  const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

const handleProcessPayment = async () => {
  try {
    const loaded = await loadRazorpay();

    if (!loaded || !window.Razorpay) {
      alert("Razorpay failed to load");
      return;
    }

    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bidId: bidData._id,
        bidType,
        payerEmail,
        payerName,
        payeeEmail,
        payeeName,
        amount,
      }),
    });

    const data = await res.json();

    if (!data.success || !data.order) {
      alert(data.error || "Order failed");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: data.order.amount,
      currency: "INR",
      order_id: data.order.id,

      handler: async function (response) {
        const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          alert("Payment Successful ✅");
          if (onSuccess) onSuccess(verifyData.payment);
          onClose();
        } else {
          alert("Verification failed ❌");
        }
      },

      prefill: {
        name: payerName,
        email: payerEmail,
      },

      theme: {
        color: "#16a34a",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert("Payment failed");
  }
};

  const methodLabel = method === "upi" ? "UPI" : method === "netbanking" ? "Net Banking" : method === "card" ? "Card" : "";

  return (
    <div
      id="payment-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target.id === "payment-modal-overlay") onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: "slideUp 0.25s ease" }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }} className="px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-green-200 font-medium tracking-wide uppercase mb-0.5">Krishi Setu Secure Payment</p>
            <h2 className="text-white text-xl font-bold">
              ₹{Number(amount).toLocaleString("en-IN")}
            </h2>
            <p className="text-green-100 text-xs mt-0.5">
              {bidType === "crop" ? `Crop: ${itemName}` : `Tender: ${tenderNo}`}
            </p>
          </div>
          {step !== 3 && (
            <button onClick={onClose} className="text-green-200 hover:text-white text-2xl leading-none" aria-label="Close">×</button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-gray-100">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${i === step ? "text-green-700 border-b-2 border-green-600" : i < step ? "text-green-500" : "text-gray-400"}`}>
              {i < step ? "✓" : i + 1}. {s}
            </div>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex gap-2 items-start">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {/* ── STEP 0: Method Selection ── */}
          {step === 0 && (
            <div>
              <h3 className="text-gray-800 font-semibold text-base mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                {[
                  { id: "upi", icon: "📱", title: "UPI", subtitle: "GPay, PhonePe, Paytm, BHIM" },
                  { id: "netbanking", icon: "🏦", title: "Net Banking", subtitle: "All major Indian banks" },
                  { id: "card", icon: "💳", title: "Debit / Credit Card", subtitle: "Visa, Mastercard, RuPay" },
                ].map((m) => (
                  <button
                    key={m.id}
                    id={`payment-method-${m.id}`}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${method === m.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300 hover:bg-gray-50"}`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{m.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.subtitle}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === m.id ? "border-green-500" : "border-gray-300"}`}>
                      {method === m.id && <div className="w-2 h-2 rounded-full bg-green-500" />}
                    </div>
                  </button>
                ))}
              </div>
              <button
                id="payment-next-method"
                onClick={() => { setError(""); setStep(1); }}
                disabled={!method}
                className="mt-5 w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 1: Details Entry ── */}
          {step === 1 && (
            <div>
              <h3 className="text-gray-800 font-semibold text-base mb-4">
                {method === "upi" && "Enter UPI Details"}
                {method === "netbanking" && "Select Your Bank"}
                {method === "card" && "Enter Card Details"}
              </h3>

              {method === "upi" && (
                <div className="space-y-3">
                  <label className="block text-sm text-gray-600 mb-1">UPI ID</label>
                  <div className="flex gap-2">
                    <input
                      id="upi-id-input"
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }}
                      className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      id="verify-upi-btn"
                      onClick={handleVerifyUpi}
                      disabled={upiVerifying || upiVerified}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${upiVerified ? "bg-green-100 text-green-700" : "bg-green-600 text-white hover:bg-green-700"} disabled:opacity-60`}
                    >
                      {upiVerifying ? "..." : upiVerified ? "✓ Verified" : "Verify"}
                    </button>
                  </div>
                  {upiVerified && <p className="text-xs text-green-600 flex items-center gap-1">✓ UPI ID verified successfully</p>}
                </div>
              )}

              {method === "netbanking" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Choose Bank</label>
                  <select
                    id="bank-select"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Select your bank --</option>
                    {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {bank && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                      🔒 You will be redirected to {bank}'s secure net banking portal to complete the payment.
                    </div>
                  )}
                </div>
              )}

              {method === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Card Number</label>
                    <input
                      id="card-number-input"
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      maxLength={19}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cardholder Name</label>
                    <input
                      id="card-holder-input"
                      type="text"
                      placeholder="Name on card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Expiry (MM/YY)</label>
                      <input
                        id="card-expiry-input"
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">CVV</label>
                      <input
                        id="card-cvv-input"
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        maxLength={3}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button onClick={() => { setError(""); setStep(0); }} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition">← Back</button>
                <button
                  id="payment-to-review-btn"
                  onClick={() => { setError(""); setStep(2); }}
                  disabled={!canProceedFromDetails()}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Review & Confirm ── */}
          {step === 2 && (
            <div>
              <h3 className="text-gray-800 font-semibold text-base mb-4">Review Payment</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm border border-gray-200">
                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-green-700 text-base">₹{Number(amount).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="font-medium text-gray-800">{bidType === "crop" ? `Crop: ${itemName}` : `Tender: ${tenderNo}`}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">From</span><span className="font-medium text-gray-800">{payerName || payerEmail}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">To</span><span className="font-medium text-gray-800">{payeeName}</span></div>
                <hr className="border-gray-200" />
                <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium text-gray-800">{methodLabel}</span></div>
                {method === "upi" && <div className="flex justify-between"><span className="text-gray-500">UPI ID</span><span className="font-medium text-gray-800">{upiId}</span></div>}
                {method === "netbanking" && <div className="flex justify-between"><span className="text-gray-500">Bank</span><span className="font-medium text-gray-800">{bank}</span></div>}
                {method === "card" && <div className="flex justify-between"><span className="text-gray-500">Card</span><span className="font-medium text-gray-800">•••• •••• •••• {cardNumber.replace(/\s/g, "").slice(-4)}</span></div>}
              </div>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex gap-2">
                <span>🔒</span><span>Your payment is secured by 256-bit encryption. This transaction is monitored for compliance with government portal standards.</span>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setError(""); setStep(1); }} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition">← Back</button>
                <button
                  id="confirm-payment-btn"
                  onClick={handleProcessPayment}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition"
                >
                  Confirm & Pay ₹{Number(amount).toLocaleString("en-IN")}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Processing ── */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-5">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-green-200" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent"
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">Processing your payment…</p>
                <p className="text-sm text-gray-500 mt-1">Securing transaction with Krishi Setu</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-green-400"
                    style={{ animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite` }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">Do not close this window</p>
            </div>
          )}

          {/* ── STEP 4: Receipt ── */}
          {step === 4 && paymentRecord && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3" style={{ animation: "scaleIn 0.3s ease" }}>
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
                <p className="text-sm text-gray-500 mt-1">Your receipt has been emailed to you</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono font-bold text-gray-800 bg-green-50 px-2 py-0.5 rounded text-xs">{paymentRecord.transactionId}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Amount Paid</span><span className="font-bold text-green-700">₹{Number(paymentRecord.amount).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium capitalize">{paymentRecord.method}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date & Time</span><span className="font-medium text-xs">{new Date(paymentRecord.paidAt).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="font-medium">{paymentRecord.itemName || paymentRecord.tenderNo}</span></div>
              </div>

              <div className="flex gap-3">
                <button
                  id="payment-done-btn"
                  onClick={onClose}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition"
                >
                  Done ✓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

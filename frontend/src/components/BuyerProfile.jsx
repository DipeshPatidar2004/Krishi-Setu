import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import PaymentModal from "./PaymentModal";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

/**
 * BuyerProfile.jsx (updated)
 * - change-password + delete-account wired
 * - shorter centered inline notifications
 */

const BuyerProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // inline banner state (success / error)
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const hideTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const showSuccess = (text) => {
    setErrorMessage("");
    setSuccessMessage(text);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (text) => {
    setSuccessMessage("");
    setErrorMessage(text);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setErrorMessage(""), 4500);
  };

  if (!user) {
    return (
      <div className="p-10 text-center text-gray-600">Please login to view your profile.</div>
    );
  }

  if (user.userType !== "buyer") {
    return (
      <div className="p-10 text-center text-red-600">You are not logged in as a buyer.</div>
    );
  }

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "",
    companyName: user.companyName || "",
    businessType: user.businessType || "",
    gstNumber: user.gstNumber || "",
  });
  const [saving, setSaving] = useState(false);

  // change-password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  // --- Tender Bids received (from farmers) ---
  const [tenderBids, setTenderBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const fetchBids = async () => {
      setBidsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/marketPlace/tenderbids/${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success) setTenderBids(data.bids || []);
      } catch (err) {
        console.error("Failed to fetch tender bids:", err);
      } finally {
        setBidsLoading(false);
      }
    };
    fetchBids();
  }, [user?.email]);

  const handleTenderBidAction = async (bidId, approve) => {
    try {
      const res = await fetch(`${API_BASE}/api/marketPlace/tenderbid/${bidId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approve }),
      });
      const data = await res.json();
      if (data.success) {
        setTenderBids((prev) => prev.map((b) => (b._id === bidId ? { ...b, isApproved: approve } : b)));
        showSuccess(approve ? "Bid approved ✅" : "Bid rejected ❌");
      } else {
        showError(data.error || "Failed to update bid.");
      }
    } catch (err) {
      console.error("Tender bid action error:", err);
      showError("Failed to update bid. Please try again.");
    }
  };

  const pendingTenderBidsCount = tenderBids.filter((b) => b.isApproved === null).length;

  // --- Buyer's own crop bids (bids placed by this buyer on farmer crops) ---
  const [buyerCropBids, setBuyerCropBids] = useState([]);
  const [cropBidsLoading, setCropBidsLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const fetchBuyerCropBids = async () => {
      setCropBidsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/marketPlace/cropbids-by-buyer/${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success) setBuyerCropBids(data.bids || []);
      } catch (err) {
        console.error("Failed to fetch buyer crop bids:", err);
      } finally {
        setCropBidsLoading(false);
      }
    };
    fetchBuyerCropBids();
  }, [user?.email]);

  // --- Payments (outgoing payments as payer) ---
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const fetchPayments = async () => {
    if (!user?.email) return;
    setPaymentsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payment/my/${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) setPayments(data.payments || []);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [user?.email]);

  const completedPayments = payments.filter((p) => p.status === "completed");
  const pendingPayments   = payments.filter((p) => p.status === "pending");

  // --- PaymentModal state ---
  const [paymentModal, setPaymentModal] = useState({ open: false, bidData: null, bidType: null });

  const openPaymentModal = (bidData, bidType) => setPaymentModal({ open: true, bidData, bidType });
  const closePaymentModal = () => setPaymentModal({ open: false, bidData: null, bidType: null });

  const handlePaymentSuccess = (completedPayment) => {
    setPayments((prev) => {
      const exists = prev.find((p) => p._id === completedPayment._id);
      if (exists) return prev.map((p) => p._id === completedPayment._id ? completedPayment : p);
      return [completedPayment, ...prev];
    });
    showSuccess("Payment successful! Transaction ID: " + completedPayment.transactionId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const userId = user._id || user.id;

      const res = await fetch(`${API_BASE}/api/auth/profile/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        showError(data.error || "Failed to update profile");
        setSaving(false);
        return;
      }

      const updated = data.user || { ...user, ...formData };

      updateUser(updated);

      setFormData({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        location: updated.location || "",
        companyName: updated.companyName || "",
        businessType: updated.businessType || "",
        gstNumber: updated.gstNumber || "",
      });

      showSuccess("Buyer profile updated successfully ✅");
      setActiveTab("profile");
    } catch (err) {
      console.error("Buyer profile update error:", err);
      showError("Failed to update buyer profile. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showError("Please fill both current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      showError("New password must be at least 6 characters.");
      return;
    }

    setChangingPwd(true);
    try {
      const userId = user._id || user.id;
      const res = await fetch(`${API_BASE}/api/auth/change-password/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        showError(data.error || "Failed to change password.");
        return;
      }

      showSuccess("Password changed successfully ✅");
      setCurrentPassword("");
      setNewPassword("");
      setActiveTab("profile");
    } catch (err) {
      console.error("Change password error:", err);
      showError("Failed to change password. Check console.");
    } finally {
      setChangingPwd(false);
    }
  };

  // delete account
  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This will permanently delete your account.")) return;

    try {
      const userId = user._id || user.id;
      const res = await fetch(`${API_BASE}/api/auth/profile/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        showError(data.error || "Failed to delete account.");
        return;
      }

      try {
        if (typeof logout === "function") {
          await logout();
        } else {
          if (typeof updateUser === "function") updateUser(null);
          localStorage.removeItem("authUser");
        }
      } catch (err) {
        // ignore
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Delete account error:", err);
      showError("Failed to delete account. Check console.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Shorter centered notifications */}
      {(successMessage || errorMessage) && (
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-xl">
            {successMessage && (
              <div className="flex items-start justify-between bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm" role="status">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                  </div>
                </div>
                <button onClick={() => setSuccessMessage("")} className="text-green-700 hover:text-green-900" aria-label="Dismiss success">✕</button>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start justify-between bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm" role="alert">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0v1a1 1 0 11-2 0v-1zm0-7a1 1 0 012 0v4a1 1 0 11-2 0V6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                  </div>
                </div>
                <button onClick={() => setErrorMessage("")} className="text-red-700 hover:text-red-900" aria-label="Dismiss error">✕</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDEBAR NAV */}
        <aside className="md:w-64">
          <div className="bg-white border shadow-sm rounded-2xl p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Account Settings</h2>

            <nav className="flex flex-col space-y-1 text-sm">
              <button onClick={() => setActiveTab("profile")} className={`text-left px-3 py-2 rounded-xl border transition ${activeTab === "profile" ? "bg-green-50 border-green-500 text-green-700 font-semibold" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200"}`}>👤 My Profile</button>

              <button onClick={() => setActiveTab("bids")} className={`text-left px-3 py-2 rounded-xl border transition flex items-center gap-2 ${activeTab === "bids" ? "bg-green-50 border-green-500 text-green-700 font-semibold" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200"}`}>
                <span>📋</span><span className="flex-1">Tender Bids</span>
                {pendingTenderBidsCount > 0 && <span className="ml-auto bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingTenderBidsCount}</span>}
              </button>

              <button onClick={() => setActiveTab("payments")} className={`text-left px-3 py-2 rounded-xl border transition flex items-center gap-2 ${activeTab === "payments" ? "bg-green-50 border-green-500 text-green-700 font-semibold" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200"}`}>
                <span>💰</span><span className="flex-1">Payments</span>
                {pendingPayments.length > 0 && <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingPayments.length}</span>}
              </button>

              <button onClick={() => setActiveTab("edit")} className={`text-left px-3 py-2 rounded-xl border transition ${activeTab === "edit" ? "bg-green-50 border-green-500 text-green-700 font-semibold" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200"}`}>✏️ Edit Profile</button>

              <button onClick={() => setActiveTab("password")} className={`text-left px-3 py-2 rounded-xl border transition ${activeTab === "password" ? "bg-green-50 border-green-500 text-green-700 font-semibold" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200"}`}>🔒 Change Password</button>

              <button onClick={() => setActiveTab("remove")} className={`text-left px-3 py-2 rounded-xl border transition ${activeTab === "remove" ? "bg-red-50 border-red-500 text-red-600 font-semibold" : "border-transparent text-gray-600 hover:bg-red-50 hover:border-red-200"}`}>🗑️ Remove Account</button>
            </nav>
          </div>
        </aside>

        <section className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Profile Details</h1>
                <p className="text-sm text-gray-500 mt-1">View your buyer information used for marketplace & orders.</p>
              </div>

              <hr className="border-gray-200" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.name}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.phone || "—"}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.email || "—"}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">GST Number</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.gstNumber || "—"}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Business Name</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.companyName || "—"}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Business Type</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.businessType || "—"}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Location</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.location || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "edit" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Edit Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Update your buyer details. Changes will be saved to your account.</p>
              </div>

              <form className="space-y-5 max-w-xl" onSubmit={handleEditSubmit}>
                {/* form fields unchanged */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Business Name</label>
                    <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Business Type</label>
                    <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option value="">Select Business Type</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Exporter">Exporter</option>
                      <option value="Food Processor">Food Processor</option>
                      <option value="Government Agency">Government Agency</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">GST Number</label>
                    <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Location</label>
                    <input name="location" value={formData.location} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="mt-2 inline-flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Change Password</h1>
                <p className="text-sm text-gray-500 mt-1">Update your buyer account password now.</p>
              </div>

              <form className="space-y-4 max-w-md" onSubmit={handleChangePassword}>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>

                <button type="submit" disabled={changingPwd} className="mt-2 inline-flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-60">
                  {changingPwd ? "Changing..." : "Save Password"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "remove" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-red-600">Remove Account</h1>
                <p className="text-sm text-gray-500 mt-1">Permanently delete your buyer account and its order history.</p>
              </div>

              <p className="text-sm text-gray-600">After deletion, you will not be able to log in again with this buyer account. This action cannot be undone.</p>

              <button className="mt-2 inline-flex items-center justify-center bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition" onClick={handleDeleteAccount}>
                Delete My Account
              </button>
            </div>
          )}

          {/* ===== TENDER BIDS TAB (Buyer) ===== */}
          {activeTab === "bids" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Tender Bids</h1>
                <p className="text-sm text-gray-500 mt-1">Review and approve/reject bids from farmers on your tenders.</p>
              </div>

              <hr className="border-gray-200" />

              {bidsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading bids...</div>
              ) : tenderBids.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-500 font-medium">No tender bids received yet</p>
                  <p className="text-sm text-gray-400 mt-1">When farmers bid on your tenders, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tenderBids.map((bid) => (
                    <div key={bid._id} className={`border rounded-xl p-5 transition ${
                      bid.isApproved === true ? "bg-green-50 border-green-200" :
                      bid.isApproved === false ? "bg-red-50 border-red-200" :
                      "bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm"
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{bid.name}</p>
                            {bid.isApproved === true && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Approved</span>}
                            {bid.isApproved === false && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Rejected</span>}
                            {bid.isApproved === null && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pending</span>}
                          </div>
                          <p className="text-sm text-gray-500">{bid.email}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600"><strong>Tender:</strong> {bid.tenderNo}</span>
                            <span className="text-sm font-semibold text-primary-700">₹{bid.bidingAmount}</span>
                          </div>
                          {bid.createdAt && (
                            <p className="text-xs text-gray-400 mt-1">{new Date(bid.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                          )}
                        </div>

                        {bid.isApproved === null && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleTenderBidAction(bid._id, true)}
                              className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleTenderBidAction(bid._id, false)}
                              className="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== PAYMENTS TAB (Buyer — Pay Now) ===== */}
          {activeTab === "payments" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
                <p className="text-sm text-gray-500 mt-1">Complete payments for approved bids and view your transaction history.</p>
              </div>

              <hr className="border-gray-200" />

              {(paymentsLoading || cropBidsLoading) ? (
                <div className="text-center py-8 text-gray-500">Loading payments…</div>
              ) : (
                <>
                  {/* ── Approved Crop Bids — Pay Now ── */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-800 mb-3">✅ Approved Bids — Pay Now</h2>
                    <p className="text-xs text-gray-400 mb-3">These are your crop bids that have been approved by farmers. Complete payment to finalise the deal.</p>
                    {buyerCropBids.filter((b) => b.isApproved === true).length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-3xl mb-2">🌾</p>
                        <p className="text-gray-500 text-sm">No approved crop bids yet. Place bids from the Marketplace.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {buyerCropBids.filter((b) => b.isApproved === true).map((bid) => {
                          const existingPayment = payments.find((p) => p.bidId === bid._id);
                          const isPaid = existingPayment?.status === "completed";
                          const isPending = existingPayment?.status === "pending";
                          return (
                            <div key={bid._id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-xl p-4 transition ${isPaid ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-green-300 hover:shadow-sm"}`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900">{bid.cropName}</p>
                                  {isPaid && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Paid</span>}
                                  {isPending && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Processing</span>}
                                  {!isPaid && !isPending && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Payment Due</span>}
                                </div>
                                <p className="text-xs text-gray-500">Farmer: {bid.farmerEmail}</p>
                                <p className="text-sm font-bold text-green-700 mt-1">₹{Number(bid.bidAmount).toLocaleString("en-IN")}</p>
                                {isPaid && existingPayment && (
                                  <p className="text-xs text-green-600 mt-1 font-mono">TXN: {existingPayment.transactionId}</p>
                                )}
                              </div>
                              <div className="shrink-0">
                                {isPaid ? (
                                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg">✅ Paid</span>
                                ) : (
                                  <button
                                    id={`pay-now-crop-${bid._id}`}
                                    onClick={() => openPaymentModal(bid, "crop")}
                                    className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm hover:shadow-md"
                                    style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
                                  >
                                    💳 Pay Now
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Pending Payments ── */}
                  {pendingPayments.length > 0 && (
                    <div>
                      <h2 className="text-base font-semibold text-gray-800 mb-3">⏳ Pending Payments</h2>
                      <div className="space-y-2">
                        {pendingPayments.map((p) => (
                          <div key={p._id} className="flex items-center justify-between border border-amber-200 bg-amber-50 rounded-xl px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{p.itemName || p.tenderNo}</p>
                              <p className="text-xs text-gray-500">Initiated {new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                            </div>
                            <span className="font-bold text-amber-700">₹{Number(p.amount).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Completed Transactions ── */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-800 mb-3">📊 Transaction History</h2>
                    {completedPayments.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-3xl mb-2">📋</p>
                        <p className="text-gray-500 text-sm">No completed transactions yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Transaction ID</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {completedPayments.map((p) => (
                              <tr key={p._id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3 font-mono text-xs font-bold text-green-700 bg-green-50">{p.transactionId}</td>
                                <td className="px-4 py-3 text-gray-700">{p.itemName || p.tenderNo || "—"}</td>
                                <td className="px-4 py-3 font-bold text-green-700">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                                <td className="px-4 py-3 capitalize text-gray-600">{p.method}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ── PaymentModal ── */}
      {paymentModal.open && paymentModal.bidData && (
        <PaymentModal
          bidData={paymentModal.bidData}
          bidType={paymentModal.bidType}
          userEmail={user.email}
          userName={user.name}
          onClose={closePaymentModal}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default BuyerProfile;

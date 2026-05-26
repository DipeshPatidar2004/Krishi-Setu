import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import PaymentModal from "./PaymentModal";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // inline banner state
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

  // --- Farmer-specific state ---
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "",
    landSize: user.landSize || "",
    crops: user.crops || "",
    aadhar: user.aadhar || "",
  });
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  // --- Bids Received (CropBids from buyers) ---
  const [cropBids, setCropBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const fetchBids = async () => {
      setBidsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/marketPlace/cropbids/${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success) setCropBids(data.bids || []);
      } catch (err) {
        console.error("Failed to fetch crop bids:", err);
      } finally {
        setBidsLoading(false);
      }
    };
    fetchBids();
  }, [user?.email]);

  const handleBidAction = async (bidId, approve) => {
    try {
      const res = await fetch(`${API_BASE}/api/marketPlace/cropbid/${bidId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approve }),
      });
      const data = await res.json();
      if (data.success) {
        setCropBids((prev) => prev.map((b) => (b._id === bidId ? { ...b, isApproved: approve } : b)));
        showSuccess(approve ? "Bid approved ✅" : "Bid rejected ❌");
      } else {
        showError(data.error || "Failed to update bid.");
      }
    } catch (err) {
      console.error("Bid action error:", err);
      showError("Failed to update bid. Please try again.");
    }
  };

  // --- Payments (incoming payments as payee) ---
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Edit Profile ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userId = user._id || user.id;
      const res = await fetch(`${API_BASE}/api/auth/profile/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
        landSize: updated.landSize || "",
        crops: updated.crops || "",
        aadhar: updated.aadhar || "",
      });
      showSuccess("Profile updated successfully ✅");
      setActiveTab("profile");
    } catch (err) {
      console.error("Profile update error:", err);
      showError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // --- Change Password ---
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
      showError("Failed to change password. Please try again.");
    } finally {
      setChangingPwd(false);
    }
  };

  // --- Delete Account ---
  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This will permanently delete your account.")) return;
    try {
      const userId = user._id || user.id;
      const res = await fetch(`${API_BASE}/api/auth/profile/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        showError(data.error || "Failed to delete account.");
        return;
      }
      try {
        if (typeof logout === "function") await logout();
        else {
          if (typeof updateUser === "function") updateUser(null);
          localStorage.removeItem("krishiSetuUser");
        }
      } catch (_) { /* ignore */ }
      window.location.href = "/";
    } catch (err) {
      console.error("Delete account error:", err);
      showError("Failed to delete account. Please try again.");
    }
  };

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const pendingBidsCount = cropBids.filter((b) => b.isApproved === null).length;

  const sidebarTabs = [
    { id: "profile",  label: "My Profile",       icon: "👤" },
    { id: "bids",     label: "Bids Received",     icon: "📋", badge: pendingBidsCount || null },
    { id: "payments", label: "Payments",          icon: "💰", badge: completedPayments.length || null },
    { id: "edit",     label: "Edit Profile",      icon: "✏️" },
    { id: "password", label: "Change Password",   icon: "🔒" },
    { id: "remove",   label: "Remove Account",    icon: "🗑️", danger: true },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Inline Notifications */}
      {(successMessage || errorMessage) && (
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-xl">
            {successMessage && (
              <div className="flex items-start justify-between bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm" role="status">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
                <button onClick={() => setSuccessMessage("")} className="text-green-700 hover:text-green-900" aria-label="Dismiss">✕</button>
              </div>
            )}
            {errorMessage && (
              <div className="flex items-start justify-between bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm" role="alert">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0v1a1 1 0 11-2 0v-1zm0-7a1 1 0 012 0v4a1 1 0 11-2 0V6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                </div>
                <button onClick={() => setErrorMessage("")} className="text-red-700 hover:text-red-900" aria-label="Dismiss">✕</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDEBAR */}
        <aside className="md:w-64">
          <div className="bg-white border shadow-sm rounded-2xl p-5">
            {/* Avatar + Name */}
            <div className="flex flex-col items-center mb-5 pb-5 border-b border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                {initials}
              </div>
              <p className="mt-3 text-base font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <span className="mt-2 inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                🌾 {user.userType || "Farmer"}
              </span>
            </div>

            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Account Settings</h2>

            <nav className="flex flex-col space-y-1 text-sm">
              {sidebarTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left px-3 py-2.5 rounded-xl border transition flex items-center gap-2 ${activeTab === tab.id
                    ? tab.danger
                      ? "bg-red-50 border-red-500 text-red-600 font-semibold"
                      : "bg-green-50 border-green-500 text-green-700 font-semibold"
                    : tab.danger
                      ? "border-transparent text-gray-600 hover:bg-red-50 hover:border-red-200"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200"
                    }`}
                >
                  <span>{tab.icon}</span>
                  <span className="flex-1">{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-auto bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tab.badge}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1">
          {/* ===== MY PROFILE TAB ===== */}
          {activeTab === "profile" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Profile Details</h1>
                <p className="text-sm text-gray-500 mt-1">View your farmer information used across Krishi Setu.</p>
              </div>

              <hr className="border-gray-200" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Full Name</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Aadhar Number</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.aadhar ? `XXXX-XXXX-${user.aadhar.slice(-4)}` : "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Location</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.location || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Land Size</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.landSize ? `${user.landSize} acres` : "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Primary Crops</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{user.crops || "—"}</p>
                </div>
              </div>

              {/* Registered date */}
              {user.registeredAt && (
                <>
                  <hr className="border-gray-200" />
                  <p className="text-xs text-gray-400">
                    Member since {new Date(user.registeredAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </>
              )}
            </div>
          )}

          {/* ===== EDIT PROFILE TAB ===== */}
          {activeTab === "edit" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Edit Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Update your farmer details. Changes will be saved to your account.</p>
              </div>

              <form className="space-y-5 max-w-xl" onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Full Name</label>
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

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Location</label>
                  <input name="location" value={formData.location} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="Village/City, District" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Land Size (acres)</label>
                    <input name="landSize" type="number" min="0" step="0.1" value={formData.landSize} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Primary Crops</label>
                    <input name="crops" value={formData.crops} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="e.g., Wheat, Rice" />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="mt-2 inline-flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* ===== CHANGE PASSWORD TAB ===== */}
          {activeTab === "password" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Change Password</h1>
                <p className="text-sm text-gray-500 mt-1">Update your account password to keep it secure.</p>
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

          {/* ===== REMOVE ACCOUNT TAB ===== */}
          {activeTab === "remove" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-red-600">Remove Account</h1>
                <p className="text-sm text-gray-500 mt-1">Permanently delete your farmer account and all associated data.</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  ⚠️ After deletion, you will not be able to log in again with this account. All your tender applications, marketplace listings, and payment history will be lost. This action <strong>cannot be undone</strong>.
                </p>
              </div>

              <button className="mt-2 inline-flex items-center justify-center bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition" onClick={handleDeleteAccount}>
                Delete My Account
              </button>
            </div>
          )}

          {/* ===== BIDS RECEIVED TAB (Farmer) ===== */}
          {activeTab === "bids" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Bids Received</h1>
                <p className="text-sm text-gray-500 mt-1">Review and approve/reject bids from buyers on your crops.</p>
              </div>

              <hr className="border-gray-200" />

              {bidsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading bids...</div>
              ) : cropBids.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-500 font-medium">No bids received yet</p>
                  <p className="text-sm text-gray-400 mt-1">When buyers bid on your crops, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cropBids.map((bid) => (
                    <div key={bid._id} className={`border rounded-xl p-5 transition ${bid.isApproved === true ? "bg-green-50 border-green-200" :
                      bid.isApproved === false ? "bg-red-50 border-red-200" :
                        "bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm"
                      }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{bid.buyerName}</p>
                            {bid.isApproved === true && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Approved</span>}
                            {bid.isApproved === false && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Rejected</span>}
                            {bid.isApproved === null && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pending</span>}
                          </div>
                          <p className="text-sm text-gray-500">{bid.buyerEmail}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600"><strong>Crop:</strong> {bid.cropName}</span>
                            <span className="text-sm font-semibold text-primary-700">₹{bid.bidAmount}</span>
                          </div>
                          {bid.createdAt && (
                            <p className="text-xs text-gray-400 mt-1">{new Date(bid.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                          )}
                        </div>

                        {bid.isApproved === null && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleBidAction(bid._id, true)}
                              className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleBidAction(bid._id, false)}
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

          {/* ===== PAYMENTS TAB (Farmer — incoming) ===== */}
          {activeTab === "payments" && (
            <div className="bg-white border shadow-sm rounded-2xl p-8 space-y-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
                <p className="text-sm text-gray-500 mt-1">Track payments received from buyers for your approved crop bids.</p>
              </div>

              <hr className="border-gray-200" />

              {paymentsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading payments…</div>
              ) : (
                <>
                  {/* ── Approved bids awaiting payment ── */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-800 mb-3">⏳ Approved Bids — Awaiting Payment</h2>
                    {cropBids.filter((b) => b.isApproved === true).length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-3xl mb-2">🌾</p>
                        <p className="text-gray-500 text-sm">No approved bids yet. Approve bids from the &quot;Bids Received&quot; tab.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cropBids.filter((b) => b.isApproved === true).map((bid) => {
                          const existingPayment = payments.find((p) => p.bidId === bid._id);
                          return (
                            <div key={bid._id} className="flex items-center justify-between border rounded-xl p-4 bg-green-50 border-green-200">
                              <div>
                                <p className="font-semibold text-gray-900">{bid.buyerName}</p>
                                <p className="text-xs text-gray-500">{bid.buyerEmail}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-gray-600"><strong>Crop:</strong> {bid.cropName}</span>
                                  <span className="text-sm font-bold text-green-700">₹{bid.bidAmount}</span>
                                </div>
                              </div>
                              <div className="shrink-0">
                                {existingPayment?.status === "completed" ? (
                                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">✅ Payment Received</span>
                                ) : existingPayment?.status === "pending" ? (
                                  <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full">⏳ Awaiting Payment</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">🔔 Payment Not Initiated</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Completed Transactions ── */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-800 mb-3">✅ Completed Transactions</h2>
                    {completedPayments.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-3xl mb-2">📊</p>
                        <p className="text-gray-500 text-sm">No completed transactions yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Transaction ID</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">From</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {completedPayments.map((p) => (
                              <tr key={p._id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3 font-mono text-xs font-bold text-green-700 bg-green-50">{p.transactionId}</td>
                                <td className="px-4 py-3 text-gray-700">{p.payerName || p.payerEmail}</td>
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
    </div>
  );
};

export default Profile;
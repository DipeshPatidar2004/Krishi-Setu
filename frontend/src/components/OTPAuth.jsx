// src/components/OTPAuth.jsx
import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const RESEND_COOLDOWN = 60; // seconds

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function isPhoneE164(s) {
  return /^\+\d{7,15}$/.test(s); // basic E.164 check
}

export default function OTPAuth({ onVerified }) {
  const [identifier, setIdentifier] = useState("");
  const [channel, setChannel] = useState("email");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("idle"); // idle | sent | verifying
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
  }, [cooldown]);

  function validateBeforeSend() {
    const id = identifier.trim();
    if (!id) {
      setMsg("Enter email or phone number.");
      return false;
    }
    if (channel === "email" && !isEmail(id)) {
      setMsg("Enter a valid email address.");
      return false;
    }
    if (channel === "sms" && !isPhoneE164(id)) {
      setMsg("Enter phone in E.164 format, e.g. +919812345678.");
      return false;
    }
    return true;
  }

  async function requestOtp() {
    if (!validateBeforeSend()) return;
    setMsg("Sending OTP...");
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/otp/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), channel }),
      });
      const data = await res.json();
      if (res.ok) {
        setStage("sent");
        setMsg(`OTP sent via ${channel}.`);
        // start cooldown
        setCooldown(RESEND_COOLDOWN);
      } else {
        setMsg(data.error || data.message || "Failed to send OTP");
      }
    } catch (e) {
      setMsg("Network error: " + e.message);
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp() {
    if (!otp.trim()) {
      setMsg("Enter the OTP.");
      return;
    }
    setMsg("Verifying...");
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/otp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), channel, otp: otp.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("OTP verified");
        // pass both identifier and channel back to caller
        onVerified?.(identifier.trim(), channel);
      } else {
        setMsg(data.error || data.message || "Verification failed");
        setStage("sent");
      }
    } catch (e) {
      setMsg("Network error: " + e.message);
      setStage("sent");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="p-3 border rounded max-w-md bg-white">
      <h4 className="mb-2 text-lg font-medium">Sign in / Verify with OTP</h4>

      <input
        className="w-full p-2 mb-2 border rounded"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="you@example.com or +91XXXXXXXXXX"
        disabled={sending || verifying}
      />

      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 border rounded ${channel === "email" ? "bg-gray-100" : ""}`}
          onClick={() => setChannel("email")}
          disabled={sending || verifying}
        >
          Email
        </button>
        <button
          className={`px-3 py-1 border rounded ${channel === "sms" ? "bg-gray-100" : ""}`}
          onClick={() => setChannel("sms")}
          disabled={sending || verifying}
        >
          SMS
        </button>

        <button
          className="ml-auto px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
          onClick={requestOtp}
          disabled={sending || cooldown > 0}
        >
          {sending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP"}
        </button>
      </div>

      {stage === "sent" && (
        <div className="mb-2">
          <input
            className="w-full p-2 mb-2 border rounded"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={verifying}
          />
          <button
            className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-60"
            onClick={verifyOtp}
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      <div className="text-sm mt-2">{msg}</div>
    </div>
  );
}

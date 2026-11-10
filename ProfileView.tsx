import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { User, Mail, Phone, QrCode, Lock, Edit3, Check, X, AlertCircle, CheckCircle } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { adminProfile, updateAdminProfile } = useAdminData();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(adminProfile?.name || '');
  const [email, setEmail] = useState(adminProfile?.email || '');
  const [mobile, setMobile] = useState(adminProfile?.mobile || '');
  const [upiId, setUpiId] = useState(adminProfile?.upiId || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStartEdit = () => {
    setIsEditing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setName(adminProfile?.name || '');
    setEmail(adminProfile?.email || '');
    setMobile(adminProfile?.mobile || '');
    setUpiId(adminProfile?.upiId || '');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMsg(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Password validation matching video 01:52
    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirm password do not match');
        return;
      }
    }

    updateAdminProfile({
      name,
      role: 'admin',
      email,
      mobile,
      upiId
    });

    setIsEditing(false);
    setSuccessMsg('Profile updated successfully');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* Top Header matching video 01:47 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">My Profile</h2>
          <p className="text-xs text-slate-400">
            System administrator credentials and payment collection UPI address.
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={handleStartEdit}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Validation Alert matching video 01:52 */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Card matching video 01:47 - 01:49 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Avatar Section matching video 01:47 */}
        <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-slate-800">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-1 shadow-xl shadow-amber-500/20 mb-3 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#141e28] flex items-center justify-center text-amber-400">
              <User className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{adminProfile.name}</h3>
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 mt-0.5">
            {adminProfile.role}
          </span>
        </div>

        {/* Info or Edit Form */}
        <div className="pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-6">
            <User className="w-4 h-4 text-amber-400" />
            <span>Personal Information</span>
          </h4>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Name</span>
                    <span className="text-sm font-semibold text-white">{adminProfile.name}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Email Address</span>
                    <span className="text-sm font-mono text-white">{adminProfile.email}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Mobile</span>
                    <span className="text-sm font-mono text-white">{adminProfile.mobile}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <QrCode className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">UPI ID (For Player Deposits)</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{adminProfile.upiId}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number (10 digits)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  UPI ID (Merchant deposit endpoint)
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

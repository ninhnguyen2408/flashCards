import React, { useState, useEffect } from 'react';
import type { User } from '../types/auth';
import { ApiService } from '../services/apiService';
import { soundEffects } from '../services/soundEffects';

import {
  X,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Mail,
  ArrowLeft,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'check_email'>('form');

  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Timer for resend countdown
  useEffect(() => {
    let timer: any = null;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await ApiService.login(loginUsername, loginPassword);
      if (res.success && res.user) {
        soundEffects.playCorrect();
        setSuccessMsg(res.message);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
          setSuccessMsg(null);
        }, 400);
      } else {
        soundEffects.playIncorrect();
        setErrorMsg(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await ApiService.sendRegistrationConfirmationLink(regUsername, regFullName, regEmail, regPassword);
      if (res.success) {
        soundEffects.playPop();
        setSuccessMsg(res.message);

        if (res.requiresEmailCheck) {
          setStep('check_email');
          setResendCountdown(60);
        } else if (res.user) {
          // Direct registration complete without email confirmation
          soundEffects.playVictory();
          setTimeout(() => {
            onLoginSuccess(res.user!);
            onClose();
            setSuccessMsg(null);
          }, 500);
        }
      } else {
        soundEffects.playIncorrect();
        setErrorMsg(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Email Link
  const handleResendEmail = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await ApiService.resendRegistrationConfirmationLink(regEmail);
      if (res.success) {
        soundEffects.playPop();
        setSuccessMsg(res.message);
        setResendCountdown(60);
      } else {
        soundEffects.playIncorrect();
        setErrorMsg(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-all duration-200">

        {/* Modal Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {step === 'check_email' ? 'Kích Hoạt Tài Khoản' : 'Tài Khoản VocaFast'}
              </h3>
              <p className="text-xs text-slate-500">
                {step === 'check_email' ? 'Xác nhận 1-click qua thư điện tử' : 'Đăng nhập hoặc đăng ký tài khoản học viên'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setStep('form');
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= STEP 1: FORM (LOGIN / REGISTER) ================= */}
        {step === 'form' && (
          <>
            {/* Tabs: Login / Register */}
            <div className="px-6 pt-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  onClick={() => {
                    soundEffects.playPop();
                    setActiveTab('login');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'login'
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playPop();
                    setActiveTab('register');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'register'
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng Ký Học Viên</span>
                </button>
              </div>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên đăng nhập hoặc Email
                  </label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập username hoặc email..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:from-brand-700 hover:to-indigo-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang kiểm tra đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Đăng Nhập Vào Hệ Thống</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER FORM (STUDENT ONLY) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên đăng nhập (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="vd: hoang_nam, linh_chi..."
                    className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và Tên đầy đủ *
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="vd: Nguyễn Hoàng Nam..."
                    className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email nhận thư xác nhận *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="vd: hoangnam@gmail.com..."
                    className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Link kích hoạt 1-click sẽ được gửi về Email này.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang gửi thư kích hoạt...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Gửi Thư Kích Hoạt Tài Khoản</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}

        {/* ================= STEP 2: CHECK EMAIL INSTRUCTIONS SCREEN ================= */}
        {step === 'check_email' && (
          <div className="p-6 space-y-5 animate-fade-in text-center">
            
            {/* Animated Mail Icon */}
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/25 animate-pulse">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                Kiểm Tra Hộp Thư Của Bạn ✉️
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Chúng tôi đã gửi một email xác nhận kích hoạt đến:
              </p>
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 font-extrabold text-xs">
                {regEmail}
              </div>
            </div>

            {/* Instruction Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Mở ứng dụng hoặc trang web Gmail/Email của bạn.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Tìm thư từ <strong>Supabase Auth</strong> và bấm nút <strong className="text-brand-600 dark:text-brand-400">"Confirm email address"</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Website sẽ tự động xác nhận và đưa bạn vào màn hình học ngay lập tức!</span>
              </div>
            </div>

            {/* Direct Open Gmail Button */}
            <div className="space-y-2.5 pt-1">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:to-indigo-700 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Mở Hộp Thư Gmail Ngay</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Resend button */}
              <div className="flex items-center justify-center text-xs">
                {resendCountdown > 0 ? (
                  <span className="text-slate-400 font-medium">
                    Gửi lại thư sau <strong className="text-brand-600 font-bold">{resendCountdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Gửi lại email xác nhận</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  setStep('form');
                  setErrorMsg(null);
                }}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại đổi Email / Thông tin</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

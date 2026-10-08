"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Inter, Fraunces } from "next/font/google";
import styles from "./login.module.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: ["500"],
  display: "swap",
  variable: "--font-fraunces",
});

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNote, setShowForgotNote] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Nếu đã có session còn hiệu lực, chuyển hướng ngay về trang chủ "/"
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          router.replace("/");
        }
      })
      .catch(() => {
        // Bỏ qua lỗi kết nối ban đầu
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const u = username.trim();
    if (!u || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: u,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
        setLoading(false);
        return;
      }

      // Đăng nhập thành công -> redirect về "/"
      router.push("/");
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleFillDemo = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div
      className={`${styles.loginContainer} ${inter.className} ${fraunces.variable}`}
      id="login"
    >
      {/* Background Image & Shade Gradient */}
      <img
        className={styles.bgImage}
        src="/login-bg.jpg"
        alt="Nhà nghỉ Mẫu Background"
      />
      <div className={styles.shadeOverlay} aria-hidden="true" />

      {/* Hero Text góc trái-dưới */}
      <div className={styles.hero}>
        <h1>
          Quản lý
          <br />
          Nhà nghỉ Mẫu
        </h1>
        <p>Hệ thống vận hành phòng, đặt phòng và ca trực nhân viên tinh gọn, chính xác.</p>
      </div>

      {/* Glassmorphic Login Card */}
      <form
        className={styles.card}
        id="loginForm"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Brand Mark */}
        <div className={styles.mark} role="img" aria-label="Quản lý Nhà nghỉ Mẫu">
          NN
        </div>

        {/* Title */}
        <h2 className={styles.title}>Đăng nhập</h2>

        {/* Error Alert */}
        {error && (
          <div className={styles.alert} id="loginErr" role="alert">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4.5M10 13.5v.01" strokeLinecap="round" />
            </svg>
            <span id="loginErrMsg">{error}</span>
          </div>
        )}

        {/* Field: Username */}
        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <circle cx="10" cy="7" r="3.2" />
              <path
                d="M3.8 17c.8-3 3.3-4.6 6.2-4.6s5.4 1.6 6.2 4.6"
                strokeLinecap="round"
              />
            </svg>
            <input
              className={styles.input}
              id="lgUser"
              type="text"
              autoComplete="username"
              placeholder="Tên đăng nhập"
              aria-label="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Field: Password */}
        <div className={styles.field}>
          <div className={`${styles.inputWrapper} ${styles.inputPw}`}>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <rect x="4" y="8.5" width="12" height="8.5" rx="2" />
              <path
                d="M6.8 8.5V6.3a3.2 3.2 0 0 1 6.4 0v2.2"
                strokeLinecap="round"
              />
            </svg>
            <input
              className={styles.input}
              id="lgPass"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Mật khẩu"
              aria-label="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              id="pwToggle"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path
                    d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="10" r="2.6" />
                  <path d="M3 3l14 14" strokeLinecap="round" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path
                    d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="10" r="2.6" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Link: Quên mật khẩu? */}
        <div className={styles.row}>
          <button
            type="button"
            className={styles.forgotBtn}
            id="lgForgot"
            aria-controls="lgForgotNote"
            aria-expanded={showForgotNote}
            onClick={() => setShowForgotNote((prev) => !prev)}
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Note: Quên mật khẩu */}
        {showForgotNote && (
          <p
            className={styles.note}
            id="lgForgotNote"
            role="status"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="8" />
              <path d="M10 9v4.5M10 6.5v.01" strokeLinecap="round" />
            </svg>
            <span>Liên hệ Quản lý để cấp lại mật khẩu.</span>
          </p>
        )}

        {/* Submit Button */}
        <button
          className={styles.submitBtn}
          id="lgBtn"
          type="submit"
          disabled={loading}
        >
          <span id="lgBtnTxt">
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </span>
          {!loading && (
            <svg
              id="lgBtnIco"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                d="M4 10h11M11 5.5 15.5 10 11 14.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {loading && <span className={styles.spin} id="lgSpin" aria-hidden="true" />}
        </button>

        {/* Demo Chips */}
        <div className={styles.chips}>
          <button
            type="button"
            className={styles.chip}
            data-fill="admin"
            title="Mật khẩu admin@123"
            aria-label="Dùng thử tài khoản Quản lý (mật khẩu admin@123)"
            onClick={() => handleFillDemo("admin", "admin@123")}
          >
            <span className={styles.avatar}>QL</span>
            <b>Quản lý</b>
          </button>
          <button
            type="button"
            className={`${styles.chip} ${styles.chipB}`}
            data-fill="letan"
            title="Mật khẩu 123456"
            aria-label="Dùng thử tài khoản Lễ tân (mật khẩu 123456)"
            onClick={() => handleFillDemo("letan", "123456")}
          >
            <span className={styles.avatar}>LT</span>
            <b>Lễ tân</b>
          </button>
        </div>
      </form>
    </div>
  );
}


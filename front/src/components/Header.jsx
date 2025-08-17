import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import http from "../api/http";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  // 초기값은 false로 두고, 실제 로그인 여부는 /auth/me로 판별
  const [authed, setAuthed] = useState(false);

  // /auth/me 중복 호출 방지용 락
  const fetchingRef = useRef(false);
  const isMountedRef = useRef(true);

  const refreshAuth = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      await http.get("/auth/me"); // 200이면 로그인 상태
      if (isMountedRef.current) setAuthed(true);
    } catch {
      if (isMountedRef.current) setAuthed(false);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // 앱 진입 시 1회 확인
    refreshAuth();

    // 로그인/로그아웃 등 상태 변화 시 다시 확인
    const onAuthChanged = () => refreshAuth();

    // 세션 만료(401) 신호가 오면 즉시 false로만 전환 (재조회 X → 루프 방지)
    const onAuthExpired = () => {
      if (isMountedRef.current) setAuthed(false);
    };

    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("auth-expired", onAuthExpired);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("auth-expired", onAuthExpired);
    };
  }, []);

  const logout = async () => {
    try {
      // 세션 기반 로그아웃 (서버에 엔드포인트 있으면 세션 무효화)
      await http.post("/auth/logout").catch(() => {});
    } finally {
      // 혹시 JWT를 병행하던 흔적이 있다면 정리 (무해)
      localStorage.removeItem("auth_token");
      // 바로 상태 반영 (추가로 전역 알림이 필요하면 아래 한 줄 유지)
      window.dispatchEvent(new Event("auth-changed"));
      nav("/");
    }
  };

  return (
    <header className="hdr">
      <div className="hdr__left">
        <Link to="/" className="hdr__brand">
          SSP
        </Link>
      </div>

      <div className="hdr__right">
        {authed ? (
          <button className="hdr__btn" onClick={logout}>
            로그아웃
          </button>
        ) : (
          pathname !== "/login" && (
            <Link to="/login" className="hdr__btn">
              로그인
            </Link>
          )
        )}
      </div>
    </header>
  );
}

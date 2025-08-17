import axios from "axios";

const http = axios.create({
  baseURL: "/api",
  withCredentials: true, // 세션/쿠키 방식 호환
  timeout: 10000,
});

// 요청 인터셉터: 로컬스토리지 토큰 존재 시 Authorization 헤더 추가
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401이면 로그인 필요
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = String(err?.config?.url || "");
    if (status === 401) {
      const isMe = url.includes("/auth/me");
      if (!isMe) {
        // 세션 만료/미인증: 상태만 끄고, /auth/me 재호출은 하지 않음
        window.dispatchEvent(new Event("auth-expired"));
      }
    }
    return Promise.reject(err);
  }
);

export default http;

import { defineStore } from "pinia";
import AuthService from "@/services/AuthenService";
import router from '@/router'

export const useAuthen = defineStore("authen", {
  state: () => ({
    loginSuccess: false,
    loginErrorMsg: "",
    token: localStorage.getItem("_token"),
    userCode: localStorage.getItem("_usercode"),
    userName: localStorage.getItem("_username"),
    permission: [],
  }),
  actions: {
    async login(username, password) {
      localStorage._token = "";
      localStorage._usercode = "";
      localStorage._username = "";
      this.token = "";
      this.userCode = "";
      this.userName = "";
      this.loginErrorMsg = "";

      try {
        const response = await AuthService.login(username, password);
        const respData = response.data;

        if (respData.success && respData.data && respData.data.length > 0) {
          const user = respData.data[0];
          this.loginSuccess = true;
          localStorage._token = user.user_code;
          localStorage._usercode = user.user_code;
          localStorage._username = user.user_name || user.user_code;
          this.token = user.user_code;
          this.userCode = user.user_code;
          this.userName = user.user_name || user.user_code;
        } else {
          this.loginSuccess = false;
          this.loginErrorMsg = "รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        }
      } catch (err) {
        this.loginSuccess = false;
        this.loginErrorMsg = "ไม่สามารถเชื่อมต่อระบบได้";
        console.error(err);
      }
    },
    directSetToken(token) {
      localStorage._token = token;
      this.token = token;
    },
    logout() {
      localStorage._token = "";
      localStorage._usercode = "";
      localStorage._username = "";
      localStorage.is_update = "0";
      localStorage.is_approve = "0";
      localStorage.is_create = "0";
      localStorage.is_history = "0";
      localStorage.is_permission = "0";
      localStorage.is_print = "0";
      localStorage.is_report = "0";
      this.token = "";
      this.userCode = "";
      this.userName = "";
      router.push({ name: 'login' });
    },
    directLogout() {
      localStorage._token = "";
      localStorage._usercode = "";
      localStorage._username = "";
      this.token = "";
      this.userCode = "";
      this.userName = "";
      router.push({ name: 'login' });
    },
  },
});

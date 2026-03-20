

export default [
  {
    path: "/login",
    name: "login",
    meta: {
      auth: false,
      guest: true,
      forwordauth: true,
    },
    component: () => import("../pages/Login.vue"),
  },
  {
    path: "/",
    name: "",
    meta: {
      auth: true,
    },
    component: () => import("../pages/MainMenu.vue"),
  },
  {
    path: "/dashboard",
    name: "dashboard",
    meta: {
      auth: true,
    },
    component: () => import("../pages/Dashboard.vue"),
  },
  {
    path: "/mainmenu",
    name: "mainmenu",
    meta: {
      auth: true,
    },
    component: () => import("../pages/MainMenu.vue"),
  },
  {
    path: "/status-manage",
    name: "status_manage",
    meta: {
      auth: true,
    },
    component: () => import("../pages/StatusManage.vue"),
  },
  {
    path: "/summary-report",
    name: "summary_report",
    meta: {
      auth: true,
    },
    component: () => import("../pages/SummaryReport.vue"),
  },
];

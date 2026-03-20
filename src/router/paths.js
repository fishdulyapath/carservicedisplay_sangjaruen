

export default [
  {
    path: "/",
    name: "",
    meta: {
      auth: false,
    },
    component: () => import("../pages/MainMenu.vue"),
  },
    {
    path: "/dashboard",
    name: "dashboard",
    meta: {
      auth: false,
    },
    component: () => import("../pages/Dashboard.vue"),
  },
  {
    path: "/mainmenu",
    name: "mainmenu",
    meta: {
      auth: false,
    },
    component: () => import("../pages/MainMenu.vue"),
  },
  {
    path: "/status-manage",
    name: "status_manage",
    meta: {
      auth: false,
    },
    component: () => import("../pages/StatusManage.vue"),
  },
  {
    path: "/summary-report",
    name: "summary_report",
    meta: {
      auth: false,
    },
    component: () => import("../pages/SummaryReport.vue"),
  },
];



export default [
  {
    path: "/",
    name: "dashboard",
    meta: {
      auth: false,
    },
    component: () => import("../pages/Dashboard.vue"),
  },
  {
    path: "/customer/:id",
    name: "customer",
    meta: {
      auth: false,
    },
    component: () => import("../pages/CustomerDisplay.vue"),
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
    path: "/withdraw",
    name: "withdraw",
    meta: {
      auth: false,
    },
    component: () => import("../pages/Withdraw.vue"),
  },
  {
    path: "/repair",
    name: "repair",
    meta: {
      auth: false,
    },
    component: () => import("../pages/Repair.vue"),
  },
];

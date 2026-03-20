

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
    path: "/mainmenu",
    name: "mainmenu",
    meta: {
      auth: false,
    },
    component: () => import("../pages/MainMenu.vue"),
  },

];

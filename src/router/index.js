import { createRouter, createWebHistory } from "vue-router";

import paths from './paths'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: paths,
});

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem("_token");
  const isAuth = to.matched.some((record) => record.meta.auth);
  const isHide = to.matched.some((record) => record.meta.guest);
  const forwordauth = to.matched.some((record) => record.meta.forwordauth);

  if (isAuth && !loggedIn) {
    next({ name: "login" });
  } else if (isHide && loggedIn && forwordauth) {
    next({ name: "mainmenu" });
  } else {
    next();
  }
});

export default router;

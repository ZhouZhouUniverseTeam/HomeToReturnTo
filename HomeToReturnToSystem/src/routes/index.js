import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path:'/',
    redirect: '/welcome'
  },
  {
    path: "/home",
    name: 'Home',
    component: () => import('../views/Home/index.vue'),
  },
  {
    path: "/welcome",
    name: 'Welcome',
    component: () => import('../views/WelCome/index.vue'),
  },
  {
    path:'/provinceRanking',
    name: 'ProvinceRanking',
    component: () => import('../views/ProvinceRanking/index.vue'),
  },
  {
    path:'/rubbishClass',
    name: 'RubbishClass',
    component: () => import('../views/RubbishClass/index.vue')
  },
  {
    path:'/examination',
    name: 'Examination',
    component: () => import('../views/Examination/index.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

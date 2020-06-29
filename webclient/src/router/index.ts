import Vue from 'vue';
import VueRouter, { RouteConfig, NavigationGuard } from 'vue-router';
import Home from '../views/Home.vue';
import store from '../store';

Vue.use(VueRouter);

const loginGuard: NavigationGuard = (to, from, next) => {
  store.dispatch('user/getLocalUser');
  const user = store.getters['user/currentUser'];
  const { visible_level } = to.meta;
  if (!user.id) {
    next({
      name: 'login',
      query: {
        redirectPath: to.fullPath,
      },
    });
  } else if (!isNaN(visible_level) && user.admin_level < visible_level) {
    next({
      name: 'forbidden',
      query: {
        path: to.fullPath,
      },
    });
  } else {
    next();
  }
};

const fullUrlGuard: NavigationGuard = (to, from, next) => {
  const fullUrlReg = /^\/http/;
  if (fullUrlReg.test(to.fullPath)) {
    return (location.href = to.fullPath.substring(1));
  }
  next();
};

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    beforeEnter: loginGuard,
    redirect: '/projects',
    meta: {
      visible_level: 0,
    },
    children: [
      //---------------Project-------------------
      {
        path: '/project/create',
        name: 'projectCreate',
        component: () =>
          import(
            /* webpackChunkName: "projectconfig" */ '../views/ProjectConfig.vue'
          ),
        meta: {
          visible_level: 0,
        },
      },
      {
        path: '/projects',
        name: 'projects',
        component: () =>
          import(/* webpackChunkName: "projects" */ '../views/Projects.vue'),
        meta: {
          visible_level: 0,
        },
        props: route => ({
          page: +route.query.page || 1,
          created: route.query.created === 'true' || false,
          business: route.query.business === 'true' || false,
          keywords: route.query.keywords || '',
        }),
      },
      {
        path: '/project/:id',
        name: 'projectDetail',
        component: () =>
          import(/* webpackChunkName: "project" */ '../views/Project.vue'),
        meta: {
          visible_level: 0,
        },
      },
      {
        path: '/project/:id/edit',
        name: 'projectEdit',
        component: () =>
          import(
            /* webpackChunkName: "projectconfig" */ '../views/ProjectConfig.vue'
          ),
        meta: {
          visible_level: 0,
        },
      },
      {
        path: '/project/:id/stats',
        name: 'projectStats',
        component: () =>
          import(
            /* webpackChunkName: "projectStats" */ '../views/ProjectStats.vue'
          ),
        meta: {
          visible_level: 0,
        },
      },
      //---------------Job---------------------
      {
        path: '/project/:project_id/job/create',
        name: 'jobCreate',
        component: () =>
          import(/* webpackChunkName: "jobconfig" */ '../views/JobConfig.vue'),
        meta: {
          visible_level: 0,
        },
      },
      {
        path: '/project/:project_id/job/:id',
        name: 'jobDetail',
        component: () =>
          import(/* webpackChunkName: "job" */ '../views/Job.vue'),
        meta: {
          visible_level: 0,
        },
      },
      {
        path: '/project/:project_id/job/:id/edit',
        name: 'projectEdit',
        component: () =>
          import(/* webpackChunkName: "jobconfig" */ '../views/JobConfig.vue'),
        meta: {
          visible_level: 0,
        },
      },
      //---------------Build-------------------
      {
        path: '/project/:project_id/job/:job_id/build/:id',
        name: 'buildDetail',
        component: () =>
          import(/* webpackChunkName: "build" */ '../views/Build.vue'),
        meta: {
          visible_level: 0,
        },
      },
      //---------------Admin-------------------
      {
        path: '/admin/user',
        name: 'adminUser',
        component: () =>
          import(/* webpackChunkName: "adminuser" */ '../views/AdminUser.vue'),
        meta: {
          visible_level: 2,
        },
      },
      {
        path: '/admin/group',
        name: 'adminGroup',
        component: () =>
          import(
            /* webpackChunkName: "admingroup" */ '../views/AdminGroup.vue'
          ),
        meta: {
          visible_level: 1,
        },
      },
      //---------------GlobalStats-------------------
      {
        path: '/stats',
        name: 'globalStats',
        component: () =>
          import(
            /* webpackChunkName: "globalstats" */ '../views/GlobalStats.vue'
          ),
        meta: {
          visible_level: 0,
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () =>
      import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () =>
      import(/* webpackChunkName: "forbidden" */ '../views/Forbidden.vue'),
    beforeEnter: fullUrlGuard,
  },
  {
    path: '/*',
    name: 'notFound',
    component: () =>
      import(/* webpackChunkName: "notfound" */ '../views/NotFound.vue'),
    beforeEnter: fullUrlGuard,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;

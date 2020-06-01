import Vue from 'vue'
import VueRouter from 'vue-router'


const Login = () => import('../components/Login')
const Home = () => import('../components/Home')
const Welcome = () => import('../components/Welcome')
const User = () => import('../components/user/User')
const Permission = () => import('../components/permission/Permission')
const Roles = () => import('../components/permission/Roles')
const Category = () => import('../components/goods/Category')
const Params = () => import('../components/goods/Params')
const GoodsList = () => import('../components/goods/GoodsList')
const Add = () => import('../components/goods/Add')
const Order = () => import('../components/order/Order')
const Report = () => import('../components/report/Report')

Vue.use(VueRouter)

 const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
   {
     path: '/home',
     component: Home,
     redirect: '/welcome',
     children: [
       {
         path: '/welcome',
         component: Welcome
       },
       {
         path: '/users',
         component: User
       },
       {
         path: '/roles',
         component: Roles
       },
       {
         path: '/rights',
         component: Permission
       },
       {
         path: '/categories',
         component: Category
       },
       {
         path: '/params',
         component: Params
       },
       {
         path: '/goods',
         component: GoodsList
       },
       {
         path: '/goods/add',
         component: Add
       },
       {
         path: '/orders',
         component: Order
       },
       {
         path: '/reports',
         component: Report
       }
     ]
   }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()

  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login')
  next();
})


export default router

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  {path: '/login', component: () => import('@/views/login/index'), hidden: true},
  {path: '/404', component: () => import('@/views/404'), hidden: true},
  {
    path: '',
    component: Layout,
    redirect: '/home',
    meta: {title: '首页', icon: 'home'},
    children: [{
      path: 'home',
      name: 'home',
      component: () => import('@/views/home/index'),
      meta: {title: '首页', icon: 'home'}
    }
    ]
  }
]

export const asyncRouterMap = [
  {
    path: '/custorder',
    component: Layout,
    redirect: '/custorder/custorder',
    name: 'custorder',
    meta: {title: '客户订单', icon: 'product'},
    children: [
      {
        path: 'custorder',
        name: 'custorder',
        component: () => import('@/views/oms/custOrder/index'),
        meta: {title: '客户订单列表', icon: 'product-list'}
      },
      {
        path: 'addCustOrder',
        name: 'addCustOrder',
        component: () => import('@/views/oms/custOrder/add'),
        meta: {title: '客户下单'},
        hidden:true
      },
      {
        path: 'updateCustOrder',
        name: 'updateCustOrder',
        component: () => import('@/views/oms/custOrder/update'),
        meta: {title: '客户订单修改'},
        hidden:true
      },
    ]
  },
  {
    path: '/oms',
    component: Layout,
    redirect: '/oms/shipOrder',
    name: 'oms',
    meta: {title: '运单管理', icon: 'order'},
    children: [
      {
        path: 'shipOrder',
        name: 'shipOrder',
        component: () => import('@/views/oms/shipOrder/index'),
        meta: {title: '运单配载', icon: 'order-return-reason'}
      },
      {
        path: 'addShipOrder',
        name: 'addShipOrder',
        component: () => import('@/views/oms/shipOrder/add'),
        meta: {title: '运单配载维护'},
        hidden:true
      },
      {
        path: 'viewShipOrder',
        name: 'viewShipOrder',
        component: () => import('@/views/oms/shipOrder/view'),
        meta: {title: '运单配载详情'},
        hidden:true
      },
      {
        path: 'updateShipOrder',
        name: 'updateShipOrder',
        component: () => import('@/views/oms/shipOrder/update'),
        meta: {title: '运单配载修改'},
        hidden:true
      },
      {
        path: 'customsDeclaration',
        name: 'customsDeclaration',
        component: () => import('@/views/oms/customsDeclaration/index'),
        meta: {title: '报关单'},
        hidden:true
      }
    ]
  },
  {
    path:'/settlement',
    component: Layout,
    redirect: '/settlement/settlement',
    name: 'settlement',
    meta: {title: '结算账单', icon: 'sms'},
    children: [
      {
        path: 'settlement',
        name: 'settlement',
        component: () => import('@/views/oms/settlement/index'),
        meta: {title: '结算账单', icon: 'sms-coupon'}
      }
    ]
  },
  {
    path:'/sys',
    component: Layout,
    redirect: '/sys/baseData',
    name: 'sys',
    meta: {title: '数据管理', icon: 'table'},
    children: [
      {
        path: 'baseData',
        name: 'baseData',
        component: () => import('@/views/ums/sys/index'),
        meta: {title: '基础数据', icon: 'product-cate'}
      }
    ]
  },
  {
    path:'/ums',
    component: Layout,
    redirect: '/ums/admin',
    name: 'ums',
    meta: {title: '权限', icon: 'ums'},
    children: [
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/ums/admin/index'),
        meta: {title: '用户列表', icon: 'ums-admin'}
      },
      {
        path: 'role',
        name: 'role',
        component: () => import('@/views/ums/role/index'),
        meta: {title: '角色列表', icon: 'ums-role'}
      },
      {
        path: 'allocMenu',
        name: 'allocMenu',
        component: () => import('@/views/ums/role/allocMenu'),
        meta: {title: '分配菜单'},
        hidden: true
      },
      {
        path: 'allocResource',
        name: 'allocResource',
        component: () => import('@/views/ums/role/allocResource'),
        meta: {title: '分配资源'},
        hidden: true
      },
      {
        path: 'menu',
        name: 'menu',
        component: () => import('@/views/ums/menu/index'),
        meta: {title: '菜单列表', icon: 'ums-menu'}
      },
      {
        path: 'addMenu',
        name: 'addMenu',
        component: () => import('@/views/ums/menu/add'),
        meta: {title: '添加菜单'},
        hidden: true
      },
      {
        path: 'updateMenu',
        name: 'updateMenu',
        component: () => import('@/views/ums/menu/update'),
        meta: {title: '修改菜单'},
        hidden: true
      },
      {
        path: 'resource',
        name: 'resource',
        component: () => import('@/views/ums/resource/index'),
        meta: {title: '资源列表', icon: 'ums-resource'}
      },
      {
        path: 'resourceCategory',
        name: 'resourceCategory',
        component: () => import('@/views/ums/resource/categoryList'),
        meta: {title: '资源分类'},
        hidden: true
      },
    ]
  },
  {path: '*', redirect: '/404', hidden: true}
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})


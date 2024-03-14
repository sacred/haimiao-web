import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/custOrder/list',
    method:'post',
    data: params
  })
}

export function cancelOrder(params) {
  return request({
    url:'/custOrder/cancel',
    method:'post',
    params:params
  })
}

export function getCustOrderInfo(id) {
  return request({
    url:'/custOrder/info/'+id,
    method:'get',
  })
}

export function createCustOrder(params) {
  return request({
    url:'/custOrder/create',
    method:'post',
    data: params
  })
}

export function updateCustOrder(params) {
  return request({
    url:'/custOrder/update',
    method:'post',
    data: params
  })
}
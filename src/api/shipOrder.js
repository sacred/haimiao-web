import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/loading/list',
    method:'post',
    data: params
  })
}

export function getShipOrderInfo(id) {
  return request({
    url:'/loading/info/'+id,
    method:'get',
  })
}

export function getGoodsDetail(id) {
  return request({
    url:'/loading/goodsDetail/'+id,
    method:'get'
  })
}

export function createShipOrder(params) {
  return request({
    url:'/loading/create',
    method:'post',
    data: params
  })
}

export function updateShipOrder(params) {
  return request({
    url:'/loading/update',
    method:'post',
    data: params
  })
}

export function getUnLoadingGoodsInfo(params) {
  return request({
    url:'/loading/getUnLoadingGoods',
    method:'post',
    data: params
  })
}

export function generateCustomsDeclaration(id) {
  return request({
    url:'/loading/genCustDeclaration/'+ id,
    method:'post'
  })
}

export function loadCustomsDeclaration(id) {
  return request({
    url:'/loading/getCustDeclarationInfo/'+ id,
    method:'get'
  })
}

export function loadingConfirm(params) {
  return request({
    url:'/loading/confirm/loading',
    method:'post',
    params: params
  })
}

export function sendingConfirm(params) {
  return request({
    url:'/loading/confirm/sending',
    method:'post',
    params: params
  })
}
import request from '@/utils/request'

export function fetchOptions(enumType) {
    return request({
        url:'/sysEnum/list/' + enumType,
        method:'get'
    })
}

export function getOption(enumType, param) {
    return request({
        url:'/sysEnum/getByCode/' + enumType,
        method:'get',
        param: param
    })
}

export function addOptions(param) {
    return request({
        url:'/sysEnum/create/',
        method:'post',
        data: param
    })
}

export function updateOptions(param) {
    return request({
        url:'/sysEnum/update/',
        method:'post',
        data: param
    })
}

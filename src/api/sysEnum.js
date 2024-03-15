import request from '@/utils/request'

export function listOptions(param) {
    return request({
        url:'/sysEnum/list',
        method:'get',
        params: param
    })
}

export function fetchOptions(param) {
    param.state = 1;
    return request({
        url:'/sysEnum/list',
        method:'get',
        params: param
    })
}

export function getOption(param) {
    return request({
        url:'/sysEnum/getByCode',
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

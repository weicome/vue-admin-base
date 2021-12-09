import request from '@/utils/request'

export function getList() {
  return request({
    url: '/admin',
    method: 'get'
  })
}

export function addAdmin(data) {
  return request({
    url: '/admin',
    method: 'post',
    data
  })
}

export function upAdmin(data) {
  return request({
    url: '/admin/' + data.id,
    method: 'put',
    data
  })
}
export default {
  getList,
  addAdmin,
  upAdmin
}

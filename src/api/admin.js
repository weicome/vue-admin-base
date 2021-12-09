import request from '@/utils/request'

export function getList(query) {
  return request({
    url: '/admin',
    method: 'get',
    param: query
  })
}

export function addAdmin(data) {
  console.log(data)
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
export function delAdmin(id) {
  return request({
    url: '/admin/' + id,
    method: 'delete'
  })
}
export default {
  getList,
  addAdmin,
  upAdmin,
  delAdmin
}

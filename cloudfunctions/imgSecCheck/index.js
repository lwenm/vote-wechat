const cloud = require('wx-server-sdk')
 
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
 
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.security.imgSecCheck({
      media: ({
        header: {
          'Content-Type': 'application/octet-stream'
        },
        contentType: 'image/png',
        value: Buffer.from(event.img)   // 这里必须要将小程序端传过来的进行Buffer转化,否则就会报错,接口异常
      })
    })
    return ({ code: 200, msg: '成功', data: result })
  } catch (err) {
    // 错误处理
    return ({ code: 502, msg: '调用imgSecCheck接口异常', data: err })
  }
}
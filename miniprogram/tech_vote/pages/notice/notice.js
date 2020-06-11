let app = getApp();
Page({
  data: {
    noticeData:{}
  },
  bindCopyTap:function(){
    let data = "tech_vote/pages/index/index?id=" + this.data.noticeData.id
    wx.setClipboardData({
      data: data,
      success(res) {
        wx.showModal({
          title: '提示',
          content: '链接已成功复制到剪贴板！',
          showCancel:false
        })
      }
    })
  },
  onLoad: function (options) {
    console.log(options);
    app.util.setNBT(app.globalData.app_name);
    let data = JSON.parse(options.data);
    this.setData({
      noticeData: data,
      self: options.self
    })
  },
})
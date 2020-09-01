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
    console.log(options, 'onload');
    app.util.setNBT(app.globalData.app_name);
    this.init(options);
  },
  init: function (options) {
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=activity.detail.display',
      'cachetime': '0',
      data: {
        id: options.id,
        pindex: 1,
        order: 1
      },
      success: function(res) {
        let datalist = res.data.data;
        that.setData({
          noticeData: datalist.activity,
          self: options.self
        })
      }
    });
  }
})
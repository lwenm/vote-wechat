let  app = getApp();
Page({
  data: {

  },
  gocenter(){
    wx.navigateTo({
      url: '../center/center',
    })
  },
  golist(){
    wx.navigateTo({
      url: '../list/list',
    })
  },
  goshouquan(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
  goactivity:function(){
    wx.navigateTo({
      url: '../index/index?id=76',
    })
  },
  gocheck:function(){
    wx.navigateTo({
      url: '../check/check',
    })
  },
  gobm:function(){
    wx.navigateTo({
      url: '../enter/enter',
    })
  },
  goPageA:function(){
    
  },
  setVoteStorage: function () {
    let that = this;
    wx.setStorage({
      key: 'voteDraft',
      data: app.datalist,
    })
  },
  onLoad: function (options) {
    app.util.setNBT(app.globalData.app_name);
  }
})
// miniprogram/tech_vote/pages/success/success.js
let app= getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    last_everyday_num: 0,
    type: null,
    message: '',
    obj: {},
    isShareShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.id = options.id
    this.setData({
      type: parseInt(options.type),
      message: options.message,
      obj: {
        shareTitle: options.shareTitle,
        shareName: options.shareName,
        shareUrl: options.shareUrl
      }
    })
    const that = this;
    app.util.request({
      url: 'entry/wxapp/wxapp&r=vote.vote.doshow',
      data: {
        id: this.id
      },
      success: function(res) {
        if(res.data.errno == 0) {
          that.setData({
            last_everyday_num: parseInt(res.data.data.data.last_everyday_num)
          })
        }
      }
    })
  },
  backPage () {
    wx.navigateBack({
      url: '../votedetail/votedetail?id=' + this.id,
    })
  },
  bindShareTap () {
    this.setData({
      isShareShow: !this.data.isShareShow,
    })
  },
  bindcat () {

  },
  bindPosterTap:function(){
    this.setData({
      isShareShow:false
    })
    wx.navigateTo({
      url: '../poster/poster?id=' + this.id+'&source=2',
    })
  },
  navigateToList () {
    wx.switchTab({
      url: '/tech_vote/pages/list/list',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '投票结果'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    return {
      title: that.data.obj.shareName+'正在参加投票活动，点进来帮他投一票吧',
      path: "/tech_vote/pages/votedetail/votedetail?id="+that.id,
      imageUrl: that.data.obj.shareUrl
    }
  }
})
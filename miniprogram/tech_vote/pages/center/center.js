let app = getApp();
Page({

  data: {
    canRefresh: true,
  },
  
  makePhoneCall:function(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phonenum,
    })
  },
  bindGZHTap:function(){
    wx.navigateTo({
      url: './connect/connect',
    })
  },
  bindQSTap:function(){
    wx.navigateTo({
      url: './question/question',
    })
  },
  bindAllVoteTap:function(e){
    wx.navigateTo({
      url: './votelist/votelist?type='+e.currentTarget.dataset.type,
    })
  },
  bindAdTap:function(e){
    wx.navigateTo({
      url: '../webview/webview?datasrc=' + encodeURIComponent(e.currentTarget.dataset.url),
    })
  },
  bindPublishTap: function (e) {
    let that = this;
      wx.getStorage({
        key: 'voteDraft',
        success: function (res) {
          console.log(res);
          app.datalist = res.data;
          //有缓存
          wx.showModal({
            title: '提示',
            content: '有上次未发布的草稿，是否继续使用',
            cancelText: '不使用',
            confirmText: '继续使用',
            confirmColor: "#f75360",
            success: function (res) {
              if (res.confirm) {
                //继续使用，取缓存数据
                wx.navigateTo({
                  url: '../publishlist/publishA/publishA?formid=' + e.detail.formId,
                })
              } else if (res.cancel) {
                app.datalist = {};
                wx.removeStorage({
                  key: 'voteDraft',
                  success(res) { }
                })
                wx.navigateTo({
                  url: '../publishlist/publishA/publishA?formid=' + e.detail.formId,
                })
              }
            }
          })
        },
        fail: function () {
          //无缓存数据 第一次编辑
          app.datalist.thumb = [],
            app.datalist.title = '';
          app.datalist.intro = '';
          app.datalist.intro_image = [];
          that.setVoteStorage();
          wx.navigateTo({
            url: '../publishlist/publishA/publishA?formid=' + e.detail.formId,
          })
        }
      })
    
    
  },
  setVoteStorage: function () {
    let that = this;
    wx.setStorage({
      key: 'voteDraft',
      data: app.datalist,
    })
  },
  init:function(){
    let that=this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=mine.index.display',
      'cachetime': '0',
      method: "post",
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        that.data.canRefresh = true;
        if (datalist.globaldata.fun_activity_publish == '0' && app.tabBar.list[2]) {
          var tabBarlist = [app.tabBar.list[0], app.tabBar.list[2]];
          app.tabBar.list = tabBarlist;
        }
        app.util.footer(that);
        that.setData({
          activity_bm_num: datalist.data.activity_bm_num,
          activity_cy_num: datalist.data.activity_cy_num,
          activity_fq_num: datalist.data.activity_fq_num,
          nickname: datalist.data.nickname,
          headimgurl: datalist.data.headimgurl,
          adlist: datalist.data.adinfo,
        })
      }
    })
  },
  onLoad:function(opt){
    var that = this;
    if (app.globalData){
      app.util.setNBT(app.globalData.app_name);
    }
    app.util.resizeFooter(that);
    wx.hideTabBar();
    that.init();
    console.log(app);
    if (app.globalData && app.globalData.getinfo==1){
      wx.redirectTo({
        url: '../login/login?source=center',
      })
    }
  },
  onPullDownRefresh:function(){
    let that =this;
    if (that.data.canRefresh) {
      that.data.canRefresh = false;
      that.init();
      wx.stopPullDownRefresh();
    }
  }
})
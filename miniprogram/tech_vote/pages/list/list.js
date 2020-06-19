let app = getApp();
Page({


  data: {
    votelist: [],
    pindex: 1,
    isend: false,
    isloading: false,
    canRefresh: true,
    isendT:false
  },
  bindPublishTap: function(e) {
    let that = this;
    console.log(e);
      if (app.globalData.getinfo == 1) {
        wx.navigateTo({
          url: '../login/login?source=home',
        })
      } else {
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
      }
    
   

  },
  setVoteStorage: function() {
    let that = this;
    wx.setStorage({
      key: 'voteDraft',
      data: app.datalist,
    })
  },
  bindDetailTap: function(e) {
    wx.navigateTo({
      url: '../index/index?id=' + e.currentTarget.dataset.id
    })
  },
  loadData: function() {
    let that = this;
    that.setData({
      isloading: true,
    }) 
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=activity.list.display',
      'cachetime': '0',
      method: "post",
      data: {
        pindex: that.data.pindex
      },
      success(res) {
        console.log(res);
        that.data.canRefresh = true;
        let datalist = res.data.data;

        app.globalData = datalist.globaldata;
        app.util.setNBT(app.globalData.app_name);
        if (datalist.globaldata.fun_activity_publish == '0' && app.tabBar.list[2]) {
          var tabBarlist = [app.tabBar.list[0], app.tabBar.list[2]];
          app.tabBar.list = tabBarlist;
        }
        app.util.footer(that);
        that.setData({
          votelist: that.data.votelist.concat(datalist.data),
          pindex: ++that.data.pindex,
          isloading: false,
          blacklist: datalist.blacklist ? datalist.blacklist:''
        })
        if (datalist.data.length < 1 && that.data.pindex==2) {
          that.setData({
            isendT: true
          })
        } else if (datalist.data.length < 10){
          that.setData({
            isend: true,
          })
        }else{
          that.setData({
            isend: false,
          })
        }
      },
      fail(err) {
        console.log(err, 'err')
      }
    })
  },
  onShow: function () {
    app.util.ad_cp(0);
    if (app.id && app.id != '') {
      wx.navigateTo({
        url: '../index/index?id=' + app.id,
      });
    }
  },
  onLoad: function(options) {
    var that = this;
    that.loadData();
    app.util.resizeFooter(that)
    wx.hideTabBar();
  },
  onReachBottom: function() {
    let that = this;
    if (!that.data.isend) {
      that.loadData();
    }
  },
  onPullDownRefresh: function() {
    let that = this;
    that.setData({
      pindex: 1,
      isend: false,
      isloading: false,
      votelist: [],
      isendT: false,
    });
    if (that.data.canRefresh) {
      that.data.canRefresh = false;
      that.loadData();
      wx.stopPullDownRefresh();
    }

  }
})
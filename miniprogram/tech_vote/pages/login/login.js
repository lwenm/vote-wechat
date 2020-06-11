
 let app = getApp();
Page({
  data: {
    isload:false
  },
  
  updateUserInfo(result) {
    var that =this;
    //拿到用户数据时，通过app.util.getUserinfo将加密串传递给服务端
    //服务端会解密，并保存用户数据，生成sessionid返回
    app.util.getUserInfo(function (userInfo) {
      //这回userInfo为用户信息
      console.log(userInfo);
      if (userInfo.memberInfo) {
        app.userMsg = userInfo;
        app.globalData.getinfo = 0;
        switch(that.data.source){
          case "home":
           that.gopublish();
            break;
          case "center":
            wx.switchTab({
              url: '../center/center',
            })
            break;
          case "baoming":
            wx.redirectTo({
              url: '../enter/enter?id='+that.data.id,
            })
            break;
          case "gift":
            wx.navigateBack({
              delta:1,
              data:{
                canrefesh:true
              }
            })
            break;
        }
      } else {
        if (that.data.source == 'center') {
          wx.switchTab({
            url: '../list/list',
          })
        } else {
          app.util.navigateBack({
            data: {
              needrefresh: true,
              canrefesh: true
            }
          })
        }
      }
      
    }, result.detail)
  },
  gopublish:function(){
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
          success: function (res) {
            if (res.confirm) {
              //继续使用，取缓存数据
              wx.navigateTo({
                url: '../publishlist/publishA/publishA',
              })
            } else if (res.cancel) {
              app.datalist = {};
              wx.removeStorage({
                key: 'voteDraft',
                success(res) { }
              })
              wx.navigateTo({
                url: '../publishlist/publishA/publishA',
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
          url: '../publishlist/publishA/publishA',
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
  init(){
    var that = this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=login',
      'cachetime': '0',
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        that.setData({
          appInfo: datalist.data,
          isload:true
        });
      }
    })
  },
  onLoad: function (options) {
    var that=this;
    that.setData({
      source: options.source
    })
    if(options.id){
      that.setData({
        id: options.id
      })
    }
    app.util.setNBT(app.globalData.app_name);
    that.init();
  },
  gofanhui: function () {
    var that = this;
    if (that.data.source == 'center') {
      wx.switchTab({
        url: '../list/list',
      })
    } else {
      app.util.navigateBack({
        data: {
          needrefresh: true,
          canrefesh: true
        }
      })
    }
  }

})
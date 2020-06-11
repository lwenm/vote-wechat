let app = getApp();
Page({

  data: {
    isload:false,
    imgurl:''
  },
  bindSaveImageTap:function(){
    let that = this;
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success() {
        wx.downloadFile({
          url: that.data.imgurl,
          success:function(res){
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                console.log(res);
                // wx.showToast({
                //   title: '保存成功！'
                // });
                wx.showModal({
                  title: '提示',
                  content: '图片已成功保存到您的手机相册!',
                  showCancel:false
                })
              }
            })
          }, 
        })
       
      },
      fail() {
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.writePhotosAlbum']) {
              wx.showModal({
                title: '提示',
                content: '需要您授权使用保存图片功能！',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success(res) {
                        if (res.authSetting['scope.writePhotosAlbum']) {
                          wx.showModal({
                            title: '提示',
                            content: '授权成功，请保存图片！',
                            showCancel: false,
                            success: function () {
                            }
                          })
                        } else {
                          wx.showModal({
                            title: '提示',
                            content: '请允许使用保存图片功能',
                            showCancel: false,
                            success: function () {
                            }
                          })
                        }
                      }

                    })
                  }
                }
              })
            } 
          }
        })
      }
    })
  },
  imgload:function(){
    this.setData({
      isload:true
    })
  },
  getposter:function(url,id){
    let that =this;
    app.util.request({
      'url': url,
      'cachetime': '0',
      data: {
        id: id
      },
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        if(datalist.code==1){
          that.setData({
            imgurl: datalist.data
          })
        }else{
          app.util.message(datalist.message)
        }
      }
    })
  },
  onLoad: function (options) {
    console.log(options);
    app.util.setNBT(app.globalData.app_name);
    app.util.resizeFooter(this);
    if(options.source==1){
      this.getposter('entry/wxapp/wxapp&r=activity.detail.activity_poster',options.id);
    }else{
      this.getposter('entry/wxapp/wxapp&r=join.index.join_poster', options.id);
    }
  }
})
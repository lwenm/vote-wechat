let app=getApp();
Page({
  data: {
    name:'',
    intro:'',
    thumb:[],
    share_thumb:[],
    phone:'',
    wechat:'',
    updata: false
  },
  bindSubmitTap:function(){
    let that = this;
    if (!that.data.name){
      wx.showModal({
        title: '提示',
        content: '请输入参赛名称',
        showCancel:false,
      })
      return false;
    }
    if (!that.data.intro) {
      wx.showModal({
        title: '提示',
        content: '请输入参赛介绍',
        showCancel: false,
      })
      return false;
    }
    if (that.data.thumb.length<1) {
      wx.showModal({
        title: '提示',
        content: '请上传参赛图片',
        showCancel: false,
      })
      return false;
    }
    
    if (that.data.sign_phone_need==1){
      if (!(/^1[345789]\d{9}$/.test(that.data.phone))){
        wx.showModal({
          title: '提示',
          content: '请输入正确的联系电话',
          showCancel: false,
        })
        return false;
      }
    }
    if (that.data.sign_wechat_need == 1) {
      if (!that.data.wechat) {
        wx.showModal({
          title: '提示',
          content: '请输入微信号',
          showCancel: false,
        })
        return false;
      }
    }
    that.setData({
      updata: true
    });
    let data={
      name: that.data.name,
      intro: that.data.intro,
      thumb: that.data.thumb,
      share_thumb: that.data.share_thumb,
      phone: that.data.phone,
      wechat: that.data.wechat,
      activity_id: that.activity_id
    }
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=join.index.dojoin',
      'cachetime': '0',
      'method':'post',
      data: data,
      success(res) {
        console.log(res);
        that.setData({
          updata: true
        });
        let datalist = res.data.data;
        if(datalist.code ==1){
          wx.showModal({
            title: '提示',
            content: datalist.message,
            showCancel:false,
            success:function(res){
              if(res.confirm){
                wx.reLaunch({
                  url: '../index/index?id=' + that.activity_id,
                })
              }
            }
          })
        }else{
          wx.showModal({
            title: '提示',
            content: datalist.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta:1
                })
              }
            }
          })
        }
      },
      fail(res) {
        wx.showModal({
          title: '提示',
          content: res.data.message,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }
    })
  },
  chooseShareThumb:function(){
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.uploadShareThumb(res.tempFilePaths, 0);
      }
    })
  },
  uploadShareThumb: function (tempPaths, pindex) {
    var that = this;
    var url = "entry/wxapp/wxapp&r=upload";
    var uploadUrl = app.util.uploadUrl(url)
    if (pindex < tempPaths.length) {
      wx.showLoading({ title: '上传中...' });
      wx.uploadFile({
        url: uploadUrl,
        filePath: tempPaths[pindex],
        name: 'file',
        formData: { type: "image" },
        header: { "Content-Type": "multipart/form-data" },
        success(res) {
          wx.hideLoading();
          const data = JSON.parse(res.data);
          if (data.code == 1) {
            pindex++;
            let temparr = [];
            temparr.push(data.path);
            that.setData({
              share_thumb: temparr
            })
            if (pindex < tempPaths.length) {
              that.uploadShareThumb(tempPaths, pindex);
            }
          } else {
            wx.showToast({
              title: data.message,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    }
  },
  choosethumb: function () {
    let that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.uploadThumb(res.tempFilePaths, 0);
      }
    })
  },
  uploadThumb: function (tempPaths, pindex) {
    var that = this;
    var url = "entry/wxapp/wxapp&r=upload";
    var uploadUrl = app.util.uploadUrl(url)
    if (pindex < tempPaths.length) {
      wx.showLoading({ title: '上传中...' });
      wx.uploadFile({
        url: uploadUrl,
        filePath: tempPaths[pindex],
        name: 'file',
        formData: { type: "image" },
        header: { "Content-Type": "multipart/form-data" },
        success(res) {
          wx.hideLoading();
          const data = JSON.parse(res.data);
          if (data.code == 1) {
            pindex++;
            let temparr = [];
            temparr.push(data.path);
            that.setData({
              thumb: that.data.thumb.concat(temparr)
            })
            if (pindex < tempPaths.length) {
              that.uploadThumb(tempPaths, pindex);
            }
          } else {
            wx.showToast({
              title: data.message,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    }
  },
  introImgDelete: function (e) {
    let index = e.currentTarget.dataset.index,
      that = this, thumb = that.data.thumb;
    thumb.splice(index, 1);
    that.setData({
      thumb: thumb
    });
  },
  bindPhoneInput: function (e) {
    let that = this;
    that.setData({
      phone: e.detail.value
    })
  },
  bindWeChatInput: function (e) {
    let that = this;
    that.setData({
      wechat: e.detail.value
    })
  },
  bindIntroInput: function (e) {
    let that = this;
    that.setData({
      intro: e.detail.value
    })
  },
  bindNameInput:function(e){
    let that=this;
    that.setData({
      name:e.detail.value
    })
  },
  init:function(data){
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=join.index.getjoin',
      'cachetime': '0',
      data: data,
      success(res) {
        console.log(res);
        if(res.data.data.code==1){
          wx.showModal({
            title: '提示',
            content: res.data.data.message,
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }else{
          let datalist = res.data.data;
          if (datalist.blacklist == 1) {
            wx.showModal({
              title: '提示',
              content: '您已被拉黑！',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
          app.domainPath = app.domainPath == '' ? datalist.attachurl : app.domainPath;
          that.setData({
            attachurl: app.domainPath,
            sign_phone_need: datalist.data.sign_phone_need,
            sign_wechat_need: datalist.data.sign_wechat_need,
            sign_enabled: datalist.data.sign_enabled,
          })
        }
        
      }
    })
  },
  onLoad: function (options) {
    let data = { activity_id: options.id, formid: options.formid}
    this.activity_id = options.id;
    this.init(data);
    app.util.setNBT(app.globalData.app_name);
  }
})
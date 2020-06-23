let app = getApp();
Page({

  data: {
    reward_image: [],
    updata: false
  },
  bindLastTap: function() {
    app.util.navigateBack({});
  },
  formSubmit: function(e) {
    let that = this;
    
    console.log(app);
    that.setData({
      updata: true,
    })
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=activity.publish.save',
      'cachetime': '0',
      method: "post",
      data: {
        id: that.id,
        thumb: app.datalist.thumb,
        title: app.datalist.title, //标题
        intro: app.datalist.intro, //介绍
        intro_img: app.datalist.intro_img,
        reward: app.datalist.reward, //奖励
        reward_image: app.datalist.reward_image,
        tp_repeat_enabled: app.datalist.tp_repeat_enabled, //是否重复投票
        tp_check_enabled: app.datalist.tp_check_enabled, //是否验证投票
        tp_everyday_num: app.datalist.tp_everyday_num, //每日投票次数
        dq_enabled: app.datalist.dq_enabled, //地区限制开关
        dq_value: app.datalist.dq_value, //活动限制地区
        dq_ip_num: app.datalist.dq_ip_num, //同意IP投票数
        share_thumb: app.datalist.share_thumb, //活动分享图片
        sponsor_enabled: app.datalist.sponsor_enabled, //主办方是否填写
        sponsor_name: app.datalist.sponsor_name, //主办方名称
        sponsor_phone: app.datalist.sponsor_phone, //主办方电话
        sign_enabled: app.datalist.sign_enabled, //是否开放报名
        sign_phone_need: app.datalist.sign_phone_need, //是否需要报名电话
        sign_wechat_need: app.datalist.sign_wechat_need, //报名者微信号
        sign_start_date: app.datalist.sign_start_date, //报名开始时间
        sign_start_time: app.datalist.sign_start_time,
        sign_stop_date: app.datalist.sign_stop_date,
        sign_stop_time: app.datalist.sign_stop_time,
        vote_start_date: app.datalist.vote_start_date,
        vote_start_time: app.datalist.vote_start_time,
        vote_stop_date: app.datalist.vote_stop_date,
        vote_stop_time: app.datalist.vote_stop_time, //投票结束时间
        list_enabled: app.datalist.list_enabled
      },
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        wx.hideLoading();
        that.setData({
          updata: false
        })
        app.datalist = {};
        app.id = datalist.data;
        wx.removeStorage({
          key: 'voteDraft',
          success(res) {}
        })
        wx.showModal({
          title: '提示',
          content: res.data.message,
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../../list/list',
              })
              
            }
          }
        })
      },
      fail(res) {
        wx.showModal({
          title: '提示',
          content: res.data.message,
          showCancel: false
        })
        wx.hideLoading();
        that.setData({
          updata: false
        })
      }
    });
  },
  introImgDelete: function(e) {
    let index = e.currentTarget.dataset.index,
      that = this,
      imagelist = that.data.reward_image;
    imagelist.splice(index, 1);
    that.setData({
      reward_image: imagelist
    });
    app.datalist.reward_image = that.data.reward_image;
    that.setVoteStorage();
  },
  bindIntroInput: function(e) {
    var reward = e.detail.value;
    this.setData({
      reward: reward
    });
    app.datalist.reward = this.data.reward;
    this.setVoteStorage();
  },
  bindAddImg: function() {
    let that = this;
    that.data.reward_image.length < 10 ? that.chooseIntroImages() : wx.showModal({
      title: '提示',
      content: '您最多上传10张图片',
      showCancel: false,
      success: function() {}
    })
  },
  chooseIntroImages: function() {
    let that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.uploadIntroImages(res.tempFilePaths, 0);
      }
    })
  },
  uploadIntroImages: function(tempPaths, pindex) {
    var that = this;
    var url = "entry/wxapp/wxapp&r=upload";
    var uploadUrl = app.util.uploadUrl(url)
    if (pindex < tempPaths.length) {
      wx.showLoading({
        title: '上传中...'
      });
      wx.uploadFile({
        url: uploadUrl,
        filePath: tempPaths[pindex],
        name: 'file',
        formData: {
          type: "image"
        },
        header: {
          "Content-Type": "multipart/form-data"
        },
        success(res) {
          wx.hideLoading();
          const data = JSON.parse(res.data);
          if (data.code == 1) {
            pindex++;
            that.setData({
              reward_image: that.data.reward_image.concat(data.path)
            })
            app.datalist.reward_image = that.data.reward_image;
            that.setVoteStorage();
            if (pindex < tempPaths.length) {
              that.uploadIntroImages(tempPaths, pindex);
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
  setVoteStorage: function() {
    let that = this;
    wx.setStorage({
      key: 'voteDraft',
      data: app.datalist,
    })
  },
  onLoad: function(options) {
    let that = this;
    app.util.resizeFooter(that);
    app.util.setNBT(app.globalData.app_name);
    that.id = options.id ? options.id : '';
    that.setData({
      reward: app.datalist.reward ? app.datalist.reward : '',
      reward_image: app.datalist.reward_img ? app.datalist.reward_img : [],
      attachurl: app.domainPath,
    });
    app.datalist.reward = that.data.reward;
    app.datalist.reward_image = that.data.reward_image;
    that.setVoteStorage();
  }
})
let app = getApp();
Page({
  data: {
    sign_enabled:false,
    sign_phone_need: false,
    sign_wechat_need:false,
    zbfMsgOption: false,
    sponsor_name:'',
    sponsor_phone:'',
    sponsor_wechat:[],
  },
  bindLastTap: function () {
    app.util.navigateBack({});
  },
  nextPage: function () {
    let that = this;
    let voteStartTime = Date.parse(that.data.vote_start_date.replace(/-/g, '/') + ' ' + that.data.vote_start_time);
    let voteStopTime = Date.parse(that.data.vote_stop_date.replace(/-/g, '/') + ' ' + that.data.vote_stop_time);
    let thisTime = Date.parse(new Date());
    if (voteStopTime <= voteStartTime){
      wx.showToast({
        title: '投票结束时间必须大于开始时间！',
        icon:'none'
      });
      return  false;
    }
    if (voteStopTime < thisTime) {
      wx.showToast({
        title: '投票结束时间必须大于等于当前时间！',
        icon: 'none'
      });
      return false;
    }
    if (that.data.sign_enabled){
      let signStartTime = Date.parse(that.data.sign_start_date.replace(/-/g, '/') + ' ' + that.data.sign_start_time);
      let signStopTime = Date.parse(that.data.sign_stop_date.replace(/-/g, '/') + ' ' + that.data.sign_stop_time);
      if (signStartTime >= signStopTime){
        wx.showToast({
          title: '报名结束时间必须大于开始时间！',
          icon: 'none'
        });
        return false;
      }
      if (signStopTime > voteStopTime) {
        wx.showToast({
          title: '报名结束时间不得大于投票结束时间！',
          icon: 'none'
        });
        return false;
      }
    }
    //主办方信息
    if (that.data.zbfMsgOption){
      if (!that.data.sponsor_name){
        wx.showToast({
          title: '请填写主办方名称',
          icon: 'none'
        });
        return false;
      }
      let valid_rule = /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/;// 手机号码
      if (!(valid_rule.test(that.data.sponsor_phone))) {
        wx.showToast({
          title: '请填写正确的主办方电话',
          icon: 'none'
        });
        return false;
      }
    }
    let url = this.id ? '../publishC/publishC?id=' + this.id : '../publishC/publishC';
    wx.navigateTo({
      url: url,
    })
  },
  bindDateChange:function(e){
    let datetype = e.currentTarget.dataset.datetype,
      that = this;
    switch (datetype) {
      case "bmStart":
        that.setData({
          sign_start_date: e.detail.value
        })
        app.datalist.sign_start_date = that.data.sign_start_date
        that.setVoteStorage();
        break;
      case "bmEnd":
        that.setData({
          sign_stop_date: e.detail.value
        })
        app.datalist.sign_stop_date = that.data.sign_stop_date
        that.setVoteStorage();
        break;
      case "tpStart":
        that.setData({
          vote_start_date: e.detail.value
        })
        app.datalist.vote_start_date = that.data.vote_start_date
        that.setVoteStorage();
        break;
      case "tpEnd":
        that.setData({
          vote_stop_date: e.detail.value
        })
        app.datalist.vote_stop_date = that.data.vote_stop_date
        that.setVoteStorage();
        break;
    }
  },
  bindTimeChange: function (e) {
    console.log(e)
    let datetype = e.currentTarget.dataset.datetype,
      that = this;
    switch (datetype) {
      case "bmStart":
        that.setData({
          sign_start_time: e.detail.value
        })
        app.datalist.sign_start_time = that.data.sign_start_time
        that.setVoteStorage();
        break;
      case "bmEnd":
        that.setData({
          sign_stop_time: e.detail.value
        })
        app.datalist.sign_stop_time = that.data.sign_stop_time
        that.setVoteStorage();
        break;
      case "tpStart":
        that.setData({
          vote_start_time: e.detail.value
        })
        app.datalist.vote_start_time = that.data.vote_start_time
        that.setVoteStorage();
        break;
      case "tpEnd":
        that.setData({
          vote_stop_time: e.detail.value
        })
        app.datalist.vote_stop_time = that.data.vote_stop_time
        that.setVoteStorage();
        break;
    }
  },
 
  bindzbfCode: function () {
    let that = this;
    wx.chooseImage({
      count: 1,
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
          pindex++;
          let temparr = [];
          temparr.push(data.path);
          that.setData({
            sponsor_wechat: temparr
          })
          app.datalist.sponsor_wechat = that.data.sponsor_wechat;
          that.setVoteStorage();
          if (pindex < tempPaths.length) {
            that.uploadThumb(tempPaths, pindex);
          }
        }
      })
    }
  },
  zbfPhoneInput:function(e){
    this.setData({
      sponsor_phone: e.detail.value
    });
    app.datalist.sponsor_phone = this.data.sponsor_phone
    this.setVoteStorage();
  },
  zbfNameInput:function(e){
    this.setData({
      sponsor_name: e.detail.value
    })
    app.datalist.sponsor_name = this.data.sponsor_name
    this.setVoteStorage();
  },
  bindzbfMsgChange:function(){
    let that = this;
    that.setData({
      zbfMsgOption: !that.data.zbfMsgOption
    });
    app.datalist.sponsor_enabled = that.data.zbfMsgOption?'1':'0'
    that.setVoteStorage();
  },
  bindbmzWeChatChange: function () {
    let that = this;
    that.setData({
      sign_wechat_need: !that.data.sign_wechat_need
    });
    app.datalist.sign_wechat_need=that.data.sign_wechat_need?'1':'0';
    that.setVoteStorage();
  },
  bindbmzPhoneChange:function(){
    let that = this;
    that.setData({
      sign_phone_need: !that.data.sign_phone_need
    });
    app.datalist.sign_phone_need = that.data.sign_phone_need ? '1' : '0';
    that.setVoteStorage();
  },
  bindbmOptionChange:function(){
    let that = this;
    that.setData({
      sign_enabled: !that.data.sign_enabled
    });
    app.datalist.sign_enabled = that.data.sign_enabled ? '1' : '0';
    that.setVoteStorage();
  },
  setVoteStorage:function(){
    // console.log(app);
    let that = this;
    wx.setStorage({
      key: 'voteDraft',
      data: app.datalist,
    })
  },
  onLoad: function (options) {
    let that = this;
    console.log(app);
    app.util.setNBT(app.globalData.app_name);
    app.util.resizeFooter(that)
    that.id = options.id ? options.id:'';
    that.setData({
      sign_enabled: app.datalist.sign_enabled==1 ?true:false,
      sign_phone_need: app.datalist.sign_phone_need==1 ? true : false,
      sign_wechat_need: app.datalist.sign_wechat_need==1 ? true : false,
      sign_start_date: app.datalist.sign_start_date_arr ? app.datalist.sign_start_date_arr  : app.post.sign_start_date_arr,
      sign_start_time: app.datalist.sign_start_time_arr ? app.datalist.sign_start_time_arr : app.post.sign_start_time_arr,
      sign_stop_date: app.datalist.sign_stop_date_arr ? app.datalist.sign_stop_date_arr : app.post.sign_stop_date_arr,
      sign_stop_time: app.datalist.sign_stop_time_arr ? app.datalist.sign_stop_time_arr : app.post.sign_stop_time_arr,
      zbfMsgOption: app.datalist.sponsor_enabled==1 ? true:false,
      sponsor_phone: app.datalist.sponsor_phone ? app.datalist.sponsor_phone:'',
      sponsor_name: app.datalist.sponsor_name ? app.datalist.sponsor_name : '',
      // sponsor_wechat: app.datalist.sponsor_wechat ? app.datalist.sponsor_wechat : [],
      attachurl: app.domainPath,
      vote_start_date: app.datalist.vote_start_date_arr ? app.datalist.vote_start_date_arr : app.post.vote_start_date_arr,
      vote_start_time: app.datalist.vote_start_time_arr ? app.datalist.vote_start_time_arr : app.post.vote_start_time_arr,
      vote_stop_date: app.datalist.vote_stop_date_arr ? app.datalist.vote_stop_date_arr : app.post.vote_stop_date_arr,
      vote_stop_time: app.datalist.vote_stop_time_arr ? app.datalist.vote_stop_time_arr: app.post.vote_stop_time_arr,
    });
    //初始化缓存数据
    app.datalist.sign_enabled = that.data.sign_enabled?'1':'0';
    app.datalist.sign_phone_need = that.data.sign_phone_need?'1':'0';
    app.datalist.sign_wechat_need = that.data.sign_wechat_need?'1':'0';
    app.datalist.sponsor_enabled = that.data.zbfMsgOption?'1':'0';
    app.datalist.sponsor_phone = that.data.sponsor_phone;
    app.datalist.sponsor_name = that.data.sponsor_name;
    // app.datalist.sponsor_wechat = that.data.sponsor_wechat;
    app.datalist.sign_start_date = that.data.sign_start_date;
    app.datalist.sign_start_time = that.data.sign_start_time;
    app.datalist.sign_stop_date = that.data.sign_stop_date;
    app.datalist.sign_stop_time = that.data.sign_stop_time;
    app.datalist.vote_start_date = that.data.vote_start_date;
    app.datalist.vote_start_time = that.data.vote_start_time;
    app.datalist.vote_stop_date = that.data.vote_stop_date;
    app.datalist.vote_stop_time = that.data.vote_stop_time;
    that.setVoteStorage();
  }
})
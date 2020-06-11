let  app = getApp();
Page({

  data: {
    index_mb:0,
    repeatVoteChange:false,
    share_thumb:[],
    index_voteNum:0,
    // region: ['全部', '全部', '全部'],
    index_voteWeChat:0
  },
  bindLastTap: function () {
    app.util.navigateBack({});
  },
  nextPage:function(){
    let url = this.id ? '../publishD/publishD?id=' + this.id : '../publishD/publishD';
    wx.navigateTo({
      url: url,
    })
  },
  bindlist_enabledChange:function(){
    let that = this;
    that.setData({
      list_enabled: !that.data.list_enabled
    })
    app.datalist.list_enabled = that.data.list_enabled?'1':'0';
    that.setVoteStorage();
  },
  bindVoteWeChatChange:function(e){
    let that=this;
    that.setData({
      index_voteWeChat:e.detail.value
    })
    app.datalist.dq_ip_num = that.data.dq_ip_num_arr[that.data.index_voteWeChat];
    that.setVoteStorage();
  },
  bindRegionChange(e) {
    this.setData({
      region: e.detail.value
    })
    app.datalist.dq_value = this.data.region[0] + ',' + this.data.region[1] + ',' + this.data.region[2];
    this.setVoteStorage();
  },
  bindAreaIPChange:function(){
    let that =this;
    that.setData({
      areaIPChange: !that.data.areaIPChange
    })
    app.datalist.dq_enabled = that.data.areaIPChange?'1':'0';
    that.setVoteStorage();
  },
  bindVoteNumChange:function(e){
    this.setData({
      index_voteNum: e.detail.value
    })
    app.datalist.tp_everyday_num = this.data.tp_everyday_num_arr[this.data.index_voteNum],
    this.setVoteStorage();
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
          if (data.code == 1) {
            pindex++;
            let temparr = [];
            temparr.push(data.path);
            that.setData({
              share_thumb: temparr
            })
            app.datalist.share_thumb = that.data.share_thumb;
            that.setVoteStorage();
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
  bindRepeatVoteChange:function(){
    let that= this;
    that.setData({
      repeatVoteChange:!that.data.repeatVoteChange
    })
    app.datalist.tp_repeat_enabled = that.data.repeatVoteChange?'1':'0'
    that.setVoteStorage();
  },
  // bindmbChange:function(e){
  //   this.setData({
  //     index_mb:e.detail.value
  //   });
  //   app.datalist.muban_id = this.data.mubanarr[this.data.index_mb].id;
  //   this.setVoteStorage();
  // },
  setVoteStorage: function () {
    let that = this;
    wx.setStorage({
      key: 'voteDraft',
      data: app.datalist,
    })
  },
  onLoad: function (options) {
    let that = this;
    app.util.resizeFooter(that);
    app.util.setNBT(app.globalData.app_name);
    that.id = options.id ? options.id:'';
    that.setData({
      // mubanarr: app.post.muban_arr,
      tp_everyday_num_arr: app.post.tp_everyday_num_arr,
      dq_ip_num_arr: app.post.dq_ip_num_arr,
      // muban_id: app.datalist.muban_id ? app.datalist.muban_id : app.post.muban_arr[0].id,
      attachurl: app.domainPath,
      share_thumb: app.datalist.share_thumb ? app.datalist.share_thumb:[],
      tp_everyday_num: app.datalist.tp_everyday_num ? app.datalist.tp_everyday_num : app.post.tp_everyday_num_arr[0],
      repeatVoteChange: app.datalist.tp_repeat_enabled==1?true:false,
      areaIPChange: app.datalist.dq_enabled==1?true:false,
      region: app.datalist.dq_value ? app.datalist.dq_value.split(',') : ['全部', '全部', '全部'],
      dq_ip_num: app.datalist.dq_ip_num ? app.datalist.dq_ip_num : app.post.dq_ip_num_arr[0],
      list_enabled: app.datalist.list_enabled==1?true:false
    });
    //初始化 app
    // app.datalist.muban_id=that.data.muban_id;
    app.datalist.tp_everyday_num = that.data.tp_everyday_num;
    app.datalist.dq_ip_num = that.data.dq_ip_num;
    app.datalist.share_thumb=that.data.share_thumb;
    app.datalist.tp_repeat_enabled = that.data.repeatVoteChange?'1':'0';
    app.datalist.dq_enabled = that.data.areaIPChange ? '1' : '0';
    app.datalist.dq_value = that.data.region[0] + ',' + that.data.region[1] + ',' + that.data.region[2];
    app.datalist.list_enabled = that.data.list_enabled?'1':'0'
    that.setVoteStorage();
    // for (let x in that.data.mubanarr){
    //   if (that.data.muban_id == that.data.mubanarr[x].id){
    //     that.setData({
    //       index_mb:x
    //     })
    //     break;
    //   }
    // }
    for (let j in that.data.tp_everyday_num_arr) {
      if (that.data.tp_everyday_num == that.data.tp_everyday_num_arr[j]) {
        that.setData({
          index_voteNum: j
        })
        break;
      }
    }
    for (let k in that.data.dq_ip_num_arr) {
      if (that.data.dq_ip_num == that.data.dq_ip_num_arr[k]) {
        that.setData({
          index_voteWeChat: k
        })
        break;
      }
    }
  }

}) 
let app =getApp();
Page({

  data: {
    currentTab:0,
    datalist:[],
    pindex:1,
    isend:false,
    isloading:false,
    needrefresh:false,
    isendT:false
  },
  canlaodMore:true,
  bindBackTap:function(){
    app.util.navigateBack({
      delta:1,
      data:{
        canRefresh: true
      }
    })
  },
  bindEnterTap: function (e) {
    console.log(e);
      wx.navigateTo({
        url: '../enter/enter?id=' + this.data.activity_id + '&formid=' + e.detail.formId
      })
  },
  godetail:function(e){
    wx.navigateTo({
      url: './detail/detail?id='+e.currentTarget.dataset.id
    })
  }, 
  changeTabActive:function(e){
    let that=this;
    that.setData({
      currentTab: e.currentTarget.dataset.tabindex,
      pindex:1,
      isend:false,
      isloading:false,
      datalist:[],
      isendT:false
    });
    that.init(e.currentTarget.dataset.tabindex)
  },
  init:function(status){
    let that= this;
    that.setData({
      isloading: true
    })
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=join.index.check',
      'cachetime': '0',
      'method': 'post',
      data:{
        status: status,
        activity_id: that.data.activity_id,
        pindex:that.data.pindex
      },
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        that.setData({
          isloading: false,
          pindex:++that.data.pindex,
          func_check_addplayer: datalist.defined.func_check_addplayer ? datalist.defined.func_check_addplayer:'+添加选手'
        })
        if (datalist.data.length < 1 && that.data.pindex==2){
          that.setData({
            isendT: true
          })
          that.canlaodMore=false;
        } else if (datalist.data.length < 10){
          that.setData({
            isend: true,
            datalist: that.data.datalist.concat(datalist.data)
          })
        }else{
          that.setData({
            isend: false,
            datalist: that.data.datalist.concat(datalist.data)
          })
          that.canlaodMore = true;
        }
      }
    })
  },
  onShow:function(){
    if(this.data.needrefresh){
      wx.startPullDownRefresh();
    }
  },
  onLoad: function (options) {
    console.log(options);
    app.util.resizeFooter(this)
    app.util.setNBT(app.globalData.app_name);
    this.setData({
      activity_id: options.id,
    })
    this.init(0);
    
  },
  onReachBottom: function () {
    if (this.canlaodMore) {
      this.init(this.data.currentTab);
    }
  },
  onPullDownRefresh:function(){
    let that=this;
    that.setData({
      pindex: 1,
      isend: false,
      isloading: false,
      datalist: []
    });
    that.init(that.data.currentTab);
    wx.stopPullDownRefresh();
  }
})
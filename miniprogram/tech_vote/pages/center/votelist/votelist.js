let  app = getApp();
Page({

  data: {
    pindex:1,
    isend: false,
    isloading: false,
    votelist:[],
    isendT:false
  },
  bindDeleteTap:function(e){
    var that = this;
    let index = e.currentTarget.dataset.index;
    let votelist = that.data.votelist;
    wx.showModal({
      title: '提示',
      content: '确定删除',
      success:function(res){
        if(res.confirm){
          app.util.request({
            'url': "entry/wxapp/wxapp&r=activity.publish.delete",
            'cachetime': '0',
            method: "post",
            data: {
              id: e.currentTarget.dataset.id
            },
            success(res) {
              console.log(res);
              let datalist = res.data.data;
              if (datalist.code == 1) {
                app.util.message(datalist.message);
                votelist.splice(index, 1);
                that.setData({
                  votelist: votelist
                })
              }
            }
          })
        }
      }
    })
    
  },
  bindItemTap:function(e){
    wx.navigateTo({
      url: '../../index/index?id='+e.currentTarget.dataset.voteid,
    })
  },
  init:function(url){
    var that = this;
    app.util.request({
      'url': url,
      'cachetime': '0',
      method: "post",
      data:{
        pindex: that.data.pindex
      },
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        that.setData({
          votelist: that.data.votelist.concat(datalist.data),
          pindex: ++that.data.pindex,
        })
        if (datalist.data.length < 1 && that.data.pindex==2){
          that.setData({
            isendT: true
          })
        } else if (datalist.data.length < 4){
          that.setData({
            isend: true
          })
        }else{
          that.setData({
            isend: false
          })
        }
        
      }
    })
  },
  onLoad: function (options) {
    var that = this;
    app.util.setNBT(app.globalData.app_name);
    switch (options.type){
      case "0":
        that.setData({
          type:0
        })
        that.path = 'entry/wxapp/wxapp&r=mine.index.postedactivity';
        that.init( that.path);
      break;
      case '1':
         that.path = 'entry/wxapp/wxapp&r=mine.index.toapply';
        that.init( that.path);
      break;
      case '2':
        that.path = 'entry/wxapp/wxapp&r=mine.index.tovote';
        that.init(that.path);
        break;
      case '3':
        that.path = 'entry/wxapp/wxapp&r=mine.index.seenactivity';
        that.init(that.path);
        break;
    }
  },
  loadmore:function(){
    var that = this;
    that.setData({
      isloading: true
    })
    app.util.request({
      'url': that.path,
      'cachetime': '0',
      method: "post",
      data: {
        pindex: that.data.pindex
      },
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        that.setData({
          votelist: that.data.votelist.concat(datalist.data),
          pindex: ++that.data.pindex,
          isloading: false
        })
        if (datalist.data.length < 1 || datalist.data.length < 4) {
          that.setData({
            isend: true
          })
        } else {
          that.setData({
            isend: false
          })
        }

      }
    })
  },
  onReachBottom: function () {
    let that = this;
    if (!that.data.isend) {
      that.loadmore();
    }
  }
})
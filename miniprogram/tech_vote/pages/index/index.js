let app = getApp();
let bmap = require('../../libs/bmap-wx.min.js');
let interval;
let col1H = 0;
let col2H = 0;
Page({
  data: {
    obj: {}, //shijian
    activity: {},
    globaldata: {},
    currentTab: 1,
    votelist: [],
    pindex: 1,
    isend: false,
    isloading: false,
    searchContent: '',
    rotateScale: 0,
    isload: false,
    isShareShow: false,
    orderlist: [],
    imgWidth: 0,
    loadingCount: 0,
    images: [],
    col1: [],
    col2: [],
    canRefresh:false
  },
  bindPublishTap:function(){
    wx.navigateTo({
      url: '../publishlist/publishA/publishA',
    })
  },
  bindShareViewTap: function() {
    this.setData({
      isShareShow: !this.data.isShareShow,
    })
  },
  bindShareTap: function() {
    this.setData({
      isShareShow:false
    })
    wx.navigateTo({
      url: '../poster/poster?id=' + this.acid + '&source=1',
    })
  },
  bindCenterTap: function() {
    wx.switchTab({
      url: '../center/center',
    })
  },
  bindEnterTap: function(e) {
    console.log(e);
    if(this.data.globaldata.getinfo==1){
      wx.navigateTo({
        url: '../login/login?source=baoming&id=' + this.data.activity.id
      })
    }else{
      wx.navigateTo({
        url: '../enter/enter?id=' + this.data.activity.id + '&formid=' + e.detail.formId
      })
    }

  },
  bindCheckTap: function() {

    wx.navigateTo({
      url: '../check/check?id=' + this.data.activity.id
    })
  },
  bindEditTap: function() {
    wx.navigateTo({
      url: '../publishlist/publishA/publishA?id=' + this.data.activity.id,
    })
  },
  bindPostTap: function(id) {
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=vote.vote.dovote',
      'cachetime': '0',
      data: {
        id: that.data.voteid
      },
      success(res) {
        console.log(res);
        let datalist = res.data;
        if (datalist.data.res == 1) {
          that.bindmessageTap(datalist.message);
          let activity = that.data.activity,
            votelist = that.data.votelist;
          activity['tj_vote_num'] = datalist.data.data.activity_num;
          votelist[that.data.voteindex]['vote_num'] = datalist.data.data.join_num;
          that.setData({
            activity: activity,
            votelist: votelist
          })
        } else {
          that.bindmessageTap(datalist.message);
        }
      }
    })
  },
  bindmessageTap: function(msg) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false
    })
  },
  bindLocationTap: function(id) {
    let that = this;
    var BMap = new bmap.BMapWX({
      ak: 'nt5eZUoSygqVZEOrctGz9fwSG6PFd1UE'
    });
    let fail = function(data) {
      wx.showModal({
        title: '提示',
        content: '获取地理位置失败，请检查是否授权使用当前地理位置！',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.openSetting({
              success(res) {
                console.log(res.authSetting);
                if (res.authSetting['scope.userLocation']) {
                  wx.showToast({
                    title: '授权成功！',
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '只有授权成功才可以投票！',
                    showCancel: false
                  })
                }
              }
            })
          }
        }
      });

    }
    let success = function(data) {
      console.log(data);
      let province = data.originalData.result.addressComponent.province,
        city = data.originalData.result.addressComponent.city,
        district = data.originalData.result.addressComponent.district,
        dqvalue = that.data.activity.dq_value.split(',');
      if (dqvalue[0] != '全部') {
        if (province == dqvalue[0]) {
          //同一个省
          if (dqvalue[1] != '全部') {
            if (city == dqvalue[1]) {
              if (dqvalue[2] != '全部') {
                if (district == dqvalue[2]) {
                  that.bindPostTap()
                } else {
                  that.bindmessageTap('您当前不在活动地区内，无法投票！');
                }
              } else {
                that.bindPostTap()
              }
            } else {
              that.bindmessageTap('您当前不在活动地区内，无法投票！');
            }
          } else {
            that.bindPostTap()
          }
        } else {
          that.bindmessageTap('您当前不在活动地区内，无法投票！');
        }
      } else {
        that.bindPostTap()
      }
    }
    BMap.regeocoding({
      fail: fail,
      success: success,
    });
  },
  bindVoteTap: function(e) {
    let that = this;
    that.setData({
      voteid: e.currentTarget.dataset.id,
      voteindex: e.currentTarget.dataset.index,
    })
    if (that.data.activity.dq_enabled == 1) {
      that.bindLocationTap();
    } else {
      that.bindPostTap();
    }
  },
  //search
  bindInputTap: function(e) {
    this.setData({
      searchContent: e.detail.value
    })
  },
  bindDetailTap: function(e) {
    wx.navigateTo({
      url: '../votedetail/votedetail?id=' + e.currentTarget.dataset.id,
    })
  },
  bindSearchTap: function() {
    let that = this;
    that.setData({
      pindex: 1,
      votelist: [],
      isend: false,
      isendT: false,
      isloading: false,
      loadingCount: 0,
      images: [],
      col1: [],
      col2: [],
    })
    if(that.data.currentTab==3){
      that.setData({
        currentTab:1,
        orderlist: []
      })
    }
    col1H=0;
    col2H=0;
    that.laodMoreData();
  },
  bindOrderTap: function() {
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=activity.detail.toplist',
      'cachetime': '0',
      data: {
        id: that.acid
      },
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        if(datalist.data.length<1){
          that.setData({
            isendT: true,
          })
        }else{
          that.setData({
            isend: true,
            orderlist: datalist.data
          });
        }
       
      }
    })
  },
  changeTabActive: function(e) {
    let that = this;
    that.setData({
      currentTab: e.currentTarget.dataset.tabindex,
      pindex: 1,
      isend: false,
      isloading: false,
      votelist: [],
      orderlist: [],
      isendT:false,
      loadingCount: 0,
      images: [],
      col1: [],
      col2: [],
      searchContent:""
    });
    col1H=0;
    col2H = 0;
    if (e.currentTarget.dataset.tabindex == 3) {
      that.bindOrderTap();
    } else {
      that.laodMoreData();
    }
  },
  bindNoticeTap: function() {
    let self=0;
    if (this.data.activity.uid == this.data.globaldata.uid){
      self = 1;
    }
    wx.navigateTo({
      url: '../notice/notice?data=' + JSON.stringify(this.data.activity) + '&self=' + self
    })
  },
  time2end: function(time) {
    let that = this;
    let day = parseInt(time / (60 * 60 * 24));
    let hou = parseInt(time % (60 * 60 * 24) / 3600);
    let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
    let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
    let obj = {
      day: day,
      hou: hou,
      min: min,
      sec: sec
    }
    that.setData({
      obj: obj
    })
    if (time > 0) {
      interval= setTimeout(function() {
        that.time2end(--time)
      }, 1000);
    }
  },
  loadActiviyData: function(data, global) {
    let that = this;
    that.setData({
      activity: data,
      globaldata: global,
      isload: true
    })
  },
  loadVoteData: function(data) {
    let images= data;
    console.log(images);
    let baseId = "img-" + (+new Date());
    for (let i = 0; i < images.length; i++) {
      images[i].baseId = baseId + "-" + i;
      images[i].height=0;
    }
    this.setData({
      loadingCount: images.length,
      images: this.data.images.concat(images),
      votelist: this.data.votelist.concat(data)
    });
  },
  init: function(id) {
    let that = this;
    col1H = 0;
    col2H = 0;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=activity.detail.display',
      'cachetime': '0',
      data: {
        id: id,
        pindex: that.data.pindex,
        order: that.data.currentTab
      },
      success(res) {
        console.log(res);
        if(res.data.data.code==1){
          wx.showModal({
            title: '提示',
            content: res.data.data.message,
            showCancel:false,
            success:(res=>{
              if (res.confirm) {
                wx.switchTab({
                  url: '../list/list',
                })
              }
            })
          })
        }else{
          let datalist = res.data.data;
          that.setData({
            pindex: ++that.data.pindex,
            func_pianshen: datalist.func_pianshen,
            share_enabled_index: datalist.share_enabled_index,
            canRefresh: false,
            func_acti_detail_playermanage: datalist.func_acti_detail_playermanage ? datalist.func_acti_detail_playermanage:'活动管理',
            func_acti_detail_dojoin: datalist.func_acti_detail_dojoin ? datalist.func_acti_detail_dojoin:'我要报名',
          })
          if (!app.globalData) {
            app.globalData = datalist.globaldata
            app.util.setNBT(datalist.globaldata.app_name);
          }
          //活动数据
          that.loadActiviyData(datalist.activity, datalist.globaldata);
          if (datalist.activity.time_type == 0) {
            that.setData({
              timeTitle: '距离报名开始'
            })
          } else if (datalist.activity.time_type == 1) {
            that.setData({
              timeTitle: '距离报名结束'
            })
          } else if (datalist.activity.time_type == 2) {
            that.setData({
              timeTitle: '距离投票开始'
            })
          } else if (datalist.activity.time_type == 3) {
            that.setData({
              timeTitle: '距离投票结束'
            })
          } else {
            that.setData({
              timeTitle: '活动已结束'
            })
          }
          that.time2end(datalist.activity.res_time);
          that.loadVoteData(datalist.join);
          if (datalist.join.length < 1 && that.data.pindex == 2) {
            that.setData({
              isendT: true,
            })
          } else if (datalist.join.length < 5) {
            that.setData({
              isend: true,
            })
          } else {
            that.setData({
              isend: false,
            })
          }
        }
        
      }
    })
  },
  onLoad: function(options) {
    if (app.globalData!=null){
      app.util.setNBT(app.globalData.app_name);
    }
    let that = this;
    that.acid = options.id?options.id:options.scene;
    that.init(that.acid);
    if (app.id) {
      app.id = ""
    }
    // that.setData({
    //   currentTab: 1,
    //   pindex: 1,
    //   isend: false,
    //   isloading: false,
    //   votelist: [],
    //   orderlist: [],
    //   isendT: false
    // });
    // if(options.tabindex==3){
      
    //   that.bindOrderTap();
    // }
    app.util.resizeFooter(that);
    wx.getSystemInfo({
      success: (res) => {
        let ww = res.windowWidth;
        let wh = res.windowHeight;
        let imgWidth = ww * 0.48;
        let scrollH = wh;
        this.setData({
          imgWidth: imgWidth
        });
      }
    })
  },
  onImageLoad: function (e) {
    let imageId = e.currentTarget.id;
    let oImgW = e.detail.width;         //图片原始宽度
    let oImgH = e.detail.height;        //图片原始高度
    let imgWidth = this.data.imgWidth;  //图片设置的宽度
    let scale = imgWidth / oImgW;        //比例计算
    let imgHeight = oImgH * scale;      //自适应高度
    let images = this.data.images;
    let imageObj = {};

    for (let i = 0; i < images.length; i++) {
      let img = images[i];
      if (img.baseId === imageId) {
        imageObj = img;
        break;
      }
    }

    imageObj.height = imgHeight;
    let loadingCount = this.data.loadingCount - 1;
    let col1 = this.data.col1;
    let col2 = this.data.col2;
    // console.log(col1H, col2H);
    if (col1H <= col2H) {
      col1H += imgHeight;
      col1.push(imageObj);
    } else {
      col2H += imgHeight;
      col2.push(imageObj);
    }

    let data = {
      loadingCount: loadingCount,
      col1: col1,
      col2: col2
    };

    if (!loadingCount) {
      data.images = [];
    }

    this.setData(data);
  },
  
  laodMoreData: function() {
    let that = this;
    that.setData({
      isloading: true
    })
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=activity.detail.display',
      'cachetime': '0',
      data: {
        id: that.acid,
        pindex: that.data.pindex,
        order: that.data.currentTab,
        like: that.data.searchContent
      },
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        that.setData({
          pindex: ++that.data.pindex,
          isloading: false
        })
        //活动数据
        that.loadVoteData(datalist.join);
        if (datalist.join.length < 1 && that.data.pindex==2) {
          that.setData({
            isendT: true,
          })
        } else if (datalist.join.length < 5){
          that.setData({
            isend: true,
          })
        }else {
          that.setData({
            isend: false,
          })
        }
      }
    })
  },
  onShow: function () {
    app.util.ad_cp(1);
    if (this.data.canRefresh){
      wx.startPullDownRefresh();
    }
    
  },
  onPullDownRefresh: function() {
    let that = this;
    that.setData({
      currentTab: 1,
      pindex: 1,
      votelist: [],
      isendT:false,
      loadingCount: 0,
      images: [],
      col1: [],
      col2: [],
    })
    clearTimeout(interval)
    that.init(that.acid);
    wx.stopPullDownRefresh();
  },
  onReachBottom: function() {
    let that = this;
    if (!that.data.isend && that.data.currentTab!=3 && !that.data.isendT) {
      that.laodMoreData();
    }
  },
  onShareAppMessage:function(){
    let that =this;
    return{
      title: that.data.activity.title,
      path: "/tech_vote/pages/index/index?id=" + that.data.activity.id,
      imageUrl: that.data.activity.share_thumb ? that.data.activity.share_thumb:''
    }
  },
})
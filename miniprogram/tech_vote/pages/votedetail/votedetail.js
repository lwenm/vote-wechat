let app = getApp();
let bmap = require('../../libs/bmap-wx.min.js');
var interval;
Page({
  data: {
    gifts: [1, 2, 3, 2, 1, 1, 1],
    isGiftShow: false,
    isShareShow: false,
    obj: {},
    timeobj:{},
    intervalindex: 0,
    isDanMuShow:false,
    danmulist:[],
    imgheights:[],
    current:0,
    giftlogs:[],
    hotlist:[],
    voteSuccess:false,
    isload:false,
    canrefresh:false,
    pizzleShow:false,
    isOk:false,
    checkImg: 1
  },
  bindWebviewTap:function(e){
    this.setData({
      voteSuccess: false,
    })
    wx.navigateTo({
      url: '../webview/webview?datasrc=' + encodeURIComponent(e.currentTarget.dataset.link),
    })
  },
  bindminiTap:function(e){
    this.setData({
      voteSuccess: false
    })
    wx.navigateToMiniProgram({
      appId: e.currentTarget.dataset.appid,
      path: e.currentTarget.dataset.path
    })
  },
  bindStopPop:function(){
    return;
  },
  bindAdTap: function (e) {
    wx.navigateTo({
      url: '../webview/webview?datasrc=' + encodeURIComponent(e.currentTarget.dataset.url),
    })
  },
  hidepop:function(){
    this.setData({
      voteSuccess: false
    })
  },
  makePhoneCall: function (e) {
    this.setData({
      voteSuccess: false
    })
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phonenum,
    })
  },
  bindHideVotetipsTap:function(){
    this.setData({
      voteSuccess: !this.data.voteSuccess
    })
  },
  bindgoTap:function(){
    wx.navigateTo({
      url: '../index/index?id=' + this.data.obj.activity_id,
    })
  },
  bindOtherTap:function(e){
    wx.redirectTo({
      url: './votedetail?id=' + e.currentTarget.dataset.id,
    })
  },
  bindImageTap:function(e){
    this.setData({ current: e.detail.current })
  },
  imageLoad: function (e) {//获取图片真实宽度  
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
    //计算的高度值  
    var viewHeight = 600 / ratio;
    var imgheight = viewHeight;
    var imgheights = this.data.imgheights;
    //把每一张图片的对应的高度记录到数组里  
    imgheights[e.target.dataset.id] = imgheight;
    this.setData({
      imgheights: imgheights
    })
  },
  bindPosterTap:function(){
    this.setData({
      isShareShow:false
    })
    wx.navigateTo({
      url: '../poster/poster?id=' + this.id+'&source=2',
    })
  },
  bindPostDanMuTap:function(){
    let that = this;
    if(!this.danmu){
        wx.showModal({
          title: '提示',
          content: '请输入弹幕内容！',
          showCancel:false
        })
    }else{
      app.util.request({
        'url': 'entry/wxapp/wxapp&r=vote.vote.createbarrage',
        'cachetime': '0',
        data: {
          j_id: that.data.obj.id,
          a_id: that.data.obj.activity_id,
          content: that.danmu
        },
        success(res) {
          console.log(res);
          let datalist = res.data;
          if (datalist.data.code == 1) {
            clearTimeout(interval);
            that.setData({
              isDanMuShow: !that.data.isDanMuShow,
              intervalindex: -1
            })
            wx.showToast({
              title: '发送成功',
            })
            //弹幕添加
            let obj = {
              content:'',
              nickname:''
            }
            obj['content'] = datalist.data.data.content;
            obj['nickname'] = datalist.data.data.nickname;
            console.log(obj);
              that.setData({
                danmulist: that.data.danmulist.concat(obj),
              },function(){
                interval=setTimeout(function(){
                  that.doAnimatiom();
                  that.setData({
                    intervalindex: 0,
                  })
                },2000)
              })
          } else {
            wx.showModal({
              title: '提示',
              content: datalist.data.message,
              showCancel: false
            })
          }
        }
      })
    }
    
  },
  bindDanMuInput:function(e){
    this.danmu = e.detail.value;
  },
  bindPostTap: function() {
    let that = this;
    if (!+that.check) {
      this.postTapTo();
    } else {
      that.setData({
        pizzleShow: true
      })
    }
  },
  postTapTo () {
    const that = this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=vote.vote.dovote',
      'cachetime': '0',
      data: {
        id: that.data.obj.id
      },
      success(res) {
        console.log(res);
        let datalist = res.data;
        if (datalist.data.res == 1) {
          let obj = that.data.obj;
          obj.vote_num = datalist.data.data.join_num;
          obj.list = datalist.data.data.list;
          if (that.data.enabled.func_pianshen == 0) {
            if (that.data.votesuccess.activity_ad_enabled == 0) {
              that.setData({
                obj: obj
              })
              that.navigateResultPage(that.data.obj.id, 1, datalist.message);
            } else {
              that.setData({
                obj: obj,
                voteSuccess: !that.data.voteSuccess
              })
            }
          } else {
            // that.setData({
            //   obj: obj,
            // })
            // that.bindmessageTap(datalist.message);
            that.navigateResultPage(that.data.obj.id, 1)
          }
        } else {
          that.navigateResultPage(that.data.obj.id, 0, datalist.message);
        }
      }
    })
  },
  navigateResultPage: function(id, type, message = '') {
    let that = this;
    wx.navigateTo({
      url: '../result/result?id='+id+'&type='+type+
      '&message='+message+'&shareName='+that.data.obj.name+
      '&shareUrl='+that.data.obj.thumb[0],
    })
  },
  bindDanMuTap:function(){
    console.log(app);
    if (app.globalData.getinfo == 1) {
      wx.navigateTo({
        url: '../login/login?source=gift',
      })
    }else{
      this.setData({
        isDanMuShow: !this.data.isDanMuShow
      })
    }
    
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
      ak: that.data.baidu_ak
    });
    let fail = function(data) {
      console.log(data);
      if (data.statusCode == 101 || data.statusCode== 200){
        wx.showModal({
          title: '提示',
          content: "百度AK有误，请联系客服",
          showCancel:false
        })
        return;
      }
     
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
        dqvalue = that.data.obj.dq_value.split(',');
      if (dqvalue[0] != '全部') {
        if (province == dqvalue[0]) {
          //同一个省
          if (dqvalue[1] != '全部') {
            if (city == dqvalue[1]) {
              if (dqvalue[2] != '全部') {
                if (district == dqvalue[2]) {
                  that.bindPostTap()
                } else {
                  that.navigateResultPage(that.data.obj.id, 0, '活动仅限' + dqvalue[0] + dqvalue[1] + dqvalue[2]+'参与！')
                  // that.bindmessageTap('活动仅限' + dqvalue[0] + dqvalue[1] + dqvalue[2]+'参与！');
                }
              } else {
                that.bindPostTap()
              }
            } else {
              that.navigateResultPage(that.data.obj.id, 0, '活动仅限' + dqvalue[0] + dqvalue[1]+'参与！')
              // that.bindmessageTap('活动仅限' + dqvalue[0] + dqvalue[1]+'参与！');
            }
          } else {
            that.bindPostTap()
          }
        } else {
          that.navigateResultPage(that.data.obj.id, 0, '活动仅限' + dqvalue[0]+'参与！')
          // that.bindmessageTap('活动仅限' + dqvalue[0]+'参与！');
        }
      } else {
        that.bindPostTap()
      }
    }
    wx.authorize({
      scope: 'scope.userLocation',
      success:function(res){
        BMap.regeocoding({
          fail: fail,
          success: success,
        });
      },
      fail:function(){
        wx.showModal({
          title: '提示',
          content: '获取地理位置失败，请检查是否授权使用当前地理位置！',
          showCancel: false,
          success: function (res) {
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
                      content: '只有成功授权您才可以投票！',
                      showCancel: false
                    })
                  }
                }
              })
            }
          }
        });
      }
    })
    
  },
  bindVoteTap: function(e) {
    let that = this;
    if (typeof that.data.obj.dq_enabled != "undefined" && that.data.obj.dq_enabled == 1) {
      that.bindLocationTap();
    } else {
      that.bindPostTap();
    }
  },
  bindShareTap: function() {
    this.setData({
      isShareShow: !this.data.isShareShow,
    })
  },
  bindcat: function () {
    this.setData({
      isShareShow: !this.data.isShareShow,
    })
  },
  bindPayTap: function(e) {
    let that = this;
    console.log(app);
    if(app.globalData.getinfo==1){
      wx.navigateTo({
        url: '../login/login?source=gift',
      })
    }else{
      app.util.request({
        'url': 'entry/wxapp/wxapp&r=vote.gift.givegift',
        'cachetime': '0',
        'method': 'post',
        data: {
          g_id: e.currentTarget.dataset.id,
          j_id: that.data.obj.id
        },
        success(res) {
          console.log(res);
          var ordernum = res.data.data.ordernum;
          app.util.request({
            'url': 'entry/wxapp/pay', //调用wxapp.php中的doPagePay方法获取支付参数
            data: {
              ordernum: ordernum
            },
            'cachetime': '0',
            success(res) {
              if (res.data && res.data.data && !res.data.errno) {
                //发起支付
                wx.requestPayment({
                  'timeStamp': res.data.data.timeStamp,
                  'nonceStr': res.data.data.nonceStr,
                  'package': res.data.data.package,
                  'signType': 'MD5',
                  'paySign': res.data.data.paySign,
                  'success': function (res) {
                    console.log(res);
                    that.setData({
                      isGiftShow: !that.data.isGiftShow
                    })
                    //支付票数
                    // let votenum = that.data.obj.vote_num,
                    //   obj = that.data.obj;
                    // votenum = parseInt(votenum) + parseInt(e.currentTarget.dataset.num);
                    // obj.vote_num = votenum
                    // that.setData({
                    //   obj: obj
                    // })
                    that.init(that.id)
                  },
                  'fail': function (res) {
                    wx.showModal({
                      title: '支付提示',
                      content: "支付失败，请重新支付",
                      showCancel: false,
                      success: function (res) {
                        if (res.confirm) {

                        }
                      }
                    })
                  }
                })
              }
            },
            fail(res) {
              wx.showModal({
                title: '系统提示',
                content: res.data.message ? res.data.message : '错误',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {

                  }
                }
              })
            }
          })
        }
      })
    }
    

  },
  bindGiftTap: function() {
    this.setData({
      isGiftShow: !this.data.isGiftShow
    })
  },
 onShow:function(){
  this.setData({
    checkImg: Math.floor(Math.random() * 9) + 1
  })
  // if(this.data.canrefresh){
    this.init(this.id);
  // } 
 },
  init: function(id) {
    let that = this;
    this.setData({ isOk:false });
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=vote.vote.display',
      'cachetime': '0',
      'method': 'post',
      data: {
        id: id,
      },
      success(res) {
        console.log(res);
        that.check = res.data.data.data.tp_check_enabled || 0
        if (res.data.data.code == 1) {
          wx.showModal({
            title: '提示',
            content: res.data.data.message,
            showCancel: false,
            success: (res => {
              if(res.confirm){
                wx.switchTab({
                  url: '../list/list',
                })
              }
            })
          })
        } else {
        let datalist = res.data.data;
          app.globalData = datalist.globaldata;
        if (!app.globalData) {
          app.util.setNBT(datalist.globaldata.app_name);
        }
        app.util.ad_cp(2);
        that.setData({
          obj: datalist.data,
          gifts: datalist.gift,
          danmulist: datalist.barrage,
          hotlist: datalist.mostpopular,
          giftlogs: datalist.gift_list_log,
          adlist: datalist.adinfo,
          votesuccess: datalist.votesuccess,
          gift_switch: datalist.gift_switch,
          baidu_ak: datalist.baidu_ak,
          enabled: datalist.enabled,
          isload:true,
          canrefresh: false,
          defined: datalist.defined,
        },function(){
          that.animationInit();
          if (that.data.isIos){
            if (that.data.enabled.func_ios_pay==1){
              that.setData({
                hasGiftBtn: true
              })
            }else{
              that.setData({
                hasGiftBtn: false
              })
            }
          }else{
            that.setData({
              hasGiftBtn:true
            })
          }
        });
        }
      }
    })
  },
  doAnimatiom: function () {
    let that = this;
    if (that.data.danmulist.length>0  && that.data.intervalindex < that.data.danmulist.length - 1) {
      that.setData({
        intervalindex: ++that.data.intervalindex,
      },function(){
        interval = setTimeout(function () {
          that.doAnimatiom();
        }, 4000)
      })
    }else{
      that.setData({
        intervalindex: 0,
        
      },function(){
        interval = setTimeout(function () {
          that.doAnimatiom();
        }, 4000)
      })
    } 
  },
  animationInit: function() {
    let that = this
    that.animationY = wx.createAnimation({
      duration:1500,
      transformOrigin: "30% 30% 40%",
      timingFunction: "ease-in-out",
      delay: 0
    });
    that.animationY.scale(0.3, 0.3).step({
      transformOrigin: "0 0 0",
    })
    that.animationY.scale(1, 1)
      .opacity(1)
      .step({
        transformOrigin: "0 0 0",
      })
      that.animationY.translate(0, -80).step()
      that.animationY.opacity(0).step();
      that.setData({
        animationY: that.animationY.export(),
      },function(){
        interval = setTimeout(function () {
          that.doAnimatiom();
        }, 4000)
      })
  },
  
  onLoad: function(options) {
    let that = this;
    this.id = options.id?options.id:options.scene;
    this.init(this.id);
    console.log(app.globalData)
    if (app.globalData!=null){
      app.util.setNBT(app.globalData.app_name);
    }
    wx.getSystemInfo({
      success: function(res) {
        console.log(res);
        if (res.windowWidth>375){
          that.setData({
            moreH:true
          })
        }else{
          that.setData({
            moreH: false
          })
        }
        if (res.platform == "ios"){
          that.setData({
            isIos:true
          })
        }else{
          that.setData({
            isIos: false
          })
        }
      },
    })
  },
  myEventListener: function (e) {
    //获取到组件的返回值，并将其打印
    wx.showToast({
      title: '验证成功'
    })
    this.postTapTo()
    this.setData({
      isOk: true,
      pizzleShow: false
    })
  },
  flashcheck: function() {
    const checkImg = this.data.checkImg;
    this.setData({
      checkImg: this.return10(checkImg)
    })
  },
  return10: function(current) {
    const rand = Math.floor(Math.random() * 9) + 1;
    if (rand === current) {
      return this.return10(current)
    }
    return rand;
  },
  onShareAppMessage: function(res) {
    let that = this;
    that.danmulist= that.data.danmulist;
    clearTimeout(interval);
    that.setData({
      danmulist: [],
      animationY: {},
      intervalindex:0
    })
    if (res.from === 'button') {
     this.setData({
       danmulist:this.danmulist,
     }, function () {
       setTimeout(function(){
         that.animationInit();
       },4000)
       
     })
    }
    console.log(interval);
    console.log(this.data.obj.share_thumb[0])
    return {
      title: that.data.obj.name+'正在参加投票活动，点进来帮他投一票吧',
      path:'tech_vote/pages/votedetail/votedetail?id='+this.id,
      imageUrl: this.data.obj.share_thumb[0]
    }
  }
})
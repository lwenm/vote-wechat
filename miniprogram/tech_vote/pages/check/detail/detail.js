let app = getApp();
Page({

  data: {
    id: '',
    intro: '',
    name: '',
    phone: '',
    wechat: '',
    thumb: [],
  },
  bindCheckTap: function(e) {
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=join.index.docheck',
      'cachetime': '0',
      'method': 'post',
      data: {
        id: that.data.acid,
        status: e.currentTarget.dataset.type
      },
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        wx.showModal({
          title: '提示',
          content: datalist.data,
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              app.util.navigateBack({
                data: {
                  needrefresh: true
                }
              })
            }
          }
        })

      }
    })
  },
  init: function(id) {
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=join.index.publish',
      'cachetime': '0',
      'method': 'post',
      data: {
        id: id
      },
      success(res) {
        console.log(res);
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
        that.setData({
          id: datalist.data.number,
          intro: datalist.data.intro,
          name: datalist.data.name,
          phone: datalist.data.phone,
          wechat: datalist.data.wechat,
          thumb: datalist.data.thumb,
          acid: datalist.data.j_id
        })
      }
    })
  },
  onLoad: function(options) {
    this.init(options.id);
    app.util.setNBT(app.globalData.app_name);
  }
})
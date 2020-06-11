var WxParse = require('../../../../wxParse/wxParse.js');
let app = getApp();
Page({

  data: {

  },
  onLoad: function (options) {
    let that = this;
    app.util.setNBT(app.globalData.app_name);
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=mine.index.getquestion',
      'cachetime': '0',
      method: "post",
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        if(datalist.data){
          WxParse.wxParse('article', 'html', datalist.data, that, 10);
        }
       
      }
    })
  }
})
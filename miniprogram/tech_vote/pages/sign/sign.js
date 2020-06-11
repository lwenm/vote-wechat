let app= getApp();
Page({

  data: {
    topThreeArr:[],
    bottomSignArr:[]
  },
  init:function(isshow,id){
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=activity.detail.toplist',
      'cachetime': '0',
      'showLoading': isshow,
      data:{
        id:id
      },
      success(res) {
        console.log(res);
        let datalist = res.data.data;
        let orderData = datalist.data;
        let temparr = [];
        if (orderData.length > 3) {
          temparr.push(orderData[0]);
          temparr.push(orderData[1]);
          temparr.push(orderData[2]);
          that.setData({
            topThreeArr: temparr,
            bottomSignArr: orderData
          });
        } else {
          temparr = orderData;
          that.setData({
            topThreeArr: temparr
          });
        }
      }
    })
  },

  onLoad: function (options) {
    this.init(true,options.id);
  }
})

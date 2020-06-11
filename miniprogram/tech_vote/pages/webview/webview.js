let app = getApp();
Page({

  data: {

  },

  onLoad: function (options) {
    var that = this;
    console.log(options);
    var datasrc = decodeURIComponent(options.datasrc);
    console.log(datasrc);
    that.setData({
      datasrc: datasrc
    });
    app.util.setNBT(app.globalData.app_name);
  }
})
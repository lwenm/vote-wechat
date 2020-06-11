let app = getApp();
Page({
  data: {
    themeCount: 0,
    intro:"",
    imagelist:[],
    thumb: [],
    attachurl:'',
    isupload:false
    },
  bindLastTap: function () {
    app.util.navigateBack({});
  },
  nextPage:function(){
    if(this.data.thumb.length<1){
      wx.showToast({
        title: '请上传投票封面图片',
        icon:'none'
      })
      return false;
    }
    if (!this.data.title) {
      wx.showToast({
        title: '请填写投票标题',
        icon: 'none'
      })
      return false;
    }
    if (!this.data.intro && this.data.imagelist.length<1) {
      wx.showToast({
        title: '请填写投票介绍',
        icon: 'none'
      })
      return false;
    }
    app.datalist.intro_img = this.data.imagelist;
    let url = this.id ? '../publishB/publishB?id=' + this.id :'../publishB/publishB';
    wx.navigateTo({
      url: url ,
    })
    
    
  },
  choosethumb:function(){
    let that=this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        //校验图片

        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePaths[0],
          success: buffer => {           
            wx.cloud.callFunction({
              name: 'imgSecCheck',
              data: {
                value: buffer.data 
              }
            }).then(
              imgRes => {
                
                if (imgRes.result.errCode == '87014') {
                  wx.showToast({
                    title: '图片含有违法违规内容',
                    icon: 'none'
                  })
                  return
                } else {
                    wx.navigateTo({
                      url: '../imagecut/imagecut?imgpath=' + res.tempFilePaths[0],
                    })
                    // that.uploadThumb(res.tempFilePaths, 0);
                }
              }
            )
          }
        })
      }
    })
  },
  uploadThumb: function (){
    var that = this;
    var url = "entry/wxapp/wxapp&r=upload";
    var uploadUrl = app.util.uploadUrl(url)
      wx.showLoading({ title: '上传中...' });
      wx.uploadFile({
        url: uploadUrl,
        filePath: that.data.imagpath,
        name: 'file',
        formData: { type: "image" },
        header: { "Content-Type": "multipart/form-data" },
        success(res) {
          wx.hideLoading();
          const data = JSON.parse(res.data);
          if (data.code == 1) {
            let temparr = [];
            temparr.push(data.path);
            that.setData({
              thumb: temparr,
              isupload: false
            })
            app.datalist.thumb = that.data.thumb;
            that.setVoteStorage();
          } else {
            wx.showToast({
              title: data.message,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    
  },
  introImgDelete:function(e){
    let index = e.currentTarget.dataset.index,
    that=this, imagelist = that.data.imagelist;
    imagelist.splice(index,1);
    that.setData({
      imagelist: imagelist
    });
    app.datalist.intro_img = that.data.imagelist;
    that.setVoteStorage();
  },
  bindAddImg:function(){
    let that  = this;
    that.data.imagelist.length<10?that.chooseIntroImages():wx.showModal({
      title: '提示',
      content: '您最多上传10张图片',
      showCancel:false,
      success:function(){}
    })
  },
  chooseIntroImages:function(){
    let that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.uploadIntroImages(res.tempFilePaths, 0);
      }
    })
  },
  uploadIntroImages: function (tempPaths, pindex){
    var that = this;
    var url = "entry/wxapp/wxapp&r=upload";
    var uploadUrl = app.util.uploadUrl(url)
    if (pindex < tempPaths.length) {
      wx.showLoading({title: '上传中...'});
      wx.uploadFile({
        url: uploadUrl,
        filePath: tempPaths[pindex],
        name: 'file',
        formData: {type: "image" },
        header: {"Content-Type": "multipart/form-data"},
        success(res) {
          wx.hideLoading();
          const data = JSON.parse(res.data);
          if (data.code == 1) {
            pindex++;
            that.setData({
              imagelist: that.data.imagelist.concat(data.path)
            })
            app.datalist.intro_img = that.data.imagelist;
            that.setVoteStorage();
            if (pindex < tempPaths.length) {
              that.uploadIntroImages(tempPaths, pindex);
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
  bindIntroInput: function (e) {
    var intro = e.detail.value;
    this.setData({
      intro: intro
    });
    app.datalist.intro = this.data.intro;
    this.setVoteStorage();
  },
  bindThemeInput: function (e) {
    var title = e.detail.value; 
    this.setData({
      title: title,
      themeCount: title.length
    });
    app.datalist.title = this.data.title;
    this.setVoteStorage();
  },
  setVoteStorage:function(){
    let that=this;
    wx.setStorage({
      key: 'voteDraft',
      data: app.datalist,
    })
  },
  initData:function(){
    // console.log(app.datalist);
    this.setData({
      thumb: app.datalist.thumb ? app.datalist.thumb:[],
      title: app.datalist.title ? app.datalist.title:'',
      intro: app.datalist.intro ? app.datalist.intro:'',
      imagelist: app.datalist.intro_img ? app.datalist.intro_img:[],
      themeCount: app.datalist.title ? app.datalist.title.length:0
    })
  },
  init:function(data){
    let that= this;
    app.util.request({
      'url': 'entry/wxapp/wxapp&r=activity.publish.display',
      'cachetime': '0',
      data: data,
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
        app.domainPath = app.domainPath==''? datalist.attachurl : app.domainPath;
        that.setData({
          attachurl: app.domainPath,
          thumb_arr: datalist.post.thumb_arr
        })
        app.post = datalist.post;
        if(data.id){
          app.datalist = datalist.data;
          that.initData();
        }
       
      }
    })
  },
  onLoad: function (options) {
    let that = this, data = {formid: options.formid};
    if (options.id) {
      data = { id: options.id, formid: options.formid}
      that.id = options.id;
      that.init(data); 
    }else{
      that.init(data);
      that.initData();
    }
    app.util.resizeFooter(that)
    app.util.setNBT(app.globalData.app_name);
  },
  onShow:function(){
    if(this.data.isupload){
      this.uploadThumb();
      this.setData({
        isupload: false
      })
    }
  }
})
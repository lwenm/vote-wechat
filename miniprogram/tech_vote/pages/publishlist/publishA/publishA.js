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
      success: function (img) {
        wx.showLoading({
          title: '检测中',
        })
        // 拦截图片，判断图片是否正规（不包含违法图片）
        // 压缩图片
        that.getCanvasImg(0,0,img.tempFilePaths, function(smallImg) {
          wx.getFileSystemManager().readFile({
            filePath: smallImg,
            success: res => {
              wx.cloud.callFunction({
                name: 'imgSecCheck',
                data: {
                  img: res.data
                }
              })
              .then(res => {
                wx.hideLoading()
                if(res.result) {
                  const { errCode } = res.result.data;
                  if(!errCode) {
                    wx.navigateTo({
                      url: '../imagecut/imagecut?imgpath=' + img.tempFilePaths[0]
                    })
                  }
                  if(errCode === 87014) {
                    wx.showToast({
                      icon: "none",
                      title: '图片存在敏感内容，无法上传',
                    })
                  }
                } else {
                  wx.showToast({
                    title: '图片检测失败请重新上传',
                  })
                }
              })
              .catch(err => {
                wx.showToast({
                  title: '图片检测失败请重新上传',
                })
                console.error(err);
              })
            }
          })
        })
        // that.uploadThumb(res.tempFilePaths, 0);
      }
    })
  },
  // 压缩并获取图片，这里用了递归的方法来解决canvas的draw方法延时的问题
  getCanvasImg: function (index,failNum, tempFilePaths, callBack){
    var that = this;
    wx.getImageInfo({
      // src: tempFilePaths[index],// 用于多个图片压缩
      src: tempFilePaths[0], //图片的路径，可以是相对路径，临时文件路径，存储文件路径，网络图片路径,  
      success: res => {
        // util.imageUtil  用语计算长宽比
        var imageSize = res.width / res.height;
        that.imageSize = imageSize;
        if (index < tempFilePaths.length){
          const ctx = wx.createCanvasContext('attendCanvasId');
          ctx.drawImage(tempFilePaths[index], 0, 0, 80, parseInt(80 / imageSize));
          ctx.draw(true, function () {
            setTimeout(() => {
              wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: 80,
                height: parseInt(80 / imageSize),
                destWidth: 80,
                destHeight: parseInt(80 / imageSize),
                canvasId: 'attendCanvasId',
                success (res) {
                  callBack(res.tempFilePath)
                },
                fail (e) {
                  that.getCanvasImg(inedx,failNum,tempFilePaths,callBack);
                }
              });
            }, 0);
          });
        }
      },
      fail: () => {},
      complete: () => {}
    });
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
    console.log(options)
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
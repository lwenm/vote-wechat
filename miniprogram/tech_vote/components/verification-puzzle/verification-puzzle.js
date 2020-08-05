var ctxShadow;
var ctxPuzzle;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: {
      type: String,
      value: '',
      observer: function (newV, oldV) {
        this.setData({
          puzzleShow: false,
          shadowShow: false
        })
        this.init()
      }
    },
    isOk: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    oriSrc: '',
    imgPuzzle: '',
    imgShadow: '',
    translateX: 0,
    oriX:0,
    x: 0,
    oldx: 0,
    size: {},
    width: 600,
    height: 414,
    puzzleShow: true,
    shadowShow: true
  },
  lifetimes: {
    created() {
      this.clientWidth = wx.getSystemInfoSync().windowWidth;
    },
    // attached: function() {
    //   this.init()
    // }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    init () {
      let w = (this.clientWidth / 750) * 600
      let h = (this.clientWidth / 750) * 414
      this.setData({
        oriSrc: this.properties.src,
        width: w,
        height: h
      })
      const random = (Math.random() * ((w / 2) - (w / 600) * 110));
      this.drawPic(random + (w / 2), h * 0.6, (w / 600) * 10)
      console.log(w, h, random, random + (w / 2), h * 0.6, (w / 600) * 10)
      let getSize = (selector) => {
        return new Promise((resolve, reject) => {
          let view = wx.createSelectorQuery().in(this).select(selector);
          view.fields({
            size: true,
          }, (res) => {
            resolve(res.width);
          }).exec();
        });
      }
      getSize("#pathway").then((res1) => {
        this.data.size.pathway = res1;
        getSize("#track").then((res2) => {
          this.data.size.track = res2;
        });
      })
    },
    drawPic(x, y, r) {
      var that = this
      that.setData({
        translateX: -x,
        oriX:-x
      })
      ctxPuzzle = wx.createCanvasContext('canvasPuzzle',this)
      ctxShadow = wx.createCanvasContext('canvasShadow',this)
      // 填充块
      wx.getImageInfo({
        src: that.properties.src,
        success: function (res) {
          that.clip(ctxPuzzle, x, y, r)
          ctxPuzzle.stroke()
          ctxPuzzle.drawImage(res.path, 0, 0, that.data.width, that.data.height);
          ctxPuzzle.restore();
          ctxPuzzle.draw(false, setTimeout(() => {
            wx.canvasToTempFilePath({
              canvasId: 'canvasPuzzle',
              success: function (e) {
                console.log("!!!!", e.tempFilePath)
                that.setData({
                  imgPuzzle: e.tempFilePath,
                  puzzleShow: true,
                })
              },
              fail: function (e) {
                console.log("AAAA", e)
              }
            }, that)
          }, 150))
        }
      })
      // 缺口
      ctxShadow.setFillStyle('white')
      that.clip(ctxShadow, x, y, r)
      ctxShadow.fillRect(0, 0, that.data.width, that.data.height)
      ctxShadow.restore()
      ctxShadow.draw(false, setTimeout(function() {
        wx.canvasToTempFilePath({
          canvasId: 'canvasShadow',
          success: function (e) {
            console.log("!!!!", e.tempFilePath)
            that.setData({
              imgShadow: e.tempFilePath,
              shadowShow: true
            })
          },
          fail: function (e) {
            console.log("AAAA", e)
          }
        }, that)
      }, 150))
    },
    clip(ctx, x, y, r) {
      ctx.save();
      //开始一个新的绘制路径
      ctx.beginPath();
      //设置路径起点坐标
      ctx.moveTo(x, y);
      ctx.arcTo(x, y - r, x + r, y - r, r);
      ctx.lineTo(x + 2 * r, y - r);
      ctx.arcTo(x + 2 * r, y - 2 * r, x + 3 * r, y - 2 * r, r);
      ctx.arcTo(x + 4 * r, y - 2 * r, x + 4 * r, y - r, r);
      ctx.lineTo(x + 5 * r, y - r);
      ctx.arcTo(x + 6 * r, y - r, x + 6 * r, y, r);
      ctx.lineTo(x + 6 * r, y + r);
      ctx.arcTo(x + 7 * r, y + r, x + 7 * r, y + 2 * r, r);
      ctx.arcTo(x + 7 * r, y + 3 * r, x + 6 * r, y + 3 * r, r);
      ctx.lineTo(x + 6 * r, y + 4 * r);
      ctx.arcTo(x + 6 * r, y + 5 * r, x + 5 * r, y + 5 * r, r);
      ctx.lineTo(x + 4 * r, y + 5 * r);
      ctx.arcTo(x + 4 * r, y + 4 * r, x + 3 * r, y + 4 * r, r);
      ctx.arcTo(x + 2 * r, y + 4 * r, x + 2 * r, y + 5 * r, r);
      ctx.lineTo(x + r, y + 5 * r);
      ctx.arcTo(x, y + 5 * r, x, y + 4 * r, r);
      ctx.lineTo(x, y + 3 * r);
      ctx.arcTo(x + r, y + 3 * r, x + r, y + 2 * r, r);
      ctx.arcTo(x + r, y + r, x, y + r, r);
      ctx.lineTo(x, y);
      //先关闭绘制路径。注意，此时将会使用直线连接当前端点和起始端点。
      ctx.closePath();
      ctx.clip();
      ctx.stroke(); //画线轮廓
    },
    onChange(e) {
      this.setData({
        oldx: e.detail.x,
        translateX:this.data.oriX+e.detail.x
      })
    },
    onEnd() {
      if (this.data.isOk) {
        return;
      }
      if (((this.data.oldx) > (-this.data.oriX-2))&&(this.data.oldx<(2-this.data.oriX))) {
        this.triggerEvent('result');
      } else {
        this.setData({
          x: 0,
          oldx: 0
        })
      }
    },
    flashcheck() {
      this.triggerEvent('flash')
    }
  }
})
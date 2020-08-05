/**
 * 微信小程序中的无法获取canvas的宽高，需要我们手动去设置
 * 可以通过getSystemIfo获取，设备宽高，然后计算所需数值
 * 1.创建两个Canvas,一个用来当验证背景（底），一个用来当拼接块
 * 2.同坐标下一个
 */
  // tech_vote/components/checkcode/checkcode.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    img: 'tech_vote/resource/check/1.jpg',
    show: true,
    width: '',
    height: '',
    pic: '',
    y: '',
    x: '',
    left: 0
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      let that = this;
      wx.getSystemInfo({
        success: function (res) {
          that.windowWidth = res.windowWidth;
          that.windowHeight = res.windowHeight;
          let width = (res.windowWidth / 750) * 540;
          let height = (res.windowHeight / 750) * 360;
          that.setData({
            width: width,
            height: height
          })
        },
      })
      const canvas = wx.createCanvasContext('canvas1');
      const block = wx.createCanvasContext('block'),
        three = wx.createCameraContext('three');
      wx.getImageInfo({
        src: that.data.img,
        success (res) {
          console.log(res);
        }
      })
      const img = that.data.img,
        canvas_width = that.data.width,
        canvas_height = that.data.height * 0.3;
      let l = 50,
        x = 150 + Math.random() * (canvas_width - l - 150),
        y = 10 + Math.random() * (canvas_height - l - 10);
      that.setData({
        block_w: l,
        y: y,
        x: x
      })
      canvas.drawImage(img, 0, 0, canvas_width, canvas_height);
      canvas.draw(false, setTimeout(() => {
        wx.canvasToTempFilePath({
          x: x,
          y: y,
          width: l,
          height: l,
          canvasId: 'canvas1',
          fileType: 'png',
          success(res) {
            console.log(res.tempFilePath)
            that.setData({
              pic: res.tempFilePath
            })
          },
          fail: err => {
            console.log(err)
          }
        }, this)
      }, 500))
      block.beginPath()
      block.moveTo(x, y)
      block.lineTo(x, y + l)
      block.lineTo(x + l, y + l)
      block.lineTo(x + l, y)
      block.globalCompositeOperation = 'xor'
      block.fill()
      block.drawImage(img, 0, 0, canvas_width, canvas_height);
      block.draw()
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    move: function (res) {
      let left = res.detail.x;
      if (left > 0) {
        this.setData({
          left: left
        })
      }
    },
    end: function (res) {
      if (this.data.show) {
        let end = this.data.left,
          moves = this.data.x;
        if (Math.abs(end - moves) < 2) {
          console.log('bingo')
          wx.showToast({
            title: '验证成功',
            icon: 'success',
            duration: 2000
          })
          this.setData({
            show: false
          })
          setTimeout(function () {
            wx.redirectTo({
              url: 'verification',
            })
          }, 2000)
        } else {
          this.setData({
            left: 0
          })
        }
      }
    }
  }
})

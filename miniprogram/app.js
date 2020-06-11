var util = require('third-party/resource/js/util.js');
App({
    //imagesurl
    datalist:{},
    domainPath:'',
    //加载微擎工具类
    util: util,
    globalData:null,
    userInfo: {
        sessionid: null,
    },
    "tabBar": {
      "color": "#C5C6C6",
      "selectedColor": "#282828",
        "borderStyle": "#fff",
        "backgroundColor": "#fff",
        "list": [
            {
                "pagePath": "/tech_vote/pages/list/list",
                "iconPath": "../../resource/icon/home_normal.png",
                "selectedIconPath": "../../resource/icon/home_selected.png",
                "text": "首页",
                "type":'1'
            },
            {
              "pagePath": "/tech_vote/pages/publishlist/publishA/publishA",
              "iconPath": "../../resource/icon/issue_normal.png",
              "selectedIconPath": "../../resource/icon/issue_selected.png",
                "text": "发起投票",
                "type": '5'
            },
            {
              "pagePath": "/tech_vote/pages/center/center",
              "iconPath": "../../resource/icon/me_normal.png",
              "selectedIconPath": "../../resource/icon/me_selected.png",
                "text": "我的",
                "type": '1'
            }
        ]
    },
    onLaunch:function(){
        wx.cloud.init({
            env: "toupiao-0a4k2",
        })
    },
    siteInfo: require('siteinfo.js')
});
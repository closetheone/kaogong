export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/practice/index',
    'pages/practice/detail',
    'pages/wrong/index',
    'pages/profile/index',
    'pages/mock-exam/index',
    'pages/mock-exam/exam',
    'pages/mock-exam/result'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '考公助手',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#667eea',
    backgroundColor: '#f8f8f8',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: 'pages/practice/index',
        text: '刷题',
        iconPath: 'assets/practice.png',
        selectedIconPath: 'assets/practice-active.png'
      },
      {
        pagePath: 'pages/wrong/index',
        text: '错题',
        iconPath: 'assets/wrong.png',
        selectedIconPath: 'assets/wrong-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/profile.png',
        selectedIconPath: 'assets/profile-active.png'
      }
    ]
  }
})

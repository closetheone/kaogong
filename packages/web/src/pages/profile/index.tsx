import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface UserInfo {
  nickname: string
  avatar: string
  targetExam: string
  studyDays: number
  totalQuestions: number
  accuracy: number
}

export default function Profile() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nickname: '考公人',
    avatar: 'https://via.placeholder.com/100',
    targetExam: '2026年国考',
    studyDays: 0,
    totalQuestions: 0,
    accuracy: 0
  })

  useEffect(() => {
    // TODO: 从API获取用户信息
    // loadUserInfo()
  }, [])

  const menuItems = [
    { icon: '📊', label: '学习统计', path: '/pages/stats/index' },
    { icon: '🎯', label: '目标设置', path: '/pages/settings/target' },
    { icon: '⚙️', label: '设置', path: '/pages/settings/index' },
    { icon: '💬', label: '意见反馈', path: '/pages/feedback/index' },
    { icon: 'ℹ️', label: '关于我们', path: '/pages/about/index' }
  ]

  const handleMenuClick = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  const handleEditProfile = () => {
    Taro.navigateTo({ url: '/pages/profile/edit' })
  }

  return (
    <View className='profile'>
      <View className='user-card'>
        <Image 
          className='avatar'
          src={userInfo.avatar}
          mode='aspectFill'
        />
        <View className='user-info'>
          <Text className='nickname'>{userInfo.nickname}</Text>
          <Text className='target-exam'>目标：{userInfo.targetExam}</Text>
        </View>
        <View className='edit-btn' onClick={handleEditProfile}>
          <Text>编辑</Text>
        </View>
      </View>

      <View className='stats-card'>
        <View className='stat-item'>
          <Text className='stat-value'>{userInfo.studyDays}</Text>
          <Text className='stat-label'>学习天数</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{userInfo.totalQuestions}</Text>
          <Text className='stat-label'>刷题总数</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{userInfo.accuracy}%</Text>
          <Text className='stat-label'>正确率</Text>
        </View>
      </View>

      <View className='menu-list'>
        {menuItems.map((item, index) => (
          <View 
            key={index}
            className='menu-item'
            onClick={() => handleMenuClick(item.path)}
          >
            <Text className='menu-icon'>{item.icon}</Text>
            <Text className='menu-label'>{item.label}</Text>
            <Text className='menu-arrow'>›</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

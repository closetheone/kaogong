import { View, Text, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

export default function Index() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [stats, setStats] = useState({
    todayCount: 0,
    totalCount: 0,
    accuracy: 0
  })

  useLoad(() => {
    // 获取用户信息
    loadUserInfo()
    // 获取学习统计
    loadStats()
  })

  const loadUserInfo = async () => {
    try {
      // TODO: 调用API获取用户信息
      // const res = await api.user.getProfile()
      // setUserInfo(res.data)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const loadStats = async () => {
    try {
      // TODO: 调用API获取统计数据
      // const res = await api.practice.getStats()
      // setStats(res.data)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const handleStartPractice = () => {
    Taro.navigateTo({
      url: '/pages/practice/index'
    })
  }

  const handleViewWrong = () => {
    Taro.switchTab({
      url: '/pages/wrong/index'
    })
  }

  return (
    <View className='index'>
      {/* 用户信息区域 */}
      <View className='user-section'>
        <View className='user-info'>
          <Image 
            className='avatar'
            src={userInfo?.avatar || 'https://via.placeholder.com/100'}
            mode='aspectFill'
          />
          <View className='user-detail'>
            <Text className='nickname'>
              {userInfo?.nickname || '考公人'}
            </Text>
            <Text className='motto'>
              {userInfo?.motto || '每天进步一点点'}
            </Text>
          </View>
        </View>
      </View>

      {/* 学习统计 */}
      <View className='stats-section'>
        <View className='stats-title'>
          <Text>今日学习</Text>
        </View>
        <View className='stats-grid'>
          <View className='stat-item'>
            <Text className='stat-value'>{stats.todayCount}</Text>
            <Text className='stat-label'>今日刷题</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{stats.totalCount}</Text>
            <Text className='stat-label'>累计刷题</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{stats.accuracy}%</Text>
            <Text className='stat-label'>正确率</Text>
          </View>
        </View>
      </View>

      {/* 快速入口 */}
      <View className='quick-entry'>
        <View className='entry-title'>
          <Text>快速开始</Text>
        </View>
        <View className='entry-grid'>
          <View className='entry-item' onClick={handleStartPractice}>
            <View className='entry-icon practice'>
              <Text>📝</Text>
            </View>
            <Text className='entry-text'>开始刷题</Text>
          </View>
          <View className='entry-item' onClick={handleViewWrong}>
            <View className='entry-icon wrong'>
              <Text>❌</Text>
            </View>
            <Text className='entry-text'>错题本</Text>
          </View>
          <View className='entry-item' onClick={() => Taro.navigateTo({ url: '/pages/mock-exam/index' })}>
            <View className='entry-icon mock'>
              <Text>🎯</Text>
            </View>
            <Text className='entry-text'>模拟考试</Text>
          </View>
          <View className='entry-item'>
            <View className='entry-icon plan'>
              <Text>📅</Text>
            </View>
            <Text className='entry-text'>学习计划</Text>
          </View>
        </View>
      </View>

      {/* 激励语 */}
      <View className='motivation'>
        <Text className='motivation-text'>
          💪 坚持就是胜利，上岸就在眼前！
        </Text>
      </View>
    </View>
  )
}

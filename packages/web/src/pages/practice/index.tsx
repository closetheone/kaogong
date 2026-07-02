import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const categories = [
  { id: 'verbal', name: '言语理解', icon: '📖', count: 40 },
  { id: 'quantitative', name: '数量关系', icon: '🔢', count: 15 },
  { id: 'judgment', name: '判断推理', icon: '🧠', count: 40 },
  { id: 'data', name: '资料分析', icon: '📊', count: 20 },
  { id: 'common', name: '常识判断', icon: '💡', count: 20 }
]

export default function Practice() {
  const handleStartPractice = (categoryId: string, categoryName: string) => {
    Taro.navigateTo({
      url: `/pages/practice/detail?category=${categoryId}&name=${categoryName}`
    })
  }

  return (
    <View className='practice'>
      <View className='header'>
        <Text className='title'>选择练习模块</Text>
        <Text className='subtitle'>2026年国考行测真题</Text>
      </View>

      <View className='category-list'>
        {categories.map(category => (
          <View 
            key={category.id}
            className='category-card'
            onClick={() => handleStartPractice(category.id, category.name)}
          >
            <View className='category-icon'>
              <Text>{category.icon}</Text>
            </View>
            <View className='category-info'>
              <Text className='category-name'>{category.name}</Text>
              <Text className='category-count'>{category.count}题</Text>
            </View>
            <View className='category-arrow'>
              <Text>›</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='tips'>
        <Text className='tips-title'>💡 刷题建议</Text>
        <View className='tips-content'>
          <Text>• 建议按模块顺序练习，循序渐进</Text>
          <Text>• 每题控制在1-2分钟内</Text>
          <Text>• 错题及时复习，巩固知识点</Text>
        </View>
      </View>
    </View>
  )
}

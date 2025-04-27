<template>
  <div class="breadcrumb-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
        <router-link v-if="item.path && index !== breadcrumbList.length - 1" :to="item.path">
          {{ item.title }}
        </router-link>
        <span v-else>{{ item.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'Breadcrumb'
}
</script>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// 路由对象
const route = useRoute()

// 面包屑列表
const breadcrumbList = ref([{ title: '首页', path: '/' }])

// 生成面包屑数据
const generateBreadcrumb = () => {
  breadcrumbList.value = [{ title: '首页', path: '/' }]
  
  // 如果是首页，不添加其他面包屑
  if (route.path === '/') return
  
  // 根据当前路由生成面包屑
  const pathList = route.path.split('/').filter(Boolean)
  
  // 构建面包屑路径
  let currentPath = ''
  pathList.forEach((path, index) => {
    currentPath += `/${path}`
    
    // 从路由meta中获取标题，或者使用路径的首字母大写形式
    const title = route.matched[index + 1]?.meta.title || 
                  path.charAt(0).toUpperCase() + path.slice(1)
    
    breadcrumbList.value.push({
      title,
      path: index === pathList.length - 1 ? '' : currentPath
    })
  })
}

// 监听路由变化，生成面包屑
watch(
  () => route.path,
  () => {
    generateBreadcrumb()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.breadcrumb-container {
  padding: 12px 0;
  background-color: #f9f9f9;
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
  
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: #909399;
      
      &.is-link {
        color: #606266;
        
        &:hover {
          color: #f27c8d;
        }
      }
    }
    
    &:last-child {
      .el-breadcrumb__inner {
        color: #303133;
      }
    }
  }
}
</style> 
<template>
  <div class="not-found-page">
    <main-layout>
      <div class="not-found-container text-center py-20">
        <img src="../assets/404.png" alt="404" class="not-found-image mx-auto mb-6" />
        
        <h1 class="text-3xl font-bold mb-4">页面走丢了～</h1>
        <p class="text-gray-500 mb-8">抱歉，您访问的页面不存在或已被删除</p>
        
        <div class="flex justify-center gap-4">
          <el-button type="primary" @click="goHome">返回首页</el-button>
          <el-button @click="goBack">返回上一页</el-button>
        </div>
      </div>
    </main-layout>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<script setup>
import { useRouter } from 'vue-router'


const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.not-found-container {
  max-width: 600px;
  margin: 0 auto;
}

.not-found-image {
  max-width: 300px;
}
</style> 

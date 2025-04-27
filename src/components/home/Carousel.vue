<template>
  <div class="carousel-container">
    <el-carousel :interval="4000" type="card" height="450px">
      <el-carousel-item v-for="(item, index) in carouselData" :key="index">
        <div class="carousel-item" @click="handleCarouselClick(item)" :style="{backgroundImage: `url(${item.imageUrl})`}">
          <div class="carousel-content">
            <h2 class="carousel-title">{{ item.title }}</h2>
            <p class="carousel-description">{{ item.description }}</p>
            <el-button type="primary" class="carousel-button" @click.stop="handleCarouselClick(item)">
              {{ item.buttonText }}
            </el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
export default {
  name: 'Carousel'
}
</script>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 轮播图数据
const carouselData = ref([
  {
    id: 1,
    title: '婴儿奶粉特惠季',
    description: '进口奶粉低至7折，满199减50',
    buttonText: '立即抢购',
    imageUrl: 'https://img.freepik.com/free-photo/happy-mother-cute-baby-playing-bed_23-2148989691.jpg',
    link: '/products/milk'
  },
  {
    id: 2,
    title: '婴儿推车新品上市',
    description: '轻便折叠，舒适安全，新客首单享8.5折',
    buttonText: '查看详情',
    imageUrl: 'https://img.freepik.com/free-photo/baby-development-concept-with-wooden-blocks_23-2149152094.jpg',
    link: '/products/stroller'
  },
  {
    id: 3,
    title: '宝宝玩具季',
    description: '益智玩具，促进宝宝认知发展',
    buttonText: '去看看',
    imageUrl: 'https://img.freepik.com/free-photo/mother-playing-with-baby-home_23-2148955142.jpg',
    link: '/products/toys'
  },
  {
    id: 4,
    title: '婴儿护肤品套装',
    description: '温和无刺激，呵护宝宝娇嫩肌肤',
    buttonText: '了解更多',
    imageUrl: 'https://img.freepik.com/free-photo/mother-her-daughter-sitting-bed-playing-laptop_23-2148225542.jpg',
    link: '/products/skincare'
  }
])

// 点击轮播图
const handleCarouselClick = (item) => {
  router.push(item.link)
}
</script>

<style lang="scss" scoped>
.carousel-container {
  width: 100%;
  margin: 20px 0 40px;
}

.carousel-item {
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%);
    border-radius: 6px;
  }
}

.carousel-content {
  position: relative;
  padding: 0 50px;
  max-width: 500px;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.carousel-title {
  font-size: 32px;
  margin-bottom: 10px;
}

.carousel-description {
  font-size: 18px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.carousel-button {
  padding: 12px 25px;
  font-size: 16px;
}

:deep(.el-carousel__item) {
  transition: transform 0.4s ease;
  
  &.is-active {
    z-index: 10;
  }
}

:deep(.el-carousel__arrow) {
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  
  &:hover {
    background-color: white;
  }
}

@media (max-width: 768px) {
  .carousel-content {
    padding: 0 30px;
  }
  
  .carousel-title {
    font-size: 24px;
  }
  
  .carousel-description {
    font-size: 14px;
  }
}
</style> 
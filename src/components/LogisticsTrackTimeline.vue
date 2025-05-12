<template>
  <div class="logistics-timeline">
    <div class="timeline-empty" v-if="!tracks || tracks.length === 0">
      <el-empty description="暂无物流轨迹信息" :image-size="80" />
    </div>
    
    <div class="timeline" v-else>
      <div 
        v-for="(track, index) in tracks" 
        :key="index" 
        class="timeline-item"
        :class="{ 'is-first': index === 0 }"
      >
        <!-- 时间线节点 -->
        <div class="timeline-node" :class="getNodeClass(track.status)">
          <div class="node-inner"></div>
        </div>
        
        <!-- 时间线内容 -->
        <div class="timeline-content">
          <div class="timeline-time">{{ formatTime(track.trackingTime) }}</div>
          <div class="timeline-info">
            <div class="timeline-status" v-if="track.status">
              <el-tag size="small" :type="getStatusType(track.status)">
                {{ getStatusText(track.status) }}
              </el-tag>
            </div>
            <div class="timeline-text">{{ track.content }}</div>
            <div class="timeline-location" v-if="track.location">{{ track.location }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/date'

// 组件属性
const props = defineProps({
  // 轨迹数据数组
  tracks: {
    type: Array,
    default: () => []
  }
})

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  return formatDate(time, 'MM-DD HH:mm')
}

// 获取节点样式类
const getNodeClass = (status) => {
  const statusMap = {
    'CREATED': 'node-info',
    'SHIPPING': 'node-primary',
    'DELIVERED': 'node-success',
    'EXCEPTION': 'node-danger'
  }
  return statusMap[status] || 'node-info'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    'CREATED': 'info',
    'SHIPPING': 'primary',
    'DELIVERED': 'success',
    'EXCEPTION': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'CREATED': '已创建',
    'SHIPPING': '运输中',
    'DELIVERED': '已送达',
    'EXCEPTION': '异常'
  }
  return textMap[status] || status
}
</script>

<style lang="scss" scoped>
.logistics-timeline {
  padding: 10px 0;
  
  .timeline-empty {
    padding: 20px 0;
    display: flex;
    justify-content: center;
  }
  
  .timeline {
    position: relative;
    
    &:before {
      content: '';
      position: absolute;
      left: 7px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #E4E7ED;
    }
    
    .timeline-item {
      position: relative;
      padding-bottom: 20px;
      display: flex;
      
      &:last-child {
        padding-bottom: 0;
      }
      
      .timeline-node {
        position: relative;
        width: 16px;
        height: 16px;
        background-color: #fff;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 15px;
        z-index: 1;
        
        .node-inner {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #909399;
        }
        
        &.node-primary .node-inner {
          background-color: #409EFF;
        }
        
        &.node-success .node-inner {
          background-color: #67C23A;
        }
        
        &.node-warning .node-inner {
          background-color: #E6A23C;
        }
        
        &.node-danger .node-inner {
          background-color: #F56C6C;
        }
        
        &.node-info .node-inner {
          background-color: #909399;
        }
      }
      
      .timeline-content {
        flex: 1;
        
        .timeline-time {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }
        
        .timeline-info {
          background-color: #F5F7FA;
          padding: 10px;
          border-radius: 4px;
          
          .timeline-status {
            margin-bottom: 6px;
          }
          
          .timeline-text {
            font-size: 14px;
            color: #333;
            margin-bottom: 4px;
            line-height: 1.5;
          }
          
          .timeline-location {
            font-size: 12px;
            color: #606266;
          }
        }
      }
      
      &.is-first {
        .timeline-content {
          .timeline-info {
            background-color: #67C23A1A;
            border-left: 3px solid #67C23A;
          }
        }
      }
    }
  }
}
</style> 
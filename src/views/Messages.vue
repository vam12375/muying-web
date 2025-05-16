<template>
  <div class="messages-container">
    <div class="messages-header">
      <h1 class="page-title">消息中心</h1>
      <div class="action-buttons">
        <el-button type="primary" @click="handleMarkAllRead" :disabled="!messageStore.hasUnreadMessages">
          全部标为已读
        </el-button>
      </div>
    </div>

    <!-- 消息类型标签栏 -->
    <div class="message-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="全部消息" name="all">
          <el-badge :value="messageStore.unreadCount" :hidden="!messageStore.hasUnreadMessages" />
        </el-tab-pane>
        <el-tab-pane label="订单消息" name="order">
          <el-badge :value="messageStore.unreadCountByType.order" :hidden="!messageStore.unreadCountByType.order" />
        </el-tab-pane>
        <el-tab-pane label="系统通知" name="system">
          <el-badge :value="messageStore.unreadCountByType.system" :hidden="!messageStore.unreadCountByType.system" />
        </el-tab-pane>
        <el-tab-pane label="活动消息" name="promotion">
          <el-badge 
            :value="messageStore.unreadCountByType.promotion" 
            :hidden="!messageStore.unreadCountByType.promotion" 
          />
        </el-tab-pane>
        <el-tab-pane label="积分消息" name="points">
          <el-badge :value="messageStore.unreadCountByType.points" :hidden="!messageStore.unreadCountByType.points" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 消息列表 -->
    <div class="message-list">
      <el-skeleton :rows="3" animated :loading="loading && !initialized">
        <template v-if="messageList.length > 0">
          <div
            v-for="message in messageList"
            :key="message.messageId"
            :class="['message-item', { 'unread': message.isRead === 0 }]"
            @click="handleMessageClick(message)"
          >
            <div class="message-header">
              <div class="message-title">
                <div class="title-text">{{ message.title }}</div>
                <el-tag v-if="message.isRead === 0" size="small" type="danger">未读</el-tag>
                <el-tag v-else size="small" type="info">已读</el-tag>
              </div>
              <div class="message-time">{{ formatDate(message.createTime) }}</div>
            </div>
            <div class="message-content">{{ message.content }}</div>
            <div class="message-footer">
              <div class="message-type">{{ getMessageTypeDesc(message.type) }}</div>
              <div class="message-actions">
                <el-button
                  v-if="message.isRead === 0"
                  type="text"
                  size="small"
                  @click.stop="handleMarkRead(message)"
                >
                  标为已读
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click.stop="handleDelete(message)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无消息" />
      </el-skeleton>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 消息详情对话框 -->
    <el-dialog v-model="dialogVisible" title="消息详情" width="40%">
      <div v-if="selectedMessage" class="message-detail">
        <h2 class="detail-title">{{ selectedMessage.title }}</h2>
        <div class="detail-meta">
          <span class="detail-time">{{ formatDate(selectedMessage.createTime) }}</span>
          <span class="detail-type">{{ getMessageTypeDesc(selectedMessage.type) }}</span>
        </div>
        <div class="detail-content">{{ selectedMessage.content }}</div>
        <div class="detail-actions">
          <el-button
            v-if="selectedMessage.type === 'order' && selectedMessage.extra"
            type="primary"
            @click="viewOrderDetail"
          >
            查看订单
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMessageStore } from '@/stores/message';
import { ElMessage, ElMessageBox } from 'element-plus';
import { markMessageRead, markAllAsRead, markTypeAsRead, deleteMessage } from '@/api/userMessage';

// 引入路由
const router = useRouter();
// 消息store
const messageStore = useMessageStore();

// 状态
const activeTab = ref('all');
const messageList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const initialized = ref(false);
const dialogVisible = ref(false);
const selectedMessage = ref(null);
const autoRefreshTimer = ref(null);

// 计算属性
const currentType = computed(() => {
  return activeTab.value === 'all' ? '' : activeTab.value;
});

// 初始化
onMounted(async () => {
  // 获取各类型未读消息数量
  await messageStore.fetchUnreadCountByType();
  
  // 加载消息列表
  await fetchMessageList();
  
  // 启动自动刷新
  autoRefreshTimer.value = messageStore.startAutoRefresh();
  
  initialized.value = true;
});

// 清理定时器
onBeforeUnmount(() => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value);
  }
});

// 监听标签页变化，重新获取消息
watch(activeTab, async () => {
  currentPage.value = 1;
  await fetchMessageList();
});

// 获取消息列表
const fetchMessageList = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      type: currentType.value
    };
    
    const data = await messageStore.fetchMessages(params);
    
    // 过滤掉催发货提醒消息 - 普通用户不应该看到这些消息
    const filteredMessages = (data.records || []).filter(message => message.type !== 'shipping_reminder');
    messageList.value = filteredMessages;
    total.value = data.total ? (data.total - (data.records?.length - filteredMessages.length)) : 0;
  } catch (error) {
    console.error('获取消息列表失败:', error);
    ElMessage.error('获取消息列表失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取消息类型描述
const getMessageTypeDesc = (type) => {
  // 如果是催发货消息类型，普通用户不应该看到
  if (type === 'shipping_reminder') {
    return '系统消息'; // 对用户显示为普通系统消息
  }
  
  const typeMap = {
    'system': '系统通知',
    'order': '订单消息',
    'promotion': '活动消息',
    'points': '积分消息',
    'remind': '提醒消息',
    'checkin': '签到消息'
  };
  return typeMap[type] || '其他消息';
};

// 处理标签页切换
const handleTabChange = () => {
  // 标签页变化由watch处理
  console.log('切换到标签页:', activeTab.value);
};

// 处理分页大小变化
const handleSizeChange = async (size) => {
  pageSize.value = size;
  await fetchMessageList();
};

// 处理当前页变化
const handleCurrentChange = async (page) => {
  currentPage.value = page;
  await fetchMessageList();
};

// 处理消息点击
const handleMessageClick = (message) => {
  selectedMessage.value = message;
  dialogVisible.value = true;
  
  // 如果是未读消息，自动标记为已读
  if (message.isRead === 0) {
    handleMarkRead(message, false);
  }
};

// 标记消息为已读
const handleMarkRead = async (message, showTip = true) => {
  try {
    const res = await markMessageRead(message.messageId);
    if (res.code === 200) {
      // 更新本地状态
      message.isRead = 1;
      message.readTime = new Date();
      
      // 更新未读消息数量
      await messageStore.fetchUnreadCount();
      await messageStore.fetchUnreadCountByType();
      
      if (showTip) {
        ElMessage.success('已标记为已读');
      }
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch (error) {
    console.error('标记已读失败:', error);
    ElMessage.error('操作失败，请稍后再试');
  }
};

// 标记所有消息为已读
const handleMarkAllRead = async () => {
  try {
    let res;
    if (activeTab.value === 'all') {
      res = await markAllAsRead();
    } else {
      res = await markTypeAsRead(activeTab.value);
    }
    
    if (res.code === 200) {
      // 更新消息列表中的已读状态
      messageList.value.forEach(msg => {
        msg.isRead = 1;
        msg.readTime = new Date();
      });
      
      // 更新未读消息数量
      await messageStore.fetchUnreadCount();
      await messageStore.fetchUnreadCountByType();
      
      ElMessage.success('已全部标记为已读');
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch (error) {
    console.error('标记全部已读失败:', error);
    ElMessage.error('操作失败，请稍后再试');
  }
};

// 删除消息
const handleDelete = async (message) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const res = await deleteMessage(message.messageId);
    if (res.code === 200) {
      // 从列表中移除
      messageList.value = messageList.value.filter(msg => msg.messageId !== message.messageId);
      
      // 如果是未读消息，更新未读计数
      if (message.isRead === 0) {
        await messageStore.fetchUnreadCount();
        await messageStore.fetchUnreadCountByType();
      }
      
      ElMessage.success('删除成功');
      
      // 关闭详情对话框（如果正在显示）
      if (dialogVisible.value && selectedMessage.value?.messageId === message.messageId) {
        dialogVisible.value = false;
      }
    } else {
      ElMessage.error(res.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除消息失败:', error);
      ElMessage.error('删除失败，请稍后再试');
    }
  }
};

// 查看订单详情
const viewOrderDetail = () => {
  try {
    if (selectedMessage.value && selectedMessage.value.extra) {
      // 解析extra中的orderId
      const extraData = JSON.parse(selectedMessage.value.extra);
      if (extraData && extraData.orderId) {
        // 跳转到订单详情页
        router.push(`/order/${extraData.orderId}`);
        dialogVisible.value = false;
      }
    }
  } catch (error) {
    console.error('解析订单数据失败:', error);
    ElMessage.error('无法查看订单详情');
  }
};
</script>

<style scoped>
.messages-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.message-tabs {
  margin-bottom: 20px;
}

.message-list {
  min-height: 300px;
}

.message-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s;
}

.message-item:hover {
  background-color: #f9f9f9;
}

.message-item.unread {
  background-color: #f0f9ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.message-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-text {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.message-time {
  color: #999;
  font-size: 13px;
}

.message-content {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-type {
  color: #909399;
  font-size: 13px;
}

.message-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 消息详情样式 */
.message-detail {
  padding: 10px;
}

.detail-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: #909399;
  font-size: 14px;
}

.detail-content {
  line-height: 1.6;
  margin-bottom: 20px;
  color: #666;
  white-space: pre-line;
}

.detail-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 
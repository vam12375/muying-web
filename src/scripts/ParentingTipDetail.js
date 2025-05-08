import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useParentingTipsStore } from '@/stores/parentingTips';
import { formatDate as formatDateUtil } from '@/utils/format';
import { getParentingTipComments, addParentingTipComment, increaseViewCount } from '@/api/parentingTips';

export default function useParentingTipDetail() {
  const route = useRoute();
  const router = useRouter();
  const parentingTipsStore = useParentingTipsStore();

  // 状态
  const loading = computed(() => parentingTipsStore.detailLoading);
  const currentTip = computed(() => parentingTipsStore.currentTip);
  const relatedTips = computed(() => parentingTipsStore.relatedTips);

  // 评论相关
  const comments = ref([]);
  const commentContent = ref('');
  const commentPage = ref(1);
  const commentPageSize = ref(10);
  const commentTotal = ref(0);
  const commentsLoading = ref(false);
  const commentSubmitting = ref(false);

  // 格式化文章内容（将换行符转换为HTML）
  const formattedContent = computed(() => {
    if (!currentTip.value || !currentTip.value.content) return '';
    return currentTip.value.content
      .replace(/\n/g, '<br />')
      .replace(/\s{2}/g, '&nbsp;&nbsp;');
  });

  // 生命周期钩子
  onMounted(async () => {
    // 获取文章ID
    const tipId = route.params.id;
    if (!tipId) {
      ElMessage.error('参数错误');
      router.push('/parenting-tips');
      return;
    }
    
    // 获取分类
    await parentingTipsStore.fetchCategories();
    
    // 获取文章详情
    const tip = await parentingTipsStore.fetchTipDetail(tipId);
    
    if (tip) {
      // 记录浏览量
      increaseViewCount(tipId).catch(err => {
        console.error('增加浏览量失败:', err);
      });
      
      // 获取相关文章
      parentingTipsStore.fetchRelatedTips(tip.categoryId, tipId);
      
      // 获取评论
      fetchComments();
    }
  });

  onUnmounted(() => {
    // 清除当前文章
    parentingTipsStore.clearCurrentTip();
  });

  // 方法
  const fetchComments = async () => {
    if (!currentTip.value) return;
    
    commentsLoading.value = true;
    
    try {
      const res = await getParentingTipComments(currentTip.value.id, {
        page: commentPage.value,
        pageSize: commentPageSize.value
      });
      
      if (res.code === 200) {
        comments.value = res.data.list || [];
        commentTotal.value = res.data.total || 0;
      } else {
        console.error('获取评论失败:', res.message);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    } finally {
      commentsLoading.value = false;
    }
  };

  const submitComment = async () => {
    if (!currentTip.value) return;
    
    if (!commentContent.value.trim()) {
      ElMessage.warning('评论内容不能为空');
      return;
    }
    
    commentSubmitting.value = true;
    
    try {
      const res = await addParentingTipComment(currentTip.value.id, {
        content: commentContent.value.trim()
      });
      
      if (res.code === 200) {
        ElMessage.success('评论发表成功');
        commentContent.value = '';
        
        // 重新获取评论列表（回到第一页）
        commentPage.value = 1;
        fetchComments();
      } else {
        ElMessage.error(res.message || '评论发表失败');
      }
    } catch (error) {
      console.error('评论发表失败:', error);
      ElMessage.error('评论发表失败，请稍后重试');
    } finally {
      commentSubmitting.value = false;
    }
  };

  const handleCommentPageChange = (page) => {
    commentPage.value = page;
    fetchComments();
  };

  const getCategoryName = (categoryId) => {
    return parentingTipsStore.getCategoryName(categoryId);
  };

  const viewTipDetail = (id) => {
    // 如果点击的是同一篇文章，滚动到顶部
    if (id === Number(route.params.id)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // 否则跳转到新文章
    router.push(`/parenting-tips/detail/${id}`);
  };

  const goBack = () => {
    router.push('/parenting-tips');
  };

  const formatDate = (date) => {
    return formatDateUtil(date, 'YYYY-MM-DD HH:mm');
  };

  return {
    // 状态
    loading,
    currentTip,
    relatedTips,
    comments,
    commentContent,
    commentPage,
    commentPageSize,
    commentTotal,
    commentsLoading,
    commentSubmitting,
    formattedContent,
    
    // 方法
    fetchComments,
    submitComment,
    handleCommentPageChange,
    getCategoryName,
    viewTipDetail,
    goBack,
    formatDate
  };
} 
<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <ul>
            <li><router-link to="/about">公司简介</router-link></li>
            <li><router-link to="/contact">联系我们</router-link></li>
            <li><router-link to="/join">招贤纳士</router-link></li>
            <li><router-link to="/terms">服务条款</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3>购物指南</h3>
          <ul>
            <li><router-link to="/guide/shopping">购物流程</router-link></li>
            <li><router-link to="/guide/payment">支付方式</router-link></li>
            <li><router-link to="/guide/delivery">配送方式</router-link></li>
            <li><router-link to="/guide/service">售后服务</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3>帮助中心</h3>
          <ul>
            <li><router-link to="/help/faq">常见问题</router-link></li>
            <li><router-link to="/help/return">退换货流程</router-link></li>
            <li><router-link to="/help/warranty">保修政策</router-link></li>
            <li><router-link to="/help/complaint">投诉建议</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section contact-section">
          <h3>联系我们</h3>
          <p><i class="el-icon-phone"></i> 客服热线: 400-123-4567</p>
          <p><i class="el-icon-message"></i> 客服邮箱: service@muyingmall.com</p>
          <p><i class="el-icon-time"></i> 工作时间: 9:00-22:00</p>
          <div class="social-media">
            <a href="#" title="微信"><i class="icon-wechat"></i></a>
            <a href="#" title="微博"><i class="icon-weibo"></i></a>
            <a href="#" title="抖音"><i class="icon-tiktok"></i></a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="copyright">
          &copy; {{ new Date().getFullYear() }} 母婴商城 版权所有
        </div>
        <div class="icp">
          <a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备12345678号</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style lang="scss" scoped>
.site-footer {
  background-color: #f5f5f5;
  padding: 40px 0 20px;
  margin-top: 40px;
  color: #666;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 30px;
}

.footer-section {
  width: 22%;
  margin-bottom: 20px;
  
  h3 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #333;
    font-weight: 500;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      margin-bottom: 8px;
      
      a {
        color: #666;
        text-decoration: none;
        transition: color 0.3s;
        
        &:hover {
          color: #f27c8d;
        }
      }
    }
  }
}

.contact-section {
  p {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 8px;
      font-size: 16px;
    }
  }
  
  .social-media {
    margin-top: 15px;
    display: flex;
    
    a {
      margin-right: 12px;
      color: #666;
      font-size: 20px;
      transition: color 0.3s;
      
      &:hover {
        color: #f27c8d;
      }
    }
  }
}

.footer-bottom {
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 14px;
  
  .copyright, .icp {
    margin-bottom: 10px;
  }
  
  .icp a {
    color: #666;
    text-decoration: none;
    
    &:hover {
      color: #f27c8d;
    }
  }
}

@media (max-width: 768px) {
  .footer-section {
    width: 48%;
  }
}

@media (max-width: 576px) {
  .footer-section {
    width: 100%;
  }
  
  .footer-bottom {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style> 
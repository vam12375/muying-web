/**
 * 懒加载工具类
 * 用于组件懒加载、图片懒加载等，提高应用性能
 */
import { defineAsyncComponent } from 'vue';

/**
 * 异步组件加载函数，带有加载状态和错误处理
 * @param {Function} loader 组件加载函数
 * @param {Object} options 加载选项
 * @returns {Object} Vue异步组件
 */
export function asyncComponent(loader, options = {}) {
  // 默认加载配置
  const defaultOptions = {
    delay: 200, // 显示加载组件前的延迟时间
    timeout: 30000, // 超时时间
    loadingComponent: null, // 加载中显示的组件
    errorComponent: null, // 加载失败显示的组件
    // 加载中钩子，返回true将展示loadingComponent，否则展示加载中微调器
    // onLoadingComponent 参数见下方 defineAsyncComponent 中的 onLoadingComponent
    onLoadingComponent: null,
    // 如果提供，则加载失败时会调用该函数得到一个返回值
    // onError 参数见下方 defineAsyncComponent 中的 onError
    onError: null,
  };

  // 合并配置选项
  const mergedOptions = { ...defaultOptions, ...options };

  // 使用Vue的defineAsyncComponent创建异步组件
  return defineAsyncComponent({
    loader,
    delay: mergedOptions.delay,
    timeout: mergedOptions.timeout,
    loadingComponent: mergedOptions.loadingComponent,
    errorComponent: mergedOptions.errorComponent,
    onError: mergedOptions.onError,
  });
}

/**
 * 批量注册懒加载组件
 * @param {Object} components 组件映射对象 { name: importFn }
 * @param {Object} options 公共加载选项
 * @returns {Object} 注册后的组件对象
 */
export function registerLazyComponents(components, options = {}) {
  const registeredComponents = {};
  
  for (const [name, importFn] of Object.entries(components)) {
    registeredComponents[name] = asyncComponent(importFn, options);
  }
  
  return registeredComponents;
}

/**
 * 创建路由懒加载函数
 * @param {Function} importFn 导入函数
 * @returns {Function} 用于Vue Router的懒加载函数
 */
export function lazyRoute(importFn) {
  return () => importFn();
}

/**
 * 创建预加载路由模块
 * 预加载但不立即执行，提高后续路由切换速度
 * @param {Function} importFn 导入函数
 * @returns {Function} 预加载路由函数
 */
export function prefetchRoute(importFn) {
  const lazyModule = lazyRoute(importFn);
  // 在下一个空闲时间预加载模块
  window.setTimeout(() => {
    lazyModule();
  }, 1000);
  return lazyModule;
}

/**
 * 创建图片懒加载指令
 * @returns {Object} Vue指令对象
 */
export function createLazyImageDirective() {
  return {
    mounted(el, binding) {
      // 支持传入图片URL或对象形式 { src: url, placeholder: url }
      let src = typeof binding.value === 'string' ? binding.value : binding.value?.src;
      let placeholder = binding.value?.placeholder || '';
      
      if (!src) return;
      
      // 创建Intersection Observer用于检测元素是否进入视图
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 元素进入视图，加载图片
            if (el.tagName === 'IMG') {
              // 如果是img标签，直接设置src
              el.src = src;
            } else {
              // 如果是其他标签，设置背景图
              el.style.backgroundImage = `url(${src})`;
            }
            
            // 图片加载完成后的处理
            const img = new Image();
            img.onload = () => {
              // 添加已加载类，可用于CSS过渡效果
              el.classList.add('lazy-loaded');
              // 移除占位图类
              el.classList.remove('lazy-loading');
            };
            
            img.onerror = () => {
              // 图片加载失败处理
              el.classList.add('lazy-error');
              console.error('图片加载失败:', src);
            };
            
            img.src = src;
            
            // 取消观察
            observer.unobserve(el);
          }
        });
      }, {
        // 根据元素进入视图的比例触发加载
        threshold: 0.1,
        // 提前加载，当元素距离视口300px时开始加载
        rootMargin: '300px'
      });
      
      // 如果有占位图，先设置占位图
      if (placeholder) {
        if (el.tagName === 'IMG') {
          el.src = placeholder;
        } else {
          el.style.backgroundImage = `url(${placeholder})`;
        }
        el.classList.add('lazy-loading');
      }
      
      // 开始观察元素
      observer.observe(el);
      
      // 存储observer实例以便卸载时清理
      el._lazyLoadObserver = observer;
    },
    
    updated(el, binding) {
      // 如果绑定值变化，更新处理
      let newSrc = typeof binding.value === 'string' ? binding.value : binding.value?.src;
      let oldSrc = typeof binding.oldValue === 'string' ? binding.oldValue : binding.oldValue?.src;
      
      if (newSrc !== oldSrc) {
        // 移除旧的观察器
        if (el._lazyLoadObserver) {
          el._lazyLoadObserver.unobserve(el);
          delete el._lazyLoadObserver;
        }
        
        // 重新绑定
        binding.def.mounted(el, binding);
      }
    },
    
    unmounted(el) {
      // 组件卸载时清理观察器
      if (el._lazyLoadObserver) {
        el._lazyLoadObserver.unobserve(el);
        delete el._lazyLoadObserver;
      }
    }
  };
}

// 导出工具函数
export default {
  asyncComponent,
  registerLazyComponents,
  lazyRoute,
  prefetchRoute,
  createLazyImageDirective
}; 
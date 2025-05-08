<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MotionDiv',
  props: {
    initial: Object,
    animate: Object,
    transition: Object,
    exit: Object
  }
}
</script> 
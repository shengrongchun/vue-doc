<template>
    <span @click="changeName">{{ name }}</span>
</template>
<script>
export default {
  data() {
    return {
      name: '哈啰出行,点我试试!'
    }
  },
  methods: {
    changeName() {
      this.name = '哈啰出行，我看行'
    }
  }
}
</script>


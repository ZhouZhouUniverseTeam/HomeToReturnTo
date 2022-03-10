<template>
  <div class="right-button-link">
    <RouterLink :to="`${to}`">
      <slot></slot>
    </RouterLink>
  </div>
</template>

<script>
export default {
  name: "index",
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    to: {
      type: String
    }
  }
}
</script>

<style scoped lang="less">
.right-button-link {
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 220px;
  padding: 5px 10px;
  height: 50px;
  background-color: #fff;
  border: 2px solid #000;
  border-bottom-left-radius: 50px;
  border-top-left-radius: 50px;
  transition: all 0.3s;
  margin-right: -150px;
  margin-bottom: 20px;

  & a {
    font-size: 20px;
    text-decoration: none;
    text-align: center;
    color: #006699;
    user-select: none;
    border: none;
  }
}
.right-button-link.active {
  margin-right: 0;
}
</style>
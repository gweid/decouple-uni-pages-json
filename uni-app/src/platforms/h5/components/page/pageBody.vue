<template>
  <uni-page-wrapper>
    <uni-page-body>
      <slot />
    </uni-page-body>
  </uni-page-wrapper>
</template>
<style>
uni-page-wrapper {
  display: block;
  height: 100%;
  position: relative;
}

uni-page-head[uni-page-head-type="default"] ~ uni-page-wrapper {
  height: calc(100% - 44px);
  height: calc(100% - 44px - constant(safe-area-inset-top));
  height: calc(100% - 44px - env(safe-area-inset-top));
}

.uni-app--showtabbar uni-page-wrapper {
  display: block;
  height: calc(100% - 50px);
  height: calc(100% - 50px - constant(safe-area-inset-bottom));
  height: calc(100% - 50px - env(safe-area-inset-bottom));
}

.uni-app--showtabbar uni-page-wrapper::after {
  content: "";
  display: block;
  width: 100%;
  height: 50px;
  height: calc(50px + constant(safe-area-inset-bottom));
  height: calc(50px + env(safe-area-inset-bottom));
}

.uni-app--showtabbar uni-page-head[uni-page-head-type="default"] ~ uni-page-wrapper {
  height: calc(100% - 44px - 50px);
  height: calc(100% - 44px - constant(safe-area-inset-top) - 50px - constant(safe-area-inset-bottom));
  height: calc(100% - 44px - env(safe-area-inset-top) - 50px - env(safe-area-inset-bottom));
}

uni-page-body {
  display: block;
  box-sizing: border-box;
  width: 100%;
}
</style>
<script>
export default {
  name: 'PageBody'
}
</script>

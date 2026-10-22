<script setup>
import AdvertBanner from '../../components/AdvertBanner.vue';
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #layout-top>
      <AdvertBanner href="https://events.zoom.us/ev/Ag_xPefs5sgZrJ1NFahdYqv-WfvhdtzQOkVaQMrJcPZQilHl_XXW~AjQ-n6IUY0fUjVBbmBQPTNH9vaRjeuW6FTyjvypb8lqTF7JyYP3j_qJdQHx8jU-idBH-cpxCCfQ1dT8_beCAsxpGPA">
        <b>Node-RED Con 2026 – Nov. 3:</b> Node-RED at the Edge of Intelligence — <span class="underline">Register free today!</span>
      </AdvertBanner>
    </template>
  </Layout>
</template>
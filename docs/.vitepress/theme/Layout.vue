<script setup>
import AdvertBanner from '../../components/AdvertBanner.vue';
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #layout-top>
      <AdvertBanner href="https://events.zoom.us/ev/AqhqiQ8mTK2lnAoOEH8c8TA1a_9MzVhZq_T7d1-kMHlHDt2_Qh_0~Au3w7qmqpnpiahQlhdbsX2WTIU1irW402wkglZXvNQ12Ip_8m4ToMu4vQ5fp7ujvOn7_f6weZ70nr35LYHAmA1--vg">
        <b>Node-RED Con 2025 – Nov. 4:</b> Global Community Conference on Industrial Applications — <span class="underline">Register free today!</span>
      </AdvertBanner>
    </template>
  </Layout>
</template>
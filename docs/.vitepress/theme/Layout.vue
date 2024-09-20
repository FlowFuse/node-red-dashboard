<script setup>
// import AdvertBanner from '../../components/AdvertBanner.vue';
import Footer from '../../components/Footer.vue';
import DefaultTheme from 'vitepress/theme';

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <!-- <template #layout-top>
        <AdvertBanner href="https://flowfuse.com/webinars/2024/workshop-dashboard/">
            <b>Dashboard 2.0 Workshop: </b> Join us for a free workshop
            on how to use Dashboard 2.0 in Node-RED on July 2nd - <span class="underline">Register Now</span>
        </AdvertBanner>
    </template> -->
    <template #layout-bottom>
      <Footer />
        <!-- <AdvertBanner href="https://flowfuse.com/webinars/2024/workshop-dashboard/">
            <b>Dashboard 2.0 Workshop: </b> Join us for a free workshop
            on how to use Dashboard 2.0 in Node-RED on July 2nd - <span class="underline">Register Now</span>
        </AdvertBanner> -->
    </template>
  </Layout>
</template>
<template>
    <footer class="VPFooter">
        <div class="container">
            <p class="message">
                <CookieConsent />
            </p>
            <p class="copyright">Copyright 2024 FlowFuse Inc. All Rights Reserved.</p>
        </div>
    </footer>
</template>

<script>
import CookieConsent from './CookieConsent/CookieConsent.vue'
export default {
    name: 'SiteFooter',
    components: {
        CookieConsent
    }
}
</script>

<style>

.VPFooter {
  position: relative;
  z-index: var(--vp-z-index-footer);
  border-top: 1px solid var(--vp-c-gutter);
  padding: 32px 24px;
  background-color: var(--vp-c-bg);
}
.VPFooter.has-sidebar {
  display: none;
}
.VPFooter a {
  text-decoration-line: underline;
  text-underline-offset: 2px;
  transition: color 0.25s;
}
.VPFooter a:hover {
  color: var(--vp-c-text-1);
}
@media (min-width: 768px) {
    .VPFooter {
        padding: 32px;
    }
}
.VPFooter .container {
  margin: 0 auto;
  max-width: var(--vp-layout-max-width);
  text-align: center;
}
.VPFooter .message,
.VPFooter .copyright {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>

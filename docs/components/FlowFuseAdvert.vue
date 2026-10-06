<template>
    <div class="flowfuse-advert">
        <div>
            <h2>Elevate Node-RED with FlowFuse</h2>
            <p>FlowFuse provides a complete platform to build, manage and scale your production Node-RED applications, with built-in AI to help your team move faster.</p>
            <ul>
                <li>AI Assistance to Build Flows and Get Answers</li>
                <li>Simplified Hosting and Maintenance</li>
                <li>Centralized Management of your Node-RED Deployments</li>
                <li>Built-in Version Control &amp; Robust Development Pipelines</li>
                <li>Enhanced Team Collaboration</li>
                <li>Efficient Remote Device Management</li>
            </ul>
            <a href="https://flowfuse.com/product/why-flowfuse/">Learn More</a>
        </div>
        <div>
            <img src="../assets/images/screenshot-flowfuse-home.png" alt="FlowFuse platform home showing hosted and remote instances alongside the FlowFuse Expert AI assistant">
        </div>
    </div>
</template>

<style scoped>
.flowfuse-advert {
  margin-top: 64px;
  padding-top: 64px;
  border-top: 1px solid var(--vp-c-divider);
  display: grid;
  grid-template-columns: 1fr 60%;
  gap: 36px;
}

.flowfuse-advert h2 {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
  color: var(--vp-c-flowfuse);
}

.flowfuse-advert img {

}

.flowfuse-advert a {
    display: inline-block;
    margin-top: 16px;
    padding: 8px 16px;
    background-color: var(--vp-c-flowfuse);
    color: white;
    border-radius: 4px;
    text-decoration: none;
}
.flowfuse-advert a:hover {
    background-color: var(--vp-c-flowfuse-dark);
}
</style>

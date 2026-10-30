# Changelog

## [1.34.1](https://github.com/FlowFuse/node-red-dashboard/compare/v1.34.0...v1.34.1) (2026-10-27)


### Bug Fixes

* [2332] Load the ui-template Vue editor without a plugin so Node-RED 3.0 starts ([#2333](https://github.com/FlowFuse/node-red-dashboard/issues/2333)) ([4c5f821](https://github.com/FlowFuse/node-red-dashboard/commit/4c5f8215d321fc99f30af8168fdbb5c43130a435))

## [1.34.0](https://github.com/FlowFuse/node-red-dashboard/compare/v1.33.0...v1.34.0) (2026-10-22)


### Features

* script and style support in the ui-template code editor ([#2291](https://github.com/FlowFuse/node-red-dashboard/issues/2291)) ([215bca8](https://github.com/FlowFuse/node-red-dashboard/commit/215bca8463faaab8acb15b7c31357fd87658ab2f))
* Vue and Vuetify editing in the ui-template code editor ([#2290](https://github.com/FlowFuse/node-red-dashboard/issues/2290)) ([c0be053](https://github.com/FlowFuse/node-red-dashboard/commit/c0be053478c523feab2ea7b303b4d45df03ed00d))


### Bug Fixes

* "Connection Lost" notification remains on screen after reconnecting ([#2294](https://github.com/FlowFuse/node-red-dashboard/issues/2294)) ([f224fce](https://github.com/FlowFuse/node-red-dashboard/commit/f224fce6beb5c0af20e8188858f419eb7a84a683))
* [2318] Dashboard keeps disconnecting when a widget's history has more than 10 Buffers ([#2323](https://github.com/FlowFuse/node-red-dashboard/issues/2323)) ([3fd73a8](https://github.com/FlowFuse/node-red-dashboard/commit/3fd73a87c074fa36245c67eae11d3d0ca2a920e7))

## [1.33.0](https://github.com/FlowFuse/node-red-dashboard/compare/v1.32.0...v1.33.0) (2026-10-06)


### Features

* [1679] Add multiple groups per tab  ([#2259](https://github.com/FlowFuse/node-red-dashboard/issues/2259)) ([2ceb6c9](https://github.com/FlowFuse/node-red-dashboard/commit/2ceb6c9ac85706e46bb12a6a6256d7e921b36ba0))
* [2269] ui-chart clones its whole series on every message ([#2270](https://github.com/FlowFuse/node-red-dashboard/issues/2270)) ([61d06a2](https://github.com/FlowFuse/node-red-dashboard/commit/61d06a2986a83e7647aeaa275499d5ff7449b495))


### Bug Fixes

* Dashboard enters infinite reload loop when base URL differs only by case (/Dashboard/ vs /dashboard/) ([#2278](https://github.com/FlowFuse/node-red-dashboard/issues/2278)) ([034c8a5](https://github.com/FlowFuse/node-red-dashboard/commit/034c8a5157ca31d004e89175f9201a6906268fdd))

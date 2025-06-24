---
description: Verstehen Sie die Repository-Struktur des Node-RED Dashboards 2.0 für ein besseres Code-Management und Beiträge.
---

# Repository-Struktur

Zweck dieser Seite ist es, einen Überblick darüber zu geben, wie Dashboard 2.0 strukturiert ist, damit Sie sich besser im Repository zurechtfinden und effektiv beitragen können.

## Kernordner

Das Repository enthält zwei Hauptordner:

### /nodes

Das Verzeichnis `/nodes` enthält die Sammlung von Node-RED-Knoten, die im Node-RED-Editor verfügbar sind. Diese Knoten sind dafür verantwortlich, die Konfiguration des Dashboards zu verwalten, welche Widgets angezeigt werden, und Ereignisse basierend auf ihrer Konfiguration im Node-RED-Editor an das Dashboard zu senden und von dort zu empfangen.

### /ui

Dieser Ordner enthält unsere Vue.js-Anwendung. Diese kann mit `npm run build` erstellt werden, und das Ergebnis dieses Builds wird dann in das `/dist`-Verzeichnis kopiert, wo es von Node-RED bereitgestellt wird.
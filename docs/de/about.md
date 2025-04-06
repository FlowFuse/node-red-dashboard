---
description: "Erfahren Sie mehr über die Technologieentscheidungen von Dashboard 2.0"
---

# Über Node-RED Dashboard 2.0

Willkommen zur Dokumentation für das Node-RED Dashboard 2.0, den Nachfolger des ursprünglichen und sehr beliebten [Node-RED Dashboards](https://flows.nodered.org/node/node-red-dashboard).

Dieses Projekt wurde von [FlowFuse](https://flowfuse.com/) ins Leben gerufen, um das ursprüngliche Dashboard zu aktualisieren und sich von Angular v1.0 zu entfernen, das seit langem veraltet ist. Unsere vollständige Erklärung, warum wir Dashboard 2.0 entwickeln, können Sie [hier](https://flowfuse.com/blog/2023/06/dashboard-announcement/) lesen.

## Technologien

### Node-RED

[Node-RED](https://nodered.org/) ist ein auf Fluss basierendes Programmierwerkzeug, das ursprünglich von IBMs Emerging Technology Services-Team entwickelt wurde und jetzt Teil der JS Foundation ist. Es bietet einen browserbasierten Editor, der es einfach macht, Flows mit der breiten Palette von Knoten zu verbinden, die mit einem einzigen Klick in seiner Laufzeitumgebung bereitgestellt werden können.

### Vue.js v3.0

[Vue.js](https://vuejs.org/) ist ein progressives, inkrementell annehmbares JavaScript-Framework zum Erstellen von Benutzeroberflächen im Web. Es ist eine beliebte Wahl für den Aufbau moderner Webanwendungen.

Wir haben uns für Vue.js gegenüber anderen beliebten Frameworks wie React und Angular entschieden, weil es eine flache Lernkurve und Benutzerfreundlichkeit/Lesbarkeit für Nicht-Frontend-Entwickler bietet.

Wir nutzen auch die [Vuetify-Komponentenbibliothek](https://vuetifyjs.com/en/components/all/), ein Material Design-Komponentenframework für Vue.js. Es zielt darauf ab, saubere, semantische und wiederverwendbare Komponenten bereitzustellen, die den Aufbau Ihrer Anwendung erleichtern.

### Socket IO

[Socket.IO](https://socket.io/) ermöglicht Echtzeit-, bidirektionale und ereignisbasierte Kommunikation. Es funktioniert auf jeder Plattform, jedem Browser oder Gerät und legt gleichermaßen Wert auf Zuverlässigkeit und Geschwindigkeit.

Im Dashboard 2.0 verwenden wir Socket IO, um zwischen Node-RED und der Dashboard-Benutzeroberfläche zu kommunizieren.
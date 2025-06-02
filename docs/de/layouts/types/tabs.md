---
description: Rendern Sie jede Gruppe als eigenständigen Tab in einer Registerkartenansicht für die Seite
---
<script setup>
    import AddedIn from '../../../components/AddedIn.vue'
</script>

# Layout: Tabs <AddedIn version="1.15.0" />

Anstatt jede Gruppe nebeneinander (wie bei festen und Rasterlayouts) oder übereinander (wie beim Notizbuchlayout) zu rendern, wird das Tabs-Layout jede Gruppe als eigenständigen Tab in einer Registerkartenansicht für die Seite rendern. Sie können dann zwischen den Tabs wechseln, um die verschiedenen Gruppen anzuzeigen.

![Tabs Layout](../../../assets/images/layout-tabs.gif){data-zoomable}
*Eine Beispiel-Benutzeroberfläche, die mit dem "Tabs"-Layout gerendert wurde, wobei jede "Gruppe" als Tab angezeigt wird.*

Beachten Sie, dass es derzeit nicht möglich ist, zu einer Seite mit einem bestimmten geöffneten Tab zu navigieren. Die Seite wird immer mit dem ersten ausgewählten Tab geöffnet.

## Steuerung von Breite & Spalten

Jeder Tab wird immer die volle Breite des Bildschirms rendern. Die "Breite" jeder Gruppe definiert dann die Anzahl der Spalten, die innerhalb des Tabs verfügbar sein werden.

Wenn Sie beispielsweise eine Gruppe mit einer Breite von 6 und zwei Diagrammen haben, die jeweils eine Breite von 3 haben, werden sie nebeneinander innerhalb des Tabs gerendert, bei 50% der Bildschirmbreite. Wenn Sie dann die Breite der Gruppe auf 12 ändern, würden die beiden Diagramme stattdessen jeweils nur 25% der Bildschirmbreite einnehmen.

## Breakpoints

Abhängig von der Bildschirmgröße ändert sich die Anzahl der standardmäßig gerenderten Spalten. Hier sehen Sie Beispiele für die gerenderten Spalten bei drei Breakpoints:

![Richtlinien, die die in der "Raster"-Layout gerenderten Spalten demonstrieren](../../../assets/images/layout-grid-columns.png){data-zoomable}
_Richtlinien, die die in der "Raster"-Layout gerenderten Spalten bei verschiedenen Bildschirmgrößen demonstrieren_

Die genauen verwendeten Breakpoints können in den [Seiteneinstellungen](../../nodes/config/ui-page.md#breakpoints) konfiguriert werden.

Da Tab-Layouts Gruppen in voller Breite rendern, wird die Anzahl der Spalten _innerhalb_ der Gruppe durch das _Minimum_ der Spalten/Breite der Gruppe und der Spalten der Seite bestimmt. Wenn also eine Gruppe 9 Spalten hat, das Seitenlayout jedoch aufgrund des Breakpoints 6 Spalten erzwingt, wird sie mit 6 gerendert. Wenn jedoch die Breite der Gruppe 6 beträgt und der Seiten-Breakpoint 12 Spalten definiert, wird die Gruppe dennoch mit 6 gerendert.
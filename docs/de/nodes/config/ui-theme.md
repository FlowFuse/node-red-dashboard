---
description: Passen Sie das Aussehen und die Haptik Ihres Dashboards mit UI-Themen im Node-RED Dashboard 2.0 an.
colors:
    Oberfläche: Steuert die Farbe der Kopfzeile und der Navigationsseitenmenüs
    Primär: Jedes interaktive Element wird mit dieser Farbe gestaltet, einschließlich Schaltflächen, Schieberegler und Fokuszustand von Eingabefeldern.
    Seiten - Hintergrund: Die Hintergrundfarbe der gesamten Seite
    Gruppen - Hintergrund: Die Hintergrundfarbe aller auf der Seite gerenderten Gruppen
    Gruppen - Umriss: Die Farbe des Rahmens aller auf der Seite gerenderten Gruppen
sizes:
    Zeilenhöhe: Wie hoch eine einzelne Zeile (Höheneinheit) im Dashboard gerendert werden soll. Optionen hier sind Standard (48px), Komfortabel (36px) und Kompakt (32px).
    Seitenabstand: Der Abstand, der alle Gruppen auf einer Seite umgibt. Anwendbar für Raster- & Feste Layouts und Notizbuch-Layouts, bei denen die Bildschirmbreite schmaler als 1024px ist.</br></br>Sie können den Abstand für jede Seite der Seite separat mit <a href="https://www.w3schools.com/css/css_padding.asp#:~:text=Padding%20%2D%20Shorthand%20Property" target="_blank">CSS Shorthand notation</a> definieren.
    Gruppenzwischenraum: "Der Abstand zwischen jeder Gruppe in einem Layout. Standard: 12px"
    Gruppenrandradius: "Der Randradius der Umrandung jeder Gruppe auf einer Seite. Standard: 4px"
    Widget-Zwischenraum: "Der Abstand zwischen jedem Widget innerhalb einer Gruppe. Standard: 12px"
---

<script setup>
</script>

# Konfiguration: UI-Thema `ui-theme`

Jeder Seite kann ein Thema zugewiesen werden, das zum Rendern der Seite verwendet wird. Das Thema ist eine Sammlung von Farben, die das Aussehen und die Haptik der Widgets steuern.

## Farben

<PropsTable property="colors" :hide-dynamic="true"/>

## Größen

<PropsTable property="sizes" :hide-dynamic="true"/>

## Beispiele

### Modifizierte Farben & Abstände

Beispielkonfiguration von `ui-theme` in Node-RED:

<img src="/images/theme-config.png" alt="Beispielkonfiguration für ein Thema" width="350"/>

Ergebnis-Dashboard mit angewendetem Thema:

![Ergebnis-Dashboard mit angewendetem Thema](/images/theme-example.png "Ergebnis-Dashboard mit angewendetem Thema"){data-zoomable}

Die hier gewählten Farben wurden ausgewählt, um es einfacher zu machen, zwischen den verschiedenen Gruppen zu unterscheiden, anstatt ästhetisch ansprechend zu sein.

### Zeilenhöhe

![Standard (Links), Komfortabel (Mitte), Kompakt (Rechts) Zeilenhöhenvergleiche für ein UI-Tabellenelement](/images/node-examples/ui-theme-row-height.png "Standard (Links), Komfortabel (Mitte), Kompakt (Rechts) Zeilenhöhenvergleiche für ein UI-Tabellenelement"){data-zoomable}
_Standard (Links), Komfortabel (Mitte), Kompakt (Rechts) Zeilenhöhenvergleiche für ein UI-Tabellenelement_

Die Zeilenhöhe steuert, wie hoch eine einzelne Zeile (Höheneinheit) im Dashboard gerendert werden soll. Optionen hier sind Standard (48px), Komfortabel (36px) und Kompakt (32px).
---
description: Erfahren Sie, wie die Node-RED Dashboard-Layouts für Ihre Anwendungen konfiguriert werden können.
---

# Layouts

Layouts sind eine Konfiguration, die seitenweise verfügbar ist. Sie steuern, wie alle [Gruppen](../nodes/config/ui-group) von Widgets auf einer bestimmten [Seite](../nodes/config/ui-page) angeordnet sind:

![Screenshot der Layout-Optionen auf einer ui-Seite](../../assets/images/layouts-page-layout-option.png){data-zoomable}
_Screenshot der Layout-Optionen auf einer `ui-Seite`_

Derzeit bieten wir vier verschiedene Layout-Optionen an:

- [Raster](./types/grid.md)
- [Fest](./types/fixed.md)
- [Notizbuch](./types/notebook.md)
- [Tabs](./types/tabs.md)

## Größenanpassung von Gruppen & Widgets

Ein grundlegender Bestandteil beim Erstellen von Layouts in Dashboard 2.0 (das dem Prinzip von Dashboard 1.0 folgt) ist die Möglichkeit, die Größe jeder Gruppe und jedes Widgets mit dem Größenanpassungs-Widget zu steuern:

![Screenshot des Größenanpassungs-Widgets für ein ui-Gauge](../../assets/images/layouts-sizing-options.png){data-zoomable}
_Screenshot des Größenanpassungs-Widgets für ein ui-Gauge_

Was diese Größenanpassung genau bedeutet, unterscheidet sich leicht je nach verwendetem Layout, aber das allgemeine Prinzip ist, dass die Größe einer Gruppe oder eines Widgets steuert, wie viel Platz es im Layout einnimmt.

Die wesentlichen Unterschiede liegen in der "Breite"-Eigenschaft der Größe:

- Für "Raster" und "Notizbuch" wird die Breite als Teil von 12 _Spalten_ berechnet, d.h. eine Breite von "6" würde die Hälfte der Breite des Layouts einnehmen.
- Für "Fest" wird die Breite als Vielfaches von 90 _Pixeln_ berechnet, d.h. eine Breite von "3" würde 270px des Bildschirms einnehmen.

## Breakpoints

Die meisten Layouts im Dashboard nutzen ein Konzept von "Spalten", wobei die Gruppenbreite als Anzahl von Spalten definiert ist, z.B. 6, und die Seite dann eine bestimmte Anzahl von Spalten rendert, z.B. 12. Das bedeutet, dass eine Gruppe mit einer Breite von 6 die Hälfte der Seitenbreite einnehmen würde.

Breakpoints [können konfiguriert werden](../nodes/config/ui-page.md#breakpoints) auf einer seitenweisen Basis, um zu steuern, wie viele Spalten bei verschiedenen Bildschirmgrößen gerendert werden. Dies ist besonders nützlich für responsives Design, da Sie steuern können, wie viele Spalten auf einem mobilen Gerät, Tablet oder Desktop gerendert werden.

## Themenoptionen

Zusätzlich zur Kernlayoutstruktur, die definiert, wie die Gruppen angeordnet und angeordnet sind, ist es auch möglich, einige der Abstände in einem Layout über das [Thema](../nodes/config/ui-theme) der Seite zu steuern.

### Konfigurierbare Optionen

![Screenshot der Themenoptionen zur Steuerung der Größenanpassung des Layouts](../../assets/images/layouts-theme-options.jpg){data-zoomable}
_Screenshot der Themenoptionen zur Steuerung der Größenanpassung des Layouts_

Jede Farbe hier korreliert mit dem jeweiligen Abschnitt im folgenden Bild:

![Screenshot der Themenoptionen zur Steuerung der Größenanpassung des Layouts](../../assets/images/layouts-theme-example.jpg){data-zoomable}
_Screenshot der Themenoptionen zur Steuerung der Größenanpassung des Layouts, hier wird ein "Raster"-Layout gezeigt_

- **Seitenabstand:** Der Abstand, der den gesamten Inhalt der Seite umschließt, oben als <span style="color: orange;">orange</span> Raum dargestellt.
- **Gruppenabstand:** Der Abstand zwischen jeder Gruppe, oben als <span style="color: lightseagreen;">grün</span> Raum dargestellt.
- **Widget-Abstand:** Der Abstand zwischen jedem Widget innerhalb einer Gruppe, oben als <span style="color: deeppink;">pink</span> Raum dargestellt.

Eine zusätzliche Option, die auf Gruppenbasis verfügbar ist, ist, ob der Name der Gruppe angezeigt werden soll oder nicht, oben dargestellt durch den <span style="color: goldenrod;">gelben</span> Raum. Wenn dies ausgeblendet ist, wird der Gruppenabstand (<span style="color: blue;">blau</span>) auf allen vier Seiten der Gruppe gerendert.

### Nicht konfigurierbar (derzeit)

Obwohl wir angemessene Anpassungsstufen bieten, gibt es einige Bereiche, die derzeit nicht konfigurierbar sind:

- **Zeilenhöhe:** Eine einzelne Einheit der Höhe ist derzeit auf 48px festgelegt. Dies kann derzeit nicht geändert werden. Dies betrifft auch das "Feste" Layout, bei dem eine einzelne Einheit der Breite durch diesen Wert bestimmt wird.
- **Gruppenabstand:** Der Abstand, der den gesamten Inhalt der Gruppe umschließt, oben als <span style="color: blue;">blauer</span> Raum dargestellt.
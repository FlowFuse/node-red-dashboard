---
description: Erstellen Sie flexible und responsive Layouts mit einem Rastersystem für das Node-RED Dashboard 2.0.
---

# Layout: Raster

Ähnlich dem [Raster](https://getbootstrap.com/docs/4.0/layout/grid/)-System von Bootstrap bietet dieses standardmäßig 12 Spalten, innerhalb derer der Inhalt skaliert werden kann. Es ist als CSS-Rasterlayout aufgebaut.

Die Breite jeder Gruppe repräsentiert die Anzahl der Spalten, die sie im gesamten Rasterlayout der Seite einnehmen wird, z.B. eine Gruppe mit der Breite 12 wird die volle Breite des Bildschirms einnehmen, selbst wenn sich die Bildschirmbreite ändert.

Das Layout verschiebt Widgets automatisch in die nächste Zeile, wenn sie nicht in eine gegebene Zeile passen. Die Höhe jeder Zeile wird durch das höchste Widget in dieser Zeile bestimmt.

## Breakpoints

Abhängig von der Bildschirmgröße kann sich die Anzahl der standardmäßig gerenderten Spalten ändern. Hier sehen Sie Beispiele für die gerenderten Spalten bei drei Breakpoints:

![Richtlinien, die die in der "Raster"-Layout gerenderten Spalten demonstrieren](../../../assets/images/layout-grid-columns.png){data-zoomable}
_Richtlinien, die die in der "Raster"-Layout gerenderten Spalten bei verschiedenen Bildschirmgrößen demonstrieren_

Die genauen verwendeten Breakpoints können in den [Seiteneinstellungen](../../nodes/config/ui-page.md#breakpoints) konfiguriert werden.

## Steuerung der Breite

Gruppen füllen die definierte Breite aus und erstellen dann intern ihr eigenes Rasterlayout, wobei die Anzahl der Spalten in dieser Gruppe der Breite der Gruppe entspricht. Die Gruppen können ihre eigenen internen Abstände und Seiten haben, die angepasst werden können.

![Richtlinien, die die in der "Raster"-Layout gerenderten Spalten demonstrieren](../../../assets/images/layout-grid-example.png){data-zoomable}
_Richtlinien, die die in der "Raster"-Layout gerenderten Spalten bei verschiedenen Bildschirmgrößen demonstrieren_

Mehr über diese Anpassungen des Themas und Layouts können Sie [hier](../index.md) lesen.

## Steuerung des Leerraums

Die Steuerung des Leerraums kann mit einem Rasterlayout knifflig sein. Wir haben derzeit kein intelligentes Mauerwerkslayout ([Beispiel](https://masonry.desandro.com/layout)), stattdessen nutzen wir das [CSS-Rasterlayout-Modul](https://www.w3schools.com/css/css_grid.asp).

Daher wird die Höhe einer gegebenen "Zeile" von Widgets durch das höchste Widget in dieser Zeile bestimmt.

Die meisten Widgets halten sich strikt an ihre angegebene Breite und Höhe, jedoch wachsen einige (z.B. `ui-template` oder `ui-markdown`) mit ihrem Inhalt, selbst wenn dies bedeutet, die in der Widget-Konfiguration angegebene Höhe zu überschreiten.

Hier sehen wir ein Beispiel für ein gerendertes Rasterlayout im Dashboard 2.0:

![Rasterlayout](../../../assets/images/layout-eg-grid.png){data-zoomable}
*Ein Beispiel für eine Benutzeroberfläche, die mit dem "Raster"-Layout gerendert wurde*
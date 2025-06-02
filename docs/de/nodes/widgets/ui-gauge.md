---
description: Zeigen Sie Echtzeitmetriken mit ui-gauge im Node-RED Dashboard 2.0 für sofortige Datenvisualisierung an.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Dropdowns in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Typ:
        description: Definiert die Form des Messgeräts, "Kachel", "Batterie", "Wassertank", "Halb-Messgerät" oder "3/4-Messgerät"
        dynamic: true
    Stil:
        description: Definiert den Stil des gerenderten Bogens, "Nadel" oder "Abgerundet". (nur anwendbar für 3/4 und Halb-Messgeräte)
        dynamic: true
    Bereich (min):
        description: Der kleinste Wert, der auf dem Messgerät angezeigt werden kann
        dynamic: true
    Bereich (max):
        description: Der größte Wert, der auf dem Messgerät angezeigt werden kann
        dynamic: true
    Segmente:
        description: Definiert die Barrieren, durch die der Bogen farblich kodiert wird. Diese Segmente können auch auf dem Messgerät angezeigt werden.
        dynamic: true
    Beschriftung:
        description: Text, der über dem Messgerät angezeigt wird und beschreibt, was das Messgerät anzeigt.
        dynamic: true
    Präfix:
        description: Text, der _vor_ dem Wert in der Mitte des Messgeräts hinzugefügt wird. (nur anwendbar für 3/4 und Halb-Messgeräte)
        dynamic: true
    Suffix:
        description: Text, der _nach_ dem Wert in der Mitte des Messgeräts angezeigt wird. (nur anwendbar für 3/4 und Halb-Messgeräte)
        dynamic: true
    Einheiten:
        description: Kleiner Text, der unter dem Wert in der Mitte des Messgeräts angezeigt wird. (nur anwendbar für 3/4 und Halb-Messgeräte)
        dynamic: true
    Symbol:
        description: Symbol, das unter dem Wert in der Mitte des Messgeräts angezeigt wird. Verwendet <a href="https://pictogrammers.com/library/mdi/">Material Designs Icon</a>, das Präfix <code>mdi-</code> muss nicht enthalten sein. (nur anwendbar für 3/4 und Halb-Messgeräte)
        dynamic: true
    Größen (Messgerät): (px) Wie dick der Bogen und die Hintergrundkulisse des Messgeräts gerendert werden.
    Größen (Lücke): (px) Wie groß der Abstand/die Polsterung zwischen dem Messgerät und den "Segmenten" ist.
    Größen (Segmente): (px) Wie dick die Segmente gerendert werden.
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung darüber, ob die Zahleneingabe aktiviert ist oder nicht
dynamic:
    Beschriftung:
        payload: msg.ui_update.label
        structure: ["String"]
    Symbol:
        payload: msg.ui_update.icon
        structure: ["String"]
    Typ:
        payload: msg.ui_update.gtype
        structure: ["String"]
        examples: ['gauge-tile', 'gauge-battery', 'gauge-tank', 'gauge-half', 'gauge-34']
    Stil:
        payload: msg.ui_update.gstyle
        structure: ["String"]
    Min:
        payload: msg.ui_update.min
        structure: ["Number"]
    Max:
        payload: msg.ui_update.max
        structure: ["Number"]
    Segmente:
        payload: msg.ui_update.segments
        structure: ["Array<{color: String, from: Number}>"]
    Präfix:
        payload: msg.ui_update.prefix
        structure: ["String"]
    Suffix:
        payload: msg.ui_update.suffix
        structure: ["String"]
    Einheiten:
        payload: msg.ui_update.units
        structure: ["String"]
---


<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue";
</script>

<TryDemo href="gauge" title="Demo Ausprobieren">

# Messgerät `ui-gauge` <AddedIn version="1.1.0"/>

</TryDemo>

Fügt Ihrem Dashboard ein Messgerät-Diagramm hinzu. Dies kann mit benutzerdefinierten Typen (halb, 3/4), Stilen (abgerundet, Nadel) und Segmentierung konfiguriert werden, mit Beispielen, die [unten](#examples) detailliert beschrieben sind.

![Screenshot, der jeden Messgerät-Typ nebeneinander zeigt](/images/node-examples/ui-gauge-types.png "Screenshot, der jeden Messgerät-Typ nebeneinander zeigt"){data-zoomable}
_Screenshot, der jeden Messgerät-Typ nebeneinander zeigt_

## Eingabe

Werte für die Messgeräte können durch Senden eines numerischen Werts in `msg.payload` festgelegt werden. Das Messgerät wird dann aktualisiert, um diesen Wert widerzuspiegeln.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Steuerungen

<ControlsTable/>

## Beispiele

### Halb-Messgerät - Abgerundet

| Typ | Stil | Größe (Messgerät) | Größe (Lücke) | Größe (Segmente) |
| --- | --- | --- | --- | --- |
| Halb-Messgerät | Abgerundet | 16 | 2 | 8 |

![Beispiel eines Halb-Messgeräts, das einen abgerundeten Bogen zeigt](/images/node-examples/ui-gauge-half-rounded.png "Beispiel eines Halb-Messgeräts, das einen abgerundeten Bogen zeigt"){data-zoomable}
*Beispiel eines Halb-Messgeräts, das einen abgerundeten Bogen zeigt.*

### Halb-Messgerät - Nadel

| Typ | Stil | Suffix | Größe (Messgerät) | Größe (Lücke) | Größe (Segmente) |
| --- | --- | --- | --- | --- | --- |
| Halb-Messgerät | Nadel | % | 0 | 0 | 32 |

![Beispiel eines Halb-Messgeräts, das eine Nadel mit nur Segmenten zeigt](/images/node-examples/ui-gauge-half-needle.png "Beispiel eines Halb-Messgeräts, das eine Nadel mit nur Segmenten zeigt"){data-zoomable}
*Beispiel eines Halb-Messgeräts, das eine Nadel mit nur Segmenten zeigt.*

### 3/4-Messgerät - Abgerundet

| Typ | Stil | Größe (Messgerät) | Größe (Lücke) | Größe (Segmente) |
| --- | --- | --- | --- | --- |
| 3/4-Messgerät | Abgerundet | 16 | 0 | 0 |

![Beispiel eines 3/4-Messgeräts, das einen abgerundeten Bogen ohne Segmente zeigt](/images/node-examples/ui-gauge-34-rounded.png "Beispiel eines 3/4-Messgeräts, das einen abgerundeten Bogen ohne Segmente zeigt"){data-zoomable}
*Beispiel eines 3/4-Messgeräts, das einen abgerundeten Bogen ohne Segmente zeigt.*

### 3/4-Messgerät - Nadel

| Typ | Stil | Größe (Messgerät) | Größe (Lücke) | Größe (Segmente) |
| --- | --- | --- | --- | --- |
| 3/4-Messgerät | Nadel | 32 | 2 | 6 |

![Beispiel eines 3/4-Messgeräts, das eine Nadel mit Segmenten und einem Bogen zeigt](/images/node-examples/ui-gauge-34-needle.png "Beispiel eines 3/4-Messgeräts, das eine Nadel mit Segmenten und einem Bogen zeigt"){data-zoomable}
*Beispiel eines 3/4-Messgeräts, das eine Nadel mit Segmenten und einem Bogen zeigt.*

### Kachel

| Typ | Beschriftung |
| --- | --- |
| Kachel | Meine Kachel |

![Beispiele einiger Kachel-Messgeräte](/images/node-examples/ui-gauge-tiles.png "Beispiele einiger Kachel-Messgeräte"){data-zoomable}
*Beispiele einiger Kachel-Messgeräte*

### Batterie <AddedIn version="1.15.0" />

| Typ |
| --- |
| Batterie |

![Beispiele einiger horizontaler Batterie-Messgeräte](/images/node-examples/ui-gauge-battery.png "Beispiele einiger Batterie-Messgeräte"){data-zoomable}
*Beispiele einiger horizontaler Batterie-Messgeräte*

### Wassertank <AddedIn version="1.15.0" />

| Typ |
| --- |
| Wassertank |

![Beispiele einiger Wassertank-Messgeräte](/images/node-examples/ui-gauge-water-tank.png "Beispiele einiger Wassertank-Messgeräte"){data-zoomable}
*Beispiele einiger Wassertank-Messgeräte*

Beim Wechsel zu einem "Wassertank"-Typ werden die Segmente mit den folgenden Werten überschrieben:

```js
[{
    color: '#A8F5FF',
    from: 0
}, {
    color: '#55DBEC',
    from: 15
}, {
    color: '#53B4FD',
    from: 35
}, {
    color: '#2397D1',
    from: 50
}]
```

## CSS überschreiben

Das Messgerät kann weiter gestylt werden, indem benutzerdefiniertes CSS zum `ui_template`-Knoten hinzugefügt wird. Einige nützliche Klassen, die zum Stylen verfügbar sind, umfassen:

- `.nrdb-ui-gauge-value span` - Der Wert in der Mitte des Messgeräts
- `.nrdb-ui-gauge-value label` - Die Einheitenbeschriftung
- `.nrdb-ui-gauge-value i` - Das Symbol
- `.nrdb-ui-gauge-icon-only i` - Verfügbar, wenn ein Messgerät ein Symbol, aber keine "Einheiten"-Beschriftung hat
- `.nrdb-ui-gauge #limits` - Das umschließende `<g>`-Element, das die min/max `<text>`-Elemente umschließt
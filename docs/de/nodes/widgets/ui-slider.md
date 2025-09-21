---
description: Integrieren Sie ui-slider im Node-RED Dashboard 2.0 für dynamische Werteingabe durch einen einfachen Schiebemechanismus.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Sliders in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Beschriftung:
        description: Der Text, der links vom Slider angezeigt wird. HTML-Inhalt ist erlaubt.
        dynamic: true
    Daumenbeschriftung:
        description: Definiert, wann die Daumenbeschriftung des Sliders angezeigt wird. Standardmäßig auf 'Beim Ziehen'.
        dynamic: true
    Ticks anzeigen:
        description: Definiert, wann die Ticks auf der Spur sichtbar sind. Standardmäßig auf 'Immer'.
        dynamic: true
    Bereich:
        description: min - der minimale Wert, auf den der Slider geändert werden kann. Wenn min > max, wird der Slider umgekehrt.; max - der maximale Wert, auf den der Slider geändert werden kann; Schritt - der Inkrement-/Dekrementwert, wenn der Slider bewegt wird.
        dynamic: true
    Farbe:
        description: main - Farbe des Sliders und Daumens; track - Farbe der Slider-Spur; thumb - Farbe des Griffs. Es kann der Name einer Farbe (rot, grün, blau, ...) oder ein Hex-Farbcode (#b5b5b5) sein.
        dynamic: true
    Symbole:
        description: Fügen Sie <a href="https://pictogrammers.com/library/mdi/">mdi-Symbole</a> vor und nach dem Slider hinzu. Zum Beispiel "minus". Es ist nicht notwendig, das "mdi-" Präfix einzuschließen, nur den Namen des Symbols.
        dynamic: true    
    Ausgabe: Definiert, wann eine Nachricht gesendet wird, entweder während der Slider bewegt wird oder wenn der Slider losgelassen wird.        
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung darüber, ob der Button anklickbar ist oder nicht.
dynamic:
    Beschriftung:
        payload: msg.ui_update.class
        structure: ["String"]
    Daumenbeschriftung:
        payload: msg.ui_update.thumbLabel
        structure: ["true | false | 'always'"]
    Ticks anzeigen:
        payload: msg.ui_update.showTicks
        structure: ["true | false | 'always'"]
    Bereich (min):
        payload: msg.ui_update.min
        structure: ["Number"]
    Bereich (Schritt):
        payload: msg.ui_update.step
        structure: ["Number"]
    Bereich (max):
        payload: msg.ui_update.max
        structure: ["Number"]
    Symbol voranstellen:
        payload: msg.ui_update.iconPrepend
        structure: ["String"]
    Symbol anhängen:
        payload: msg.ui_update.iconAppend
        structure: ["String"]
    Farbe:
        payload: msg.ui_update.color
        structure: ["String"]
    Farbe der Spur:
        payload: msg.ui_update.colorTrack
        structure: ["String"]
    Farbe des Daumens:
        payload: msg.ui_update.colorThumb
        structure: ["String"]
    Klasse:
        payload: msg.ui_update.class
        structure: ["String"]
    Textfeld anzeigen:
        payload: msg.ui_update.showTextField
        structure: ["true | false"]
---

<script setup>
    import TryDemo from "./../../../components/TryDemo.vue";
</script>

<TryDemo href="slider" title="Demo Ausprobieren">

# Slider `ui-slider`

</TryDemo>

Fügt Ihrem Dashboard einen Slider hinzu, der Werte in Node-RED unter `msg.payload` ausgibt, sobald sich sein Wert ändert.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

### Wert einstellen

Sie können den Wert des Sliders einstellen, indem Sie den jeweiligen Wert in `msg.payload` übergeben.

## Steuerungen

<ControlsTable/>

## Beispiel - Grundlegend

![Beispiel eines Sliders](/images/node-examples/ui-slider.png "Beispiel eines Sliders"){data-zoomable}
*Beispiel eines gerenderten Sliders in einem Dashboard.*

## Beispiel - Daumen immer anzeigen

![Beispiel eines Sliders mit 'Daumen immer anzeigen' auf 'Immer' gesetzt](/images/node-examples/ui-slider-thumb-always.png "Beispiel eines Sliders mit 'Daumen immer anzeigen' auf 'Immer' gesetzt"){data-zoomable}
*Beispiel eines Sliders mit 'Daumen immer anzeigen' auf 'Immer' gesetzt*

## Beispiel - Ticks anzeigen

![Beispiel eines Sliders mit Ticks auf 'Immer' gesetzt](/images/node-examples/ui-slider-ticks.png "Beispiel eines Sliders mit Ticks auf 'Immer' gesetzt"){data-zoomable}
*Beispiel eines Sliders mit Ticks auf 'Immer' gesetzt*

### Ticks anpassen

Ticks können durch Überschreiben des CSS für den Slider angepasst werden.

Das Erscheinungsbild der Ticks kann durch die Verwendung der folgenden CSS-Variablen geändert werden

- <code>--tick-scaleX</code> zum horizontalen Anpassen der Ticks
- <code>--tick-scaleY</code> zum vertikalen Anpassen der Ticks
- <code>--tick-color</code> zum Ändern der Tick-Farbe

Beachten Sie, dass Sie möglicherweise unterschiedliche Klassen für vertikale und horizontale Slider erstellen müssen.


```css
.my-slider-horizontal.nrdb-ui-slider{
    --tick-scaleX: 0.25;
    --tick-scaleY: 4;
    --tick-color: rgba(var(--v-theme-primary),0.7);
}
.my-slider-vertical.nrdb-ui-slider{
    --tick-scaleX: 4;
    --tick-scaleY: 0.25; 
    --tick-color: orange;
}
```

Verschiedene Stile können auf die Ticks des gefüllten Teils des Sliders angewendet werden.

```css
.my-slider-horizontal.nrdb-ui-slider .v-slider-track__tick--filled{
    --tick-color:violet;
}
```

## Beispiel - Vertikale Slider

Slider wechseln automatisch zu einer vertikalen Ausrichtung, wenn die Höhe größer als die Breite ist.

![Beispiel eines vertikalen Sliders](/images/node-examples/ui-slider-vertical.png "Beispiel eines vertikalen Sliders"){data-zoomable}
*Beispiel eines vertikalen Sliders in einem Dashboard.*
---
description: Nutzen Sie die Leistungsfähigkeit von ui-template im Node-RED Dashboard 2.0, um benutzerdefinierte Widgets und einzigartige Dashboard-Layouts zu entwerfen.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Bereich: "Vorlagenknoten können für 3 Zwecke/Bereiche verwendet werden: <ul><li><b>Widget (Gruppenbereich):</b>Ein Standard-HTML/Vue-Widget, das in einer Gruppe im Dashboard gerendert wird.</li><li><b>Widget (Seitenbereich):</b>Ein HTML/Vue-Widget, das auf einer Seite gerendert wird, außerhalb bestehender Gruppen. Beachten Sie, dass diese Widgets nach allen Gruppen gerendert werden. Ein Anwendungsfall hierfür wäre, wenn Sie einen festen Footer auf einer bestimmten Seite haben möchten.</li><li><b>Widget (UI-Bereich):</b>Ein HTML/Vue-Widget, das auf jeder Seite des Dashboards gerendert wird. Am häufigsten in Verbindung mit <a href=\"#teleports\">Teleports</a> verwendet.</li><li><b>CSS (Alle Seiten):</b>Definieren Sie benutzerdefinierte CSS-Klassen/Stile, die für das gesamte Dashboard gelten.</li><li><b>CSS (Einzelne Seite):</b>Definieren Sie benutzerdefinierte CSS-Klassen/Stile, die nur für eine einzelne Seite Ihres Dashboards gelten.</li></ul>"
    Klasse: Fügt dem Widget CSS-Klassen hinzu
    Vorlage: Der Inhalt des Widgets oder CSS &lt;style&gt;. Wenn Sie dies für CSS verwenden, müssen Sie keine &lt;style&gt;-Tags einfügen, da diese automatisch hinzugefügt werden.
dynamic:
    Format:
        payload: msg.ui_update.format
        structure: ["String"]
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue";
</script>


<TryDemo href="template" title="Demo Ausprobieren">

# Vorlage `ui-template` <AddedIn version="0.10.0"/>

</TryDemo>
 
Bieten Sie benutzerdefiniertes JS und HTML (einschließlich aller [Vuetify-Komponenten](https://vuetifyjs.com/en/components/all/)) zur Darstellung im Dashboard an.

- Definieren Sie Ihre eigenen Vue-Komponenten
- Laden Sie externe JS-Abhängigkeiten
- Schreiben Sie rohes JavaScript
- Verwenden Sie Vuetify-Komponenten

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Schreiben benutzerdefinierter Widgets

UI Template wird verschiedene Tags analysieren und sie in das Dashboard rendern. Die verfügbaren Tags sind:

- `<template>` - Jeder HTML-Code hier wird in das Dashboard gerendert.
- `<script>` - Jeder JavaScript-Code hier wird ausgeführt, wenn das Widget geladen wird. Sie können hier auch eine vollständige VueJS-Komponente [definieren](#building-full-vue-components).
- `<style>` - Jeder CSS-Code hier wird in das Dashboard injiziert.

### Arbeiten mit Variablen

Alle Variablen, die Sie in Ihr `<template />` rendern möchten, werden auf eine von zwei Arten gemacht:

::: v-pre
- **Attributbindung** - Verwenden Sie `:`, um eine Variable an ein Attribut zu binden. Alles innerhalb der `""` hier wird als JavaScript behandelt, zum Beispiel: 

```html
<p :class="msg.payload">Hallo Welt</p>
````

oder, wenn Sie `msg.payload` als Teil des Wertes verwenden möchten, können Sie dies tun:

```html
<!-- Ändern Sie die Farbe basierend auf msg.payload. Erwartet, dass payload entweder "error", "warning" oder "info" ist -->`
<p :class="'text-' + msg.payload">Hallo Welt</p>
<!-- oder mit String-Literalen: -->
<p :class="`text-${msg.payload}`">Hallo Welt</p>
````

oder sogar `msg.payload` als Bedingung verwenden:

```html
<!-- 
  Ändern Sie die Farbe basierend auf dem Wert von msg.payload: 
  * Wenn msg.payload "error" entspricht, setzen Sie den Text auf die vordefinierte `text-error`-Farbe. 
  * Andernfalls setzen Sie den Text auf die vordefinierte `text-info`-Farbe.
-->
<p :class="msg.payload === 'error' ? 'text-error' : 'text-info'">Hallo Welt</p>
````

- **Textinterpolation** - Verwenden Sie `{{ }}`, um eine Variable in den Text eines Elements zu interpolieren. Alles innerhalb der geschweiften Klammern wird als JavaScript behandelt. Zum Beispiel:

```html
<p>Hallo {{ msg.payload }}</p>
```

```html
<p>Prozentsatz {{ msg.payload * 100 }}%</p>
```

### Eingebaute Variablen

Sie haben Zugriff auf eine Reihe von eingebauten Variablen in Ihrem `ui-template`-Knoten:

- `id` - Die ID des `ui-template`-Knotens, die von Node-RED zugewiesen wird.
- `msg` - Die letzte Nachricht, die vom `ui-template`-Knoten empfangen wurde.
- `$socket` - Die socket.io-Verbindung, die zur Kommunikation mit dem Node-RED-Backend verwendet wird.

Wenn Sie auf die `msg`-Variable innerhalb eines `<script />`-Tags zugreifen, müssen Sie den Variablennamen mit `this.` (z.B. `this.msg.payload`) voranstellen, damit erkannt wird, dass Sie auf die komponentengebundene `msg`-Variable zugreifen.

***Wichtiger Hinweis:*** Beim ersten Laden kann `msg.payload` `null` oder `undefined` sein, und der Versuch, auf eine verschachtelte Eigenschaft zuzugreifen, führt zu einem Fehler. Die Verwendung des **optional chaining** (?.) Operators, z.B. `msg.payload?.nested?.property`, verhindert diese Fehler.

#### Zugriff auf Node-RED Global/Flow-Kontext

Die `flow`/`global`-Kontextspeicher sind in der Dashboard-UI nicht verfügbar, daher ist es hier am besten, einen "Änderungs"-Knoten vor dem `ui-template`-Knoten zu verwenden, um einen `msg.<property>` dem entsprechenden Wert aus dem `flow.` oder `global.`-Speicher zuzuweisen:

![Beispiel für die Verwendung eines Änderungs-Knotens, um einen Wert `msg.payload` zuzuweisen](/images/node-examples/change-flow-to-msg.png "Beispiel für die Verwendung eines Änderungs-Knotens, um einen Wert `msg.payload` zuzuweisen"){data-zoomable}
_Beispiel für die Verwendung eines Änderungs-Knotens, um einen Wert `msg.payload` zuzuweisen._

### Eingebaute Funktionen

Wir bieten auch einige Hilfsfunktionen für die Node-RED-Integration an:

#### Daten senden

- `this.send(msg)` - Senden Sie eine Nachricht an den Node-RED-Flow. Wenn ein Nicht-Objektwert gesendet wird, wird das Dashboard diesen automatisch in ein `msg.payload`-Objekt einwickeln.

#### Daten empfangen

Es gibt zwei Möglichkeiten, auf Nachrichten zu reagieren, die von Ihrem `ui-template`-Knoten empfangen werden:

Option 1: 

In VueJS können wir eine Variable `watch`en, um auf Änderungen zu reagieren.

Wie im Abschnitt [Eingebaute Variablen](#built-in-variables) oben erwähnt, haben wir Zugriff auf die `msg`-Variable in unserem `ui-template`-Knoten. Wir können diese Variable `watch`en, um auf Änderungen zu reagieren:

```js
watch: {
    msg: function () {
        // mache etwas mit this.msg
        // läuft bei onLoad und onInput
    }
}
```

Es ist jedoch zu beachten, dass dies zwar aktualisiert wird, wenn neue Nachrichten empfangen werden, es _auch_ aktualisiert wird, wenn ein Widget zum ersten Mal geladen wird und die neueste `msg` in das Widget geladen wird.

Option 2:

Alternativ können wir einen benutzerdefinierten Socket-Listener zum `msg-input:<id>`-Ereignis hinzufügen. Dies ist nützlich, wenn Sie nur auf Nachrichten hören möchten, wenn sie empfangen werden, und nicht, wenn das Widget zum ersten Mal geladen wird.

```js
this.$socket.on('msg-input:' + this.id, (msg) => {
    // mache etwas mit msg
    // läuft nur, wenn Nachrichten empfangen werden
})
```

Dies kann in den `mounted () { }`-Handler des Widgets eingefügt werden.

### Beispiel (Rohes JavaScript)

Zusammengefasst hier ein einfaches Starter-Widget, das den Benutzer benachrichtigt, wenn er auf den Button klickt, und eine Nachricht in Node-RED sendet.

```vue
<template>
    <!-- Jeder HTML-Code kann hier eingefügt werden -->
    <button class="my-class" onclick="onClick()">Mein Button</button>
</template>

<script>
    /* Schreiben Sie hier beliebiges JavaScript */
    // fügen Sie unsere onClick-Funktion dem Fensterobjekt hinzu, um sie im HTML <button> zugänglich zu machen
    window.onClick = function () {
        alert('Button wurde geklickt')
    }

    // Verwenden Sie die send()-Funktion, um Daten zurück in Node-RED zu senden:
    this.send('Komponente wurde geladen')

    // Abonnieren Sie die eingehenden Nachrichten
    this.$socket.on('msg-input:' + this.id, function(msg) {
        // mache etwas mit der Nachricht
        alert('Nachricht empfangen: ' + msg.payload)
    })
</script>

<style>
    /* definieren Sie hier beliebige Stile - unterstützt rohes CSS */
    .my-class {
        color: red;
    }
</style>
```

### Laden externer Abhängigkeiten

Es ist möglich, externe Abhängigkeiten in Ihren `ui-template`-Knoten zu laden. Dies ist nützlich, wenn Sie eine Bibliothek verwenden möchten, die nicht in den Kernknoten von Node-RED Dashboard 2.0 enthalten ist.

Um dies zu tun, müssen Sie die Abhängigkeit im `<script>`-Abschnitt Ihrer Vorlage laden. Zum Beispiel, um die [Babylon.js](https://www.babylonjs.com/)-Bibliothek zu laden, würden Sie Folgendes tun:

```html
<script src="https://cdn.babylonjs.com/babylon.js"></script>
```

Sie können dann ein _weiteres_ `<script />`-Tag im selben `ui-template` haben, das diese Bibliothek nutzt.

Ein wichtiger Vorbehalt hier ist, dass, obwohl dies in den `<head />` des Dashboards injiziert wird, da unsere Widgets nach dem ersten Seitenladen geladen werden, die Bibliothek nicht immer sofort verfügbar ist, wenn Ihr Widget und HTML geladen werden. 

Wenn Sie Zugriff auf die Bibliothek benötigen, sobald sie verfügbar ist, besteht der Trick darin, ein `setInterval()` auszuführen und das `window`-Objekt auf das Laden der Bibliothek zu überwachen.

Zum Beispiel:

```vue
<template>
    <!-- Vorlageninhalt hier -->
</template>

<script src="https://cdn.babylonjs.com/babylon.js"></script>

<script>
function init () {
    alert('Babylon.js ist geladen')
}

// führen Sie diesen Code aus, wenn das Widget erstellt wird
let interval = setInterval(() => {
    if (window.BABYLON) {
        // rufen Sie eine init() auf, um BABYLON zu verwenden
        init();
        // Babylon.js ist geladen, daher können wir es jetzt verwenden
        clearInterval(interval);
    }
}, 100);
</script>
```

## Erstellen vollständiger Vue-Komponenten

Sie können vollständige Vue-Komponenten im `ui-template`-Knoten erstellen, indem Sie die [Options-API](https://vuejs.org/api/#options-api) von VueJS verwenden. Dies ermöglicht es Ihnen, Ihr eigenes maßgeschneidertes Verhalten zu erstellen und gibt Ihnen mehr Kontrolle über die Benutzeroberfläche.

Eine vollständige Liste der VueJS Options-API-Eigenschaften, die wir derzeit unterstützen, sind:

- `name` - Der Name Ihrer Komponente
- `data` - Eine Funktion, die Daten zurückgibt, die Sie in Ihrer Komponente verfügbar haben möchten (in sowohl `<template>` als auch `<script>` Abschnitten)
- `watch` - Führen Sie eine Funktion aus, wenn sich eine bestimmte Komponentvariable ändert
- `computed` - Berechnen Sie eine Variable basierend auf anderen Variablen in Ihrer Komponente
- `methods` - Definieren Sie Funktionen, die aus Ihren `<template>`- oder `<script>`-Abschnitten aufgerufen werden können
- `mounted` - Führen Sie Code aus, wenn die Komponente zum ersten Mal geladen wird
- `unmounted` - Führen Sie Code aus, wenn die Komponente aus dem Dashboard entfernt wird

### Beispiel (Vollständige Vue-Komponente)

Hier definieren wir ein Zähler-Widget und nutzen die `data`, `watch`, `computed` und `methods` Eigenschaften von Vue. Dieses Widget wird die `formattedCount`-Variable automatisch aktualisieren, wann immer sich die `count`-Variable ändert, und eine Nachricht an Node-RED senden, wann immer die `count`-Variable ein Vielfaches von 5 erreicht.

```vue
<template>
    <div>
        <h2>Zähler - geladen: {{ loaded }}</h2>
        <p>Aktueller Zählerstand: {{ count }}</p>
        <p class="my-class">Formatierter Zählerstand: {{ formattedCount }}</p>
        <v-btn @click="increase()">Erhöhen</v-btn>
    </div>
</template>

<script>
    export default {
        data() {
            // definieren Sie Variablen, die komponentenweit verfügbar sind
            // (in <template> und Komponentenfunktionen)
            return {
                loaded: false,
                count: 0
            }
        },
        watch: {
            // beobachten Sie alle Änderungen von "count"
            count: function () {
                if (this.count % 5 === 0) {
                    this.send({payload: 'Vielfaches von 5'})
                }
            }
        },
        computed: {
            // berechnen Sie diese Variable automatisch
            // wann immer VueJS es für angemessen hält
            formattedCount: function () {
                return `${this.count} Äpfel`
            }
        },
        methods: {
            // stellen Sie eine Methode für unser <template> und die Vue-Anwendung bereit
            increase: function () {
                this.count++
            }
        },
        mounted() {
            // Code hier, wenn die Komponente zum ersten Mal geladen wird
            this.loaded = true
        },
        unmounted() {
            // Code hier, wenn die Komponente aus dem Dashboard entfernt wird
            // d.h. wenn der Benutzer die Seite verlässt
        }
    }
</script>
<style>
    /* definieren Sie hier beliebige Stile - unterstützt rohes CSS */
    .my-class {
        color: red;
    }
</style>
```

Alles, was von der `data`-Funktion zurückgegeben wird, wird automatisch im `<template>` verfügbar gemacht. Das bedeutet, dass wir die `count`-Variable in unserem Template verwenden können, und sie wird automatisch aktualisiert, wenn sich die Variable ändert.

Wir können auch jede dieser `data`-Variablen `watch`en und entsprechend reagieren. Zum Beispiel senden wir oben eine Nachricht an Node-RED, wann immer die `count`-Variable ein Vielfaches von 5 erreicht.

Wir verwenden eine `computed`-Variable, die automatisch aktualisiert wird, wann immer sich die `count`-Variable ändert. Dies ermöglicht es uns, die `count`-Variable in einer Weise zu formatieren, die für uns nützlicher ist, um sie anzuzeigen, ohne die zugrunde liegende `count`-Variable zu beeinflussen.

### Teleports

Sie können die [Teleport](https://v3.vuejs.org/guide/teleport.html)-Funktion von Vue verwenden, um Inhalte an einem bestimmten Ort im DOM zu rendern.

Der Code kann in einen `ui-template`-Knoten geschrieben werden, und der Bereich wird auf "Gruppe", "Seite" oder "UI" gesetzt, je nachdem, wann Sie möchten, dass dieses `<Teleport>` aktiv ist.

Wir bieten einige vordefinierte Orte an, die Sie verwenden können:

#### Seitenname (`#app-bar-title`)

Fügen Sie Inhalte zur linken Seite der Kopfzeile des Dashboards hinzu. `<Teleport>` kann wie folgt verwendet werden:

```vue
<template>
    <Teleport v-if="mounted" to="#app-bar-title">
        <v-btn>Button 1</v-btn>
        <v-btn>Button 2</v-btn>
    </Teleport>
</template>
<script>
    export default {
        data() {
            return {
                mounted: false
            }
        },
        mounted() {
            this.mounted = true
        }
    }
</script>
```

Dies würde zu folgendem Ergebnis führen:

![Beispiel für das Teleportieren von Inhalten zum App-Bar-Titel](/assets/images/appbar-title-teleport-actions.png "Beispiel für das Teleportieren von Inhalten zum App-Bar-Titel"){data-zoomable}
_Beispiel für das Teleportieren von Inhalten zum App-Bar-Titel, das zum bestehenden Seitennamen hinzugefügt wird_

Wir können auch das Rendern des Seitennamens unter den Haupteinstellungen des Dashboards ausschalten, sodass beim Verwenden des Teleports dies der einzige Inhalt ist, der oben links gerendert wird.

Hier können wir ein Bild (eingefügt über `msg.payload`) anstelle des Seitennamens rendern:

```vue
<template>
    <Teleport v-if="mounted" to="#app-bar-title">
        <img height="32px" :src="msg.payload"></img>
    </Teleport>
</template>
<script>
    export default {
        data() {
            return {
                mounted: false
            }
        },
        mounted() {
            this.mounted = true
        }
    }
</script>
```

Dies würde zu folgendem Ergebnis führen:

![Beispiel für das Teleportieren von Inhalten zum App-Bar-Titel](/assets/images/appbar-title-teleport-img.png "Beispiel für das Teleportieren von Inhalten zum App-Bar-Titel"){data-zoomable}
_Beispiel für das Teleportieren von Inhalten zum App-Bar-Titel und das Verbergen des Seitennamens_

#### App Bar - Aktionen (`#app-bar-actions`)

Rendert Inhalte auf der rechten Seite der App-Bar des Dashboards. Um diesen Teleport zu verwenden, können Sie die folgende Syntax verwenden:

```vue
<template>
    <Teleport v-if="mounted" to="#app-bar-actions">
        <v-btn>Meine Aktion</v-btn>
    </Teleport>
</template>
<script>
    export default {
        data() {
            return {
                mounted: false
            }
        },
        mounted() {
            this.mounted = true
        }
    }
</script>
```

Dies würde zu folgendem Ergebnis führen:

![Beispiel für das Teleportieren von Inhalten zur App-Bar](/assets/images/appbar-teleport.png "Beispiel für das Teleportieren von Inhalten zur App-Bar"){data-zoomable}

Beachten Sie die Verwendung von `v-if="mounted"` im `<Teleport />`-Tag. Aus irgendeinem Grund beschwert sich Vue, wenn versucht wird, ein Teleport innerhalb unseres `ui-template` zu rendern, bevor die Komponente vollständig montiert ist. Das Einfügen dieser `v-if`-Anweisung verhindert diesen Fehler.

### URL-Parameter

Vue hat ein eingebautes `this.$route`-Objekt, das Informationen über die aktive Route enthält. Dies schließt alle in der URL enthaltenen Abfrageparameter ein (z.B. `/dashboard/my-page?query=param`), die beim Verwenden einer [UI-Steuerung](./ui-control.md#change-page) oder beim direkten Navigieren zu einer Seite definiert werden können.

Ein Beispiel, wie auf diese Parameter zugegriffen werden kann, ist wie folgt:

```vue
<template>
    <div>
        <p>Abfrageparameter: {{ $route.query }}</p>
    </div>
</template>
```


## Zusätzliche Beispiele

Alle Vue-Komponenten, die Sie in `ui-template` definieren, erweitern die zugrunde liegende `ui-template`-Vue-Komponente. Dies schließt eine Sammlung von eingebauten Methoden, Daten und unterstützten Widgets ein. Sie können auch dynamische Inhalte mit beliebigen VueJS-Datenbindungsausdrücken rendern (z.B. `v-if`, `v-for`).

### Lesen von Node-RED-Eingaben

Wann immer ein `ui-template` eine `msg` in Node-RED empfängt, wird diese automatisch der `msg`-Variable in der Vorlage zugewiesen. Ein solches Beispiel wäre:

```html
<template>
    <div>
        <h2>Zuletzt empfangene <code>msg</code>:</h2>
        <pre>{{ msg }}</pre>
    </div>
</template>
```

![Beispiel für ein UI-Template, das die zuletzt empfangene Nachricht anzeigt](/images/node-examples/ui-template-lastmsg.png "Beispiel für ein UI-Template, das die zuletzt empfangene Nachricht anzeigt"){data-zoomable}

### Senden von Nachrichten an Node-RED

Zwei freigegebene Methoden, `send` und `submit`, ermöglichen es Ihnen, Nachrichten vom Dashboard an den Node-RED-Flow zu senden. 

- `send` - Gibt eine Nachricht (definiert durch die Eingabe dieses Funktionsaufrufs) von diesem Knoten im Node-RED-Flow aus. 
- `submit` - Sendet ein `FormData`-Objekt, wenn es an ein `<form>`-Element angehängt ist. Das erstellte Objekt besteht aus den `name`-Attributen für jedes Formularelement, die ihren jeweiligen `value`-Attributen entsprechen.

#### Senden bei Klick
Hier rufen wir es auf, wenn jemand auf unseren "Hallo Welt senden"-Button klickt:

```vue
<v-btn @click="send({payload: 'Hallo Welt'})">Hallo Welt senden</v-btn>
```

#### Senden bei Änderung
Oder ein weiteres Beispiel, bei dem die Nutzlast automatisch gesendet wird, wenn das `v-model` geändert wird:

![Beispiel für ein UI-Template, das das Vuetify-Bewertungs-Widget verwendet](/images/node-examples/ui-template-rating1.png "Beispiel für ein UI-Template, das das Vuetify-Bewertungs-Widget verwendet"){data-zoomable}

```vue
<v-rating hover :length="5" :size="32" v-model="value"
    active-color="primary" @update:model-value="send({payload: value})"/>
```

`v-model` in Vue ist eine Möglichkeit, eine Variable bidirektional an ein Widget zu binden. Hier binden wir die `value`-Variable an das `v-rating`-Widget. Dann beobachten wir Änderungen an diesem Wert mit `@update:model-value` und senden die `value`-Variable an den Node-RED-Flow über `msg.payload`.

Wenn sich der Wert ändert, wenn er an einen "Debug"-Knoten angeschlossen ist, können wir sehen, dass das Ergebnis wie folgt aussieht:

![Beispielausgabe bei Verwendung des Vuetify-Bewertungs-Widgets](/images/node-examples/ui-template-rating2.png "Beispielausgabe bei Verwendung des Vuetify-Bewertungs-Widgets"){data-zoomable}

### Vuetify-Widgets

Der `ui-template`-Knoten hat auch standardmäßig Zugriff auf die [Vuetify-Komponentenbibliothek](https://vuetifyjs.com/en/components/all/). Die Bibliothek bietet eine große Anzahl von vorgefertigten Widgets, die Sie in Ihrem Dashboard verwenden können.

Diese sind besonders nützlich, da sie einfachen Zugriff auf eine große Anzahl von vorgefertigten Widgets bieten, die nicht unbedingt in den Kernknoten von Node-RED Dashboard 2.0 enthalten sind.

Einige Beispiel-Widgets, die Sie nützlich finden könnten, sind:

- [Dateieingabe](https://vuetifyjs.com/en/components/file-inputs/) - Ermöglicht die Auswahl einer Datei aus dem lokalen Dateisystem des Benutzers.
- [Sternbewertungs-Widget](https://vuetifyjs.com/en/components/ratings/) - Ein Sternbewertungs-Widget, bei dem Benutzer eine Bewertung von 1-n Sternen auswählen können.
- [Fortschritt Linear](https://vuetifyjs.com/en/components/progress-linear/) - Eine horizontale Leiste, um den Fortschritt einer Aufgabe oder einzelne Balkendiagramm-Visualisierungen anzuzeigen. 

### Artikel & Tutorials

- [Erstellen eines benutzerdefinierten Videoplayers mit UI Template](https://flowfuse.com/blog/2023/12/dashboard-0-10-0/)
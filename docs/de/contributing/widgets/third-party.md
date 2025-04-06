---
description: Erweitern Sie das Node-RED Dashboard 2.0 mit Drittanbieter-Widgets. Erfahren Sie, wie Sie sie erstellen und integrieren können.
---
<script setup>
    import AddedIn from '../../../components/AddedIn.vue'
</script>

# Erstellen von Drittanbieter-Widgets <AddedIn version="0.8.0" />

Ein einzelnes Widget besteht aus zwei Hauptteilen:

1. Ein Node-RED-Knoten, der in der Palette des Node-RED-Editors erscheint
2. `.vue` und clientseitiger Code, der das Widget in ein Dashboard rendert
 
Sie können unsere Sammlung von Kern-Widgets [hier](../../nodes/widgets.md) erkunden. Wenn Sie eine Idee für ein Widget haben, das Sie in Dashboard 2.0 erstellen möchten, sind wir offen für Pull-Anfragen, und Sie können mehr in unserem Leitfaden [Hinzufügen von Kern-Widgets](./core-widgets.md) lesen.

Wir erkennen jedoch auch an, dass es viele Gelegenheiten gibt, bei denen ein eigenständiges Repository/Paket besser funktioniert, wie es in Dashboard 1.0 sehr beliebt war.

## Empfohlene Lektüre

Auf der linken Seite der Navigation finden Sie einen Abschnitt "Nützliche Anleitungen". Wir empfehlen, sich diese anzusehen, da sie einen guten Überblick über die Struktur der Dashboard 2.0-Codebasis und einige der zugrunde liegenden architektonischen Prinzipien geben, auf denen es aufgebaut ist.

Insbesondere werden die folgenden empfohlen:

- [Ereignisarchitektur](/en/contributing/guides/state-management.html)
- [Zustandsverwaltung](/en/contributing/guides/state-management.html)

## Wie Widgets geladen werden

Dashboard 2.0 basiert auf [VueJS](https://vuejs.org/), und daher müssen alle Widgets einer Vue-Komponente zugeordnet werden. Der Prozess funktioniert wie folgt:

1. Der Dashboard 2.0-Client verbindet sich mit Node-RED
2. Node-RED sendet ein `ui-config`-Objekt, das Details zu allen Seiten, Themen, Gruppen und Widgets enthält
3. Im Ereignishandler durchlaufen wir alle Widgets, die in der `ui-config` gefunden wurden:
    - Wenn der Widget-`type` mit einer Kernkomponente übereinstimmt, ordnen wir es dieser Komponente zu
    - Wenn das Widget ein Drittanbieter-Widget ist, laden wir die relevante `.umd.js`-Datei, die vom `/resources`-Ordner des Widgets bereitgestellt wird.
3. Dashboard 2.0 lädt das relevante Layout (z.B. Grid, Fixed oder Notebook) abhängig von der aktiven URL/Seite.
4. Innerhalb dieses Layout-Managers durchlaufen wir die Widgets und rendern ihre jeweiligen Vue-Komponenten.
    - Jeder Komponente werden `id`, `props` und `state` des Widgets übergeben.

## Erste Schritte

Wir haben ein [Beispiel-Node-Repository](https://github.com/FlowFuse/node-red-dashboard-example-node) erstellt, das die Grundlagen für Ihr Widget bietet. Es enthält viele Beispiele für Funktionen, die Sie wahrscheinlich benötigen werden.

Das Basis-Repository hat die folgende Datei-/Ordnerstruktur:

Wie bei allen Node-RED-Knoten müssen Sie mit zwei Dateien beginnen:

- `/nodes/ui-example.html` - definiert die Eigenschaften des Knotens, die Bearbeitungs-UI und den Hilfetext.
- `/nodes/ui-example.js` - definiert das serverseitige Verhalten des Knotens

Jedes Widget muss dann clientseitigen Code definiert haben, der steuert, _wie_ das Widget innerhalb eines Dashboards gerendert wird. Alle Inhalte innerhalb von `/ui` werden in eine `.umd.js`-Datei gepackt, die Dashboard zur Laufzeit lädt.

- `/ui/components/` - Ordner, der `.vue`-Dateien für alle benötigten Vue-Komponenten enthält
- `/ui/index.js` - Exportiert alle Vue-Komponenten, die in Dashboard 2.0 importiert werden müssen

Die Konfiguration des Knotens und der Widgets wird über zwei Dateien gesteuert:

- `vite.config.js` - enthält die Details, was in die erstellte `.umd.js`-Datei des Widgets gepackt werden soll.
- `package.json` - muss einen `node-red-dashboard-2`-Abschnitt enthalten, der die Widgets definiert, die Dashboard importieren kann.

### Lokal entwickeln

Um mit Ihrem eigenen Drittanbieter-Widget auf Ihrem lokalen Rechner zu arbeiten:

#### Node-RED & Dashboard installieren

1. Installieren Sie Node-RED ([Dokumentation](https://nodered.org/docs/getting-started/local))
2. Installieren Sie `@flowfuse/node-red-dashboard` in Node-RED über die Option "Palette verwalten".

#### Das UI-Beispiel-Node installieren

1. Forken Sie unser [Beispiel-Node-Repository](https://github.com/FlowFuse/node-red-dashboard-example-node) und klonen Sie es lokal auf Ihren Rechner.
2. Installieren Sie im Beispiel-Node-Verzeichnis die erforderlichen Abhängigkeiten:
   ```bash
   npm install
   ```
3. Optional eine Quellkarte generieren (um den minimierten Code mit dem Originalcode zu verknüpfen), um das Debuggen des Frontend-Codes im Browser zu vereinfachen. Auf Linux kann dies erreicht werden durch:
   ```bash
   export NODE_ENV=development
   ```
4. Erstellen Sie im Beispiel-Node-Verzeichnis die `.umd.js`-Datei des Beispiel-Nodes (was Node-RED verwendet, um Ihr Widget auszuführen), dies generiert den `/resources`-Ordner, der von Node-RED geladen wird.
   ```bash
   npm run build
   ```

#### UI-Beispiel in Node-RED installieren

1. Navigieren Sie zu Ihrem lokalen Node-RED-Verzeichnis:
    ```bash
    cd ~/.node-red
    ```
2. Installieren Sie die lokale Kopie des Beispiel-Nodes:
   ```bash
   npm install /path/to/your/local/node-red-dashboard-example-node-folder
   ```
3. Starten Sie Node-RED neu

_Hinweis: Bei allen lokalen Änderungen, die Sie im `/ui`-Ordner des Drittanbieter-Widgets vornehmen, müssen Sie `npm run build` erneut ausführen, um die `umd.js`-Datei zu aktualisieren, die Dashboard lädt, um das Widget zu rendern._

## Konfigurieren Ihres Widgets

### Benennen Ihres Widgets

Um externe Widgets in den Dashboard-Kern zu importieren, liest der `ui-base`-Konfigurationsknoten von Dashboard die `package.json` von Node-RED und überprüft alle Pakete, die in Node-RED mit `node-red-dashboard-2-` im Paketnamen installiert wurden.

Daher stellen Sie bitte sicher, dass Ihre eigene Integration entsprechend benannt ist: 

```json 
"name": "node-red-dashboard-2-<your-widget-name>"
```

### Definieren Ihres Widgets

Innerhalb Ihrer eigenen `package.json` müssen Sie einen `node-red-dashboard-2`-Abschnitt definieren, der Dashboard mitteilt, _wie_ Ihr Widget geladen werden soll. Ein Beispiel aus `ui-example` ist wie folgt:

```json
"node-red-dashboard-2": {
    "version": "0.8.0",   // die minimale unterstützte Version von Dashboard 2.0
    "widgets": {
        "ui-example": {   // dieser Schlüssel muss mit dem "type" Ihres Widgets übereinstimmen, das in Node-RED registriert ist
            "output": "ui-example.umd.js", // der Name der erstellten .js-Datei, die in Dashboard importiert wird, konfiguriert in vite.config.js
            "component": "UIExample"       // der Name der primären Vue-Komponente, die als Ihr Widget in Dashboard gerendert wird
        }
    }
}
```

### Registrieren Ihres Nodes & Widgets

_Mehr Details: [Registrierung](../guides/registration.md)_

Traditionell müssen Sie bei Node-RED Ihren Knoten mit `RED.nodes.registerType("ui-example", UIExampleNode)` registrieren. Dies ist auch bei Dashboard der Fall, aber Sie müssen das Widget _auch_ bei Dashboard registrieren.

Die Dashboard-Registrierung basiert auf einer `.register()`-Funktion (siehe [Dokumentation](../guides/registration.md)). Diese Funktion ist für jeden `ui-base`, `ui-page` oder `ui-group` verfügbar. Für `ui-group` und `ui-page` wird die Funktion an den `ui-base` weitergeleitet, wo ein Store aller Widgets im Dashboard gepflegt wird.

Ihr Widget sollte eines dieser als Eigenschaft in Ihrem Node-RED-Knoten definieren, höchstwahrscheinlich wird es `ui-group` sein, wenn Sie möchten, dass Ihr Widget _innerhalb_ einer Gruppe im Dashboard gerendert wird.

In Ihrer `/nodes/ui-example.js`-Datei:

```js
module.exports = function(RED) {
    function UIExampleNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // in welcher Gruppe rendern wir dieses Widget
        const group = RED.nodes.getNode(config.group)

        /**
         * Weitere Konfiguration & Einrichtung hier
         */

        // das Widget bei Dashboard registrieren
        group.register(node, config, evts)
    }
    // Den Knoten bei Node-RED registrieren
    RED.nodes.registerType("ui-example", UIExampleNode);
}
```

## Anleitungen

Die folgenden sind Anleitungen und Beispiele zum Erstellen von Drittanbieter-Widgets. Wir haben auch den Abschnitt "Nützliche Anleitungen" in der linken Navigation, der allgemeinere Entwicklungsanleitungen beim Beitrag zu Dashboard 2.0 bietet.

### Die Grundlagen von VueJS

Wir sind uns bewusst, dass viele Entwickler, die zu Dashboard 2.0 beitragen möchten, möglicherweise neu in VueJS sind, daher haben wir hier einige Grundlagen detailliert beschrieben.

Es ist sehr üblich, seit VueJS Anwendungen mit der "Composition API" zu sehen. Während dies eine leichtere Möglichkeit ist, Ihre Anwendungen zu erstellen, ist es nicht die intuitivste für diejenigen, die mit VueJS nicht vertraut sind. Daher verwenden wir größtenteils die "Options API"-Struktur in Dashboard 2.0 und in unseren Beispielen für bessere Lesbarkeit.

Mit der Options-API hat eine Vue-Komponente die folgende Struktur:

```vue
<template>
    <!-- HTML-Vorlage für die Komponente -->
    <!-- Sie können hier direkt auf alle in Ihren Komponenten definierten Variablen verweisen, z.B. -->
    <div>{{ myVar }}</div>
</template>

<script>
export default {
    // alle Eigenschaften, die an die Komponente übergeben werden
    // in Dashboard 2.0 sind dies die 3 bereitgestellten:
    props: ['id', 'props', 'state'],
    // alle Daten, die Sie reaktiv und in Ihrer gesamten Komponente verfügbar machen möchten
    // innerhalb des <script> verweisen Sie auf diese Variablen mit this.<myVar>
    // innerhalb des HTML benötigen Sie das "this."-Präfix nicht
    data () {
        return {
            myVar: 'Hallo Welt'
        }
    },
    // Berechnete Eigenschaften sind Variablen, die sich automatisch aktualisieren, wenn sich ihre Abhängigkeiten ändern
    computed: {
        myComputedProp () {
            return this.myVar + '!'
        }
    },
    // alle Methoden, die innerhalb der Komponente verwendet werden
    methods: {
        myMethod () {
            alert(this.myVar)
        }
    },
    // Wird ausgeführt, wenn die Komponente erstellt und in den DOM geladen wird
    mounted () {
        alert('Komponente wurde geladen')
    },
    // Wird ausgeführt, wenn die Komponente entfernt wird
    unmounted () {
        alert('Komponente wurde entfernt')
    }
}
</script>

<style>
/* alle CSS-Stile für die Komponente */
</style>
```


### Verwenden von Vuetify-Komponenten

Sie sind frei, vollständig benutzerdefiniertes HTML/CSS zu definieren, wenn Sie Ihre Widgets definieren, aber wir haben auch native Unterstützung für die gesamte [Vuetify-Komponentenbibliothek](https://vuetifyjs.com/en/components/all/) bereitgestellt, um Ihnen den Einstieg mit einer Vielzahl von UI-Komponenten zu erleichtern, die Sie möglicherweise nutzen möchten.

### Zugriff auf Eigenschaften

Wenn Widgets in einem Dashboard-Layout gerendert werden, wird ihnen eine kleine Sammlung von Eigenschaften übergeben, die verwendet werden können, um das Verhalten des Widgets anzupassen:

|Eigenschaft | Beschreibung |
|--|--|
| `id` | Die ID des Widgets, die von Node-RED zugewiesen wird |
| `props` | Die in Node-RED definierten Eigenschaften, z.B. `this.props.name` oder `this.props.group` |
| `state` | Der Zustand des Widgets, z.B. `this.state.enabled` oder `this.state.visible` |

Wenn Sie diese in Ihrer eigenen Vue-Komponente rendern, können Sie wie folgt darauf zugreifen:

```vue
<template>
    <div>ID: {{ id }}</div>
    <div>Name: {{ props.name }}</div>
    <div>Gruppe: {{ props.group }}</div>
</template>

<script>
export default {
    props: ['id', 'props', 'state'],
    mounted () {
        // wird beim Laden des Widgets ausgeführt
        alert(this.id)
    }
}
</script>
```

### Kommunikation mit Node-RED

Ereignisse werden zwischen Node-RED und Dashboard 2.0 mit SocketIO hin und her gesendet. Sie können eine vollständige Aufschlüsselung dieser Ereignisse in unserem Leitfaden [Ereignisarchitektur](../guides/events.md) sehen.

#### Empfangen von Node-RED-Nachrichten

Wenn Ihr Knoten eine `msg` in Node-RED empfängt, erhält der Dashboard 2.0-Client ein `msg-input`-Ereignis über SocketIO. Sie können sich innerhalb der Vue-Komponente Ihres eigenen Widgets auf dieses Ereignis abonnieren mit:

```js
export default {
    props: ['id', 'props', 'state'],
    // der Rest Ihrer Vue-Komponente hier
    mounted () {
        this.$socket.on('msg-input' + this.id, (msg) => {
            // tun Sie etwas mit der msg
        })
    },
    unmounted () {
        // vom Ereignis abmelden, wenn das Widget zerstört wird
        this.$socket.off('msg-input:' + this.id)
    
    }
}
```

Es wird empfohlen, unseren eingebauten [Daten-Tracker](../widgets/core-widgets.md#data-tracker) zu verwenden, um die Standard-Eingabe-/Ladeereignisse für Ihr Widget einzurichten. Dies kann durch Aufrufen des folgenden in der `.vue`-Datei Ihres Widgets erfolgen:

```js
export default {
    inject: ['$dataTracker'],
    // der Rest Ihrer Vue-Komponente hier
    created () {
        this.$dataTracker(this.id)
        // wir können die Standardereignisse überschreiben, wenn wir möchten, mit
        // this.$dataTracker(this.id, myOnInputFunction, myOnLoadFunction, myOnDynamicPropertiesFunction)
    }
}
```

Weitere Details zur Anpassung des Daten-Trackers finden Sie [hier](../widgets/core-widgets.md#custom-behaviours). 


#### Senden von Node-RED-Nachrichten

Sie können eine `msg` an alle verbundenen Knoten in Node-RED senden, indem Sie eines der folgenden Ereignisse über SocketIO aufrufen:

- `this.$socket.emit('widget-action', this.id, msg)`: sendet eine `msg` an alle verbundenen Knoten in Node-RED.
- `this.$socket.emit('widget-change', this.id, msg)`: dasselbe wie `widget-action`, speichert _auch_ die letzte Nachricht im Node-RED-Datenspeicher für dieses Widget, damit der Zustand wiederhergestellt werden kann, wenn das Dashboard aktualisiert wird.

#### Benutzerdefinierte SocketIO-Ereignisse

Wenn Sie Ihre eigenen SocketIO-Ereignisse und -Handler implementieren möchten, können Sie dies in Ihrer `.vue`-Komponente tun mit:

```js
this.$socket.emit('my-custom-event', this.id, msg)
```

Dann, wo Sie Ihren Knoten bei Dashboard auf der Serverseite registrieren (in der `.js`-Datei Ihres Knotens), können Sie den relevanten Ereignishandler definieren:

```js
evts = {
    onSocket: {
        // auf benutzerdefinierte Ereignisse abonnieren
        'my-custom-event': function (conn, id, msg) {
            // eine msg in Node-RED von diesem Knoten aus senden
            node.send(msg)
        }
    }
}
group.register(node, config, evts)
```

### Datenaufbewahrung & Datenspeicher

Wir verwenden das Konzept von Datenspeichern sowohl auf der Client- als auch auf der Serverseite von Dashboard 2.0. Diese werden verwendet, um die zentrale Speicherung des neuesten Zustands und der Daten, die einem Widget zugeordnet sind, zu zentralisieren.

Datenspeicher sind eine Zuordnung der ID des Widgets/Knotens zu den neuesten Daten, die in dieses Widget empfangen wurden. Dies wird am häufigsten verwendet, um den Zustand wiederherzustellen, wenn das Dashboard aktualisiert wird.


#### Node-RED-Datenspeicher

Der Datenspeicher von Node-RED wird für Drittanbieter-Widgets über den zugehörigen `ui-base` zugänglich gemacht.

Um darauf in der `.js`-Datei Ihres Widgets zuzugreifen, können Sie verwenden:

```js
const group = RED.nodes.getNode(config.group)
const base = group.getBase()
```

Dann, wann immer Sie Daten im Datenspeicher speichern möchten, können Sie dies tun mit:

```js
base.stores.data.save(base, node, msg)
```

Sie können mehr über den Node-RED-Datenspeicher in unserem Leitfaden [Zustandsverwaltung](../guides/state-management.md) lesen.

#### Node-RED-Zustandsspeicher

Zustand bezieht sich auf alle Eigenschaften Ihres Widgets, die sich zur Laufzeit geändert haben und sich von denen unterscheiden würden, die im Node-RED-Editor festgelegt sind.

Zum Beispiel kann das `ui-dropdown` seine `options` mit einer `msg.options`-Nachricht überschrieben haben, die an den Knoten gesendet wird. Diese aktualisierten `options` würden gegen den Knoten im Zustandsspeicher gespeichert werden.

#### Clientseitiger Datenspeicher

In der Clientseite von Dashboard 2.0 verwenden wir VueX, um den zentralisierten Zustand einer UI zu verwalten.

Mit VueX können Sie `mapState` aufrufen, das den Store automatisch an Ihre Vue-Komponente bindet, z.B.:

```vue
<template>
    <!-- Die neuesten Datenwerte vom Widget mit <id> abrufen -->
    {{ messages[id] }}
</template>
<script>
// mapState von VueX importieren
import { mapState } from 'vuex'

export default {
    props: ['id', 'props', 'state'],
    // ... der Rest Ihrer Komponente hier
    computed: {// die Nachrichten des Stores an unsere eigene Vue-Komponente binden
        ...mapState('data', ['messages'])
    },
    mounted () {
        // zeigt die neueste Nachricht beim Laden des Widgets an
        alert(this.messages[this.id])
    }
}
</script>
```

Dann, um Daten zum Store hinzuzufügen:

```js
this.$store.commit('data/bind', {
    widgetId: this.id,
    msg
})
```

#### Laden des Zustands

Wenn Dashboard 2.0 geladen wird, sendet es ein `widget-load`-Ereignis an alle Widgets im Dashboard. Dies enthält den neuesten Wert aus dem Node-RED-Datenspeicher. Sie können sich auf dieses Ereignis in Ihrem Widget abonnieren mit:

```js
export default {
    props: ['id', 'props', 'state'],
    // der Rest Ihrer Komponente hier
    mounted () {
        this.$socket.on('widget-load' + this.id, (msg) => {
            // tun Sie etwas mit der msg
        })
    },
    unmounted () {
        // vom Ereignis abmelden, wenn das Widget zerstört wird
        this.$socket.off('widget-load:' + this.id)
    
    }
}
```


### Styling mit Vuetify & CSS

Wir können unser eigenes CSS innerhalb des Repositories des Widgets definieren und sie in eine `.vue`-Komponente wie folgt importieren:

```vue
<style scoped>
.ui-example-wrapper {
    padding: 10px;
    margin: 10px;
    border: 1px solid black;
}
</style>
```

Vuetify bietet auch eine Handvoll von Dienstprogrammsklassen zur Unterstützung beim Styling, die alle direkt verwendet werden können:

- [Responsive Displays](https://vuetifyjs.com/en/styles/display/#display)
- [Flex](https://vuetifyjs.com/en/styles/flex/)
- [Abstände](https://vuetifyjs.com/en/styles/spacing/#how-it-works)
- [Text & Typografie](https://vuetifyjs.com/en/styles/text-and-typography/#typography)



### Externe Abhängigkeiten

Ihr Widget kann eine beliebige Anzahl von `npm`-Abhängigkeiten haben. Diese werden alle in die `.umd.js`-Datei gebündelt, die Dashboard zur Laufzeit lädt.

In `ui-example` haben wir eine Abhängigkeit von `to-title-case`, die wir in unsere Vue-Komponente importieren und verwenden wie folgt:

```js
import toTitleCase from 'to-title-case'

export default {
    // der Rest der Komponente hier
    computed: {
        titleCase () {
            return toTitleCase(this.input.title)
        }
    }
}
```

Sie können auch andere Vue-Komponenten aus Ihrem eigenen Repository laden, wie bei jeder VueJS-Komponente.
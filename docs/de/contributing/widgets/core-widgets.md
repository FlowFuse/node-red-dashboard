---
description: Schritt-für-Schritt-Anleitung zum Hinzufügen neuer Kern-Widgets zum Node-RED Dashboard 2.0, um seine interaktiven Funktionen zu erweitern.
---

# Hinzufügen neuer Kern-Widgets

Ein einzelnes Widget besteht aus zwei Hauptteilen:

1. Ein Node-RED-Knoten, der in der Palette des Node-RED-Editors erscheint
2. `.vue` und clientseitiger Code, der das Widget in ein Dashboard rendert

Sie können unsere Sammlung von Kern-Widgets [hier](../../nodes/widgets.md) erkunden.

Wir sind immer offen für Pull-Anfragen und neue Ideen zu Widgets, die dem Kern-Dashboard-Repository hinzugefügt werden können.

Beim Hinzufügen eines neuen Widgets zur Kernsammlung müssen Sie die folgenden Schritte befolgen, um sicherzustellen, dass das Widget im Node-RED-Editor verfügbar ist und korrekt in der Benutzeroberfläche gerendert wird.

## Empfohlene Lektüre

In der linken Navigation finden Sie einen Abschnitt "Nützliche Anleitungen". Wir empfehlen, sich diese anzusehen, da sie einen guten Überblick über die Struktur des Dashboard 2.0-Codebasis und einige der zugrunde liegenden architektonischen Prinzipien geben, auf denen es aufgebaut ist.

Insbesondere werden die folgenden empfohlen:

- [Ereignisarchitektur](/en/contributing/guides/state-management.html)
- [Zustandsverwaltung](/en/contributing/guides/state-management.html)

## Checkliste

Beim Hinzufügen eines neuen Widgets zu Dashboard 2.0 müssen Sie sicherstellen, dass die folgenden Schritte für dieses neue Widget befolgt wurden, damit es erkannt und in einem Dashboard 2.0-Build aufgenommen wird:

1. In `/nodes/`:
    - Fügen Sie `<widget>.html` hinzu
    - Fügen Sie `<widget>.js` hinzu
    - Fügen Sie den Verweis auf den Abschnitt `node-red/nodes` in `package.json` hinzu
2. In `/ui/`:
    - Fügen Sie `widgets/<widget>/<widget>.vue` hinzu
    - Fügen Sie das Widget zur `index.js`-Datei in `/ui/widgets` hinzu

## Beispiel <widget.vue>

```vue
<template>
    <div @click="onAction">
        {{ id }}
    </div>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIWidget',
        // wir müssen $socket injizieren, damit wir Ereignisse an Node-RED senden können
        inject: ['$socket', '$dataTracker'],
        props: {
            id: String,    // die ID des Widgets, wie von Node-RED definiert
            props: Object, // die Eigenschaften für dieses Widget, die im Node-RED-Editor definiert sind
            state: Object  // der Zustand dieses Widgets, z.B. aktiviert, sichtbar
        },
        computed: {
            // unseren Datenspeicher so abbilden, dass wir auf alle Daten zugreifen können, die an dieses Widget gebunden sind
            // bei der Eingabe von Node-RED empfangen
            ...mapState('data', ['messages']), // bietet Zugriff auf `this.messages`, wobei `this.messages[this.id]` die gespeicherte Nachricht für dieses Widget ist
        },
        created () {
            // das Widget mit Standard-Event-Handlern für onInput, onLoad und onDynamicProperties einrichten
            this.$dataTracker(this.id)
        },
        methods: {
            onAction () {
                // wir können alle Daten senden, die wir benötigen, um Node-RED durch diesen (optionalen) Nachrichtenparameter zu senden
                const msg = {
                    payload: 'hallo welt'
                }
                // ein Ereignis an Node-RED senden, um es darüber zu informieren, dass wir auf dieses Widget geklickt haben
                this.$socket.emit('widget-action', this.id, msg)
            }
        }
    }
</script>
  
<style scoped>
</style>
```

## Daten-Tracker

Der Daten-Tracker ist ein global verfügbarer Dienst, der hilft, die Standard-Event-Handler für Widgets einzurichten.

### Verwendung

Der Daten-Tracker ist global über bestehende Widgets verfügbar und kann mit `this.$dataTracker(...)` aufgerufen werden.

Die einfachste Verwendung des Trackers wäre:

```js
...
created () {
    this.$dataTracker(this.id)
},
...
```

Dies richtet die folgenden Ereignisse ein:

- `on('widget-load')` - Stellt sicher, dass wir alle empfangenen `msg`-Objekte speichern, wenn ein Widget erstmals in das Dashboard geladen wird.
- `on('msg-input')` - Standardverhalten überprüft auf dynamische Eigenschaften (z.B. Sichtbarkeit, deaktivierter Zustand) und speichert auch die eingehende `msg` im Vuex-Store

### Benutzerdefinierte Verhaltensweisen

Es bietet auch Flexibilität, um benutzerdefinierte Event-Handler für ein gegebenes Widget zu definieren. Zum Beispiel haben wir in einem `ui-chart`-Knoten eine Logik, die das Zusammenführen von Datenpunkten und das Rendern des Diagramms behandelt, wenn eine Nachricht empfangen wird.

Die Eingaben für die Funktion `this.$dataTracker(widgetId, onInput, onLoad, onDynamicProperties)` werden wie folgt verwendet:

- `widgetId` - die eindeutige ID des Widgets
- `onInput` - eine Funktion, die aufgerufen wird, wenn eine Nachricht von Node-RED über den `on(msg-input)`-Socket-Handler empfangen wird
- `onLoad` - eine Funktion, die aufgerufen wird, wenn das Widget geladen wird und durch das `widget-load`-Ereignis ausgelöst wird
- `onDynamicProperties` - eine Funktion, die als Teil des `on(msg-input)`-Ereignisses aufgerufen wird und _vor_ der Standard-`onInput`-Funktion ausgelöst wird. Dies ist ein guter Einstiegspunkt, um gegen alle Eigenschaften zu prüfen, die in der `msg` enthalten sind, um eine dynamische Eigenschaft zu setzen (d.h. Inhalt, der in `msg.ui_update...` gesendet wird).


## Dynamische Eigenschaften

Node-RED ermöglicht die Definition der zugrunde liegenden Konfiguration für einen Knoten. Zum Beispiel hätte ein `ui-button` Eigenschaften wie `label`, `color`, `icon` usw. Es wird oft gewünscht, dass diese Eigenschaften dynamisch sind, was bedeutet, dass sie zur Laufzeit geändert werden können.

Es ist eine Standardpraxis innerhalb von Dashboard 2.0, diese Eigenschaftsaktualisierungen über ein verschachteltes `msg.ui_update`-Objekt zu unterstützen. Daher können Benutzer erwarten, dass sie diese im Allgemeinen steuern können, indem sie `msg.ui_update.<property-name>` an den Knoten übergeben, der wiederum die entsprechende Eigenschaft aktualisieren sollte.

### Entwurfsmuster

Dieser Abschnitt skizziert das architektonische Entwurfsmuster für die Entwicklung dynamischer Eigenschaften in ein Widget.

Serverseitig werden dynamische Eigenschaften in unserem `state`-Store gespeichert, der eine Zuordnung der Widget-ID zu den dynamischen Eigenschaften darstellt, die diesem Widget zugewiesen sind. Dies geschieht, um sicherzustellen, dass die dynamischen Eigenschaften eines Widgets von der anfänglichen Konfiguration getrennt sind, die in Node-RED definiert und gespeichert ist.

Bevor der `ui-base`-Knoten das `ui-config`-Ereignis und die Nutzlast sendet, führen wir die dynamischen Eigenschaften mit der anfänglichen Konfiguration zusammen, wobei die dynamischen Eigenschaften die zugrunde liegende Konfiguration überschreiben dürfen. Daher wird der Client, wenn er eine `ui-config`-Nachricht erhält, die aktuellste Konfiguration für das Widget haben, mit der Zusammenführung von sowohl statischen als auch dynamischen Eigenschaften.

### Dynamische Eigenschaften setzen

#### Serverseitig

Um eine dynamische Eigenschaft im serverseitigen `state`-Store zu setzen, können wir das `beforeSend`-Ereignis auf dem Knoten nutzen. Dieses Ereignis wird bei jeder Gelegenheit ausgelöst, bei der der serverseitige Knoten eine Nachricht an den Client senden soll, einschließlich wenn eine neue Eingabe in einen gegebenen Knoten empfangen wird.

Dafür nutzen wir die `set`-Funktion des State-Stores:

```js
/**
    *
    * @param {*} base  - zugehöriger ui-base-Knoten
    * @param {*} node  - das Node-RED-Knotenobjekt, für das wir den Zustand speichern
    * @param {*} msg   - die vollständig empfangene Nachricht (ermöglicht uns, auf Anmeldeinformationen/Socketid-Beschränkungen zu prüfen)
    * @param {*} prop  - die Eigenschaft, die wir auf dem Knoten setzen
    * @param {*} value - der Wert, den wir setzen
*/
set (base, node, msg, prop, value) {
    if (canSaveInStore(base, node, msg)) {
        if (!state[node.id]) {
            state[node.id] = {}
        }
        state[node.id][prop] = value
    }
},
```

Zum Beispiel in `ui-dropdown`:

```javascript
const evts = {
    onChange: true,
    beforeSend: function (msg) {
        if (msg.ui_update) {
            const update = msg.ui_update
            if (typeof update.options !== 'undefined') {
                // dynamisch die Eigenschaft "options" setzen
                statestore.set(group.getBase(), node, msg, 'options', update.options)
            }
        }
        return msg
    }
}

// die Dashboard-UI darüber informieren, dass wir diesen Knoten hinzufügen
group.register(node, config, evts)
```

#### Clientseitig

Jetzt, da wir den serverseitigen Zustand aktualisieren, wird bei jedem Aktualisieren die vollständige `ui-config` bereits die dynamischen Eigenschaften enthalten.

Wir müssen dann sicherstellen, dass der Client über diese dynamischen Eigenschaften _informiert wird, während sie sich ändern_. Dazu können wir das `onDynamicProperties`-Ereignis verwenden, das im [Daten-Tracker](#data-tracker) verfügbar ist.

Ein gutes Muster, dem man folgen kann, ist, eine `computed`-Variable auf der betreffenden Komponente bereitzustellen. Wir bieten dann drei hilfreiche, globale Funktionen:

- `setDynamicProperties(config)`: Weist die bereitgestellten Eigenschaften (in `config`) dem Widget im clientseitigen Store zu. Dies aktualisiert automatisch den Zustand des Widgets und alle Verweise, die diese Eigenschaft verwenden.
- `updateDynamicProperty(property, value)`: Aktualisiert die relevante `property` mit dem bereitgestellten `value` im clientseitigen Store. Stellt auch sicher, dass die Eigenschaft nicht vom Typ `undefined` ist. Dies aktualisiert automatisch den Zustand des Widgets und alle Verweise, die diese Eigenschaft verwenden.
- `getProperty(property)`: Ruft automatisch den korrekten Wert für die angeforderte Eigenschaft ab. Sucht zuerst in den dynamischen Eigenschaften, und wenn nicht gefunden, wird auf die statische Konfiguration zurückgegriffen, die im [`ui-config`-Ereignis](../guides/events.md#ui-config) definiert ist.

Die berechneten Variablen können die Funktion `this.getProperty` umschließen, die immer mit dem zentralisierten Vuex-Store auf dem neuesten Stand sein wird.

```js
{
    // ...
    computed: {
        label () {
            return this.getProperty('label')
        }
    },
    created () {
        // wir können einen benutzerdefinierten onDynamicProperty-Handler für dieses Widget definieren
        useDataTracker(this.id, null, null, this.onDynamicProperty)
    // ...,
    methods () {
        // ...,
        onDynamicProperty (msg) {
            // Standardpraxis, um Updates über msg.ui_update zu akzeptieren
            const updates = msg.ui_update
            // global verfügbare API verwenden, um die dynamische Eigenschaft zu aktualisieren
            this.updateDynamicProperty('label', updates.label)
        }
    }
}

```

### Dokumentation aktualisieren

Es gibt zwei wichtige Orte, um sicherzustellen, dass die Dokumentation aktualisiert wird, wenn dynamische Eigenschaften hinzugefügt werden:

#### Online-Dokumentation:

Jeder Knoten hat eine entsprechende `/docs/nodes/widgets/<node>.md`-Datei, die die Definition einer ` `dynamic`-Tabelle im Frontmatter ermöglicht, z.B.:

```yaml
dynamic:
    Options:
        payload: msg.options
        structure: ["Array<String>", "Array<{value: String}>", "Array<{value: String, label: String}>"]
    Class:
        payload: msg.class
        structure: ["String"]
```

Sie können diese Tabelle dann in die Dokumentation rendern mit:

```md
## Dynamische Eigenschaften

<DynamicPropsTable/>
```

#### Editor-Dokumentation:

Jeder Knoten hat eine entsprechende `/locales/<locale>/<node>.html`-Datei, die eine Tabelle dynamischer Eigenschaften enthalten sollte, z.B.:

```html
<h3>Dynamische Eigenschaften (Eingaben)</h3>
<p>Jede der folgenden Eigenschaften kann an eine <code>msg.</code> angehängt werden, um Eigenschaften auf diesem Knoten zur Laufzeit zu überschreiben oder zu setzen.</p>
<dl class="message-properties">
    <dt class="optional">options <span class="property-type">array</span></dt>
    <dd>
        Ändern Sie die zur Laufzeit verfügbaren Optionen im Dropdown
        <ul>
            <li><code>Array&lt;string&gt;</code></li>
            <li><code>Array&lt;{value: String}&gt;</code></li>
            <li><code>Array&lt;{value: String, label: String}&gt;</code></li>
        </ul>
    </dd>
    <dt class="optional">class <span class="property-type">string</span></dt>
    <dd>Fügen Sie zur Laufzeit eine CSS-Klasse oder mehr zum Button hinzu.</dd>
</dl>
```

### Debugging dynamischer Eigenschaften

Dashboard 2.0 verfügt über eine [Debug-Ansicht](/en/contributing/widgets/debugging.html), die ein [Spezialpanel](/en/contributing/widgets/debugging.html#dynamic-properties) enthält, um alle dynamischen Eigenschaften zu überwachen, die einem Widget zugewiesen sind. Dies kann ein sehr nützliches Werkzeug sein, um zu überprüfen, ob der Client über alle dynamischen Eigenschaften informiert ist, die gesendet wurden.
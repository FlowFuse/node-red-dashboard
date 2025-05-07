---
description: Anleitung zum Erstellen benutzerdefinierter Plugins für das Node-RED Dashboard 2.0, um dessen Fähigkeiten mit Ihrer Funktionalität zu erweitern.
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
</script>

# Erstellen von Dashboard-Plugins <AddedIn version="0.11.0"/>

Node-RED unterstützt die Entwicklung benutzerdefinierter Plugins, die Verhalten und Funktionalität zur Node-RED-Laufzeit hinzufügen. Ein sehr häufiger Anwendungsfall für Plugins sind [benutzerdefinierte Node-RED-Themen](https://nodered.org/docs/api/ui/themes/), die das gesamte CSS/Aussehen des zugrunde liegenden Node-RED-Editors ändern.

Das Node-RED Dashboard 2.0 unterstützt ebenfalls Plugins. Dies ermöglicht es Ihnen, benutzerdefiniertes Verhalten für die Dashboard-Laufzeit zu definieren, unabhängig von bestimmten Knoten und Widgets. Derzeit bieten wir eine Sammlung von [API-Hooks](#index-js) an, die die Injektion von Code an verschiedenen Punkten in der Dashboard-Instanziierung und -Laufzeit ermöglichen.

Um zu integrieren, stellen Sie sicher, dass Ihr Node-RED-Plugin mit `"type": "node-red-dashboard-2"` in der `package.json`-Datei registriert ist. Dies teilt Node-RED mit, dass es sich um ein Dashboard 2.0-Plugin handelt.

_Hinweis: Plugins unterscheiden sich von [Drittanbieter-Widgets](../widgets/third-party.md). Drittanbieter-Widgets werden als Knoten erstellt, die im Node-RED-Editor verfügbar werden und auf das Dashboard gezogen werden können. Plugins werden erstellt, um das Verhalten der Dashboard-Laufzeit selbst zu ändern._

## Authentifizierungs-Plugins <AddedIn version="1.10.0"/>

Einer der häufigsten Anwendungsfälle für Dashboard-Plugins ist das Hinzufügen von Benutzerdaten zu Nachrichten, die vom Dashboard gesendet werden. Sie nutzen ein bestehendes Authentifizierungs-Framework, das auf dem Node-RED-Server eingerichtet ist, und fügen Benutzerdaten in das `msg._client`-Objekt ein, das an den Node-RED-Flow gesendet wird.

### Konfiguration

Die Dashboard 2.0-Seitenleiste listet alle Plugins im Tab "Client-Daten" auf, die `auth: true` in ihrer `index.html`-Datei deklariert haben. Dies ist erforderlich, wenn ein Plugin Daten im `msg._client`-Objekt anhängt/ändert.

![Screenshot eines Beispiel-Tabs "Client-Daten"](/images/dashboard-sidebar-clientdata.png)
_Screenshot eines Beispiel-Tabs "Client-Daten"_

Im obigen Screenshot sehen wir, dass der Kern-Dashboard-Code die "Socket-ID"-Daten anhängt, und wir verwenden auch das FlowFuse-Authentifizierungs-Plugin, das alle Informationen über einen angemeldeten FlowFuse-Benutzer beim Verwenden des Dashboards anhängt.

## Plugin-Struktur

Lassen Sie uns ein kurzes Beispiel nehmen, um einen Überblick über die Struktur eines Dashboard-Plugins zu geben:

### package.json

```json
{
    "name": "node-red-dashboard-2-<plugin-name>",
    "version": "<x.y.z>",
    "description": "<beschreiben Sie Ihr Plugin>",
    "main": "index.js",
    "scripts": {
        "test": "<führen Sie hier Ihre Tests aus>"
    },
    "author": {
        "name": "<Ihr Name>",
        "url": "<Ihre Website/GH-Profil>"
    },
    "node-red": {
        "plugins": {
            "node-red-dashboard-2-<plugin-name>": "index.js"
        }
    },
    "license": "Apache-2.0"
}
```

### index.html

Dies definiert alle Client-/Editor-Plugins. Dies ermöglicht die Definition von Node-RED-Editor-Funktionen wie das Injizieren von Inhalten in die Dashboard 2.0-Seitenleiste oder ob Laufzeit-Plugins Authentifizierungs-/Client-Daten zu Nachrichten anhängen.

 ```html
 <script type="text/javascript">
    RED.plugins.registerPlugin('node-red-dashboard-2-<plugin-name>', {
        type: 'node-red-dashboard-2',
        tabs: [
            {
                id: 'my-tab-id',
                label: 'Mein Tab',
                /**
                 * Wird ausgeführt, wenn Tabs erstmals erstellt werden
                 * @param {object} base - ui-base-Knoten, für den diese Seitenleiste steht
                 * @param {object} parent - DOM-Element, um Inhalte anzuhängen
                 */
                init (base, parent) {
                    // fügen Sie dem Tab einige Inhalte hinzu
                }
            }
        ],
        auth: true/false, // Deklariert dem Dashboard 2.0, ob dies im "Client-Daten"-Tab aufgelistet werden soll
        description: '', // Wenn "auth: true", wird dies im "Client-Daten"-Tab der Dashboard-Seitenleiste verwendet
    })
</script>
 ```

### index.js

Die `js`-Datei eines Plugins definiert Laufzeitverhalten für das Dashboard 2.0. Hier definieren Sie Ihre Hooks und jeden anderen Code, den Sie ausführen möchten, wenn das Dashboard 2.0 instanziiert wird oder Nachrichten zwischen dem Dashboard und Node-RED gesendet werden.

```js
module.exports = function(RED) {
    RED.plugins.registerPlugin("node-red-dashboard-2-<plugin-name>", {

        // Teilt Node-RED mit, dass dies ein Node-RED Dashboard 2.0-Plugin ist
        type: "node-red-dashboard-2",

        // hooks - eine Sammlung von Funktionen, die in Dashboard 2.0 injiziert werden
        hooks: {
            /**
             * onSetup - wird aufgerufen, wenn das Dashboard 2.0 instanziiert wird
             * @param {object} RED - Node-RED-Laufzeit
             * @param {object} config - UI-Basis-Knoten-Konfiguration
             * @param {object} req - ExpressJS-Anfrageobjekt
             * @param {object} res - ExpressJS-Antwortobjekt
             * @returns {object} - Setup-Objekt, das an den Client übergeben wird
             */ 
            onSetup: (RED, config, req, res) => {
                return {
                    // muss IMMER socketio.path zurückgeben, wenn dieser Hook verwendet wird
                    socketio: {
                        path: `${config.path}/socketio`, 
                    }
                }
            },
            /**
             * onInput - wird aufgerufen, wenn ein Knoten eine Nachricht empfängt
             * @param {object} msg - Node-RED msg-Objekt
             * @returns {object} - Gibt Node-RED msg-Objekt zurück
             */ 
            onInput: (msg) => {
                // ändern Sie msg auf beliebige Weise
                return msg
            },
            /**
             * onAction - wird aufgerufen, wenn ein D2.0-Widget das `widget-action`-Ereignis über SocketIO auslöst
             * @param {object} conn - SocketIO-Verbindungsobjekt
             * @param {object} id - Eindeutige Knoten-/Widget-ID
             * @param {object} msg - Node-RED msg-Objekt
             * @returns {object} - Gibt Node-RED msg-Objekt zurück
             */ 
            onAction: (conn, id, msg) => {
                // ändern Sie msg auf beliebige Weise
                msg.myField = "Hallo Welt"
                return msg
            },
            /**
             * onChange - wird aufgerufen, wenn ein D2.0-Widget das `widget-change`-Ereignis über SocketIO auslöst
             * @param {object} conn - SocketIO-Verbindungsobjekt
             * @param {object} id - Eindeutige Knoten-/Widget-ID
             * @param {object} msg - Node-RED msg-Objekt
             * @returns {object} - Gibt Node-RED msg-Objekt zurück
             */ 
            onChange: (conn, id, msg) => {
                // ändern Sie msg auf beliebige Weise
                msg.myField = "Hallo Welt"
                return msg
            },
            /**
             * onLoad - wird aufgerufen, wenn ein D2.0-Widget das `widget-load`-Ereignis über SocketIO auslöst
             * @param {object} conn - SocketIO-Verbindungsobjekt
             * @param {object} id - Eindeutige Knoten-/Widget-ID
             * @param {object} msg - Node-RED msg-Objekt
             * @returns {object} - Gibt Node-RED msg-Objekt zurück
             */ 
            onLoad: (conn, id, msg) => {
                // ändern Sie msg auf beliebige Weise
                msg.myField = "Hallo Welt"
                return msg
            },
            /**
             * onAddConnectionCredentials - wird aufgerufen, wenn ein D2.0 eine Nachricht in Node-RED senden soll
             * @param {object} conn - SocketIO-Verbindungsobjekt
             * @param {object} msg - Node-RED msg-Objekt
             * @returns {object} - Gibt Node-RED msg-Objekt zurück
             */ 
            onAddConnectionCredentials: (conn, msg) => {
                // ändern Sie msg auf beliebige Weise
                msg._client.socketIp = conn.request.socket.remoteAddress
                return msg
            },
            /**
             * onIsValidConnection - Überprüft, ob bei einer gegebenen msg-Struktur und Socket-Verbindung
             * alle angegebenen _client-Daten erlauben, dass diese Nachricht gesendet wird, z.B.
             * wenn die msg._client.socketid mit der ID der Verbindung übereinstimmt
             * @param {object} conn - SocketIO-Verbindungsobjekt
             * @param {object} msg - Node-RED msg-Objekt
             * @returns {boolean} - Ist eine gültige Verbindung oder nicht
             */ 
            onIsValidConnection: (conn, msg) => {
                if (msg._client?.socketId) {
                    // wenn socketId angegeben ist, überprüfen, ob sie mit der ID der Verbindung übereinstimmt
                    return msg._client.socketId === conn.id
                }
                // wenn keine spezifischen Angaben gemacht wurden, dann erlauben, dass die Nachricht gesendet wird
                return true
            },
            /**
             * onCanSaveInStore - Überprüft, ob bei einer gegebenen msg-Struktur die msg im Store gespeichert werden kann
             * Das Speichern in einem Store ist im Allgemeinen eine schlechte Idee, wenn wir es mit Nachrichten zu tun haben, die nur für
             * bestimmte Clients bestimmt sind (z.B. eine msg._client.socketId ist angegeben)
             * @param {object} msg - Node-RED msg-Objekt
             * @returns {boolean} - Ist es in Ordnung, dies zu speichern, oder nicht
             */
            onCanSaveInStore: (msg) => {
                if (msg._client?.socketId) {
                    // wenn socketId angegeben ist, dann nicht im Store speichern
                    return false
                }
                return true
            },

        }
    })
 }
 ```

 Wenn eines von `onInput`, `onAction`, `onChange` oder `onLoad` `null` zurückgibt, wird die `msg` dort abrupt gestoppt und nicht weiter im Flow gesendet.
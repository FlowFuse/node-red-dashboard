---
description: Lassen Sie sich von einer Vielzahl von UI-Vorlagenbeispielen im Node-RED Dashboard 2.0 inspirieren, um Ihren Dashboard-Designprozess zu verbessern.
---

<script setup>
    import { ref } from 'vue'
    import FlowViewer from '../../components/FlowViewer.vue'
    import ExampleFlowWorldmap from '../../examples/template-worldmap.json'
    import ExampleDataTable from '../../examples/template-data-table.json'
    import ExampleFileUpload from '../../examples/file-upload.json'

    const examples = ref({
      'worldmap': ExampleFlowWorldmap,
      'custom-data-table': ExampleDataTable,
      'file-upload': ExampleFileUpload
    })
</script>

# UI-Vorlagenbeispiele

Der UI-Vorlagenknoten ermöglicht es Ihnen, benutzerdefinierte Widgets für Ihr Dashboard zu erstellen und benutzerdefiniertes CSS zu definieren, um Ihr Dashboard nach Belieben zu gestalten.

Um Ihnen den Einstieg zu erleichtern, haben wir einige nützliche Beispiele gesammelt, die Sie verwenden oder an Ihre eigenen Bedürfnisse anpassen können.

## Widgets

### Benutzerdefinierte Diagramme

Eine Sammlung von Beispielen zur Verwendung von Chart.js innerhalb des `ui-template`-Knotens finden Sie im Abschnitt [Erstellung benutzerdefinierter Diagramme](../nodes/widgets/ui-chart.md#building-custom-charts) der UI-Diagrammdokumentation.

### Benutzerdefinierte Datentabellen

Obwohl wir das [`ui-table`](../nodes/widgets/ui-table.md) Widget standardmäßig anbieten, ist es in seiner Funktionalität recht einfach und erlaubt nicht viel Anpassung von Zellen und Stil.

Im Dashboard 1.0 gab es ein beliebtes Drittanbieter-`ui-table`-Widget, das eine breitere Anpassung bot, aber für Dashboard 2.0 haben wir einen etwas anderen Ansatz gewählt. Anstatt eine Spezifikation zu definieren, in die Sie Ihre Daten einfügen müssen, um eine festgelegte Anzahl von Funktionen in einer Bibliothek zu nutzen, können Sie mit Dashboard 2.0 das `ui-template` verwenden, um eine Datentabelle nach Belieben und mit jedem Datenformat anzupassen.

![Beispiel einer Datentabelle](/images/template-examples/custom-data-table.png "Beispiel einer Datentabelle"){data-zoomable}
_Beispiel eines benutzerdefinierten Headers und Zellinhalts mit ui-template und Vuetify's Datentabelle_

Hier sehen wir uns an, wie Sie den UI-Vorlagenknoten und [Vuetify's Datentabelle](https://vuetifyjs.com/en/components/data-tables/basics/#usage) (die wir ohnehin unter der Haube in `ui-table` verwenden) nutzen können, um Datentabellen mit unbegrenzten Anpassungen zu erstellen:

```vue
<template>
    <!-- Eingabefeld zum Durchsuchen des Inhalts bereitstellen -->
    <v-text-field v-model="search" label="Suche" prepend-inner-icon="mdi-magnify" single-line variant="outlined"
    hide-details></v-text-field>
    <v-data-table v-model:search="search" :items="msg?.payload">
      <template v-slot:header.current>
        <!-- Überschreiben, wie wir den Header für die "current"-Spalte rendern -->
        <div class="text-center">Zentriert ausgerichtet</div>
      </template>

      <template v-slot:item.target="{ item }">
        <!-- Fügen Sie einen benutzerdefinierten Suffix zum Wert für die "target"-Spalte hinzu -->
        {{ item.target }}°C
      </template>

      <template v-slot:item.current="{ item }">
        <!-- Rendern Sie eine lineare Fortschrittsanzeige für die "current"-Spalte -->
        <v-progress-linear v-model="item.current" min="15" max="25" height="25" :color="getColor(item)">
          <template v-slot:default="{ value }">
            <strong>{{ item.current }}°C</strong>
          </template>
        </v-progress-linear>
      </template>
    
    </v-data-table>
</template>

<script>
    export default {
    data () {
      return {
        search: ''
      }
    },
    methods: {
        // Funktion hinzufügen, um die Farbe der Fortschrittsanzeige basierend auf dem Element der Zeile zu bestimmen
      getColor: function (item) {
        if (item.current > item.target) {
          return 'red'
        } else {
          return 'green'
        }
      }
    }
  }
</script>
```

Wo wir Daten wie folgt übergeben:

```json
[
    {
        "room": "Wohnzimmer",
        "id": "1234",
        "target": 18.1,
        "current": 20
    },
    {
        "room": "Badezimmer",
        "id": "5678",
        "target": 19.5,
        "current": 18
    },
    {
        "room": "Küche",
        "id": "9101",
        "target": 18.1,
        "current": 17.6
    }
]
```

Vuetify's Datentabelle rendert automatisch eine Spalte für jedes Element in den bereitgestellten Daten. Standardmäßig wird es einfach als Text gerendert (wie wir es in `ui-table` tun). Wir können jedoch auch die `<template v-slot:item.property />`-Syntax verwenden, um zu überschreiben, wie wir eine bestimmte Zelle rendern.

#### Wichtiger Hinweis: Groß- und Kleinschreibung

Dies ist nur relevant, wenn Sie `<template>`-Überschreibungen in Ihrer `v-data-table` verwenden möchten, um das Erscheinungsbild einer Zelle oder eines Headers anzupassen.

Aufgrund einer Einschränkung in der Art und Weise, wie HTML rendert, können Sie keine Großbuchstaben in DOM-Vorlagen verwenden. Das bedeutet, dass, wenn Sie eine Eigenschaft in Ihren Daten haben, die `myProperty` oder `My_Property` genannt wird, wir sie in ein HTML-freundliches Format transformieren müssen, bevor wir sie in `<template v-slot:item.property="{ item }">` einfügen können.

Diese Transformation kann mit der `headers`-Option der `v-data-table` erreicht werden, die es uns ermöglicht, Werte und Schlüssel zuzuordnen.

```vue
<template>
    <div id="app">
        <v-text-field v-model="search" label="Suche" prepend-inner-icon="mdi-magnify" single-line variant="outlined"
            hide-details></v-text-field>
        <v-data-table v-model:search="search" :headers="headers" :items="msg?.payload" class="elevation-1" :items-per-page="20">
            <template v-slot:header.lowercase>
                <div>benutzerdefinierter <b>html</b> Titel</div>
            </template>
            <template v-slot:item.snake_case="{ item }">
                ${{ 3 * item.snake_case }}
            </template>
        </v-data-table>
    </div>
</template>

<script>
    export default {
    data () {
      return {
        search: '',
        headers: [
            // eine grundlegende Header-Definition
            { title: 'kebab-case', key: 'kebab-case' },
            { title: 'schlängelnd', key: 'snake_case'},
            // wir können auch darauf verzichten, hier einen Titel zu definieren,
            // und stattdessen v-slot (siehe im HTML oben) verwenden
            { key: 'lowercase' },
            // wenn wir aufgrund der Groß- und Kleinschreibung transformieren müssen, können wir dies so tun:
            { title: 'Datum & Uhrzeit', key: 'camel-case', value: item => item['camelCase']},
            // wir können auch JS-Transformationen auf unsere Werte anwenden
            { title: 'Alle Großbuchstaben', key: 'macro-case', value: item => item['MACRO_CASE'].toUpperCase()}
        ],
      }
    },
  }
</script>
```

Zusammenfassend sind die verschiedenen Möglichkeiten zur Handhabung der Groß- und Kleinschreibung:

| Typ | Erforderliche Transformation |
|------|--------------------|
| `kebab-case` | Nein |
| `snake_case` | Nein |
| `lowercase` | Nein |
| `camelCase` | Ja |
| `MACRO_CASE` | Ja |

Sie können das obige Beispiel mit diesem Fluss ausprobieren:

<FlowViewer :flow="examples['custom-data-table']" height="200px"/>

### Datei-Upload

_Aktualisierung: Während dieses Beispiel weiterhin funktioniert und für benutzerdefinierte Anwendungsfälle mit Datei-Uploads verwendet werden kann, bieten wir ab `v1.12.0` auch ein natives [Datei-Eingabe](../nodes/widgets/ui-file-input.md) Widget an._

Beim Erstellen von Anwendungen mit Node-RED besteht häufig die Notwendigkeit, Dateien zur Analyse zu verarbeiten. In solchen Fällen benötigen wir ein Datei-Upload-Widget, das derzeit nicht verfügbar ist. Glücklicherweise können wir dies einfach mit dem `ui-template`-Widget und Vuetify JS-Komponenten erreichen.

Dazu verwenden wir die [`v-file-input`](https://vuetifyjs.com/en/components/file-inputs/) Komponente, die die Schnittstelle zum Hochladen von Dateien bereitstellt.

```javascript
<template>
    <!-- Karte zum Hochladen einer Binärdatei -->
    <v-card raised color="white">
        <!-- Kartentitel -->
        <v-card-title>Binärdatei zu Node-Red hochladen</v-card-title>
        <br>
        <v-card-text>
            <!-- Datei-Eingabe -->
            <v-file-input label="Hier klicken, um eine Datei auszuwählen" show-size v-model="uploadFile">
            </v-file-input>
            <!-- Fortschrittsanzeige -->
            <div>Fortschritt: {{ progress }} Bytes geladen</div>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <!-- Upload-Button -->
            <v-btn right @click="startUpload">Datei hochladen</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        data() {
            return {
                uploadFile: null, // Hält die ausgewählte Datei
                progress: 0 // Fortschrittsanzeige für den Datei-Upload
            }
        },
        methods: {
            // Methode, die ausgelöst wird, wenn der Upload-Datei-Button geklickt wird
            startUpload() {
                // Überprüfen, ob eine Datei ausgewählt ist
                if (!this.uploadFile) {
                    console.warn('Keine Datei ausgewählt');
                    return;
                }

                // Protokollieren der ausgewählten Dateiinformationen in der Konsole
                console.log('Datei ausgewählt:');
                console.log(this.uploadFile);

                // Erstellen einer FileReader-Instanz zum Lesen der Datei
                const reader = new FileReader();

                // Wenn die Datei gelesen wird, senden Sie sie an Node-RED
                reader.onload = () => {
                    // Bereiten Sie die Nutzlast zum Senden vor
                    const payload = {
                        topic: 'upload', // Thema für Node-RED
                        payload: this.uploadFile, // Dateiinhalte
                        file: {
                            name: this.uploadFile.name, // Dateiname
                            size: this.uploadFile.size, // Dateigröße
                            type: this.uploadFile.type // Dateityp
                        }
                    };
                    
                    // Senden Sie die Nutzlast an Node-RED (angenommen, die 'send'-Methode ist definiert)
                    this.send(payload);
                };

                // Verfolgen Sie den Fortschritt des Datei-Lesens
                reader.onprogress = (event) => {
                    this.progress = event.loaded; // Fortschritt aktualisieren
                };

                // Lesen Sie die Datei als ArrayBuffer
                reader.readAsArrayBuffer(this.uploadFile);
            }
        },
    }
</script>
```

Um eine Datei-Upload-Komponente zu Ihrem Dashboard hinzuzufügen, fügen Sie das obige Vue-Snippet in das ui-template-Widget ein. Dieses Snippet ermöglicht das Importieren der Datei, und nach dem Klicken auf den Upload-Button wird zunächst der Fortschritt des Datei-Lesevorgangs verfolgt und angezeigt, wie viel der Datei gelesen wurde. Sobald die Datei vollständig geladen ist, sendet sie das Nachrichtenobjekt an den nachfolgenden Knoten, der die Datei und verwandte Informationen zur weiteren Verarbeitung enthält. Es ist jedoch wichtig zu beachten, dass dies die Pufferarrays sendet, die wir im folgenden Beispiel mit dem Änderungs-Knoten in Zeichenfolgen umwandeln.

<FlowViewer :flow="examples['file-upload']" height="200px"/>

Bitte beachten Sie auch, dass bei Verwendung dieses Beispiels mit den Standardeinstellungen von Node-RED nur Dateien bis zu 1 MB akzeptiert werden. Das Dashboard verwendet `socket.io` für die Kommunikation, das standardmäßig auf 1 MB begrenzt ist. Sie können dieses Limit erhöhen, indem Sie den folgenden Wert in der `settings.js`-Datei ändern. Weitere Informationen finden Sie in den [Einstellungen](https://dashboard.flowfuse.com/user/settings.html).

```javascript
dashboard: {
    maxHttpBufferSize: 1e8 // Größe in Bytes, Beispiel: 100 MB
}
```

### Weltkarte

Node-RED hat einen sehr beliebten [Weltkartenknoten](https://flows.nodered.org/node/node-red-contrib-web-worldmap), der es ermöglicht, Daten auf einem Globus detailliert darzustellen. Der Knoten erstellt einen neuen Endpunkt auf Ihrem Webserver unter `/worldmap` (oder einem beliebigen Pfad, den Sie als Standard überschreiben).

![Beispiel einer Weltkarte](../../assets/images/template-example-worldmap.png "Beispiel einer Weltkarte, die im Dashboard 2.0 gerendert wird"){data-zoomable}
_Beispiel einer Weltkarte, die im Dashboard 2.0 gerendert wird_

Um eine Weltkarte in Dashboard 2.0 anzuzeigen, ist derzeit der beste Weg, dies mit einem `ui-template`-Knoten zu tun:

```vue
<template>
    <iframe src="/worldmap" class="worldmap"></iframe>
</template>
<style>
  .worldmap {
    width: 100%;
    height: 100%;  
  }
</style>
```

#### Beispiel-Fluss

<FlowViewer :flow="examples['worldmap']" height="300px"/>

## Benutzerdefinierte Gestaltung

Ein Großteil der Gestaltung für Node-RED Dashboard 2.0 wird von der zugrunde liegenden [Vuetify](https://vuetifyjs.com/en/) Bibliothek gesteuert, die wir verwenden, um viele der Widgets zu rendern. Dies bedeutet oft, dass wir beim Definieren Ihres eigenen CSS die zugrunde liegenden Vuetify-Klassen überschreiben müssen.

Um Ihr eigenes CSS hinzuzufügen, können Sie einen `ui-template`-Knoten hinzufügen und eine der folgenden "Typ"-Optionen auswählen:

- **CSS (Einzelne Seite)** - Dies fügt das CSS dem `<style>`-Tag einer einzelnen Seite hinzu und nur dieser Seite.
- **CSS (Alle Seiten)** - Dies fügt das CSS dem `<style>`-Tag aller Seiten in Ihrem Dashboard hinzu.

Hier sind einige Beispiele, die wir basierend auf häufigen Anfragen in den Foren zusammengestellt haben.

### Schriftart

![Beispiel einer Datentabelle](/images/template-examples/style-font.png "Beispiel einer Datentabelle"){data-zoomable}
_Beispiel eines benutzerdefinierten Headers und Zellinhalts mit ui-template und Vuetify's Datentabelle_

Um die Standardschriftart in Ihrem Dashboard zu ändern, können Sie das `font-family`-Feld auf der `body`-Ebene überschreiben, was sicherstellt, dass es über _alle_ Elemente in Ihrem Dashboard hinweg abgedeckt ist:

```css
body {
    font-family: monospace;
}
```

### Hintergrundbild

Wenn Sie eine benutzerdefinierte Textur oder ein Hintergrundbild wie folgt haben möchten:

![Beispiel einer Datentabelle](/images/template-examples/style-bg.png "Beispiel einer Datentabelle"){data-zoomable}
_Beispiel eines benutzerdefinierten Headers und Zellinhalts mit ui-template und Vuetify's Datentabelle_

Sie können das folgende CSS verwenden:

```css
.v-main {
    background-image: url("	https://www.transparenttextures.com/patterns/batthern.png");
    background-repeat: repeat;
}
```

### Gruppenstil

![Beispiel für angewandten Stil auf die Gruppen, die im Dashboard 2.0 gerendert werden](/images/template-examples/style-group.png "Beispiel für angewandten Stil auf die Gruppen, die im Dashboard 2.0 gerendert werden"){data-zoomable}
_Beispiel für angewandten Stil auf die Gruppen, die im Dashboard 2.0 gerendert werden_

Gruppen im Node-RED Dashboard bestehen aus einem umschließenden Container mit einer Klasse von `nrdb-ui-group` und dann einem Block innerhalb davon, den Sie visuell als die Gruppe sehen, die ein Vuetify-Karten-Widget ist und daher die Klasse `v-card` hat.

Wir können diese Klassen verwenden, um die Gruppen in unserem Dashboard zu gestalten. Zum Beispiel, um die Ränder dicker zu machen, könnten wir definieren:

```css
/* Alle .v-card's innerhalb einer Gruppe */
.nrdb-ui-group .v-card {
    border-width: 10px;
}
```

### Navigationsstil

![Beispiel, wie man den \"Navigationsschubladen\"-Stil im Dashboard 2.0 überschreibt](/images/template-examples/style-side-nav.png "Beispiel, wie man den \"Navigationsschubladen\"-Stil im Dashboard 2.0 überschreibt"){data-zoomable}
_Beispiel, wie man den \"Navigationsschubladen\"-Stil im Dashboard 2.0 überschreibt_

Standardmäßig wird die seitliche Navigationsschublade, die alle Seiten in Ihrem Dashboard auflistet, gemäß der "Header"-Farbe in Ihrem Thema gestaltet. Das bedeutet, dass ihre `background-color` auch mit dem Header des Dashboards übereinstimmt. Wenn Sie dies überschreiben möchten, können Sie dies mit der `.v-navigation-drawer`-Klasse tun:

```css
.v-navigation-drawer {
    background-color: white;
    color: black;
}
```

### Symbolstil

Es ist möglich, verschiedene Merkmale der Symbole im Dashboard zu ändern, wie z.B. ihre Größe, Farbe und Animationen, indem Sie die Sammlung von Dienstprogrammsklassen verwenden, die von der zugrunde liegenden Material Design Icons-Bibliothek bereitgestellt werden (detailliert [hier](https://pictogrammers.github.io/@mdi/font/7.4.47/#:~:text=mdi%2Dzigbee-,Extras,-The%20helper%20CSS)).

#### Größe

```
mdi-18px mdi-24px mdi-36px mdi-48px
```

#### Farbe
```
mdi-light mdi-light mdi-inactive mdi-dark mdi-dark mdi-inactive
```

#### Drehen
```
mdi-rotate-45 mdi-rotate-90 mdi-rotate-135 mdi-rotate-180 mdi-rotate-225  mdi-rotate-270 mdi-rotate-315
```
#### Spiegeln
```
mdi-flip-h mdi-flip-v
```

Beachten Sie, dass `mdi-flip-*` und `mdi-rotate-*` nicht gleichzeitig verwendet werden können.

#### Drehen
```
mdi-spin
```
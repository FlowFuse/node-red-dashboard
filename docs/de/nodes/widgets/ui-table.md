---
description: Zeigen und verwalten Sie komplexe Datensätze mühelos mit dem ui-table-Widget im Node-RED Dashboard 2.0.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Buttons in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Beschriftung: Der Text, der über der Tabelle angezeigt wird und beschreibt, was die Tabelle zeigt.
    Max. Zeilen: Definiert die maximale Anzahl von Datenzeilen, die in der Tabelle gerendert werden sollen. Überschüssige Zeilen sind über die Paginierungskontrolle verfügbar. Auf "0" setzen, um keine Paginierung zu verwenden.
    Breakpoint: Steuert, wann eine Tabelle stattdessen als Karte gerendert wird, wobei jede Spalte einer Zeile als Zeile in einer größeren, eine Zeile enthaltenden Karte für einen einzelnen Eintrag gerendert wird. Der Breakpoint wird basierend auf der <b>Breite der Tabelle</b> gemessen, nicht auf der Breite des Bildschirms.
    Auswahl: Bietet drei Optionen für die Tabelleninteraktion - "Keine", "Klick" und "Checkbox"
    Suche anzeigen: Definiert, ob eine Suchleiste über der Tabelle angezeigt werden soll. Ermöglicht das Suchen und Filtern über alle Spalten.
    Automatische Spalten: Wenn aktiviert, werden die Spalten automatisch basierend auf dem Inhalt der empfangenen Nachrichten berechnet.
    Spalten: Wenn "Automatische Spalten" deaktiviert ist, werden stattdessen diese Spalten beim Rendern der Tabelle verwendet.
dynamic:
    Klasse:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import { ref } from 'vue'

    import ExampleCellTypes from '../../../examples/ui-table-cell-types.json'

    import FlowViewer from '../../../components/FlowViewer.vue'
    import AddedIn from '../../../components/AddedIn.vue'
    import TryDemo from "./../../../components/TryDemo.vue";

    const examples = ref({
      'cellTypes': ExampleCellTypes
    })
</script>


<TryDemo href="table" title="Demo Ausprobieren">

# Datentabelle `ui-table` <AddedIn version="0.4.0" />

</TryDemo>

## Daten senden

Rendert einen Datensatz in tabellarischer Form. Erwartet eine Eingabe (`msg.payload`) im Format von:

```json
[{
    "colA": "A",
    "colB": "Hallo",
    "colC": 3
}, {
    "colA": "B",
    "colB": "Welt",
    "colC": 5
}]
```

Die Tabelle wird mit den Spalten `colA`, `colB` und `colC` gerendert, es sei denn, die "Spalten" sind explizit auf dem Knoten definiert, mit deaktivierter "Automatische Spalten"-Option.

Sie können auch ein einzelnes Datenstück senden, um es an die vorhandene Tabelle anzuhängen. In diesem Fall erwartet das `ui-table` eine Eingabe (`msg.payload`) im Format von:

```json
{
    "colA": "A",
    "colB": "Hallo",
    "colC": 3
}
```

### Daten löschen

Sie können ein leeres Array senden, um die Tabelle zu löschen.

```json
[]
```

## Eigenschaften

<PropsTable/>

### Auswahl

- **Keine**: Keine Auswahl ist erlaubt. Die Tabelle zeigt nur die Daten an.
- **Klick**: Die gesamte Zeile wird zu einem klickbaren Element, und der `ui-table`-Knoten gibt das _vollständige Objekt_ aus, das mit einer Zeile verknüpft ist, wenn darauf geklickt wird.
- **Checkbox**: Jede Zeile hat eine Checkbox, und der `ui-table`-Knoten gibt ein _Array von Objekten_ aus, die mit den ausgewählten Zeilen verknüpft sind, wenn eine Checkbox ausgewählt wird.

Die jeweiligen Ereignisse geben Folgendes aus:

```json
{
    "payload": <vollständiges Zeilenobjekt>,
    "action": "row_click" | "multiselect"
}
```

Sie können auch eine [Schaltfläche](#interaktions-schaltflächen) als Zelltyp hinzufügen und Ereignisse auf diese Weise auslösen.

### Reaktionsfähigkeit <AddedIn version="1.15.0" />

Die _"Breakpoint"_ Eigenschaft für die UI-Tabelle gibt Ihnen die Kontrolle darüber, wann eine Tabelle in den "mobilen" Modus wechselt und jede Datenzeile als Karte rendert. Dies ist nützlich, wenn Sie viele Spalten haben und die Tabelle zu breit ist, um auf einen mobilen Bildschirm zu passen. Der Breakpoint wird basierend auf der **Breite der Tabelle** gemessen, nicht auf der Breite des Bildschirms.

![Desktop-Ansicht eines UI-Tabellenbeispiels](/images/node-examples/ui-table-responsiveness-desktop.png)
_Desktop-Ansicht eines UI-Tabellenbeispiels_

![Mobile Ansicht derselben UI-Tabelle](/images/node-examples/ui-table-responsiveness-mobile.png)
_Mobile Ansicht derselben UI-Tabelle_

Der Breakpoint kann auf eine von drei Arten definiert werden:

- **Standards**: Wählen Sie aus einem der vordefinierten Breakpoints (xs, sm, md, lg).
- **px**: Definieren Sie manuell einen `px`-Wert, bei dem die Tabelle in den mobilen Modus wechselt, sobald sie diese Breite überschreitet.
- **keine**: Immer als Datenzeilen in einer Tabelle rendern, niemals in die "Mobile" Ansicht wechseln.

### Spalten konfigurieren

![Screenshot der verfügbaren Konfigurationsoptionen für Spaltentypen in Node-RED](/images/node-examples/ui-table-column-config.png "Screenshot der verfügbaren Konfigurationsoptionen für Spaltentypen in Node-RED"){data-zoomable}
_Screenshot der verfügbaren Konfigurationsoptionen für Spaltentypen in Node-RED_

Wenn Sie die Option "Automatische Spalten" deaktivieren, haben Sie mehr Kontrolle über die Definition der Spalten für Ihre Tabelle. Für jede Spalte können Sie Folgendes definieren:

- **Wert**: Der Wert, der zur Steuerung der Darstellung verwendet wird. Typischerweise würden Sie einen Schlüssel zum Wert im Datenzeilenobjekt angeben, aber es kann geändert werden, um einen festen Zeichenfolgenwert bereitzustellen.
- **Beschriftung**: Der Text, der in der Spaltenüberschrift angezeigt wird.
- **Breite**: Die Breite der Spalte, kann in `px`, `%` oder einer anderen gültigen CSS-Größe angegeben werden.
- **Ausrichtung:** Die Ausrichtung des Textes in der Spalte. Kann `Links`, `Zentriert` oder `Rechts` sein. Beachten Sie, dass einige Spalten mit "Zentrierter" Ausrichtung seltsam aussehen, da die Kopfzeile auch Platz für das Sortiersymbol enthält.
- **Typ**: Definiert den Zelltyp und steuert, wie Ihre Daten für diese Spalte gerendert werden.

### Zelltypen <AddedIn version="1.10.0" />

![Ein Beispiel für eine ui-table, die verschiedene der verfügbaren Zelltypen anzeigt](/images/node-examples/ui-table-cell-types.png "Ein Beispiel für eine ui-table, die verschiedene der verfügbaren Zelltypen anzeigt"){data-zoomable}
_Ein Beispiel für eine ui-table, die verschiedene der verfügbaren Zelltypen anzeigt_

- **Text**: Rendert die Zelle als einfachen Text.
- **HTML**: Respektiert Zeilenumbrüche (z.B. `\n`) und grundlegende HTML-Tags.
- **Link**: Rendert die Zelle als Hyperlink. Das `Link`-Feld sollte die URL enthalten, zu der verlinkt werden soll.
- **Farbe**: Rendert die Zelle als farbiges Feld. Das `Farbe`-Feld sollte eine gültige CSS-Farbe enthalten.
- **Haken/Kreuz**: Rendert die Zelle als Haken oder Kreuz. Das `Wert`-Feld sollte einen booleschen (`true`/`false`) Wert enthalten.
- **Fortschritt**: Rendert die Zelle als Fortschrittsbalken. Das `Wert`-Feld sollte eine Zahl zwischen 0 und 100 enthalten.
- **Sparkline - Trend**: Rendert die Zelle als kleines Liniendiagramm ohne Achsen. Das `Wert`-Feld sollte ein Array von Zahlen enthalten, die geplottet werden sollen.
- **Sparkline - Balken**: Rendert die Zelle als kleines Balkendiagramm ohne Achsen. Das `Wert`-Feld sollte ein Array von Zahlen enthalten, die geplottet werden sollen.
- **Schaltfläche**: Rendert eine klickbare Schaltfläche in der Zelle. Die Beschriftung der Schaltfläche wird entweder der `row[key]` oder die feste Zeichenfolge sein, die in der manuellen Spaltenkonfiguration eingegeben wurde.
- **Zeilennummer**: Rendert die Zeilennummer in die Zelle.
- **Bild**: Rendert die Zelle als Bild. Der bereitgestellte "Bild"-Wert sollte eine gültige URL sein. Eine Daten-URL wird auch für base64-kodierte Bilder unterstützt. Wenn eine ungültige URL angegeben wird, erscheint ein leerer Raum.

#### Interaktion: Schaltflächen

Der `Schaltfläche`-Zelltyp rendert eine klickbare Schaltfläche in der Zelle. Die Beschriftung der Schaltfläche wird der entsprechende Wert in Ihrer Zeile für den bereitgestellten `key` sein. Wenn die Schaltfläche geklickt wird, gibt der `ui-table`-Knoten aus:

```
{
    "payload": <vollständiges Zeilenobjekt>
    "column": <Spaltenschlüssel>
    "action": "button_click"
}
```

Anhand der `action`- und `column`-Schlüssel können Sie bestimmen, welche Schaltfläche geklickt wurde, und den `payload` verwenden, um zu bestimmen, mit welcher Zeile sie verknüpft war.

#### Beispiel

<FlowViewer :flow="examples['cellTypes']" height="200px"/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Tabellenkonfiguration

### Suche & Filter

Der `ui-table`-Knoten kann so konfiguriert werden, dass er eine Suchleiste über der Tabelle enthält. Dies ermöglicht es Benutzern, über alle Spalten zu suchen und zu filtern und automatisch über alle Spalten zu suchen, wenn Sie tippen.

#### Beispiel

![Beispiel einer Datentabelle mit Suche & Filter](/images/node-examples/ui-table-search.png "Beispiel einer Datentabelle mit Suche & Filter"){data-zoomable}
*Beispiel einer Datentabelle mit aktivierter "Suche & Filter".*

### Interaktion

Beispiel, das zeigt, wie eine Tabelle mit verschiedenen Auswahltypen erscheint.

#### Standard - Keine Auswahlereignisse

![Beispiel einer Datentabelle](/images/node-examples/ui-table.png "Beispiel einer Datentabelle"){data-zoomable}
*Beispiel einer gerenderten Datentabelle in einem Dashboard.*

#### Mehrfachauswahl
![Beispiel einer Tabelle mit aktivierter "Mehrfachauswahl"](/images/node-examples/ui-table-multi.png "Beispiel einer Tabelle mit aktivierter 'Mehrfachauswahl'"){data-zoomable}
*Beispiel einer Tabelle mit aktivierter "Mehrfachauswahl".*

#### Einzelne Zeilenauswahl

![Beispiel einer Datentabelle, die das Auswählen/Klicken einer Zeile ermöglicht](/images/node-examples/ui-table-click.png "Beispiel einer Datentabelle, die das Auswählen/Klicken einer Zeile ermöglicht"){data-zoomable}
*Beispiel einer Datentabelle, die das Auswählen/Klicken einer Zeile ermöglicht.*

### Paginierung

![Beispiel einer paginierten Tabelle](/images/node-examples/ui-table-pagination.png "Beispiel einer paginierten Tabelle"){data-zoomable}
*Beispiel einer paginierten Tabelle, die 10 Datenzeilen enthält, aber mit "Max. Zeilen" auf 5 gesetzt ist.*

Wenn Sie die Paginierungsoptionen ("Elemente pro Seite") ausblenden möchten, können Sie "Max. Zeilen" auf 0 setzen.

## Benutzerdefinierte Gestaltung & Inhalt

Wenn Sie mehr Anpassungen daran vornehmen möchten, wie Ihre Daten gerendert werden, können Sie dies tun, indem Sie Ihre eigene Datentabelle in einem `ui-template` erstellen. Schauen Sie sich [dieses Beispiel](../../user/template-examples.md#custom-tables) für weitere Details an.
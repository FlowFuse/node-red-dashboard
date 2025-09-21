---
description: Visualisieren Sie Ihre Daten wunderschön mit ui-chart im Node-RED Dashboard 2.0 für aufschlussreiche Analysen.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite der Schaltfläche in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Label: Der Text, der innerhalb der Schaltfläche angezeigt wird.
    Klasse: Der Text, der innerhalb der Schaltfläche angezeigt wird.
    Diagrammtyp: <code>Linie</code> | <code>Balken</code> | <code>Streudiagramm</code>
    Legende anzeigen: Definiert, ob eine Legende zwischen dem Titel und dem Diagramm angezeigt wird. Jedes Label wird von <code>msg.topic</code> gesteuert.
    Aktion:
        dynamic: true
        description: Steuert, wie neue Daten zu einem Diagramm hinzugefügt werden. Es wird entweder "anhängen", wobei vorhandene Daten beibehalten werden, oder "ersetzen", wobei vorhandene Daten entfernt werden, bevor neue Datenpunkte hinzugefügt werden.
    Punktform: Definieren Sie die Form des Punktes, der in Streu- und Liniendiagrammen angezeigt wird.
    Punktradius: Definieren Sie den Radius (in Pixel) jedes Punktes, der in ein Streu- oder Liniendiagramm gerendert wird.
    X-Achsentyp: <code>Zeitachse</code> | <code>Linear</code> | <code>Kategorisch</code>
    X-Achsenformat: <code>HH:mm:ss</code> | <code>HH:mm</code> | <code>YYYY-MM-DD</code> | <code>DD/MM</code> | <code>dd HH:mm</code> | <code>Benutzerdefiniert</code> | <code>Auto</code>
        Definiert, wie die Werte auf der Achse angezeigt werden, wenn der X-Achsentyp <code>'Zeitachse'</code> ist.
        Siehe <a target="_blank" href="https://moment.github.io/luxon/#/formatting?id=table-of-tokens">hier</a> für eine Übersicht über alle verfügbaren Luxon-Token.
    X-Achsenlimit: Alle Daten, die vor dem spezifischen Zeitlimit (für Zeitdiagramme) liegen oder bei denen es mehr Datenpunkte als das angegebene Limit gibt, werden aus dem Diagramm entfernt.
    Eigenschaften:
        <b>Serien:</b> Steuert, wie Sie die Datenströme in dieses Widget einfügen möchten. Der Standard ist <code>msg.topic</code>, wobei separate Themen in ihren jeweiligen Plots zu einer neuen Linie/Balken führen.</br>
        <b>X:</b> Definiert, welche Daten beim Rendern des x-Wertes eines Datenpunktes verwendet werden sollen.</br>
        <b>Y:</b> Definiert, wie der y-Wert eines Datenpunktes gerendert werden soll.
    Textfarbe: Option, um die Standardfarbe von Chart.Js für Text zu überschreiben.
        Derzeit überschreibt die Textfarbe für <code>Diagrammtitel</code>, <code>Tick-Text</code>, <code>Achsentitel</code> und <code>Legendentext</code></br>
        Es ist möglich, zu den Chart.Js-Standardeinstellungen zurückzukehren, indem das Kontrollkästchen <code>ChartJs-Standardtextfarben verwenden</code> verwendet wird.
    Gitterlinienfarbe: Option, um die Standardfarbe von Chart.Js für <code>Gitterlinien</code> und <code>Achsenrand</code> zu überschreiben.</br>
        Es ist möglich, zu den Chart.Js-Standardeinstellungen zurückzukehren, indem das Kontrollkästchen <code>ChartJs-Standardgitterfarben verwenden</code> verwendet wird.
dynamic:
    Klasse:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue"
    
    import { ref } from 'vue'
    import FlowViewer from '../../../components/FlowViewer.vue'
    import ExampleChartLineTimestamp from '../../../examples/chart-line-timestamp.json'
    import ExampleChartLineMultiple from '../../../examples/chart-line-multiple.json'
    import ExampleChartBarSWCharacters from '../../../examples/chart-bar-sw-characters.json'
    import ExampleChartBarFinance from '../../../examples/chart-bar-finance-grouped.json'
    import ExampleChartBarElection from '../../../examples/chart-bar-election-grouped.json'
    import ExampleChartPieDoughnut from '../../../examples/chart-pie-doughnut.json'
    import ExampleChartHistogramBins from '../../../examples/chart-histogram-bins.json'
    import ExampleChartHistogramCategories from '../../../examples/chart-histogram-categories.json'
    import ExampleChartHistogramSeries from '../../../examples/chart-histogram-series.json'
    import ExampleChartScatter from '../../../examples/chart-scatter-grouped.json'
    import ExampleCustomChartLine from '../../../examples/custom-chart-slider-line.json'
    import ExampleCustomChartPolar from '../../../examples/custom-chart-slider-polar.json'

    const examples = ref({
      'chart-line-timestamp': ExampleChartLineTimestamp,
      'chart-line-multiple': ExampleChartLineMultiple,
      'chart-bar-sw-characters': ExampleChartBarSWCharacters,
      'chart-bar-finance': ExampleChartBarFinance,
      'chart-bar-election': ExampleChartBarElection,
      'chart-pie-doughnut': ExampleChartPieDoughnut,
      'chart-histogram-bins': ExampleChartHistogramBins,
      'chart-histogram-categories': ExampleChartHistogramCategories,
      'chart-histogram-series': ExampleChartHistogramSeries,
      'chart-scatter-grouped': ExampleChartScatter,
      'custom-chart-line': ExampleCustomChartLine,
      'custom-chart-polar': ExampleCustomChartPolar
    })
</script>

<TryDemo href="charts-example" title="Demo Ausprobieren">

# Diagramm `ui-chart`

</TryDemo>

Bietet Konfigurationsoptionen, um die folgenden Diagrammtypen zu erstellen:

- [Liniendiagramm](#line-chart)
- [Streudiagramm](#scatter-charts)
- [Balkendiagramm](#bar-charts)
- [Kreis-/Donutdiagramme](#pie-doughnut-charts)
- [Histogramme](#histograms)

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Diagramme erstellen

Im Node-RED Dashboard 2.0 bietet das `ui-chart` eine einfache Möglichkeit, Daten in verschiedenen Diagrammtypen darzustellen. Das Diagramm ist konfigurierbar, um sich an Ihre Daten anzupassen. 

Um Ihre Daten dem Diagramm zuzuordnen, sind die wichtigsten zu konfigurierenden Eigenschaften:

![Beispiel für die Schlüsselzuordnungskonfiguration für UI-Diagramm](/images/node-examples/ui-chart-keymapping.png "Beispiel für die Schlüsselzuordnungskonfiguration für UI-Diagramm"){data-zoomable}
_Beispiel für die Schlüsselzuordnungskonfiguration für UI-Diagramm_

- **Serien**: Steuert, wie Sie Ihre Daten gruppieren möchten. In einem Liniendiagramm führen verschiedene Serien beispielsweise zu unterschiedlichen Linien, in einem Balkendiagramm führen verschiedene Serien zu unterschiedlichen Balken für einen einzelnen x-Wert (gestapelt oder nebeneinander gruppiert).
- **X**: Definiert, wo der Wert gelesen werden soll, der auf der x-Achse dargestellt werden soll. Dies kann aus dem `msg`-Objekt, als `key` in einem Objekt oder durch Generieren eines neuen `timestamp` für jeden empfangenen Datenpunkt im Knoten gelesen werden.
- **Y**: Definiert, wo der Wert gelesen werden soll, der auf der y-Achse dargestellt werden soll. Dies kann als Eigenschaft im `msg`-Objekt oder als `key` in Objekten in einem Datenarray gelesen werden.

Die nächsten wichtigen zu konfigurierenden Eigenschaften sind der "Diagrammtyp" und der "X-Achsentyp".

- **Diagrammtyp**: Wählen Sie zwischen einem Linien-, Streu- oder Balkendiagramm.
- **X-Achsentyp**: Wählen Sie zwischen einer "Zeitachse" (für zeitbasierte Daten), "Linear" (für numerische Daten) oder "Kategorisch" (für nicht-numerische Daten). Sie werden feststellen, dass einige x-Achsentypen nur für bestimmte Diagrammtypen verfügbar sind.


### Liniendiagramme

#### Zeitreihendaten

<FlowViewer :flow="examples['chart-line-timestamp']" height="250px"/>

In diesem Beispiel verbinden wir einen [Slider](./ui-slider.md) mit unserem Diagramm, um dessen Ausgabe im Laufe der Zeit darzustellen:

![Beispiel eines Liniendiagramms](/images/node-examples/ui-chart-line.png "Beispiel eines Liniendiagramms"){data-zoomable}
*Beispiel eines gerenderten Liniendiagramms mit einer "Zeit"-x-Achse.*

Ein sehr häufiger Anwendungsfall von Node-RED ist die Verarbeitung von Zeitreihendaten, wie z.B. Sensorwerten. In diesem Fall würden Sie Folgendes einstellen:

| Eigenschaft | Wert |
| - | - |
| **Diagrammtyp** | `Linie` |
| **X-Achsentyp** | `Zeitachse` |

Der Wert für die `x`-Eigenschaft wäre dann eine von zwei Dingen:

- Wenn Ihre Daten ein einfacher numerischer Wert sind, können Sie dies leer lassen, und das Diagramm verwendet automatisch das aktuelle Datum/die aktuelle Uhrzeit.
- Wenn Ihre Daten ein Objekt sind, können Sie den Schlüssel des Zeitstempels in Ihren Daten angeben, z.B. `{"myTime": 1743608192522}` würde die "X"-Eigenschaft auf den Typ `key` und den Wert `myTime` setzen.

Dann wäre das letzte Puzzlestück, die `y`-Eigenschaft auf eine von zwei Optionen zu setzen:

- Wenn Ihre Daten ein einfacher numerischer Wert sind, können Sie dies leer lassen, und das Diagramm verwendet automatisch den Wert von `msg.payload`.
- Wenn Ihre Daten ein Objekt sind, können Sie den Schlüssel des Wertes in Ihren Daten angeben, z.B. `{"myTime": 1743608192522, "myValue": 123}` würde die "Y"-Eigenschaft auf den Typ `key` und den Wert `myValue` setzen.

Hinweis: Zeitstempel müssen in Millisekunden (ms) vorliegen. Dies folgt dem JavaScript-Standard zur Darstellung von Zeit als die Anzahl der Millisekunden, die seit dem Unix-Epoch (1. Januar 1970, 00:00:00 UTC) vergangen sind.

#### Interpolationsmethoden für Liniendiagramme

Interpolation definiert, wie die Linie zwischen Datenpunkten in einem Liniendiagramm gezeichnet wird. Im Dashboard können Sie zwischen mehreren Interpolationsmethoden wählen, um Ihren Datenvisualisierungsanforderungen gerecht zu werden:
- Linear: Zeichnet eine gerade Linie zwischen jedem Datenpunkt. Am besten für kontinuierliche Datensätze mit sanften Übergängen geeignet.
- Schritt: Erstellt eine gestufte Linie zwischen Punkten, bei der der Wert abrupt zum nächsten Punkt springt. Diese Methode eignet sich ideal zur Visualisierung von Daten, die sich in diskreten Schritten ändern, wie z.B. Zustände oder Schwellenwerte.
- Bezier: Erzeugt eine glatte Kurve mit leichter Spannung zwischen Punkten und schafft eine ästhetisch ansprechendere Linie. Nützlich für Datensätze, bei denen ein sanfter Übergang wichtig ist.
- Kubisch: Zeichnet eine kubische Kurve für noch mehr Glättung zwischen Datenpunkten und bietet eine abgerundete visuelle Darstellung.
- Kubisch-Mono: Ähnlich wie kubisch, jedoch mit einer zusätzlichen Einschränkung, die sicherstellt, dass die Kurve ein monotones Verhalten beibehält. Dies bedeutet, dass sie ein Überschießen zwischen Punkten vermeidet und stabiler ist.

![Beispiel eines Liniendiagramms mit gestufter Interpolation](/images/node-examples/ui-chart-line-interpolation-stepped.png "Beispiel eines Liniendiagramms mit gestufter Interpolation"){data-zoomable}
_Beispiel eines Liniendiagramms mit gestufter Interpolation_

![Beispiel eines Liniendiagramms mit Bezier-Interpolation](/images/node-examples/ui-chart-line-interpolation-bezier.png "Beispiel eines Liniendiagramms mit Bezier-Interpolation"){data-zoomable}
_Beispiel eines Liniendiagramms mit Bezier-Interpolation_

#### Mehrere Linien

<FlowViewer :flow="examples['chart-line-multiple']" height="250px"/>

![Beispiel eines Liniendiagramms mit mehreren Linien](/images/node-examples/ui-chart-line-multiple-lines.png "Beispiel eines Liniendiagramms mit mehreren Linien"){data-zoomable}
_Beispiel eines Liniendiagramms mit mehreren Linien_

Sie können Daten in mehrere Linien gruppieren, indem Sie die Eigenschaft `Serien` verwenden. Ein häufiger Anwendungsfall hier ist die Verwendung von `msg.topic`, wobei jede Nachricht, die an das Diagramm gesendet wird, basierend auf dem Wert von `msg.topic` einer anderen Linie zugewiesen wird. Alternativ können Sie dies auf `key` setzen und einen Schlüssel in Ihren Daten angeben, nach dem gruppiert werden soll.

Wenn Sie möchten, dass ein einzelnes Datenstück mehrere Linien darstellt, können Sie die Eigenschaft `Serien` auf `JSON` setzen und dann ein Array von Schlüsseln bereitstellen (z.B. `["key1", "key2"]`), das einen Datenpunkt für jeden bereitgestellten Schlüssel aus einem einzelnen Datenpunkt darstellt.


### Streudiagramme

![Beispiel eines Streudiagramms](/images/node-examples/ui-chart-scatter.png "Beispiel eines Streudiagramms"){data-zoomable}
*Beispiel eines gerenderten Streudiagramms mit einer "Zeit"-x-Achse.*

Wir können auch "Serien" verwenden, um Punkte zu gruppieren. Nehmen wir ein Beispiel mit dem folgenden Datensatz:

```json
[
    { "series": "A", "x": 5, "y": 84 },
    { "series": "A", "x": 9, "y": 10 },
    { "series": "A", "x": 11, "y": 70 },
    { "series": "B", "x": 12, "y": 28 },
    { "series": "B", "x": 15, "y": 35 },
    { "series": "B", "x": 26, "y": 42 },
    { "series": "C", "x": 20, "y": 12 },
    { "series": "C", "x": 24, "y": 54 },
    { "series": "C", "x": 27, "y": 60 },
    { "series": "C", "x": 30, "y": 66 }]
```

In unserem Flow hätten wir:

<FlowViewer :flow="examples['chart-scatter-grouped']" height="250px" />

Mit der folgenden Konfiguration:

![Beispiel eines Streudiagramms mit in "Serien" gruppierten Daten](/images/node-examples/ui-chart-scatter-config.png "Beispiel eines Streudiagramms mit in 'Serien' gruppierten Daten"){data-zoomable}


Was zu folgendem führt:

![Beispiel eines gerenderten Streudiagramms mit einer "Linearen" x-Achse und in "Serien" gruppierten Daten](/images/node-examples/ui-chart-scatter-series.png "Beispiel eines gerenderten Streudiagramms mit einer 'Linearen' x-Achse und in 'Serien' gruppierten Daten"){data-zoomable}
*Beispiel eines gerenderten Streudiagramms mit einer "Linearen" x-Achse und in "Serien" gruppierten Daten.*


### Balkendiagramme

Derzeit unterstützen wir nur "Kategorie"-x-Achsentypen für Balkendiagramme. Das bedeutet, dass die x-Achsenwerte eine Zeichenkette sind und die y-Achse einen numerischen Wert hat.

Nehmen wir ein Beispiel für das Laden von Daten aus der Star Wars API:

<FlowViewer :flow="examples['chart-bar-sw-characters']" height="250px" />

![Beispiel eines Balkendiagramms, das Charakter-"Höhen"-Daten zeigt](/images/node-examples/ui-chart-bar-sw.png "Beispiel eines Balkendiagramms, das Charakter-'Höhen'-Daten zeigt"){data-zoomable}
_Beispiel eines Balkendiagramms, das Charakter-"Höhen"-Daten zeigt_

Wenn wir uns die Konfiguration für dieses Diagramm ansehen:

![Beispiel eines Balkendiagramms, das Charakter-"Höhen"-Daten zeigt](/images/node-examples/ui-chart-bar-sw-config.png "Beispiel eines Balkendiagramms, das Charakter-'Höhen'-Daten zeigt"){data-zoomable}

Könnten wir die "Y"-Eigenschaft leicht ändern, um einen anderen Wert darzustellen, ohne unsere Daten ändern zu müssen.


#### Gruppierte Balken - Finanzdatenbeispiel

<FlowViewer :flow="examples['chart-bar-finance']" height="250px" />

Hier haben wir ein Beispiel für einige Finanzdaten:

```json
[
    { "year": 2021, "Q1": 115, "Q2": 207, "Q3": 198, "Q4": 163 },
    { "year": 2022, "Q1": 170, "Q2": 200, "Q3": 230, "Q4": 210 },
    { "year": 2023, "Q1": 86, "Q2": 140, "Q3": 180, "Q4": 138 }
]
```

Balkendiagramme gruppieren Daten automatisch nach gemeinsamen x-Achsenwerten, behalten jedoch separate Balken für jede _Serie_ bei. Wenn Sie ein "Balken"-Diagramm auswählen, können Sie die Option "Gruppieren nach" auf "Nebeneinander" oder "Gestapelt" setzen.

Das Standardverhalten für ein Balkendiagramm besteht darin, Inhalte "Nebeneinander" zu gruppieren.

In unserer Diagrammkonfiguration können wir definieren:

![Konfiguration eines Balkendiagramms, das Finanzdaten zeigt, gruppiert nach Jahr](/images/node-examples/ui-chart-bar-grouped-finance-config.png "Konfiguration eines Balkendiagramms, das Finanzdaten zeigt, gruppiert nach Jahr"){data-zoomable}
_Konfiguration eines Balkendiagramms, das Finanzdaten zeigt, gruppiert nach Jahr_


wo wir "Serien" als Typ `JSON` definiert haben, weil wir mehrere Balken für jeden Datenpunkt rendern möchten, in diesem Fall einen für jedes Quartal:

![Beispiel eines Balkendiagramms, das Finanzdaten zeigt, gruppiert nach Jahr](/images/node-examples/ui-chart-bar-grouped-finance.png "Beispiel eines Balkendiagramms, das Finanzdaten zeigt, gruppiert nach Jahr"){data-zoomable}
_Beispiel eines Balkendiagramms, das Finanzdaten zeigt, gruppiert nach Jahr_

Wenn wir die Option "Gruppieren nach" auf "Gestapelt" umstellen, würden wir sehen:

![Beispiel eines Balkendiagramms, das dieselben Daten zeigt, jedoch gestapelt](/images/node-examples/ui-chart-bar-grouped-finance-stacks.png "Beispiel eines Balkendiagramms, das dieselben Daten zeigt, jedoch gestapelt"){data-zoomable}
_Beispiel eines Balkendiagramms, das dieselben Daten zeigt, jedoch gestapelt_


#### Gruppierte Balken - Wahldatenbeispiel

<FlowViewer :flow="examples['chart-bar-election']" height="250px" />

Hier haben wir ein Datenstück für jeden Kandidaten, für jedes Jahr, das die Anzahl der "Stimmen" angibt, die dieser Kandidat gewonnen hat.

```json
[
    { "candidate": "Dave", "year": 2019, "votes": 100 },
    { "candidate": "Sarah", "year": 2019, "votes": 90 },
    { "candidate": "Chris", "year": 2019, "votes": 160 },
    { "candidate": "Lucy", "year": 2019, "votes": 125 },
    { "candidate": "Dave", "year": 2024, "votes": 20 },
    { "candidate": "Sarah", "year": 2024, "votes": 170 },
    { "candidate": "Chris", "year": 2024, "votes": 150 },
    { "candidate": "Lucy", "year": 2024, "votes": 60 }
]
```

Wir haben ein paar verschiedene Möglichkeiten, diese Daten zu gruppieren. Zuerst haben wir eine Serie für jedes "Jahr" und den x-Wert als "Kandidat" definiert:

![Konfiguration eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Kandidat, und eine Serie für jedes Jahr](/images/node-examples/ui-chart-bar-grouped-election-config-A.png "Konfiguration eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Kandidat, und eine Serie für jedes Jahr"){data-zoomable}
_Konfiguration eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Kandidat, und eine Serie für jedes Jahr_

Ergebnis:

![Beispiel eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Kandidat, und eine Serie für jedes Jahr](/images/node-examples/ui-chart-bar-grouped-election.png "Beispiel eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Kandidat, und eine Serie für jedes Jahr"){data-zoomable}
_Beispiel eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Kandidat, und eine Serie für jedes Jahr_


Alternativ könnten wir eine Serie pro Kandidat haben und dann den x-Wert als "Jahr" definieren:

![Konfiguration eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Jahr, und eine Serie für jeden Kandidaten](/images/node-examples/ui-chart-bar-grouped-election-config-B.png "Konfiguration eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Jahr, und eine Serie für jeden Kandidaten"){data-zoomable}
_Konfiguration eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Jahr, und eine Serie für jeden Kandidaten_


Ergebnis:

![Beispiel eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Jahr, und eine Serie für jeden Kandidaten](/images/node-examples/ui-chart-bar-grouped-election-B.png "Beispiel eines Balkendiagramms, das Wahldaten zeigt, gruppiert nach Jahr, und eine Serie für jeden Kandidaten"){data-zoomable}


### Kreis-/Donutdiagramme

Diese Diagrammtypen verwenden "Radial"-Achsen. Die Eigenschaft "Serien" wird verwendet, um die Ebene zu definieren, in der die jeweiligen Daten gerendert werden. Mehrere Serien führen zu verschachtelten Kreis-/Donutdiagrammen.

Der "X"-Wert definiert den Schlüssel innerhalb einer einzelnen Serie, und die "Y"-Eigenschaft sollte auf den numerischen Wert verweisen, der die Größe eines bestimmten Segments bestimmt.

Schauen wir uns ein paar Beispiele an:

<FlowViewer :flow="examples['chart-pie-doughnut']" height="300px" />

Mit einem Beispieldatensatz wie:

```json
[
    { "year": 2021, "quarter": "Q1", "earnings": 115 },
    { "year": 2021, "quarter": "Q2", "earnings": 120 },
    { "year": 2021, "quarter": "Q3", "earnings": 100 },
    { "year": 2021, "quarter": "Q4", "earnings": 180 }
]
```

Wir können unser Diagramm so konfigurieren, dass es ein Kreis- oder Donutdiagramm rendert:

![Konfiguration eines Kreis- und Donutdiagramms](/images/node-examples/ui-chart-pie-doughnut-config.png "Konfiguration eines Kreis- und Donutdiagramms"){data-zoomable}

Ergebnis:

![Beispiel von Kreis- und Donutdiagrammen](/images/node-examples/ui-chart-pie-doughnut.png "Beispiel von Kreis- und Donutdiagrammen"){data-zoomable}
_Beispiel von Kreis- und Donutdiagrammen_

### Histogramme

Histogramme sind einzigartig, da sie nicht nur die ihnen bereitgestellten Daten darstellen. Stattdessen berechnen und verfolgen sie die Häufigkeiten der empfangenen Nachrichten, gruppiert nach den Eigenschaften "X" und "Serien".

#### Bins

<FlowViewer :flow="examples['chart-histogram-bins']" height="200px"/>

Wenn Sie numerische Daten auf der x-Achse darstellen möchten, sollten Sie den x-Achsentyp "Bins" verwenden. Dadurch können Sie den Bereich der Werte definieren, die gruppiert werden sollen, und wie viele "Bins" Ihr Bereich aufgeteilt werden soll.

![Beispiel eines Histogramms mit numerischen Bins](/images/node-examples/ui-chart-histogram-bins.png "Beispiel eines Histogramms mit numerischen Bins"){data-zoomable}

Hier haben wir einen Schieberegler, der bei jeder Bewegung eine Nutzlast in das Diagramm einspeist, wobei Zahlen in 5 Bins zwischen 0 und 10 aufgeteilt werden.

#### Kategorisch

<FlowViewer :flow="examples['chart-histogram-categories']" height="400px"/>

Wenn Sie stattdessen feste Zeichenfolgen- oder Kategoriewerte für Ihre x-Achse haben, sollten Sie den x-Achsentyp "Kategorisch" verwenden. Dadurch werden Daten nach dem x-Achsenwert gruppiert und dann die Häufigkeit jedes Wertes berechnet.

![Beispiel eines Histogramms mit kategorischen Bins](/images/node-examples/ui-chart-histogram-categories.png "Beispiel eines Histogramms mit kategorischen Bins"){data-zoomable}

Hier sendet jede Schaltfläche eine Nutzlast, die einem bestimmten Buchstaben (dem x-Achsenwert) entspricht, und das Diagramm berechnet die Häufigkeit jedes empfangenen Buchstabens. Zusätzlich gehört die erste Reihe von Schaltflächen zur "Serie 1" und die zweite Reihe von Schaltflächen zur "Serie 2", definiert durch `msg.topic`.

#### Gruppierung in Serien

<FlowViewer :flow="examples['chart-histogram-series']" height="200px"/>

Wir können unserem Histogramm auch eine zusätzliche Dimension von Daten mit "Serien" hinzufügen.

![Beispiel eines Histogramms mit kategorischen Bins und gruppiert nach Serien](/images/node-examples/ui-chart-histogram-bins-series.png "Beispiel eines Histogramms mit kategorischen Bins und gruppiert nach Serien"){data-zoomable}
_Screenshot zeigt zwei Histogramme, die dieselbe Datenquelle rendern, jedoch mit unterschiedlichen Serien_ 

Hier haben wir einen Beispieldatensatz, der Lizenzen für Software beschreibt, die für _n_ Tage läuft. Jede Lizenz beschreibt das Betriebssystem (`os`), welche `version` der Software sie ausführt, und ob es sich um eine bezahlte `license` handelt.

Unsere zwei nebeneinander angezeigten Diagramme zeigen dieselben Häufigkeitsdaten (mit Bins für das `age` auf der x-Achse), aber eines unterteilt es nach `version` und das andere nach `os`.

## Steuerungen

### Daten entfernen

#### "Anhängen" oder "Ersetzen" <AddedIn version="0.11.3" />

Die Eigenschaft "Aktion" im Diagramm ermöglicht es Ihnen zu steuern, ob Sie:

- Anhängen: Alle neuen bereitgestellten Daten werden zu den vorhandenen Daten im Diagramm hinzugefügt.
- Ersetzen: Alle vorhandenen Daten werden zuerst entfernt, dann werden neue Daten hinzugefügt.

Wenn Sie jemals die Eigenschaft auf Nachrichtenbasis überschreiben möchten, können Sie dies auch tun, indem Sie eine `msg.action`-Eigenschaft einfügen, die das Standardverhalten überschreibt. Zum Beispiel:

```js
msg = {
    "action": "append",
    "payload": 1
}
```

Würde diesen Datenpunkt dem Diagramm hinzufügen und vorhandene Daten belassen, selbst wenn das zugrunde liegende Diagramm so konfiguriert wurde, dass es immer "Ersetzen" verwendet.

#### Alle Daten löschen

Alternativ können Sie alle Daten aus einem Diagramm jederzeit entfernen, indem Sie dem Knoten eine `msg.payload` von `[]` senden. Am häufigsten wird dies durch das Verdrahten einer `ui-button` mit dem `ui-chart`-Knoten und das Konfigurieren der Schaltfläche zum Senden einer JSON-Nutzlast mit einem Wert von `[]` erreicht.

### Verschachtelte Daten

Es ist ein häufiger Anwendungsfall, dass Sie Daten als JSON strukturiert haben und einige davon darstellen möchten, z.B.:

```js
msg = {
    "payload": {
        "id": "Dataset 1",
        "value": 3,
        "nested": {
            "value": 1
        }
    }
}
```

Hier können wir die "Eigenschaften" `serien`, `x` und `y` verwenden, um zu definieren, welche Werte wir im Diagramm darstellen möchten. Um auf den relevanten Datenpunkt hier zuzugreifen, können Sie den `key:`-Typ verwenden und die Punktnotation verwenden, z.B.: `nested.value`.

### Live-Daten

Wenn Sie "Live"-Daten (z.B. von Sensoren) erzeugen, müssen Sie nicht definieren, wie die `x`-Eigenschaft dargestellt werden soll. Stattdessen können Sie dies leer lassen und das Diagramm berechnet automatisch das aktuelle Datum/die aktuelle Uhrzeit.

Dies funktioniert ebenso gut, wenn Sie `Object`-formatierte Daten verwenden, z.B.

```js
msg = {
    "topic": "Sensor A" 
    "payload": {
        "value": 3
    }
}
```

Wo Sie die `y`-Eigenschaft auf `key:value` setzen könnten. Der `x`-Wert, wenn er in der Konfiguration leer gelassen wird, würde als das aktuelle Datum/die aktuelle Uhrzeit berechnet.


## Benutzerdefinierte Diagramme erstellen

ChartJS bietet eine Vielzahl von Konfigurationsoptionen, von denen wir nur einen kleinen Teil über die Node-RED-Konfiguration bereitstellen. Wenn Sie das Erscheinungsbild Ihres Diagramms weiter anpassen oder sogar Diagramme rendern möchten, die wir noch nicht unterstützen, können Sie dies mit einem UI-Template-Knoten tun.

Derzeit müssen wir, obwohl es nicht ideal ist, die ChartJS-Bibliothek von einem CDN laden und dann darauf warten, dass die Datei geladen wurde, bevor wir sie verwenden können, wie in den [Externe Abhängigkeiten laden](/en/nodes/widgets/ui-template.html#loading-external-dependencies) Details in der UI-Template-Dokumentation beschrieben.

### Beispiel: Statische Daten

![Beispiel eines statischen 2D-Balkendiagramms](/images/node-examples/ui-template-chartjs-example-1.png "Beispiel eines statischen 2D-Balkendiagramms"){data-zoomable}

Hier ist der Template-Code, der dieses Balkendiagramm rendert:

```html
<template>
    <canvas ref="chart" />
</template>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    export default {
        mounted() {
            // code here when the component is first loaded
            let interval = setInterval(() => {
                if (window.Chart) {
                    // Babylon.js is loaded, so we can now use it
                    clearInterval(interval);
                    this.draw()
                }
            }, 100);
        },
        methods: {
            draw () {
                const ctx = this.$refs.chart
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                        datasets: [{
                            label: '# of Votes',
                            data: [12, 19, 3, 5, 2, 3],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
    }
</script>
```

### Beispiel: Eingehende Daten darstellen

Es ist unwahrscheinlich, dass wir, wie im ersten Beispiel, nur statische Daten rendern möchten - schließlich ist dies Node-RED. Als schnelles Beispiel können wir dieses Beispiel auch mit einem `ui-slider` für eine schnelle Demo verbinden. Hier ist ein Flow, der Ihnen den Einstieg erleichtert:

<FlowViewer :flow="examples['custom-chart-line']" height="200px"/>

und wie es aussieht, wenn es im Dashboard gerendert wird:

![Beispiel eines Liniendiagramms, das eingehende Daten darstellt](/images/node-examples/ui-template-chartjs-example-2.png "Beispiel eines Liniendiagramms, das eingehende Daten darstellt"){data-zoomable}

Ein tiefer Einblick in den Inhalt des `ui-template` für dieses Diagramm zeigt:

```html
<template>
    <canvas ref="chart" />
</template>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    export default {
        mounted() {
            // register a listener for incoming data
            this.$socket.on('msg-input:' + this.id, this.onInput)

            // check with ChartJS has loaded
            let interval = setInterval(() => {
                if (window.Chart) {
                    // clear the check for ChartJS
                    clearInterval(interval);
                    // draw our initial chart
                    this.draw()
                }
            }, 100);
        },
        methods: {
            draw () {
                // get reference to the <canvas /> element
                const ctx = this.$refs.chart
                
                // Render the chart
                const chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: "My Label",  // label for the single line we'll render
                            data: []            // start with no data
                        }]
                    },
                    options: {
                        animation: false, // don't run the animation for incoming data
                        responsive: true, // ensure we auto-resize the content
                        scales: {
                            x: {
                                type: 'time' // in this example, we're rendering timestamps
                            }
                        },
                        parsing: {
                            xAxisKey: 'time', // the property to render on the x-axis
                            yAxisKey: 'value' // the property to render on the y-axis
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Chart.js Line Chart'
                            }
                        }   
                    },
                });
                // make this available to all elements of the component
                this.chart = chart
            },
            onInput (msg) {
                // add a new data point ot our existing dataset
                this.chart.data.datasets[0].data.push({
                    time: (new Date()).getTime(),
                    value: msg.payload
                }) 
                // ensure the chart re-renders
                this.chart.update()      
            }
        }
    }
</script>
```


### Beispiel: Daten kategorisieren

Nehmen wir ein komplexeres Beispiel, bei dem wir einen Diagrammtyp rendern können, den wir derzeit nicht im Kern-Dashboard unterstützen, ein Polar Area Chart.

![Beispiel eines Balkendiagramms, das eingehende Daten kategorisiert](/images/node-examples/ui-template-chartjs-example-3.png "Beispiel eines Balkendiagramms, das eingehende Daten kategorisiert"){data-zoomable}


Dieses Beispiel ist von [diesem Beispiel](https://www.chartjs.org/docs/latest/samples/other-charts/polar-area-center-labels.html#polar-area-centered-point-labels) aus der ChartJS-Dokumentation adaptiert

In diesem Beispiel verdrahten wir mehrere `ui-sliders`, von denen jeder ein `msg.topic` einer anderen Farbe definiert, in unser benutzerdefiniertes Diagramm:

<FlowViewer :flow="examples['custom-chart-polar']" height="250px"/>

Ein tiefer Einblick in den Inhalt des `ui-template` zeigt:

```html
<template>
    <canvas ref="chart" />
</template>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    export default {
        mounted() {
            // register a listener for incoming data
            this.$socket.on('msg-input:' + this.id, this.onInput)

            // code here when the component is first loaded
            let interval = setInterval(() => {
                if (window.Chart) {
                    // Babylon.js is loaded, so we can now use it
                    clearInterval(interval);
                    this.draw()
                }
            }, 100);
        },
        methods: {
            draw () {
                const ctx = this.$refs.chart
                const data = {
                    labels: [],
                    datasets: [{
                        label: 'Colors',
                        data: [],
                        backgroundColor: []
                    }]
                }
                
                // Render the chart
                const chart = new Chart(ctx, {
                    type: 'polarArea',
                    data: data,
                    options: {
                        responsive: true,
                        scales: {
                            r: {
                                pointLabels: {
                                    display: true,
                                    centerPointLabels: true,
                                    font: {
                                        size: 18
                                    }
                                }
                            }
                            },
                            plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Chart.js Polar Area Chart With Centered Point Labels'
                            }
                        }
                    },
                });
                this.chart = chart
            },
            onInput (msg) {
                // in this example, our topics will be colors
                const color = msg.topic

                // have we seen this color before?
                const index = this.chart.data.labels.indexOf(color)
                
                if (index === -1) {
                    console.log('new color', color)
                    // add new dataset for this topic
                    this.chart.data.labels.push(color)
                    this.chart.data.datasets[0].data.push(msg.payload)
                    this.chart.data.datasets[0].backgroundColor.push(color)
                } else {
                    // we've already got data for this color, update the value
                    this.chart.data.datasets[0].data[index] = msg.payload
                }

                // ensure the chart re-renders
                this.chart.update()      
            }
        }
    }
</script>
```
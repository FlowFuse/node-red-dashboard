---
description: Maximieren Sie die Effizienz im Node-RED Dashboard 2.0, indem Sie Subflows für wiederverwendbare Logik und optimierte Entwicklung nutzen.
---

<script setup>
    import ComingSoon from '../../components/ComingSoon.vue';
    import NodeREDVersion from '../../components/NodeRedVersion.vue';
</script>

# Subflows

## Was sind Subflows?

Ein Subflow bietet die Möglichkeit, Ihren eigenen, vollständig benutzerdefinierten Knoten zu erstellen, dessen Logik vollständig durch andere Node-RED-Knoten definiert wird, die Sie im Arbeitsbereich nach Belieben konfigurieren und verbinden können.

Subflows beseitigen die Notwendigkeit, Code zu schreiben, in npm zu veröffentlichen oder ein separates Repository zu pflegen. Sie sind aus zwei Gründen besonders nützlich:

1. **Wiederverwendbarkeit:** Sie können denselben Subflow an mehreren Stellen in Ihrem Arbeitsbereich verwenden, ohne die gleichen Knoten immer wieder kopieren und einfügen zu müssen. Alle Subflows lesen aus derselben Konfiguration, und alle Änderungen am Subflow werden in allen Instanzen des Subflows widergespiegelt.
2. **Lesbarkeit:** Sie können eine komplexe Menge von Knoten in einem einzigen Knoten zusammenfassen, wodurch Ihr Arbeitsbereich leichter zu lesen und zu verstehen ist.

Subflows sind nicht spezifisch für Node-RED Dashboard 2.0, sondern ein Kernmerkmal von Node-RED und können auf jedem Satz von Knoten in Ihrem Arbeitsbereich verwendet werden.

## Subflows im Dashboard 2.0 <NodeREDVersion version="4.0.0" />

### Einfaches Beispiel

Hier demonstrieren wir ein schnelles Beispiel zur Erstellung eines Dashboard 2.0 Subflows. Der Subflow wird aus zwei Knoten bestehen:

- `ui-slider` - Ein Dashboard 2.0 Schieberegler-Eingabeknoten
- `ui-chart` - Ein Dashboard 2.0 Diagramm-Ausgabeknoten zur Visualisierung des Schieberegler-Eingabewerts.

Die Ausgabe des `ui-slider` wird direkt die im Diagramm gerenderten Werte steuern.

Der Subflow selbst wird dann zwei Eigenschaften zulassen:

- `group` - Die `ui-group`, in der der Schieberegler und das Diagramm gerendert werden.
- `label` - Textbasierte Beschriftung, die wir an die Beschriftung des `ui-sliders` binden werden.

<figure>
    <video controls>
        <source src="https://website-data.s3.eu-west-1.amazonaws.com/dashboard-subflows.mp4" type="video/mp4">
        Ihr Browser unterstützt das Video-Tag nicht.
    </video>
    <em>Ein schneller Durchgang, der die Erstellung und Bereitstellung eines Dashboard-Subflows von Anfang bis Ende zeigt.</em>
</figure>

Beachten Sie, wie wir mit dem Subflow ihn so oft kopieren und einfügen können, wie wir möchten, die Subflows verschiedenen Gruppen zuweisen und sie immer unabhängig voneinander gerendert werden.

### Konfigurieren von Subflows für Dashboard 2.0

#### Konfigurationsknoten

Dashboard 2.0 nutzt Node-RED [Konfigurationsknoten](https://nodered.org/docs/creating-nodes/config-nodes), um die gesamte Konfiguration/Layout des Dashboards zu verwalten.

Es ist wichtig zu betonen, dass die Unterstützung für Konfigurationsknoten innerhalb eines Subflows (und folglich die Unterstützung für Dashboard 2.0 in Subflows) nur in Node-RED `v4.0.0` und höher verfügbar ist.

Insgesamt hat Dashboard 2.0 4 Arten von Konfigurationsknoten:

- `ui-base` - Speichert die Konfiguration für das gesamte Dashboard
- `ui-page` - Speichert die Konfiguration für eine einzelne Seite, es kann mehrere Seiten innerhalb eines einzelnen `ui-base` geben.
- `ui-group` - Speichert die Konfiguration für eine einzelne Gruppe, es kann mehrere Gruppen innerhalb einer einzelnen `ui-page` geben.
- `ui-theme` - Speichert die Konfiguration für das Thema des Dashboards. Diese Themen werden seitenweise zugewiesen.

Jede der ersten drei hier kann innerhalb eines Subflows verwendet werden. Es ist nicht möglich, `ui-theme` zu verwenden, da dies nur eine Konfigurationsoption auf einem _anderen_ Konfigurationsknoten, `ui-page`, ist.

![Screenshot von Node-RED, der zeigt, wie man einen ui-group-Typ einer Subflow-Eigenschaft zuweist](../../assets/images/subflow-config-group.png){data-zoomable}
*Screenshot von Node-RED, der zeigt, wie man einen ui-group-Typ einer Subflow-Eigenschaft zuweist*

Dann können wir für jede Instanz unseres Subflows jetzt eine `ui-group` definieren, um die Knoten des Subflows darin zu rendern:

![Screenshot von Node-RED, der die Gruppenoption auf einer Subflow-Instanz zeigt](../../assets/images/subflow-config-group-option.png){data-zoomable}
*Screenshot von Node-RED, der die Gruppenoption auf einer Subflow-Instanz zeigt*

#### Oberflächenknoten-Eigenschaften

Wenn Sie einen Dashboard 2.0 Knoten innerhalb eines Subflows haben, können Sie Ihre Knoten so konfigurieren, dass ihre Eigenschaften stattdessen auf Subflow-Ebene definiert werden können und somit für jede Instanz dieses Subflows einzigartig sind, z.B. könnte die Beschriftung eines `ui-slider` jedes Mal, wenn Sie den Subflow verwenden, einzigartig sein.

Im Hintergrund arbeiten Subflows, indem sie gescoped Node-RED-Umgebungsvariablen setzen. Diese können dann von den Knoten innerhalb des Subflows genutzt werden.

Angenommen, wir möchten die `label` eines `ui-slider` innerhalb eines Subflows über eine Eigenschaft auf dem Subflow selbst setzen. Zuerst haben wir eine neue Eigenschaft (Umgebungsvariable) auf dem Subflow:

![Screenshot von Node-RED, der eine "label"-Option zeigt, die auf einem Subflow definiert ist](../../assets/images/subflow-config-label.png){data-zoomable}
*Screenshot von Node-RED, der eine "label"-Option zeigt, die auf einem Subflow definiert ist*

Beachten Sie hier, dass unsere Umgebungsvariable hier `label` ist.

Um dann auf diese in den Kindknoten zuzugreifen, in unserem Fall dem `ui-slider`, können wir die Beschriftungseigenschaft des Schiebereglers auf `${label}` setzen. Node-RED wird dies dann automatisch durch den Wert der `label`-Eigenschaft auf jeder der Subflow-Instanzen ersetzen.

![Screenshot von Node-RED, der zeigt, wie man die Umgebungsvariable verwendet, um eine Eigenschaft auf einem Kindknoten eines Subflows dynamisch zu setzen](../../assets/images/subflow-config-label-slider.png){data-zoomable}
*Screenshot von Node-RED, der zeigt, wie man die Umgebungsvariable verwendet, um eine Eigenschaft auf einem Kindknoten eines Subflows dynamisch zu setzen*

##### Größenanpassung

Beim Festlegen der Größe eines Widget-Knotens wie ui-text oder ui-button innerhalb eines Subflows werden Ihnen stattdessen Texteingabefelder für Breite und Höhe angezeigt
anstelle des üblichen Größenanpassungs-Widgets. Dies soll das externe Setzen der Werte über die Subflow-Instanzeigenschaften mit der `${variable_name}`-Syntax ermöglichen.

HINWEIS: Sie können die Breite und Höhe des Widgets immer noch auf `0` setzen, um die automatische Größenanpassung zu ermöglichen.

## Anpassung des Erscheinungsbildes

![Screenshot von Node-RED, der zeigt, wo sich die "Erscheinungsbild"-Schaltfläche befindet](../../assets/images/subflow-appearance.png){data-zoomable}
*Screenshot von Node-RED, der zeigt, wo sich die "Erscheinungsbild"-Schaltfläche befindet*

Beim Bearbeiten der Eigenschaften eines Subflows können Sie auf die Registerkarte "Erscheinungsbild" klicken, um das Erscheinungsbild anzupassen, wenn der Subflow in den Arbeitsbereichsflüssen gerendert wird.

Sie können steuern:

- **Kategorie**: In welcher Kategorie dieser Subflow innerhalb der Node-RED-Palette (linke Seite des Editors) aufgeführt wird. Dies ist standardmäßig auf _"subflows"_ eingestellt.
- **Farbe**: Die Farbe, in der Ihr Subflow-Knoten gerendert werden soll.
- **Symbol**: Welches Symbol auf Ihrem Subflow-Knoten angezeigt wird, wenn es im Arbeitsbereich verwendet wird.
- **Portbeschriftungen**: Wenn Sie Eingaben oder Ausgaben für Ihren Subflow haben, können Sie hier geeignete Beschriftungen dafür definieren.

![Screenshot eines angepassten Subflows, der mehrfach in einem Node-RED-Arbeitsbereich kopiert und eingefügt wurde](../../assets/images/subflow-appearance-example.png){data-zoomable}
*Screenshot eines angepassten Subflows, der mehrfach in einem Node-RED-Arbeitsbereich kopiert und eingefügt wurde*
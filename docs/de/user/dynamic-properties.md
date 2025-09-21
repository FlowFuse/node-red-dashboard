---
description: Erfahren Sie, wie Sie dynamische Eigenschaften im Node-RED Dashboard 2.0 verwenden, um flexible und reaktionsfähige Dashboard-Oberflächen zu erstellen.
---

# Dynamische Eigenschaften

Node-RED bietet die Möglichkeit, Eigenschaften eines Knotens zur Laufzeit festzulegen. Dies kann nützlich sein, um dynamische Funktionalität und Verhalten zu erzeugen, und im Node-RED Dashboard 2.0 ist dies auch für die meisten Felder möglich.

Für jeden Knoten können Sie in der Editor-Hilfe nachsehen, welche Eigenschaften dynamisch festgelegt werden können, oder die entsprechende Dokumentationsseite für diesen Knoten in dieser Online-Dokumentation aufrufen.

In den meisten Fällen werden die dynamischen Eigenschaften über ein `msg.ui_update`-Objekt gesteuert. Dieses Objekt kann alle Eigenschaften enthalten, die für diesen Knoten verfügbar sind. Zum Beispiel können Sie für einen `ui-button`-Knoten eine Nachricht wie diese senden, um die Beschriftung zu ändern:

```json
msg = {
    "ui_update": {
        "label": "Neue Beschriftung"
    }
}
```

## Klassen aktualisieren

Wenn wir ein Beispiel mit einem `ui-button` betrachten, können Sie die folgende `msg` an den Button selbst senden:

```json
msg = {
    "ui_update": {
        "class": "meine-klasse"
    }
}
```

Beachten Sie, dass bei `class`-Updates die Klasse dem Container des Widgets hinzugefügt wird. Das bedeutet, dass die Stildefinitionen Ihrer Klasse dies berücksichtigen müssen. Wenn Sie beispielsweise die Hintergrundfarbe eines Buttons beeinflussen möchten:

```css
.meine-klasse button.v-btn {
    background-color: red;
}
```

Wird den Trick machen. Beachten Sie, dass wir manchmal den CSS-Selektor überdefinieren müssen, um sicherzustellen, dass der Stil korrekt angewendet wird und alle zugrunde liegenden Vuetify/eingebauten Stylesheets überschreibt.

Das CSS selbst kann in einem `ui-template`-Knoten mit einem "CSS (Einzelne Seite)" oder "CSS (Alle Seiten)" Bereich definiert werden.

Beachten Sie auch, dass die `msg.class`-Injection aus Kompatibilitätsgründen weiterhin unterstützt wird, es wird jedoch empfohlen, `ui_update.class` zu verwenden, wo immer möglich.
---
description: Effiziente Strategien und Tipps zum Debuggen Ihrer Node-RED Dashboard 2.0 Setups, um einen reibungslosen Betrieb zu gewährleisten.
---

# Debugging Dashboard 2.0

Dashboard 2.0 verfügt über ein integriertes Debugging-Tool, um die für jedes Dashboard, jede Seite, jedes Thema, jede Gruppe und jedes Widget konfigurierten Daten zu verstehen.

Um zu den Tools zu gelangen, gehen Sie zu `<Ihr-Host>:<Ihr-Port>/dashboard/_debug`.

![Debugging-Tool](/images/debug-example.png "Debugging-Tool"){data-zoomable}
_Screenshot des Dashboard 2.0 Debugging-Tools_

Dieses Tool ist besonders nützlich, wenn Sie Ihre eigenen benutzerdefinierten Integrationen erstellen und auch an den Kern-Dashboard-Widgets entwickeln.

Wir hoffen, den Umfang dessen, was dieses Tool bietet, zu erweitern, aber vorerst zeigt es die aktuellen `props` für ein gegebenes Widget an, die durch die Node-RED-Konfiguration definiert sind, aber auch die überschriebenen Werte aus dem `msg`-Objekt enthalten (z.B. kann `msg.options` die `Options`-Eigenschaft für ein `ui-dropdown` überschreiben).

## Nachrichtenverlauf

![Debugging-Tool](/images/debug-example-datastore.png "Debugging-Tool"){data-zoomable}
_Screenshot des "Nachrichtenverlauf"-Tabs für ein Widget_

Dieser Tab zeigt die neuesten `msg`-Werte, die der zugehörige Knoten im `datastore` von Node-RED für ein gegebenes Widget empfangen hat.

Dies ist nützlich, um zu verstehen, welche Daten geladen werden, wenn ein neuer Client eine Verbindung zu Node-RED herstellt. Es muss aktualisiert werden, um den neuesten Stand widerzuspiegeln, wenn Sie neue Nachrichten erwarten, seit das Debug-Tool zuletzt geöffnet wurde.

## Dynamische Eigenschaften

![Debugging-Tool](/images/debug-example-statestore.png "Debugging-Tool"){data-zoomable}
_Screenshot des "Dynamische Eigenschaften"-Tabs für ein Widget_

Dieser Tab zeigt alle dynamischen Eigenschaften (Eigenschaften, die mit einer Injektion eines `msg.<property>` gesetzt wurden), die seit dem Start des Node-RED-Servers gesetzt wurden. Innerhalb unserer serverseitigen Architektur werden diese in unserem `statestore` gespeichert.

Diese Werte überschreiben im Allgemeinen die in der Node-RED-Editor festgelegten Standardeigenschaften und können verwendet werden, um zu überprüfen, warum ein bestimmtes Widget so gerendert wird, wie es ist.
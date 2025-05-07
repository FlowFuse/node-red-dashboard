<script setup>
    import AddedIn from '../../components/AddedIn.vue';
</script>

# Dashboard 2.0 Seitenleiste

![Screenshot, der die Dashboard 2.0-Seitenleiste im Node-RED-Editor zeigt.](/images/dashboard-sidebar.png){data-zoomable}
_Screenshot, der die Dashboard 2.0-Seitenleiste im Node-RED-Editor zeigt._

Die Dashboard 2.0-Seitenleiste wird zur Node-RED-Seitenleiste hinzugefügt. Sie ist so konzipiert, dass sie einen schnellen Überblick über den aktuellen Zustand des Dashboards bietet und die allgemeine Konfiguration des Dashboards unterstützt.

## Seitenleisten-Tabs

### Layout

Bietet einen Überblick über alle Seiten, Links, Gruppen und Widgets, die für das jeweilige Dashboard konfiguriert sind. Von hier aus können Sie alle diese Elemente neu anordnen, neu gruppieren und bearbeiten. Es gibt auch Verknüpfungen zu "+ Link", "+ Seite" und "+ Gruppe", um schnell neue strukturelle Elemente zum Dashboard hinzuzufügen.

### Themen

Jede Seite im Dashboard kann ein anderes Thema haben. Dieser Tab bietet einen Überblick über alle auf dem Dashboard definierten Themen und ermöglicht es Ihnen, bestehende Themen zu bearbeiten oder neue zu erstellen.

<img data-zoomable style="max-width: 400px; margin: auto;" src="/images/dashboard-sidebar-theme.png" alt="Screenshot, der den 'Themen'-Tab in der Dashboard 2.0-Seitenleiste zeigt"/>
<em>Screenshot eines "Themen"-Tabs, der eine Sammlung von Themen zeigt, die auf einem bestimmten Dashboard definiert sind.</em>

Jedes Thema zeigt, wie viele Seiten derzeit aktiv dieses Thema verwenden, und eine Vorschau der verwendeten Farbpalette, um zwischen den Themen zu unterscheiden.

### Client-Daten <AddedIn version="1.10.0" />

Dashboard 2.0 kann Daten zu jeder `msg` hinzufügen, die ein Knoten ausgibt, und Informationen über den Benutzer/Client bereitstellen, der mit dem Dashboard interagiert.

<img data-zoomable style="max-width: 400px; margin: auto;" src="/images/dashboard-sidebar-clientdata.png" alt="Screenshot eines Beispiel 'Client-Daten'-Tabs"/>
<em>Screenshot eines Beispiel "Client-Daten"-Tabs</em>

#### Client-Daten einbeziehen

Definiert, ob Client-Daten zu den vom Dashboard ausgegebenen Nachrichten hinzugefügt werden. Wenn aktiviert, steht Ihnen ein neuer `msg._client`-Wert zur Verfügung, der die relevanten Daten enthält.

Hier finden Sie auch eine Liste von "Datenanbietern", die derzeit im Dashboard aktiv sind. Zusätzlich zum Kernanbieter (der `msg._client.socketId` bereitstellt) werden alle Plugins aufgelistet, die `auth: true` in ihrer `index.html`-Datei deklariert haben (siehe [Plugins-Dokumentation](../contributing/plugins/index.md) für weitere Informationen).

#### Akzeptiert Client-Daten

Hier können Sie auf Basis des Widget-Typs definieren, ob ein Knoten die ihm übergebenen `msg._client`-Daten nutzen wird.

Für Knoten, bei denen dies eingestellt ist, wird eine `msg`, die in den Knoten injiziert wird und ein `_client`-Objekt enthält, nur an den jeweiligen Client gesendet. Zum Beispiel wird eine spezifische Socket-Verbindung bereitgestellt, wenn `msg._client.socketId` bereitgestellt wird, oder ein spezifischer Benutzer, wenn ein `msg._client.user` von einem Plugin bereitgestellt wird.

Wenn Sie dies für einen Knotentyp aktiviert haben, aber dennoch eine Nachricht an alle Verbindungen senden möchten, stellen Sie sicher, dass Sie das `msg._client`-Objekt aus der Nachricht entfernen, bevor Sie es senden. Dies kann mit einem `Änderung`-Knoten mit einer `Löschen`-Operation auf dem `msg._client`-Objekt erfolgen.
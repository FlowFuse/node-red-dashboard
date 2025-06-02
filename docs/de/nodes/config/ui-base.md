---
description: Konfigurieren Sie die grundlegenden UI-Einstellungen des Node-RED Dashboards 2.0, um die Dashboard-Umgebung an Ihre Bedürfnisse anzupassen.
props:
    Pfad: Der Endpunkt, der dem Host von Node-RED folgt, an dem Ihre UI zugänglich sein wird
    App-Symbol: Ermöglicht es Ihnen, ein benutzerdefiniertes Symbol für Ihre Anwendung festzulegen. Geben Sie die URL zum App-Symbol an, das als App-Symbol und im Browser-Tab angezeigt wird.
    Seitenpfad im Label einbeziehen: Die Seitenleiste listet alle verfügbaren Seiten für das Dashboard auf. Standardmäßig wird nur der Seitenname angezeigt, aber diese Option ermöglicht es Ihnen, auch den Pfad der Seite anzuzeigen.
    Stil der Seitenleiste: Der Stil, den das Seitenmenü verwenden soll (Standard, fest, Symbol, temporär, keine)
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import SideBySideImages from '../../../components/SideBySideImages.vue';
</script>

# Konfiguration: UI-Basis `ui-base`

## Eigenschaften

<PropsTable :hide-dynamic="true"/>

## Anwendungssymbol <AddedIn version="1.18.0" />

Die **Anwendungssymbol**-Funktion ermöglicht es Ihnen, ein benutzerdefiniertes Symbol für Ihr Node-RED Dashboard festzulegen. Dieses Symbol wird im Browser-Tab und beim Installieren des Dashboards als Progressive Web Application (PWA) verwendet. Das bereitgestellte Bild sollte quadratisch sein und Abmessungen zwischen **192px und 512px** haben. Um es einzurichten, geben Sie eine URL zu einem Bild im App-Symbol-Feld an, um das Branding und die Benutzererkennung zu verbessern.

#### So konfigurieren Sie die Anwendungssymbol-Funktion im Node-RED Dashboard 2.0:

1. Öffnen Sie die Einstellungen des Bearbeitungs-ui-base-Knotens.
2. Geben Sie im App-Symbol-Feld die URL des Bildes ein, das Sie als App-Symbol verwenden möchten. Stellen Sie sicher, dass das Bild quadratisch ist und Abmessungen zwischen 192px und 512px hat.
3. Dieses Symbol wird im Browser-Tab und beim Installieren des Dashboards als Progressive Web App (PWA) angezeigt.
4. Klicken Sie auf Aktualisieren, um die Änderungen zu speichern.

![Beispiel, wie die Eigenschaft 'App-Symbol' aussieht](/images/node-examples/ui-base-app-icon.png "Beispiel, wie die Eigenschaft 'App-Symbol' aussieht"){data-zoomable}
Screenshot der UI-Basis-Konfigurationsoptionen_

![Beispiel, wie das 'App-Symbol' im Browser-Tab aussieht](/images/node-examples/ui-base-app-icon-favicon.png "Beispiel, wie das 'App-Symbol' im Browser-Tab aussieht"){data-zoomable style="max-width: 400px; margin: auto;"}
_Beispiel, wie das 'App-Symbol' im Browser-Tab aussieht_

![Beispiel, wie das 'App-Symbol' aussieht](/images/node-examples/ui-base-app-icon-launcher.png "Beispiel, wie das 'App-Symbol' aussieht"){data-zoomable style="max-width: 200px; margin: auto"}
_Beispiel, wie das 'App-Symbol' aussieht, wenn es auf einem iPhone installiert ist_

## Titelbalken-Stiloptionen <AddedIn version="1.10.0" />

### Titelbalken - Standard

Der Titelbalken erscheint als erstes Element und scrollt _mit_ dem Inhalt, was bedeutet, dass der Titelbalken auf längeren Seiten nicht sichtbar ist, wenn die Seite gescrollt wird.

![Beispiel, wie die 'Standard'-Option aussieht](/images/node-examples/ui-base-appbar-default.png "Beispiel, wie die 'Standard'-Option aussieht"){data-zoomable}
_Beispiel, wie die 'Standard'-Option aussieht_

### Titelbalken - Fest

Der Titelbalken wird _immer_ sichtbar sein, auch wenn die Seite gescrollt wird. Dies ist nützlich, wenn Sie immer Zugriff auf den Titelbalken haben möchten, unabhängig von der Länge der Seite.

![Beispiel, wie die 'Fest'-Option aussieht](/images/node-examples/ui-base-appbar-fixed.png "Beispiel, wie die 'Fest'-Option aussieht"){data-zoomable}
_Beispiel, wie die 'Fest'-Option aussieht_

### Titelbalken - Versteckt

Der Titelbalken ist überhaupt nicht sichtbar. Beachten Sie, dass es in diesem Zustand immer noch möglich ist, das Navigationsmenü zu sehen, indem Sie die [Fest](#fest)-Option wählen.

![Beispiel, wie die 'Versteckt'-Option aussieht](/images/node-examples/ui-base-appbar-hidden.png "Beispiel, wie die 'Versteckt'-Option aussieht"){data-zoomable}
_Beispiel, wie die 'Versteckt'-Option aussieht_

## Navigationsstiloptionen <AddedIn version="1.2.0" />

### Navigation - Zusammenklappen (Standard)

<SideBySideImages
    caption="Beispiel, wie die 'Zusammenklappen'-Option aussieht, wenn sie geöffnet (links) und geschlossen (rechts) ist."
    left="/images/node-examples/ui-base-layout-default-open.png"
    right="/images/node-examples/ui-base-layout-sidebar-closed.png"
/>

Diese Option verschiebt den gesamten Inhalt des Dashboards, wenn sie geöffnet ist, und ist überhaupt nicht sichtbar, wenn sie geschlossen ist.

### Navigation - Fest

![Beispiel, wie die 'Fest'-Option jederzeit aussieht](/images/node-examples/ui-base-layout-fixed.png "Beispiel, wie die 'Fest'-Option jederzeit aussieht"){data-zoomable}
_Beispiel, wie die 'Fest'-Option jederzeit aussieht_

Bleibt immer geöffnet. An unserem mobilen Breakpoint (768px) wird dieser Wert überschrieben und eine "Über Inhalt erscheinen"-Option verwendet. Beachten Sie, dass im mobilen Maßstab (Bildschirmbreite weniger als 768px) das feste Layout zur "Standard"-Option zurückkehrt.

### Navigation - Zu Symbolen zusammenklappen

Ähnlich wie "Zusammenklappen", wenn geöffnet, aber wenn geschlossen, werden die Symbole für jede Seite weiterhin angezeigt.

<SideBySideImages
    caption="Beispiel, wie die 'Zusammenklappen'-Option aussieht, wenn sie geöffnet (links) und geschlossen (rechts) ist."
    left="/images/node-examples/ui-base-layout-default-open.png"
    right="/images/node-examples/ui-base-layout-icon-closed.png"
/>

### Navigation - Über Inhalt erscheinen

<SideBySideImages
    caption="Beispiel, wie die 'Zusammenklappen'-Option aussieht, wenn sie geöffnet (links) und geschlossen (rechts) ist."
    left="/images/node-examples/ui-base-layout-over-open.png"
    right="/images/node-examples/ui-base-layout-sidebar-closed.png"
/>

Nicht sichtbar, wenn geschlossen, und wenn geöffnet, erscheint sie über dem Dashboard-Inhalt, ohne ihn zu verschieben.

### Navigation - Immer verstecken

![Beispiel, wie die 'Immer verstecken'-Option aussieht](/images/node-examples/ui-base-layout-hide.png "Beispiel, wie die 'Immer verstecken'-Option aussieht"){data-zoomable}
_Beispiel, wie die 'Immer verstecken'-Option aussieht_

Die Seitenleiste wird unter keinen Umständen sichtbar sein. Alle Seiten sind weiterhin über ihre direkten Links oder einen [ui-control](../widgets/ui-control.md)-Knoten zugänglich.
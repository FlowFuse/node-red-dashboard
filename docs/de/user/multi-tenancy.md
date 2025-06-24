<script setup>
    import { ref } from 'vue'
    import AuthProvider from '../../components/AuthProvider.vue'
    import FlowViewer from '../../components/FlowViewer.vue'
    import ExampleSlider from '../../examples/multi-tenancy.json'
    import ExampleForm from '../../examples/multi-tenancy-form.json'

    const examples = ref({
      'multi-tenant-slider': ExampleSlider,
      'multi-tenant-form': ExampleForm
    })
</script>

# Erstellung von Multi-Tenant-Dashboards

Wir haben zwei grundlegende Designmuster beim Erstellen eines Dashboards:

- **Single Source of Truth:** Alle Benutzer Ihres Dashboards sehen die gleichen Daten. Dies ist nützlich für industrielle IoT- oder Hausautomatisierungsanwendungen.
- **Multi-Tenancy:** Die in einem bestimmten Widget angezeigten Daten sind für einen bestimmten Kunden/Sitzung/Benutzer einzigartig. Dies stellt eine traditionellere Webanwendung dar, bei der jeder Benutzer seine eigene Sitzung und zugehörige Daten hat.

Standardmäßig werden alle an einen Dashboard-Knoten übergebenen Daten an alle verbundenen Clients gesendet und sind daher für alle Benutzer sichtbar ("Single Source of Truth"). In industriellen IoT-Anwendungsfällen ist dies sehr nützlich, wenn Sie möglicherweise ein Diagramm haben, das Daten zu einem bestimmten Gerät anzeigt.

In anderen Fällen möchten Sie möglicherweise Daten nur an einen einzelnen Client/Benutzer senden. Hier kommt Multi-Tenancy ins Spiel und ermöglicht es Ihnen, Einschränkungen zu definieren, welche Clients bestimmte Daten erhalten.

Weitere Informationen zu den Designmustern finden Sie [hier](../getting-started.md#design-patterns).

## Verständnis von Client-Daten

Wenn "Client-Daten einbeziehen" aktiviert ist, wird jedem `msg`, das ein Knoten ausgibt, ein `_client`-Objekt hinzugefügt. Dieses Objekt enthält alle verfügbaren Informationen über den Client/Benutzer, der mit einem bestimmten Dashboard interagiert.

### Kern-Client-Daten

Out of the box fügt Dashboard dem `_client`-Objekt zwei Informationen hinzu:

- `socketId`: Die eindeutige ID der Socket-Verbindung, die der Client zur Interaktion mit dem Dashboard verwendet.
- `socketIp`: Die IP-Adresse des Clients, der mit dem Dashboard interagiert.

### Authentifizierungsanbieter

Plugins, wie das [FlowFuse User Addon](https://flowfuse.com/blog/2024/04/displaying-logged-in-users-on-dashboard/), sind verfügbar, um dem `_client`-Objekt zusätzliche Informationen hinzuzufügen.

Diese Authentifizierungs-Plugins können über den Node-RED-Palette-Manager installiert werden und erfordern häufig, dass Node-RED separat vom Dashboard mit einem bestimmten Authentifizierungsanbieter eingerichtet wird.

Die Plugins fügen dem `_client`-Objekt zusätzliche Informationen hinzu, wie das `user`-Objekt, das den Namen des Benutzers, die E-Mail-Adresse und alle anderen Informationen enthält, die der Authentifizierungsanbieter verfügbar hat.

#### FlowFuse User Addon

<AuthProvider img="/images/addon-logos/flowfuse-logo-square.png">
  Das <a class="https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-user-addon">FlowFuse User Plugin</a> erfordert, dass Node-RED auf <a href="https://flowfuse.com/">FlowFuse</a> mit der <a href="https://flowfuse.com/docs/user/instance-settings/#flowfuse-user-authentication">FlowFuse-Benutzerauthentifizierung</a> Option aktiviert ist.

  FlowFuse übernimmt automatisch die gesamte Einrichtung des Authentifizierungsanbieters, sodass Sie dies nicht selbst konfigurieren müssen.
</AuthProvider>

#### Cloudflare Access

<AuthProvider img="/images/addon-logos/auth-plugin-cloudflare.jpg">
  Das <a href="https://flows.nodered.org/node/@fullmetal-fred/node-red-dashboard-2-cloudflare-auth" target="_blank">Cloudflare Access Plugin</a> erfordert, dass Node-RED mit <a href="https://www.cloudflare.com/en-gb/zero-trust/products/access/" target="_blank">Cloudflare Access</a> eingerichtet ist, mit einem Cloudflare-Tunnel für Ihre Node-RED-Instanz und der entsprechenden Zugriffspolitik.
</AuthProvider>

#### Authelia Auth

<AuthProvider img="/images/addon-logos/auth-plugin-authelia.png">
  Das <a href="https://flows.nodered.org/node/@aikitori/node-red-dashboard-2-authelia-auth" target="_blank">Authelia Auth Plugin</a> fügt Benutzerdaten hinzu, wenn Ihre Node-RED-Instanz mit dem Open-Source-Authentifizierungsserver <a href="https://www.authelia.com/" target="_blank">Authelia</a> gesichert ist.
</AuthProvider>

#### Authentik Auth

<AuthProvider img="/images/addon-logos/auth-plugin-authentik.png">
  Dieses <a href="https://flows.nodered.org/node/@cgjgh/node-red-dashboard-2-authentik-auth" target="_blank">Authentik Plugin</a> fügt Benutzerdaten hinzu, wenn Ihre Node-RED-Instanz mit dem Open-Source-Authentifizierungsserver <a href="https://goauthentik.io/" target="_blank">Authentik</a> gesichert ist.

  Dieses Plugin geht davon aus, dass Sie eine laufende Authentik-Instanz haben und diese so konfiguriert haben, dass sie einen Forward-Auth-Proxy-Provider als Authentifizierungsanbieter für Node-RED verwendet.

  Der Proxy-Provider setzt die entsprechenden Header, die erforderlich sind, damit Dashboard 2.0 die Benutzerinformationen von Authentik erhält.
</AuthProvider>

## Konfiguration von Client-Daten

Im [Dashboard-Seitenleiste](./sidebar.md#client-data) innerhalb des Node-RED-Editors finden Sie die Registerkarte "Client-Daten":

<img data-zoomable style="max-width: 400px; margin: auto;" src="/images/dashboard-sidebar-clientdata.png" alt="Screenshot eines Beispiel 'Client-Daten' Tabs"/>
<em>Screenshot eines Beispiel "Client-Daten" Tabs</em>

Client-Daten definieren Informationen über den Benutzer/Client, der mit dem Dashboard interagiert. Diese Daten können jedem `msg`, das ein Knoten ausgibt, unter dem `msg._client`-Objekt hinzugefügt werden.

Wenn "Client-Daten einbeziehen" aktiviert ist, wird jedes `msg._client` die `socketId` und `socketIp` aller verbundenen Benutzer detailliert beschreiben.

## Beispiele

### Speichern von Benutzerdaten

Standardmäßig speichert Dashboard die zuletzt empfangenen Nachrichten gegen einen bestimmten Knoten in seinen eigenen Kontextspeichern. Für Knoten, die so eingerichtet sind, dass sie "Client-Daten akzeptieren", ist dies jedoch nicht der Fall, da es sehr speicherineffizient ist, Daten für _jede_ Nachricht, für _jeden_ Benutzer gegen jedes _Widget_ automatisch zu speichern.

Stattdessen wird empfohlen, das "Änderung"-Knoten und die eingebauten `global` und `flow` Kontextspeicher von Node-RED zu verwenden. Wir können die `[]`-Annotation im "Änderung"-Knoten verwenden, um ein Objekt des zuletzt übermittelten Formulars für einen bestimmten Benutzer zu speichern (unter Verwendung des FlowFuse User Addon, um `msg._client.user.username` zu erhalten):

![Screenshot, der die Konfiguration des "Änderung"-Knotens zeigt, um Daten gegen einen bestimmten Benutzer zuzuordnen](/images/multiuser-context-store.png "Screenshot, der die Konfiguration des 'Änderung'-Knotens zeigt, um Daten gegen einen bestimmten Benutzer zuzuordnen")
_Screenshot, der die Konfiguration des "Änderung"-Knotens zeigt, um Daten gegen einen bestimmten Benutzer zuzuordnen_

In einem vollständigen Fluss könnten wir dann Folgendes tun:

<FlowViewer :flow="examples['multi-tenant-form']" height="300px"/>

Schauen wir uns die Schritte an, die hier beteiligt sind:

1. Wenn ein Benutzer die Seite lädt, löst `ui-event` ein `$pageview`-Ereignis aus, das die Details des Benutzers enthält, der die Seite ansieht.
2. Wir überprüfen unseren `global` Kontextspeicher, um zu sehen, ob wir Daten gegen den Benutzernamen des Benutzers gespeichert haben.
3. Wenn ja, setzen wir `msg.payload` auf den Inhalt des Speichers, andernfalls verzweigen wir zu einem "Debug"-Knoten.
4. Senden Sie das `msg.payload` an das Formular, um es mit den gespeicherten Werten zu füllen.
5. Beim Absenden des Formulars speichern Sie den Inhalt des Formulars im `global` Kontextspeicher, wobei der Benutzername des Benutzers als Schlüssel verwendet wird.

### Vergleich verschiedener Kommunikationsoptionen

Hier demonstrieren wir drei verschiedene Clients, die dasselbe Dashboard öffnen.

Das Dashboard besteht aus drei Schiebereglern und einem Diagramm und läuft auf FlowFuse mit dem "FlowFuse User Addon" Plugin aktiviert.

Zwei der Clients sind als derselbe Benutzer angemeldet, und der dritte als "Ein anderer Benutzer".

<video controls>
    <source src="https://github.com/FlowFuse/node-red-dashboard/assets/99246719/76601b4c-8d25-451c-b04f-e5ee4cf7efb0" type="video/mp4">
    Ihr Browser unterstützt das Video-Tag nicht.
</video>

Wir können sehen, wie es möglich ist, die Interaktion eines Widgets zu steuern und wie die von diesem Widget ausgegebenen Daten an andere Komponenten und Clients weitergegeben werden.

1. Der "An alle Benutzer senden"-Schieberegler durchläuft einen Änderungsknoten, der das `_client`-Objekt aus der Nachricht entfernt, was bedeutet, dass die Daten an alle Clients gesendet werden, da keine Einschränkungen definiert sind.

2. Der "An denselben Benutzer senden"-Schieberegler durchläuft einen Änderungsknoten und hat das `socketId`-Feld aus `msg._client` entfernt, sodass nur das `user`-Objekt übrig bleibt. Dies bedeutet, dass die Daten an alle verbundenen Clients gesendet werden, bei denen derselbe authentifizierte Benutzer gefunden wird.

3. Der "Einzelner Client"-Schieberegler gibt einfach seine Standardausgabe an den "Diagramm"-Knoten weiter, einschließlich des vollständigen `msg._client`-Objekts. Dies bedeutet, dass die Daten nur an den Client (`socketId`) & Benutzer (`user`) gesendet werden, der mit dem Schieberegler interagiert hat.

Unten finden Sie den Fluss, der das obige Beispiel ausführt:

<FlowViewer :flow="examples['multi-tenant-slider']" height="300px"/>
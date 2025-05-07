---
description: Nehmen Sie an der Entwicklung des Node-RED Dashboards 2.0 teil. Erfahren Sie, wie Sie dazu beitragen können, es für alle besser zu machen.
---

# Beitrag leisten

Beiträge sind für Dashboard 2.0 immer willkommen. Wir haben viele großartige Ideen, die wir umsetzen möchten, und wir würden uns freuen, Ihre Hilfe zu haben!

## Projektstruktur

### `/nodes` 

Enthält die Dateien, die jeden der Node-RED-Knoten definieren, die das Dashboard 2.0-Knotenset bilden. Mehr über das Schreiben von Knoten für Node-RED erfahren Sie [hier](https://nodered.org/docs/creating-nodes/first-node).

### `/ui`

Enthält unsere VueJS-App, die den Kern des Dashboards 2.0 bildet. Im Verzeichnis `/ui/src/widgets` finden Sie eine Reihe von Unterverzeichnissen, die jeweils eine `.vue`-Datei enthalten. Diese Dateien definieren das Aussehen und die Funktionalität, die ein Benutzer sieht, wenn er das Dashboard betrachtet.

### `/docs`

Eine [VitePress](https://vitepress.dev/) Dokumentationsseite, die zur Erstellung der Dokumentation für Dashboard 2.0 verwendet wird (was Sie gerade lesen).

## Lokale Installation

### Voraussetzungen

- [GitHub-Konto](https://github.com/) - Sie benötigen ein GitHub-Konto, um eine Kopie des Codes zu erstellen und Änderungen beizutragen.
- [Node.js](https://nodejs.org/en/download) - Node.js wird auch mit dem Node Package Manager (`npm`) geliefert, der zur Installation von Abhängigkeiten und zum lokalen Ausführen des Dashboards (und Node-RED) verwendet wird.
- [Git](https://git-scm.com/downloads) - Git wird verwendet, um das Repository lokal auf Ihren Computer zu klonen und ermöglicht es Ihnen, Änderungen zurück in das zentrale Repository auf GitHub zu pushen.

### Repository klonen und erstellen

1. **An der entsprechenden Maschine anmelden:** Melden Sie sich an der Maschine an, auf der Sie Node-RED installiert haben.

2. **Repository forken:** Forken Sie dieses Repository in Ihr eigenes Github-Konto:

   ![image](../../assets/images/github-pr.png){data-zoomable}

3. **Git-Repo klonen:** Klonen Sie das geforkte Repository von Ihrem Github-Konto. Dies kann an einem beliebigen geeigneten Ort auf Ihrem Computer erfolgen (z. B. `/yourname/development/`):
   ```bash
   git clone https://github.com/<your_github_account>/node-red-dashboard.git
   ```

4. **Abhängigkeiten installieren:** Installieren Sie alle abhängigen Pakete (aus der `package.json`-Datei) in Ihrem geklonten Verzeichnis:
   ```bash
   cd /node-red-dashboard
   npm install
   ```

5. Optional ***eine Quellkarte generieren*** (um den minimierten Dashboard-Code mit dem Originalcode zu verknüpfen), um das Debuggen des Frontend-Dashboard-Codes im Browser zu vereinfachen. Unter Linux kann dies erreicht werden durch:
   ```bash
   export NODE_ENV=development
   ```

6. **Dashboard erstellen:** Erstellen Sie einen statischen Build der Dashboard-Benutzeroberfläche, basierend auf Vue CLI (die in Schritt 3 installiert wurde):
    ```bash
    npm run build
    ```
   Alternativ können Sie `npm run build:dev` verwenden, um eine Entwicklerversion zu erstellen, oder `npm run dev`, um eine Entwicklerversion zu erstellen und Änderungen zu überwachen (Hot Reload)


### In Node-RED installieren

1. **Zu `.node-red` navigieren:** Navigieren Sie in einem Terminal zu Ihrem `.node-red`-Ordner (normalerweise unter `~/.node-red`).
   
   ```bash
   cd ~/.node-red
   ```


3. **Vorhandenes Dashboard 2.0 entfernen:** Hinweis - Wenn Sie dieses Dashboard bereits über Ihre Palette installiert haben, müssen Sie es zuerst deinstallieren. Dies kann im Palette-Manager in Node-RED oder über `npm` im Terminal erfolgen:
   ```bash
   npm uninstall @flowfuse/node-red-dashboard
   ```

3. **Dashboard 2.0 installieren:** Installieren Sie das geforkte Dashboard in Ihrem Node-RED-System aus dem `.node-red`-Ordner:
   ```bash
   npm install <path_to_your_forked_dashboard>
   ```

## Änderungen vornehmen

1. **Änderungen vornehmen:** Nehmen Sie alle geeigneten Änderungen vor.
   - **Node-RED-Editor:** Für Änderungen an Node-RED-Knoten arbeiten Sie im Verzeichnis `/nodes` - Änderungen hier erfordern einen Neustart von Node-RED (und eine Aktualisierung des Node-RED-Editors), um die neuesten Änderungen zu sehen.
      - Zur Vereinfachung können Sie `npm run watch:node-red` verwenden, das Node-RED nach Änderungen an `/nodes` neu startet
      - Dies setzt voraus, dass Node-RED unter `~/.node-red` installiert ist und Sie `@flowfuse/node-red-dashboard` in diesem Ordner installiert haben (wie in Schritt 3 oben)
   - **Dashboard/UI:** Für Änderungen am Dashboard/UI siehe `/ui` - Änderungen hier erfordern einen Neuaufbau der Dashboard-Benutzeroberfläche, der durch Ausführen von `npm run build` (wie in Schritt 5 unter "Repository klonen und erstellen") erfolgen kann.
      - Zur Vereinfachung können Sie `npm run watch:dashboard` verwenden, das nach Änderungen an der Dashboard-Benutzeroberfläche automatisch neu erstellt wird 
   - Die beiden Watch-Befehle sind in einem Befehl unter `npm run watch` kombiniert

2. **Browser aktualisieren:** Aktualisieren Sie das Dashboard im Browser unter `http(s)://your_hostname_or_ip_address:1880/dashboard`
3. **Entwickeln:** Wiederholen Sie Schritt 1 bis 2 immer wieder, bis Sie mit Ihren Ergebnissen zufrieden sind.
4. **Branch erstellen:** Sobald Sie bereit sind, Ihre Änderungen zu veröffentlichen, erstellen Sie in Ihrem geklonten Repository-Verzeichnis (z. B. `/yourname/development/node-red-dashboard`) einen neuen Branch für alle Dateien Ihres geforkten Dashboards:
   ```bash
   git checkout -b name_of_your_new_branch
   ```
5. Sobald alle Ihre Änderungen einwandfrei funktionieren, committen Sie Ihre Änderungen:
    ```bash
    git commit -a -m "Beschreibung Ihrer Änderungen"
    ```
6.  Pushen Sie die committeten Änderungen in das Dashboard-Fork auf Ihrem Github-Konto:
    ```bash
    git push origin
    ```
7.  Wechseln Sie in Ihrem geforkten Dashboard-Repository (auf Github) zum neuen Branch und [erstellen Sie eine Pull-Anfrage](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).



## Dokumentation lokal ausführen

1. **Docs Dev Server ausführen:** Sie können die Dokumentation lokal ausführen, indem Sie den folgenden Befehl im Stammverzeichnis des `/node-red-dashboard`-Verzeichnisses ausführen:
   ```bash
   npm run docs:dev
   ```
   Dadurch wird Ihre Dokumentation unter `http://localhost:5173/` ausgeführt.
2. **Änderungen vornehmen:** Nehmen Sie alle geeigneten Änderungen an der Dokumentation (`/docs`) vor. Die Dokumentation wird live aktualisiert, es ist kein Neuaufbau, Neustart des Servers oder Aktualisieren des Browsers erforderlich.
<script setup>
    import AddedIn from '../../components/AddedIn.vue';
</script>

# Installation von Dashboards auf Mobilgeräten <AddedIn version="1.9.0" />

Node-RED Dashboard 2.0 wird als [Progressive Web App](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) erstellt und bereitgestellt. Das bedeutet, dass es zwar als Webanwendung erstellt wird, aber auf Ihrem Mobilgerät installiert und als eigenständige Anwendung ausgeführt werden kann, die sich wie eine native App verhält.

## Installation auf Android

Um das Dashboard auf einem Android-Gerät zu installieren, öffnen Sie den Browser und navigieren Sie zu Ihrem Dashboard. Wählen Sie in den Optionen des Browsers _"Zum Startbildschirm hinzufügen"_ (je nach Chrome-Version wird Ihnen möglicherweise direkt die Option _"Installieren"_ angezeigt):

<img src="../../assets/images/pwa-android-options.jpg" alt="Optionen in Chrome auf Android" style="max-width: 300px;margin: auto;">
<em>Optionen in Chrome auf Android</em>

Dies wird Sie dann auffordern, das Dashboard entweder als Anwendung zu "Installieren" oder eine "Verknüpfung" auf Ihrem Startbildschirm zu erstellen:

<img src="../../assets/images/pwa-android-install.jpg" alt="Optionen in Chrome auf Android" style="max-width: 300px;margin: auto;">
<em>Optionen in Chrome auf Android</em>

Wenn Sie installieren, wird das Dashboard zu Ihrem Startbildschirm hinzugefügt und kann als eigenständige Anwendung gestartet werden, ohne die umgebende Browser-Erfahrung.

## Installation auf iOS

Um das Dashboard auf einem iOS-Gerät zu installieren, öffnen Sie den Browser und navigieren Sie zu Ihrem Dashboard. Wählen Sie in den Optionen des Browsers _"Zum Startbildschirm hinzufügen"_:

<img src="../../assets/images/pwa-ios-options.jpg" alt="Optionen in Safari auf iOS" style="max-width: 300px;margin: auto;">
<em>Optionen in Safari auf iOS</em>

Sie werden dann aufgefordert, Ihre Anwendung zu benennen:

<img src="../../assets/images/pwa-ios-install.jpg" alt="Optionen in Safari auf iOS" style="max-width: 300px;margin: auto;">
<em>Optionen in Safari auf iOS</em>

## Anpassung

### Name

Sie können den Namen Ihrer Anwendung personalisieren, um das Branding zu verbessern und sie leicht erkennbar zu machen.

Um den Namen anzupassen, wählen Sie "Einstellungen bearbeiten" in der Dashboard 2.0-Seitenleiste. Ändern Sie dann das Feld "Name". Möglicherweise müssen Sie Node-RED neu starten, damit die Änderung in der Anwendung wirksam wird, wenn sie installiert ist.

### Icon

Sie können das App-Symbol Ihres Dashboards personalisieren, um das Branding zu verbessern und es leicht erkennbar zu machen. Um das Symbol anzupassen, fügen Sie einfach eine URL zum Bild im App-Symbolfeld unter der ui-base-Konfiguration hinzu. Für detaillierte Anweisungen besuchen Sie die [UI Base Dokumentation](/en/nodes/config/ui-base.html#application-icon).
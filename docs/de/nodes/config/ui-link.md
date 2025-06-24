---
description: Verwalten Sie Ihre Dashboard-Seiten mühelos im Node-RED Dashboard 2.0 für ein optimiertes Benutzererlebnis.
props:
    UI: Die UI (<code>ui-base</code>), zu der diese Seite hinzugefügt wird.
    Pfad: Die URL, zu der navigiert wird, wenn ein Benutzer diesen Link auswählt.
    Symbol: Welches <a href="https://pictogrammers.com/library/mdi/">Material Designs Icon</a> für die Seite verwendet werden soll. Es ist nicht erforderlich, das <code>mdi-</code> Präfix einzuschließen.
    Standardzustand: <ul><li><b>Sichtbarkeit</b> - Definiert die Standardsichtbarkeit dieser Seite im Seiten-Navigationsmenü.</li><li><b>Interaktivität</b> - Steuert, ob das Element im Seiten-Navigationsmenü deaktiviert/aktiviert ist.</li></ul><p>Beide können vom Benutzer zur Laufzeit mit einem <code>ui-control</code>-Knoten überschrieben werden.</p>
---

<script setup>
</script>

# Konfiguration: UI-Link `ui-link`

Wenn Sie von Ihrem Dashboard aus auf externe Ressourcen verlinken möchten, können Sie dies mit dem `ui-link` Konfigurationsknoten tun. Dies wird einen Link im Seiten-Navigationsmenü rendern, genau wie Ihre Dashboard [Seiten](./ui-page.md), aber direkt zur von Ihnen angegebenen URL navigieren, selbst wenn sie außerhalb des Dashboards 2.0 liegt.

## Eigenschaften

<PropsTable :hide-dynamic="true"/>

## Links hinzufügen

Um einen Link zu Ihrem Dashboard hinzuzufügen, können Sie das Seitenpanel des Dashboards 2.0 im Node-RED Editor verwenden. Klicken Sie auf die Schaltfläche `+ Link`, um ein neues Element zur Liste hinzuzufügen. Sie können dann den Link mit den relevanten Eigenschaften konfigurieren.
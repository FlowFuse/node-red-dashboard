---
description: Verwalten Sie Ihre Dashboard-Seiten mühelos im Node-RED Dashboard 2.0 für ein optimiertes Benutzererlebnis.
props:
    UI: Die UI (<code>ui-base</code>), zu der diese Seite hinzugefügt wird.
    Pfad: Erweitert den übergeordneten UI-Pfad und definiert, wo diese Seite gerendert wird.
    Symbol: Welches <a href="https://pictogrammers.com/library/mdi/">Material Designs Icon</a> für die Seite verwendet werden soll. Es ist nicht erforderlich, das <code>mdi-</code> Präfix einzuschließen.
    Thema: Welches Dashboard 2.0 Thema für diese Seite verwendet werden soll. Sie können auch Ihr eigenes anpassen.
    Layout: Welchen Layout-Manager Sie zum Rendern der Widgets verwenden möchten.
    Standardzustand: <ul><li><b>Sichtbarkeit</b> - Definiert die Standardsichtbarkeit dieser Seite im Seiten-Navigationsmenü.</li><li><b>Interaktivität</b> - Steuert, ob das Element im Seiten-Navigationsmenü deaktiviert/aktiviert ist.</li></ul><p>Beide können vom Benutzer zur Laufzeit mit einem <code>ui-control</code>-Knoten überschrieben werden.</p>
    Breakpoints: Konfigurieren Sie die responsiven Breakpoints für Ihr Dashboard, um zu steuern, wie viele Spalten bei verschiedenen Bildschirmgrößen gerendert werden. Nicht verfügbar für "Feste" Layouts.
---

<script setup>
</script>

# Konfiguration: UI-Seite `ui-page`

Jede Seite wird in einer Navigationsschublade innerhalb der UI gerendert und kann über die Navigationsleiste oben auf der Seite aufgerufen werden. Weitere Informationen zur Funktionsweise von Layouts finden Sie unter [Layouts](../../contributing/guides/layouts).

## Eigenschaften

<PropsTable :hide-dynamic="true"/>

### Breakpoints

![Breakpoints](../../../assets/images/breakpoints-config.png)
_Screenshot zeigt die Standardkonfiguration der Breakpoints_

Wie im Abschnitt Layouts der Dokumentation beschrieben, nutzen die meisten Layouttypen im Dashboard "Breakpoints". Jeder Breakpoint definiert:

- Einen **Pixel**-Wert, d.h. wann der Breakpoint wirksam wird
- Einen **Spalten**-Wert, d.h. wie viele Spalten bei diesem Breakpoint gerendert werden sollen

Je mehr Spalten Sie haben, desto mehr Gruppen und Widgets können Sie _nebeneinander_ auf Ihrer Seite unterbringen. Danach wird neuer Inhalt in einer neuen Zeile gerendert.

Beachten Sie, dass konfigurierbare Breakpoints für "Feste" Layouts nicht verfügbar sind, da diese nicht den Spaltenansatz zum Rendern von Gruppen verwenden.

Die Standard-Breakpoints sind:

### Mobil

- **Breakpoint:** < 576px
- **Spalten:** 3

### Mittel

- **Breakpoint:** > 576px
- **Spalten:** 6

### Tablet

- **Breakpoint:** 768px
- **Spalten:** 9

### Desktop

- **Breakpoint:** 1024px
- **Spalten:** 12
---
description: "Zeigen Sie Fortschritt und Abschlussstatus mit ui-progress im Node-RED Dashboard 2.0 anhand einer visuellen Fortschrittsleiste an."
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite der Fortschrittsleiste in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Beschriftung:
        description: "Der Text, der neben dem Fortschrittsprozentsatz angezeigt wird. Falls angegeben, wird er als \"Beschriftung: XX%\" innerhalb der Fortschrittsleiste dargestellt."
        dynamic: true
    Farbe:
        description: Farbe der Fortschrittsleiste, gültige Werte sind Vuetify-Themenfarben (primary, secondary, success, error, warning, info) oder benutzerdefinierte Farben (green, #a5a5a5, rgb(165,165,165), green-darken-2). Standardmäßig "primary".
        dynamic: true
    Klasse:
        description: Optionale CSS-Klassennamen, die auf die Fortschrittsleiste angewendet werden, um sie individuell zu gestalten.
        dynamic: false
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung darüber, ob Aktualisierungen der Fortschrittsleiste verarbeitet werden.
dynamic:
    Beschriftung:
        payload: msg.ui_update.label
        structure: ["String"]
    Farbe:
        payload: msg.ui_update.color
        structure: ["String"]
---

# Fortschritt `ui-progress`

Zeigt eine visuelle Fortschrittsleiste an, um den Abschlussstatus oder laufende Prozesse auf Ihrem Dashboard darzustellen.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Steuerungen

<ControlsTable/>

## Eingabe

Die Fortschrittsleiste akzeptiert numerische Werte über `msg.payload`:

- **Nutzlasttyp**: Zahl (0-100)
- **Beschreibung**: Stellt den Abschlussprozentsatz dar. Werte werden automatisch auf den Bereich 0-100 begrenzt.
- **Beispiel**: `msg.payload = 75` zeigt eine zu 75% abgeschlossene Fortschrittsleiste an

## Beispiel

### Einfache Fortschrittsleiste

![Beispiel einer Fortschrittsleiste](/images/node-examples/ui-progress.png "Beispiel einer Fortschrittsleiste"){data-zoomable}
*Beispiel einer gerenderten Fortschrittsleiste in einem Dashboard mit 79% Abschluss.*

### Dynamische Aktualisierungen

Die Fortschrittsleiste kann in Echtzeit aktualisiert werden, indem Nachrichten mit numerischen Nutzlasten gesendet werden. Sie können auch dynamisch die Beschriftung und Farbe ändern:

```javascript
// Fortschritt auf 80% aktualisieren
msg.payload = 80;
return msg;

// Fortschritt aktualisieren und Beschriftung/Farbe ändern
msg.payload = 45;
msg.ui_update = {
    label: "Daten werden geladen",
    color: "warning"
};
return msg;
```

Die Fortschrittsleiste wird häufig verwendet für:
- Upload-/Download-Fortschritt von Dateien
- Aufgabenabschlussstatus
- Datenverarbeitungsanzeigen
- Systemzustandsmetriken
- Batteriestandsanzeigen

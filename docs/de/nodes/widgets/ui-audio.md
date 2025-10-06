---
description: "Spielen Sie dynamisch Audiodateien mit ui-audio im Node-RED Dashboard 2.0 ab."
props:
    Mode: Wählen Sie zwischen Audioplayer (Abspielen von Audiodateien von einer URL) oder Text-zu-Sprache (Sprechen von Text mit den integrierten TTS-Funktionen des Browsers).
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird (nur Audioplayer).
    UI: Die UI (<code>ui-base</code>), zu der diese Seite hinzugefügt wird (nur TTS).
    Größe: Steuert die Breite der Schaltfläche in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Quelle:
        description: Die Quelle ist die URL, von der die Audiodatei abgerufen werden kann (nur Audioplayer).
        dynamic: true 
    Autoplay:
        description: Gibt an, ob die Audiodatei automatisch abgespielt wird (nur Audioplayer).
        dynamic: true
    Schleife:
        description: Gibt an, ob das Audio in einer Schleife abgespielt werden soll, d.h. automatisch wieder von vorne beginnt, wenn es endet (nur Audioplayer).
        dynamic: true
    Stumm:
        description: Gibt an, ob das Audio stummgeschaltet sein soll (nur Audioplayer).
        dynamic: true
    Stimme:
        description: Die Stimme, die für Text-zu-Sprache verwendet wird (nur TTS).
        dynamic: false
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung, ob die Schaltfläche anklickbar ist oder nicht.
dynamic:
    Quelle:
        payload: msg.ui_update.source
        structure: ["String"]
    Autoplay:
        payload: msg.ui_update.autoplay
        structure: ["'on' | 'off'"]
    Schleife:
        payload: msg.ui_update.loop
        structure: ["'on' | 'off'"]
    Stumm:
        payload: msg.ui_update.muted
        structure: ["'on' | 'off'"]
---

<script setup>
    import { ref } from 'vue'

    import TryDemo from "./../../../components/TryDemo.vue"
    
</script>


<TryDemo href="audio-example" title="Demo Ausprobieren">

# Audio `ui-audio`

</TryDemo>

Fügt dem Dashboard Audiofunktionen hinzu.

## Modi

Sie können zwischen zwei Modi wählen: „Audioplayer“ und „Text-to-Speech“.

### Audioplayer
Wenn Sie den Modus „Audioplayer“ wählen, zeigt der Knoten im Dashboard einen Audioplayer an, der Audiodateien von einer URL abspielen kann.
Sie können die URL in der Knotenkonfiguration oder dynamisch über eingehende Nachrichten angeben (siehe „Dynamische Eigenschaften“ unten).
Zusätzlich wird durch Senden einer Zeichenfolge „Nutzlast“ an den Knoten die Audioquelle auf diese Zeichenfolge eingestellt und die Wiedergabe gestartet (sofern die automatische Wiedergabe aktiviert ist).

### Text-to-Speech (TTS)
Wenn Sie den Modus „Text-to-Speech“ wählen, nutzt der Knoten die integrierten TTS-Funktionen des Browsers, um Text vorzulesen. Dies erfordert eine Benutzergeste (z. B. einen Klick auf das Dashboard), bevor es funktioniert (Browser-Sicherheitseinschränkungen).

Wenn die Nutzlast der eingehenden Nachricht eine Zeichenfolge ist, wird diese als vorzulesender Text verwendet.
Wenn die Nutzlast ein Objekt ist, können Sie zusätzliche Optionen angeben (Text ist erforderlich):

Beispiel: Sagen Sie „Hallo Welt“ mit der Stimme „Google Deutsch“ bei 1,1-facher Geschwindigkeit, 0,9-facher Tonhöhe und 88% Lautstärke

```json
{
    "payload": {
        "text": "Hallo Welt!",
        "voice": "Google Deutsch",
        "rate": 1.1,
        "pitch": 0.9,
        "volume": 88
    }
}
```

HINWEISE:
– Die verfügbaren Stimmen hängen vom Browser und Betriebssystem ab. Sie können die Liste der verfügbaren Stimmen abrufen, indem Sie `speechSynthesis.getVoices()` in der Browserkonsole ausführen.
– Die Eigenschaft `voice` ist optional. Dies kann der Name einer Stimme (z. B. „Google US English“) oder ein Index (z. B. `0` für die erste Stimme, `1` für die zweite usw.) sein. Wenn Sie `voice` auf die leere Zeichenfolge `""` setzen, wählt der Browser die Standardstimme aus.
– Mit der Eigenschaft `lang` können Sie eine Stimme auswählen, die der angegebenen Sprache entspricht. Dies ist nützlich, wenn Sie eine bestimmte Sprache verwenden möchten, aber den genauen Namen der Stimme nicht kennen. Der Browser wählt die erste Stimme aus, die der angegebenen Sprache entspricht. Hinweis: Wenn `voice` gesetzt ist, hat es Vorrang vor `lang`.

## Wiedergabe
Der Knoten unterstützt auch die Wiedergabesteuerung über eingehende Nachrichten.
Senden Sie eine Nachricht mit einem der folgenden Strings für die Wiedergabesteuerung:
- `play`: Wiedergabe starten oder fortsetzen. Wenn die Audiowiedergabe pausiert ist, wird sie an der aktuellen Position fortgesetzt.
- `resume`: (Alias ​​für `play`)
- `pause`: Wiedergabe pausieren
- `stop`: Wiedergabe stoppen und zum Anfang zurücksetzen

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Steuerungen

<ControlsTable/>
---
description: Integrieren Sie ui-text-input im Node-RED Dashboard 2.0 für anpassbare, benutzergesteuerte Dateneingabe und Feedback.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Texteingabefeldes in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Symbol:
        description: Rendert ein Material Design-Symbol innerhalb der Texteingabe. Es ist nicht notwendig, das "mdi-" Präfix einzuschließen.
        dynamic: true
    Symbolposition:
        description: Wenn "Symbol" definiert ist, steuert diese Eigenschaft, auf welcher Seite der "Beschriftung" das Symbol gerendert wird.
        dynamic: true
    Symbol Innenposition:
        description: Wenn "Symbol" definiert ist, steuert diese Eigenschaft, ob das Symbol innerhalb oder außerhalb des Texteingabefeldes gerendert wird.
        dynamic: true
    Beschriftung:
        description: Der Text, der innerhalb des Texteingabefeldes angezeigt wird. HTML-Inhalt ist erlaubt.
        dynamic: true
    Tooltip: Der Text, der beim Überfahren des Texteingabefeldes angezeigt wird.
    Modus:
        description: Der Typ des anzuzeigenden HTML-Eingabefeldes. Optionen - text | password | email | number | tel | color | date | time | week | month | datetime-local
        dynamic: true
    Durchreichen: Wenn dieser Knoten eine Nachricht in Node-RED erhält, sollte sie dann so durchgereicht werden, als ob ein neuer Wert in das Eingabefeld eingefügt wurde?
    Senden bei "Verzögerung": Wenn wahr, wird eine Nachricht nach der in "Verzögerung (ms)" angegebenen Verzögerung gesendet.
    Verzögerung: Wenn "Senden bei Verzögerung" wahr ist, wird der Wert im Texteingabefeld nach dieser (ms) Verzögerung gesendet.
    Auswahl mit Button löschen:
        description: Wenn wahr, erscheint ein Löschsymbol/-button auf der rechten Seite, um die Texteingabe zu löschen.
        dynamic: true
    Senden bei "Fokus verlassen": Sendet eine Nachricht, wenn das Texteingabefeld den Fokus verliert. Wird immer gesendet, auch wenn sich der Wert nicht geändert hat.
    Senden bei "Enter drücken": Sendet eine Nachricht, wenn der Benutzer die Eingabetaste drückt. Wird immer gesendet, auch wenn sich der Wert nicht geändert hat.
    Senden bei "Löschen-Button": Sendet eine Nachricht, wenn der Benutzer die Texteingabe mit dem Löschen-Button löscht, der "Auswahl löschen"-Button muss aktiviert sein.
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung darüber, ob die Texteingabe aktiviert ist oder nicht.
dynamic:
    Klasse:
        payload: msg.class
        structure: ["String"]
    Modus:
        payload: msg.ui_update.mode
        structure: ["String"]
    Beschriftung:
        payload: msg.ui_update.label
        structure: ["String"]
    Symbol:
        payload: msg.ui_update.icon
        structure: ["String"]
    Symbolposition:
        payload: msg.ui_update.iconPosition
        structure: ["String"]
        examples: ["links", "rechts"]
    Symbol Innenposition:
        payload: msg.ui_update.iconInnerPosition
        structure: ["String"]
        examples: ["innen", "außen"]
    Löschbar:
        payload: msg.ui_update.clearable
        structure: ["Boolean"]
---

<script setup>
    import TryDemo from "./../../../components/TryDemo.vue"
</script>


<TryDemo href="text-input" title="Demo Ausprobieren">

# Texteingabe `ui-text-input`

</TryDemo>

Fügt Ihrem Dashboard eine einzelne Texteingabezeile hinzu, mit einem konfigurierbaren "Typ" (Text, Passwort, etc.).

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Steuerungen

<ControlsTable/>

## Beispiel

![Beispiel von Texteingabetypen](/images/node-examples/ui-text-input.png "Beispiel von Texteingabetypen"){data-zoomable}
*Beispiel von mehreren Texteingabetypen, die in einem Dashboard gerendert werden.*
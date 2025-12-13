---
description: Integrieren Sie ui-number-input im Node-RED Dashboard 2.0 für anpassbare, benutzergesteuerte Dateneingabe und Feedback.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Zahleneingabefeldes in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Symbol:
        description: Rendert ein Material Design-Symbol innerhalb der Zahleneingabe. Es ist nicht notwendig, das "mdi-" Präfix einzuschließen.
        dynamic: true
    Symbolposition:
        description: Wenn "Symbol" definiert ist, steuert diese Eigenschaft, auf welcher Seite der "Beschriftung" das Symbol gerendert wird.
        dynamic: true
    Symbol Innenposition:
        description: Wenn "Symbol" definiert ist, steuert diese Eigenschaft, ob das Symbol innerhalb oder außerhalb des Zahleneingabefeldes gerendert wird.
        dynamic: true
    Beschriftung:
        description: Die Zahl, die im Zahleneingabefeld angezeigt wird. HTML-Inhalt ist erlaubt.
        dynamic: true
    Min:
        description: Definiert den minimal zulässigen Wert für das Zahleneingabefeld.
        dynamic: true
    Max:
        description: Definiert den maximal zul��ssigen Wert für das Zahleneingabefeld.
        dynamic: true
    Schritt:
        description: Legt den Inkrement-/Dekrement-Schritt zum Anpassen des Zahlenwerts im Eingabefeld fest.
        dynamic: true
    Spinner:
        description: Legt das Layout der Spinner entweder als inline oder gestapelt fest.
        dynamic: true
    Tooltip:
        description: Die Zahl, die beim Überfahren des Zahleneingabefeldes angezeigt wird.
    Durchreichen: Wenn dieser Knoten eine Nachricht in Node-RED erhält, sollte sie dann so durchgereicht werden, als ob ein neuer Wert in das Eingabefeld eingefügt wurde?
    Auswahl mit Button löschen:
        description: Wenn wahr, erscheint ein Löschsymbol/-button auf der rechten Seite, um die Zahleneingabe zu löschen.
        dynamic: true
    Senden bei "Löschen-Button": Senden Sie eine Nachricht, wenn der Benutzer die Zahleneingabe mit dem Löschen-Button löscht, der "Auswahl löschen"-Button muss aktiviert sein.
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung darüber, ob die Zahleneingabe aktiviert ist oder nicht
dynamic:
    Klasse:
        payload: msg.class
        structure: ["String"]
    Beschriftung:
        payload: msg.ui_update.label
        structure: ["String"]
    Löschbar:
        payload: msg.ui_update.clearable
        structure: ["Boolean"]
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
    Min:
        payload: msg.ui_update.min
        structure: ["Number"]
    Max:
        payload: msg.ui_update.max
        structure: ["Number"]
    Schritt:
        payload: msg.ui_update.step
        structure: ["Number"]
    Spinner:
        payload: msg.ui_update.spinner
        structure: ["String"]

---

<script setup>
    import TryDemo from "./../../../components/TryDemo.vue"
</script>


<TryDemo href="number-input" title="Demo Ausprobieren">

# Zahleneingabe `ui-number-input`

</TryDemo>

Fügt Ihrem Dashboard eine einzelne Zahleneingabezeile hinzu.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Steuerungen

<ControlsTable/>

## Nachrichtenereignisse

Sie können steuern, wann die Zahleneingabe Nachrichten sendet, indem Sie die folgenden Optionen im Knoteneditor unter "Nachricht senden bei:" konfigurieren:

| Option | Beschreibung |
|--------|--------------|
| Bei Änderung | Sendet eine Nachricht, sobald sich der Wert im Eingabefeld ändert. |
| Fokus verlassen | Sendet eine Nachricht, wenn das Eingabefeld den Fokus verliert (Benutzer klickt weg). |
| Enter drücken | Sendet eine Nachricht, wenn der Benutzer die Enter-Taste drückt, während das Eingabefeld fokussiert ist. |

Diese Optionen können unabhängig voneinander aktiviert oder deaktiviert werden, sodass Sie genau auswählen können, wann der Knoten Nachrichten senden soll.

## Beispiel

![Beispiel von Zahleneingabetypen](/images/node-examples/ui-number-input.png "Beispiel von Zahleneingabetypen"){data-zoomable}
*Beispiel von mehreren Zahleneingabetypen, die in einem Dashboard gerendert werden.*
---
description: Das Spacer-Widget ist ein einfacher Abstandshalter, der bei der Anordnung von Elementen hilft.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite und Höhe des Abstandshalters in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue";
</script>

<TryDemo href="spacer" title="Demo Ausprobieren">

# Abstandshalter `ui-spacer` <AddedIn version="1.9.0" />

</TryDemo>

Dieses Widget ermöglicht es Benutzern, einen einfachen Abstandshalter zu ihren Dashboard-Gruppen hinzuzufügen, was bei der Anordnung von Elementen hilft.

## Eigenschaften

<PropsTable/>

## Aktuelle Einschränkungen

_Derzeit_
* gehören die Abstandshalter-Widgets zum globalen Flow und werden nicht zusammen mit der Gruppe exportiert, es sei denn, der gesamte Flow wird exportiert. Das bedeutet, dass Sie, wenn Sie eine Gruppe mit Abstandshalter-Widgets exportieren möchten, entweder den gesamten Flow exportieren oder die Abstandshalter-Widgets manuell nach dem Import der Gruppe hinzufügen müssen.
* Das Bearbeiten eines Abstandshalters ist nur in der Dashboard 2.0-Seitenleiste und nicht in der Node-RED-Konfigurationsseitenleiste möglich.

## Verwendung des Abstandshalter-Widgets

In der Dashboard 2.0-Seitenleiste fahren Sie mit der Maus über die Gruppe, zu der Sie den Abstandshalter hinzufügen möchten, und klicken auf die Schaltfläche `↔ Abstandshalter`. Dadurch wird der Gruppe ein Abstandshalter hinzugefügt, den Sie dann an die gewünschte Stelle ziehen können. Das Öffnen des Bearbeitungsdialogs des Abstandshalters ermöglicht es Ihnen, die Größe des Abstandshalters festzulegen.
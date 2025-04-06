---
description: Erfassen Sie Benutzereingaben effizient mit ui-form im Node-RED Dashboard 2.0 für interaktive Datenerfassung.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Buttons in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Beschriftung:
        description: Eine Beschriftung, die vor den Formularzeilen angezeigt wird.
        dynamic: true
    Optionen:
        description: >
            Eine Liste der im Formular dargestellten Zeilen. Jede Zeile hat die folgenden Eigenschaften:
            <ul>
                <li>Beschriftung: Eine Beschriftung, die in der Formularzeile angezeigt wird.</li>
                <li>Name: Der Name des Formularelements, der als Schlüssel im <code>msg.payload</code>-Objekt verwendet wird.</li>
                <li>Typ: Der anzuzeigende Eingabetyp. Optionen - <code>text | multiline | password | email | number | checkbox | switch | date | time</code></li>
                <li>Erforderlich: Ob das Formularelement ausgefüllt werden muss, bevor das Formular abgeschickt werden kann.</li>
        dynamic: true
    Buttons: Der Text, der auf jedem der Formularbuttons angezeigt wird. Wenn der "Abbrechen"-Text leer bleibt, wird kein Abbrechen-Button angezeigt.
    Zwei Spalten: Rendert das Formular als zweispaltiges Layout.
    Zurücksetzen bei Absenden: Wenn aktiviert, wird das Formular nach dem Absenden in einen leeren Zustand zurückgesetzt.
    Thema: Definiert, wie das Thema berechnet wird, das im `msg`-Objekt enthalten ist, wenn das Formular abgeschickt wird.
    Dropdown-Optionen:
        dynamic: true
        description: Diese Liste kann Optionen für mehrere Dropdown-/Auswahlfelder in einem einzigen Formular definieren.
dynamic:
    Beschriftung:
        payload: msg.ui_update.label
        structure: ["String"]
    Optionen:
        payload: msg.ui_update.options
        structure: ["Array<Object>"]
    Dropdown-Optionen:
        payload: msg.ui_update.dropdownOptions
        structure: ["Array<{ dropdown: <string>, key: <string>, label: <string> }>"]
    Klasse:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import TryDemo from "./../../../components/TryDemo.vue";
</script>

<TryDemo href="form" title="Demo Ausprobieren">

# Formular `ui-form`

</TryDemo>

Fügt der Benutzeroberfläche ein Formular hinzu, das hilft, mehrere Werte vom Benutzer bei Klick auf den Absenden-Button als Objekt in `msg.payload` zu sammeln.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

### Formular-Daten ausfüllen

Wenn Sie Standardwerte festlegen oder Werte in Ihrem Formular vorab ausfüllen möchten, können Sie dies tun, indem Sie einen `msg.payload`-Wert übergeben. Dieser Wert sollte ein Objekt sein, wobei jeder Schlüssel den `key` eines Formularelements darstellt und der Wert den Standardwert für dieses Element darstellt.

Zum Beispiel, wenn Sie ein Formular mit einem "Text"-Feld vorab ausfüllen möchten, mit einem Namen, "first_name", können Sie die folgende `msg` übergeben:

```js
msg.payload = {
    "first_name": "John"
}
```

### Formularelemente definieren (Optionen)

Wenn Sie die Konfiguration für Ihr `ui-form` überschreiben und Details Ihrer Elemente bereitstellen möchten, nachdem Ihr Node-RED-Flow bereitgestellt wurde, können Sie dies tun, indem Sie einen `msg.ui_update.options`-Wert übergeben. Dieser Wert sollte ein Array von Objekten sein, wobei jedes Objekt ein Formularelement darstellt. Jedes Objekt sollte die folgenden Eigenschaften haben:

#### Element: Text

```json
{
    "type": "text",
    "label": "Name",
    "key": "name",
    "required": true
}
```

#### Element: Mehrzeilig

```json
{
    "type": "multiline",
    "label": "Name",
    "key": "name",
    "required": true,
    "rows": 4
}
```

#### Element: Passwort

```json
{
    "type": "password",
    "label": "Passwort",
    "key": "password",
    "required": true
}
```

#### Element: E-Mail

```json
{
    "type": "email",
    "label": "E-Mail-Adresse",
    "key": "email",
    "required": true
}
```

#### Element: Nummer

```json
{
    "type": "number",
    "label": "Alter",
    "key": "age",
    "required": true
}
```

#### Element: Kontrollkästchen

```json
{
    "type": "checkbox",
    "label": "Newsletter abonnieren",
    "key": "newsletter"
}
```

#### Element: Schalter

```json
{
    "type": "switch",
    "label": "Benachrichtigungen aktivieren",
    "key": "notifications"
}
```

#### Element: Datum

```json
{
    "type": "date",
    "label": "Geburtsdatum",
    "key": "dob",
    "required": true
}
```

#### Element: Zeit

```json
{
    "type": "time",
    "label": "Geburtszeit",
    "key": "tob",
    "required": true
}
```
#### Element: Dropdown

```json
{
    "type": "dropdown",
    "label": "Dropdown",
    "key": "selection"
}
```

### Dropdown-Optionen definieren

Wenn Sie die Konfiguration für Ihr `ui-form` überschreiben und Details Ihrer Dropdown-Optionen bereitstellen möchten, nachdem Ihr Node-RED-Flow bereitgestellt wurde, können Sie dies tun, indem Sie einen `msg.ui_update.dropdownOptions`-Wert übergeben. Dieser Wert sollte ein Array von Objekten sein, wobei jedes Objekt ein Dropdown-Element darstellt. Jedes Objekt sollte die folgenden Eigenschaften haben:

```json
[{
    "dropdown": "Dropdown-Name",
    "value": "1",
    "label": "Option 1"
}]
```

## Beispiel

![Beispiel eines Formulars](/images/node-examples/ui-form.png "Beispiel eines zweispaltigen Formulars"){data-zoomable}
*Beispiel eines gerenderten Formulars in einem Dashboard.*
---
{
    "description": "Nutzen Sie ui-event im Node-RED Dashboard 2.0, um Echtzeitereignisse und Benutzerinteraktionen effektiv zu handhaben.",
    "events": [
        {
            "event": "$pageview",
            "payload": "{ page, query }",
            "description": "Wird gesendet, wenn ein Benutzer eine bestimmte Seite im Dashboard <i>ansieht</i>. Details zur Dashboard-definierten Seite und zu allen in der URL gefundenen Abfrageparametern."
        },
        {
            "event": "$pageleave",
            "payload": "{ page }",
            "description": "Wird gesendet, wenn ein Benutzer eine bestimmte Seite im Dashboard <i>verlässt</i>."
        }
    ]
}
---

<script setup>
    import EventsList from '../../../components/EventsList.vue'
    import AddedIn from '../../../components/AddedIn.vue'
</script>

# Ereignis `ui-event` <AddedIn version="0.9.0" />

Dieses Widget rendert keinen Inhalt in Ihrem Dashboard. Stattdessen hört es auf benutzergesteuertes Verhalten und Ereignisse in Ihrem Dashboard und sendet entsprechend in den Node-RED Editor, wenn diese Ereignisse stattgefunden haben.

## Ereignisliste

Derzeit unterstützen wir die folgenden Ereignisse:

<EventsList />

### Beispiel: Seitenansicht (`$pageview`)

Jedes Mal, wenn ein Benutzer eine Seite ansieht, sendet der `ui-event`-Knoten:

```js
msg = {
    topic: '$pageview',
    payload: {
        page: {
            name: 'Seitenname',
            path: '/seiten/pfad',
            id: '1234',
            theme: 'dunkel',
            layout: 'standard',
            _groups: []
        },
        query: {
            key: 'value'
        }
    },
    _client: {
        socketId: '1234',
        socketIp: '127.0.0.1',
    }
}
```

## Benutzerdefinierte Ereignisse

In Ihren eigenen `ui-template`-Knoten können Sie benutzerdefinierte Ereignisse senden, die von jedem `ui-event`-Knoten erfasst werden, indem Sie den eingebetteten `$socket`-Operator direkt aufrufen.

Die Funktion `$socket.emit` nimmt 3 Argumente entgegen:

- Den Ereignisnamen, in diesem Fall `ui-event`
- Die `id` des `ui-event`-Knotens, an den Sie senden möchten. Sie können auch `all` verwenden, um an alle `ui-event`-Knoten zu senden.
- Die vollständige `msg`, die Sie senden möchten.

Im Fall, dass wir an einen bestimmten `ui-event`-Knoten senden möchten:

```vue
<v-btn @click="$socket.emit('ui-event', 'ui-event-node-id', msg)">Benutzerdefiniertes Ereignis senden</v-btn>
```

Oder, im Fall, dass wir an _alle_ `ui-event`-Knoten senden:

```vue
<v-btn @click="$socket.emit('ui-event', 'all', msg)">Benutzerdefiniertes Ereignis senden</v-btn>
```
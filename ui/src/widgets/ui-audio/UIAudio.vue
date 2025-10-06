<template>
    <!-- if you remove the `controls` attribute, you MUST click something on the page before initiating play -->
    <audio
        v-if="mode === 'src'"
        ref="audio"
        controls
        :autoplay="autoplay"
        :loop="loop"
        :muted="muted"
        :src="value"
        @play="handlePlayerEvents"
        @pause="handlePlayerEvents"
        @ended="handlePlayerEvents"
    />
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'DBUIAudio',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    emits: ['mounted'],
    data () {
        return {
            show: false,
            tik: 0,
            countdown: 0,
            timeouts: {
                close: null,
                step: null
            },
            /** @type {SpeechSynthesis} */
            synth: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        value: function () {
            // Get the value (i.e. the notification text content) from the last input msg
            const value = this.messages[this.id]?.payload || this.props.src
            return value
        },
        loop () {
            if (this.getProperty('loop') === 'on') {
                return true
            } else {
                return false
            }
        },
        muted () {
            if (this.getProperty('muted') === 'on') {
                return true
            } else {
                return false
            }
        },
        autoplay () {
            if (this.getProperty('autoplay') === 'on') {
                return true
            } else {
                return false
            }
        },
        mode () {
            return this.getProperty('mode') || 'src'
        },
        voice () {
            return this.getProperty('voice') || ''
        },
        /** @type {SpeechSynthesisVoice[]} */
        voices () {
            return this.$store.state.data?.voices || [] // populated by ui/src/App.vue + ui/src/store/data.mjs
        },
        speechSynthesisSupported () {
            return 'speechSynthesis' in window && !!window.speechSynthesis && 'SpeechSynthesisUtterance' in window && !!window.SpeechSynthesisUtterance
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        this.$dataTracker(this.id, this.onMsgInput, null, this.onDynamicProperties)
    },
    mounted () {
        this.$emit('mounted', this)
        this.synth = window.speechSynthesis
    },
    methods: {
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('mode', updates.mode)
            this.updateDynamicProperty('voice', updates.voice)
            this.updateDynamicProperty('src', updates.src)
            this.updateDynamicProperty('autoplay', updates.autoplay)
            this.updateDynamicProperty('loop', updates.loop)
            this.updateDynamicProperty('muted', updates.muted)
        },
        onMsgInput (msg) {
            /** @type {HTMLAudioElement} */
            const audioElement = this.$refs.audio

            // Make sure the last msg (that has a payload, containing the notification content) is being stored
            if (typeof msg.payload !== 'undefined') {
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    msg
                })
            }

            // handle playback controls
            if (Object.prototype.hasOwnProperty.call(msg, 'playback')) {
                switch (msg.playback) {
                case 'play':
                case 'resume':
                    if (this.mode === 'src' && audioElement) {
                        audioElement.play().catch((err) => {
                            console.error('Error playing audio:', err)
                        })
                    } else if (this.mode === 'tts' && this.synth?.paused) {
                        this.synth.resume()
                    }
                    break
                case 'stop':
                    if (this.mode === 'src' && audioElement) {
                        audioElement.src = ''
                    } else if (this.mode === 'tts' && (this.synth?.speaking || this.synth?.paused)) {
                        this.synth.cancel()
                    }
                    break
                case 'pause':
                    if (this.mode === 'src' && audioElement) {
                        audioElement.pause().catch((err) => {
                            console.error('Error pausing audio:', err)
                        })
                    } else if (this.mode === 'tts' && this.synth?.speaking && !this.synth?.paused) {
                        this.synth.pause()
                    }
                    break
                }
                return
            }

            if (this.mode === 'tts' && Object.prototype.hasOwnProperty.call(msg, 'payload')) {
                const node = this

                // Ensure TTS is supported
                if (!this.speechSynthesisSupported || this.voices.length === 0) {
                    console.warn('This Browser does not support Text-to-Speech')
                    node.handleTTSEvents({ error: 'Browser does not support Text-to-Speech' }, 'tts-error', null)
                    return
                }

                // Extract text and TTS Options
                let ttsOptions = {}
                if (msg.payload && typeof msg.payload === 'object') {
                    ttsOptions = { ...msg.payload }
                } else if (typeof msg.payload === 'string') {
                    ttsOptions.text = msg.payload
                } else {
                    ttsOptions.text = String(msg.payload)
                }

                if (!ttsOptions.text.trim()) {
                    console.warn('No text to speak')
                    node.handleTTSEvents({ error: 'No text to speak' }, 'tts-error', null)
                    return
                }
                // Sane defaults (interrupt current speech, do not queue)
                if (typeof ttsOptions.queue !== 'boolean') { ttsOptions.queue = false } // do not queue by default
                if (typeof ttsOptions.interrupt !== 'boolean') { ttsOptions.interrupt = true } // interrupt current speech
                const returnIfPlaying = ttsOptions.queue === false && ttsOptions.interrupt === false
                if (this.synth?.speaking) {
                    if (returnIfPlaying) {
                        node.handleTTSEvents({ error: 'Already speaking' }, 'tts-skip', null)
                        return
                    }
                    if (ttsOptions.interrupt) {
                        this.synth.cancel()
                    }
                }

                // create utterance
                const utterance = new SpeechSynthesisUtterance(ttsOptions.text)
                const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

                // apply options
                // See https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
                if (typeof ttsOptions.rate === 'number' || !isNaN(parseFloat(ttsOptions.rate))) {
                    const rate = parseFloat(ttsOptions.rate) || 1
                    utterance.rate = clamp(rate, 0.1, 10)
                }
                if (typeof ttsOptions.pitch === 'number' || !isNaN(parseFloat(ttsOptions.pitch))) {
                    const pitch = parseFloat(ttsOptions.pitch) || 1
                    utterance.pitch = clamp(pitch, 0, 2)
                }
                if (ttsOptions.lang && typeof ttsOptions.lang === 'string') {
                    utterance.lang = ttsOptions.lang
                }
                if (typeof ttsOptions.volume === 'number' || !isNaN(parseInt(ttsOptions.volume))) {
                    const vol = (+ttsOptions.volume / 100) || 1
                    utterance.volume = clamp(vol, 0, 1)
                }
                if (typeof ttsOptions.voice === 'number' || !isNaN(parseInt(ttsOptions.voice))) {
                    const v = +ttsOptions.voice
                    if (v >= 0 && v < this.voices.length) {
                        utterance.voice = this.voices[v]
                    }
                } else if (typeof ttsOptions.voice === 'string' && ttsOptions.voice) {
                    // search by name or voiceURI
                    const voice = this.voices.find(v => v.name === ttsOptions.voice || v.voiceURI === ttsOptions.voice)
                    if (voice) {
                        utterance.voice = voice
                    }
                } else if (this.voice) {
                    // use configured voice
                    const voice = this.voices.find(v => v.name === this.voice || v.voiceURI === this.voice)
                    if (voice) { utterance.voice = voice }
                }
                // if no voice set, try to find a matching lang voice
                if (!utterance.voice && utterance.lang) {
                    const langVoice = this.voices.find(v => v.lang === utterance.lang)
                    if (langVoice) { utterance.voice = langVoice }
                }
                // if still no voice, set to default voice or first in list
                if (!utterance.voice) {
                    const defaultVoice = this.voices.find(v => v.default) || this.voices[0]
                    if (defaultVoice) { utterance.voice = defaultVoice }
                }

                // prepare event data for posting back to server
                const eventData = {
                    text: utterance.text,
                    volume: utterance.volume,
                    rate: utterance.rate,
                    pitch: utterance.pitch,
                    lang: utterance.lang,
                    voice: utterance.voice
                        ? {
                            name: utterance.voice.name,
                            lang: utterance.voice.lang,
                            localService: utterance.voice.localService,
                            voiceURI: utterance.voice.voiceURI
                        }
                        : {
                            name: 'Unknown',
                            lang: null,
                            localService: null,
                            voiceURI: null
                        }
                }

                // attach events
                utterance.onstart = function (event) {
                    node.handleTTSEvents(event, 'tts-start', eventData)
                }
                utterance.onpause = function (event) {
                    node.handleTTSEvents(event, 'tts-pause', eventData)
                }
                utterance.onresume = function (event) {
                    node.handleTTSEvents(event, 'tts-resume', eventData)
                }
                utterance.onerror = function (event) {
                    node.handleTTSEvents(event, 'tts-error', eventData)
                }
                utterance.onend = function (event) {
                    node.handleTTSEvents(event, 'tts-end', eventData)
                }

                // speak
                this.synth.speak(utterance)
            }
        },
        handlePlayerEvents (event) {
            const msg = this.messages[this.id] || {}
            msg._event = event.type
            this.$socket.emit('widget-action', this.id, msg)
        },
        handleTTSEvents (event, type, utterance) {
            const msg = this.messages[this.id] || {}
            type = type || event?.type || 'tts-event'
            event = event || { type: 'tts-event' }
            msg._event = {
                ...event,
                type,
                utterance
            }
            if (type === 'tts-error' || event?.error) {
                msg._error = event.error || 'unknown'
            } else {
                delete msg._error
            }
            this.$socket.emit('widget-action', this.id, msg)
        }
    }
}
</script>

<style>
.nrdb-ui-audio audio {
    width: 100%;
    height: 100%;
}
.hidden {
    display: none !important;
}
</style>

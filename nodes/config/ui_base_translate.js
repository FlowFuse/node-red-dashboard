/**
 * AI Translation endpoint for ui-base
 * Handles translation requests to avoid CORS issues with Anthropic API
 */

const axios = require('axios')

// Rate limiting for API calls
const rateLimiter = {
    lastCall: {},
    minDelay: {
        openai: 100, // 100ms between OpenAI calls
        anthropic: 2000 // 2 seconds between Anthropic calls to avoid rate limits
    }
}

// Sleep function
function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = function (RED) {
    // Register the translation endpoint
    RED.httpAdmin.post('/dashboard/translate_api', async function (req, res) {
        const { text, sourceLang, targetLang, provider, apiKey } = req.body

        if (!text || !targetLang || !provider || !apiKey) {
            return res.status(400).json({ error: 'Missing required parameters' })
        }

        try {
            let translatedText = ''

            // Check rate limiting
            const now = Date.now()
            const lastCallTime = rateLimiter.lastCall[provider] || 0
            const timeSinceLastCall = now - lastCallTime
            const requiredDelay = rateLimiter.minDelay[provider] || 0

            if (timeSinceLastCall < requiredDelay) {
                const waitTime = requiredDelay - timeSinceLastCall
                await sleep(waitTime)
            }

            // Update last call time
            rateLimiter.lastCall[provider] = Date.now()

            if (provider === 'openai') {
                // OpenAI API call
                const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: sourceLang === 'original'
                                ? `You are a professional translator. Translate the following UI text to language code "${targetLang}". First detect the source language automatically, then translate.
                                Rules:
                                - Only return the translated text, nothing else
                                - Preserve any HTML tags, placeholders (like {{variable}}), or special formatting
                                - Keep the translation concise and appropriate for UI elements
                                - Do not add explanations or notes`
                                : `You are a professional translator. Translate the following UI text from language code "${sourceLang}" to language code "${targetLang}". 
                                Rules:
                                - Only return the translated text, nothing else
                                - Preserve any HTML tags, placeholders (like {{variable}}), or special formatting
                                - Keep the translation concise and appropriate for UI elements
                                - Do not add explanations or notes`
                        },
                        {
                            role: 'user',
                            content: text
                        }
                    ],
                    temperature: 0.3
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`
                    }
                })

                if (response.status !== 200) {
                    throw new Error(response.data?.error?.message || 'OpenAI API error')
                }

                translatedText = response.data.choices[0].message.content.trim()
            } else if (provider === 'anthropic') {
                // Anthropic API call
                const response = await axios.post('https://api.anthropic.com/v1/messages', {
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1024,
                    messages: [
                        {
                            role: 'user',
                            content: sourceLang === 'original'
                                ? `Translate the following UI text to language code "${targetLang}". First detect the source language automatically, then translate.
                                Rules:
                                - Only return the translated text, nothing else
                                - Preserve any HTML tags, placeholders (like {{variable}}), or special formatting
                                - Keep the translation concise and appropriate for UI elements
                                - Do not add explanations or notes
                                
                                Text to translate: ${text}`
                                : `Translate the following UI text from language code "${sourceLang}" to language code "${targetLang}".
                                Rules:
                                - Only return the translated text, nothing else
                                - Preserve any HTML tags, placeholders (like {{variable}}), or special formatting
                                - Keep the translation concise and appropriate for UI elements
                                - Do not add explanations or notes
                                
                                Text to translate: ${text}`
                        }
                    ]
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
                    }
                })

                if (response.status !== 200) {
                    throw new Error(response.data?.error?.message || 'Anthropic API error')
                }

                translatedText = response.data.content[0].text.trim()
            } else {
                throw new Error('Unsupported provider: ' + provider)
            }

            res.json({ translatedText })
        } catch (error) {
            console.error('Translation error:', error)

            // Handle rate limit errors
            if (error.response && error.response.status === 429) {
                const retryAfter = error.response.headers['retry-after'] || 5
                res.status(429).json({
                    error: 'Rate limit exceeded. Please try again later.',
                    retryAfter
                })
            } else {
                res.status(500).json({ error: error.message })
            }
        }
    })
}

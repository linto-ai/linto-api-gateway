const TYPE = Object.freeze({
    TRANSCRIPTION: 'transcription',
    NLP: 'nlp',
    TTS: 'tts',
    SERVICES: 'services',
    checkValue: (type) => type === TYPE.TRANSCRIPTION || type === TYPE.NLP || type === TYPE.TTS || type === TYPE.SERVICES,
})

module.exports = TYPE
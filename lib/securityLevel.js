const SECURITY_LEVEL = Object.freeze({
    SECURE: 'secure',
    SENSITIVE: 'sensitive',
    INSECURE: 'insecure',
    DEFAULT: 'insecure',
    values: () => [SECURITY_LEVEL.SECURE, SECURITY_LEVEL.SENSITIVE, SECURITY_LEVEL.INSECURE],
    checkValue: (level) => level === SECURITY_LEVEL.SECURE || level === SECURITY_LEVEL.SENSITIVE || level === SECURITY_LEVEL.INSECURE,
    validate: (level) => SECURITY_LEVEL.checkValue(level) ? level : SECURITY_LEVEL.DEFAULT,
})

module.exports = SECURITY_LEVEL

const SECURITY_LEVEL = Object.freeze({
    MIN: 0,
    MAX: 3,
    DEFAULT: 0,
    values: () => [0, 1, 2, 3],
    checkValue: (level) => Number.isInteger(level) && level >= SECURITY_LEVEL.MIN && level <= SECURITY_LEVEL.MAX,
    validate: (level) => {
        const parsed = parseInt(level, 10)
        return SECURITY_LEVEL.checkValue(parsed) ? parsed : SECURITY_LEVEL.DEFAULT
    },
})

module.exports = SECURITY_LEVEL

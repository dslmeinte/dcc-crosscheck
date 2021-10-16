export const pretty = (json) => JSON.stringify(json, null, 2)

export const tryParse = (text) => {
    try {
        return JSON.parse(text)
    } catch (e) {
        return e
    }
}


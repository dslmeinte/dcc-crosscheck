export const pretty = (json) => JSON.stringify(json, null, 2)

export const tryParse = (text) => {
    try {
        return { isJson: true, json: JSON.parse(text) }
    } catch (error) {
        return { isJson: false, error }
    }
}


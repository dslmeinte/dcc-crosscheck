const {evaluate} = require("certlogic-js")


const evaluateSafe = (expr, data) => {
    try {
        return evaluate(expr, data)
    } catch (e) {
        return `Error occurred during evaluation: ${e.message}.`
    }
}

const mapValues = (map, mapper) => Object.fromEntries(
    Object.entries(map)
        .map(([ key, value]) => [ key, mapper(key, value) ])
)


const valueSets = require("./resources/valueSets.json")


export const evaluateRulesOnPayload = (ruleSets, dcc, externals) => {
    const data = {
        payload: dcc,
        external: {
            valueSets,
            ...externals
        }
    }
    return mapValues(ruleSets, (_, ruleSet) => {
        const perRule = mapValues(ruleSet, (_, rule) => evaluateSafe(rule.Logic, data))
        return {
            perRule,
            allSatisfied: Object.values(perRule).reduce((acc, cur) => acc && !(cur instanceof Error) && cur, true)
        }
    })
}


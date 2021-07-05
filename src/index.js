import React from "react"
import {useState} from "react"
import ReactDOM from "react-dom"
import {evaluate} from "certlogic-js"

import "./styling.css"


const pretty = (json) => JSON.stringify(json, null, 2)

const tryParse = (text) => {
    try {
        return JSON.parse(text)
    } catch (e) {
        return e
    }
}

const evaluateSafe = (expr, data) => {
    try {
        return evaluate(expr, data)
    } catch (e) {
        return `Error occurred during evaluation: ${e.message}.`
    }
}


const ReactiveTextArea = ({ id, value, setter }) =>
    <textarea
        id={id}
        onChange={(event) => setter(event.target.value)}
        value={value} />


const ruleSets = require("./resources/all-rule-sets-with-tests.json")
const valueSets = require("./resources/valueSets.json")

const mapValues = (map, mapper) => Object.fromEntries(
    Object.entries(map)
        .map(([ key, value]) => [ key, mapper(key, value) ])
)

const computeResults = (payload, externals) => {
    const external = {
        valueSets,
        ...externals
    }
    return mapValues(ruleSets, (_, ruleSet) => {
        const perRule = mapValues(ruleSet, (_, rule) => evaluateSafe(rule.def.Logic, { payload, external }))
        return {
            perRule,
            allSatisfied: Object.values(perRule).reduce((acc, cur) => acc && !(cur instanceof Error) && cur, true)
        }
    })
}

const App = () => {
    const [dccAsText, setDccAsText] = useState(pretty({ var: "" }))

    const dcc = tryParse(dccAsText)
    const dccIsJson = !(dcc instanceof Error)

    const nowAsStr = new Date().toISOString()
    const results = dccIsJson ? computeResults(dcc, { validationClock: nowAsStr }) : {}

    return <main>
        <h1>DCC Crosscheck</h1>
        <p>
            Specify a DCC payload (as JSON) below, which will be evaluated against all rule sets contained in the <a href="https://github.com/eu-digital-green-certificates/dgc-business-rules-testdata">development/staging/pre-production GitHub repo</a>.
            In particular, you'll be able to see in which regions the holder of this DCC will be deemed fit-for-travel/-entry.
        </p>
        <p>
            <b>Disclaimer</b><br/>
            No rights can be derived from the contents of this website.
        </p>
        <div>
            <span className="label">DCC</span>
            <ReactiveTextArea id="dcc" value={dccAsText} setter={setDccAsText} />
        </div>
        <div>
            <span className="label">External parameters</span>
            {/*TODO  make a grid of external parameters, with validation clock (pre-populated with _now_) and addable/deletable other ones*/}
            <div>
                <span>{nowAsStr}</span>
            </div>
            {/*TODO  pre-collapsed value sets JSON*/}
        </div>
        {dccIsJson
            ? Object.entries(results).map(([ ruleSetId, ruleSet ]) =>
                <div>
                    <span className={ruleSet.allSatisfied ? "green" : "red"}>{ruleSetId}</span><span>:&nbsp;</span>
                    {Object.entries(ruleSet.perRule).map(([ ruleId, result ]) => <span className={result instanceof Error ? "orange" : (result ? "green" : "red")}>{ruleId}&nbsp;</span>)}
                </div>
            )
            : <p className="error">The DCC text isn't parseable as JSON: {dcc.message}</p>
        }
        <p>
            CertLogic has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
        </p>
    </main>
}


ReactDOM.render(<App />, document.getElementById('root'))


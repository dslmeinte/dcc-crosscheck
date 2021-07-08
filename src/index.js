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


const ruleSets = require("./resources/all-rule-sets.json")
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
        const perRule = mapValues(ruleSet, (_, rule) => evaluateSafe(rule.Logic, { payload, external }))
        return {
            perRule,
            allSatisfied: Object.values(perRule).reduce((acc, cur) => acc && !(cur instanceof Error) && cur, true)
        }
    })
}

const App = () => {
    const [dccAsText, setDccAsText] = useState(pretty({
        "ver": "1.3.0",
        "nam": {
            "fn": "Musterfrau-Gößinger",
            "fnt": "MUSTERFRAU<GOESSINGER",
            "gn": "Gabriele",
            "gnt": "GABRIELE"
        },
        "dob": "1998-02-26",
        "v": [
            {
                "tg": "840539006",
                "vp": "1119349007",
                "mp": "EU/1/20/1528",
                "ma": "ORG-100030215",
                "dn": 1,
                "sd": 2,
                "dt": "2021-02-18",
                "co": "AT",
                "is": "Ministry of Health, Austria",
                "ci": "URN:UVCI:01:AT:10807843F94AEE0EE5093FBC254BD813#B"
            }
        ]
    }))
    const [idSelectedRule, selectRule] = useState(null)

    const dcc = tryParse(dccAsText)
    const dccIsJson = !(dcc instanceof Error)

    const nowAsStr = new Date().toISOString()
    const results = dccIsJson ? computeResults(dcc, { validationClock: nowAsStr }) : {}

    const ruleSetIdSelectedRule = idSelectedRule === null ? null : idSelectedRule.substring(3, 5)
    const selectedRule = idSelectedRule === null ? null : ruleSets[ruleSetIdSelectedRule][idSelectedRule]

    return <main>
        <h1>DCC Crosscheck</h1>
        <p>
            Specify a DCC payload (as JSON) below, which will be evaluated against all rule sets contained in the <a href="https://github.com/eu-digital-green-certificates/dgc-business-rules-testdata" rel="noopener noreferrer" target="_blank">development/staging/pre-production GitHub repo</a>.
            In particular, you'll be able to see in which regions the holder of this DCC will be deemed fit-for-travel/-entry.
        </p>
        <p>
            <b>Disclaimer</b><br/>
            No rights can be derived from the contents of this Web site, nor by the information computed.
        </p>
        <div>
            <span className="label">DCC</span>
            <ReactiveTextArea id="dcc" value={dccAsText} setter={setDccAsText} />
        </div>
        <div className="separate-top">
            <span className="label">External parameters</span>
            {/*TODO  make a grid of external parameters, with validation clock (pre-populated with _now_) and addable/deletable other ones*/}
            <div className="table">
                <div className="table-body">
                    <div className="row header">
                        <div className="cell identifier"><span>Name</span></div>
                        <div className="cell"><span>Value</span></div>
                    </div>
                    <div className="row">
                        <div className="cell"><span>validationClock</span></div>
                        <div className="cell">{nowAsStr}</div>
                    </div>
                </div>
            </div>
            {/*TODO  pre-collapsed value sets JSON*/}
        </div>
        {dccIsJson
            ? <div className="separate-top">
                <span className="label">Evaluation results, per set of rules of region</span>
                {Object.entries(results).map(([ ruleSetId, ruleSet ]) =>
                    <div>
                        <span className={ruleSet.allSatisfied ? "green" : "red"}>{ruleSetId}</span><span>:&nbsp;</span>
                        {Object.entries(ruleSet.perRule).map(([ ruleId, result ]) =>
                            <a
                                className={result instanceof Error ? "orange" : (result ? "green" : "red")}
                                onClick={(event) => { selectRule(ruleId) }}
                                href="#rule"
                            >{ruleId}&nbsp;</a>
                        )}
                    </div>
                )}
                {idSelectedRule !== null && <Rule rule={selectedRule} result={results[ruleSetIdSelectedRule].perRule[idSelectedRule]} />}
            </div>
            : <p className="error">The DCC text isn't parseable as JSON: {dcc.message}</p>
        }
        <p>
            CertLogic has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
        </p>
    </main>
}

const Rule = ({ rule, result }) =>
    <div id="rule" className="separate-top">
        <span className="label">Rule</span>
        <div className="table" id="rule">
            <div className="table-body">
                <div className="row header">
                    <div className="cell identifier"><span>Field</span></div>
                    <div className="cell"><span>Value</span></div>
                </div>
                <div className="row">
                    <div className="cell"><span>Identifier</span></div>
                    <div className="cell">{rule.Identifier}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>Type</span></div>
                    <div className="cell">{rule.Type}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>Country</span></div>
                    <div className="cell">{rule.Country}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>Version</span></div>
                    <div className="cell">{rule.Version}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>SchemaVersion</span></div>
                    <div className="cell">{rule.SchemaVersion}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>Engine</span></div>
                    <div className="cell">{rule.Engine}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>EngineVersion</span></div>
                    <div className="cell">{rule.EngineVersion}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>CertificateType</span></div>
                    <div className="cell">{rule.CertificateType}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>Description</span></div>
                    <div className="cell">{rule.Description.map(({lang, desc}) => <span
                        className="description">[{lang}:] {desc}</span>)}
                    </div>
                </div>
                <div className="row">
                    <div className="cell"><span>ValidFrom</span></div>
                    <div className="cell">{rule.ValidFrom}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>ValidTo</span></div>
                    <div className="cell">{rule.ValidTo}</div>
                </div>
                <div className="row">
                    <div className="cell"><span>AffectedFields</span></div>
                    <div className="cell">
                        <pre>{rule.AffectedFields.join(", ")}</pre>
                    </div>
                </div>
                <div className="row">
                    <div className="cell"><span>Logic</span></div>
                    <div className="cell">
                        <pre className="logic">{JSON.stringify(rule.Logic, null, 2)}</pre>
                    </div>
                </div>
                <div className="row">
                    <div className="cell"><span>Result</span></div>
                    <div className="cell">
                        {result instanceof Error
                            ? <span className="orange">{result.message}</span>
                            : <span className={result === true ? "green" : "red"}>{"" + result}</span>
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>


ReactDOM.render(<App />, document.getElementById('root'))


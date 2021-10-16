import React from "react"
import {useState} from "react"
import ReactDOM from "react-dom"

import {evaluateRulesOnPayload} from "./evaluation-util"
import {pretty, tryParse} from "./json-util"
import {Rule} from "./rule"

import "./styling.css"


const ReactiveTextArea = ({ id, value, setter }) =>
    <textarea
        id={id}
        onChange={(event) => setter(event.target.value)}
        value={value} />


const ruleSets = require("./resources/all-rule-sets.json")
const defaultDCC = require("./resources/default-dcc.json")

const App = () => {
    const [dccAsText, setDccAsText] = useState(pretty(defaultDCC))
    const [idSelectedRule, selectRule] = useState(null)

    const dcc = tryParse(dccAsText)
    const dccIsJson = !(dcc instanceof Error)

    const nowAsStr = new Date().toISOString()
    const results = dccIsJson ? evaluateRulesOnPayload(ruleSets, dcc, { validationClock: nowAsStr }) : {}

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
                                onClick={(_) => { selectRule(ruleId) }}
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



ReactDOM.render(<App />, document.getElementById('root'))


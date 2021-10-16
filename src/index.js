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


const ruleSetsFromStagingRepo = require("./resources/all-rule-sets.json")
const defaultCustomRuleSet = require("./resources/default-custom-ruleSets.json")
const defaultDCC = require("./resources/default-dcc.json")

const App = () => {
    const [dccAsText, setDccAsText] = useState(pretty(defaultDCC))
    const [idSelectedRule, selectRule] = useState(null)
    const [customRuleSetAsText, setCustomRuleSetAsText] = useState(pretty(defaultCustomRuleSet))

    const dccInfo = tryParse(dccAsText)
    const customRuleSetInfo = tryParse(customRuleSetAsText)

    const nowAsStr = new Date().toISOString()

    const ruleSetsSource = new URLSearchParams(location.search).get("src") ?? "stagingRepo"
    const ruleSets = (() => {
        switch (ruleSetsSource) {
            case "stagingRepo": return ruleSetsFromStagingRepo
            case "custom": return customRuleSetInfo.isJson && Array.isArray(customRuleSetInfo.json)
                ? {
                        custom: Object.fromEntries(
                            defaultCustomRuleSet.map((rule) => [ rule.Identifier, rule ])
                        )
                    }
                : {}
        }
    })()
    const ruleSetsSourceExplanation = (() => {
        switch (ruleSetsSource) {
            case "stagingRepo": return <span>
                all rule sets contained in the <a href="https://github.com/eu-digital-green-certificates/dgc-business-rules-testdata" rel="noopener noreferrer" target="_blank">development/staging/pre-production GitHub repo</a>.
                In particular, you'll be able to see in which regions the holder of this DCC will be deemed fit-for-travel/-entry.
            </span>
            case "custom": return <span>the custom rule set specified <a href="#custom-rule-set-def">below</a>.</span>
        }
    })()

    const results = dccInfo.isJson ? evaluateRulesOnPayload(ruleSets, dccInfo.json, { validationClock: nowAsStr }) : {}

    const ruleSetIdSelectedRule = idSelectedRule === null ? null : idSelectedRule.substring(3, 5)
    const selectedRule = idSelectedRule === null ? null : ruleSets[ruleSetIdSelectedRule][idSelectedRule]

    return <main id="top">
        <h1>DCC Crosscheck</h1>
        <p>
            Specify a DCC payload (as JSON) below, which will be evaluated {ruleSetsSourceExplanation}
        </p>
        <p>
            <b>Disclaimer</b><br/>
            No rights can be derived from the contents of this Web site, nor by the information computed.
        </p>
        <div>
            <span className="label">DCC</span>
            <ReactiveTextArea id="dcc" value={dccAsText} setter={setDccAsText} />
            {!dccInfo.isJson && <p className="error">The DCC text isn't parseable as JSON: {dccInfo.error.message}</p>}
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
        {ruleSetsSource === "custom" &&
            <div id="custom-rule-set-def" className="separate-top">
                <span className="label">Custom rule set</span>
                <ReactiveTextArea id="dcc" value={customRuleSetAsText} setter={setCustomRuleSetAsText} />
                {!customRuleSetInfo.isJson && <p className="error">The DCC text isn't parseable as JSON: {customRuleSetInfo.error.message}</p>}
            </div>
        }
        {(dccInfo.isJson && (ruleSets !== "custom" || customRuleSetInfo.isJson)) &&
            <div className="separate-top">
                <span className="label">Evaluation results, per set of rules of region</span>
                {Object.entries(results).map(([ ruleSetId, ruleSet ]) =>
                    <div key={ruleSetId}>
                        <span className={ruleSet.allSatisfied ? "green" : "red"}>{ruleSetId}</span><span>:&nbsp;</span>
                        {Object.entries(ruleSet.perRule).map(([ ruleId, result ]) =>
                            <a
                                key={ruleId}
                                className={result instanceof Error ? "orange" : (result ? "green" : "red")}
                                onClick={(_) => { selectRule(ruleId) }}
                                href="#rule"
                            >{ruleId}&nbsp;</a>
                        )}
                    </div>
                )}
                {idSelectedRule !== null && <Rule rule={selectedRule} result={results[ruleSetIdSelectedRule].perRule[idSelectedRule]} />}
            </div>
        }
        <p>
            CertLogic has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
        </p>
    </main>
}



ReactDOM.render(<App />, document.getElementById('root'))


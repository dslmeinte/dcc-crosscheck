import React from "react"
import {useState} from "react"
import ReactDOM from "react-dom"
// import {evaluate} from "certlogic-js"

import "./styling.css"


const pretty = (json) => JSON.stringify(json, null, 2)

// const tryParse = (text) => {
//     try {
//         return JSON.parse(text)
//     } catch (e) {
//         return e
//     }
// }

// const evaluateSafe = (expr, data) => {
//     try {
//         return evaluate(expr, data)
//     } catch (e) {
//         return `Error occurred during evaluation: ${e.message}.`
//     }
// }


const ReactiveTextArea = ({ id, value, setter }) =>
    <textarea
        id={id}
        onChange={(event) => setter(event.target.value)}
        value={value} />


const App = () => {
    const [dccAsText, setDccAsText] = useState(pretty({ var: "" }))

    // const dcc = tryParse(dccAsText)
        // ? `Could not parse DCC payload text as JSON: ${dcc.message}.`

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
        <p>

        </p>
        <div>
        </div>
        <p>
            CertLogic has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
        </p>
    </main>
}


ReactDOM.render(<App />, document.getElementById('root'))


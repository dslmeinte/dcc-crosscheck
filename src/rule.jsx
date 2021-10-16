import {CompactExprRendering} from "certlogic-html"
import "certlogic-html/dist/styling.css"

import {pretty} from "./json-util"


export const Rule = ({ rule, result }) =>
    <div id="rule" className="separate-top">
        <span className="label">Rule</span> <span><a href="#top">(back to top)</a></span>
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
                        <pre className="logic">{pretty(rule.Logic)}</pre>
                    </div>
                </div>
                <div className="row">
                    <div className="cell"><span>Logic (compact)</span></div>
                    <div className="cell">
                        <CompactExprRendering expr={rule.Logic} />
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
        <span><a href="#top">(Back to top)</a></span>
    </div>

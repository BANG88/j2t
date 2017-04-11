'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ncp from 'copy-paste';
/**
 * parse json
 * 
 * @param {string} input 
 * @returns 
 */
function parseJSON(input: string) {
    let res = null
    try {
        res = JSON.parse(input)
    } catch (error) {
        vscode.window.showErrorMessage(error)
    }
    return res
}
/**
 * convert json to ts interface
 */
const convertJsonToTs = (jsonContent: any) => {

    for (let key in jsonContent) {
        let value = jsonContent[key];

        if (typeof value == 'string') {
            jsonContent[key] = "string";
        } else if (typeof value == 'boolean') {
            jsonContent[key] = "boolean";
        } else if (typeof value == 'number') {
            jsonContent[key] = "number";
        } else if (Array.isArray(value)) {
            // just catch most use case.
            if (value.length && typeof value[0] == 'string') {
                jsonContent[key] = "string[]";
            } else {
                jsonContent[key] = "never[]";
            }
        } else if (typeof value == 'object') {
            jsonContent[key] = convertJsonToTs(value)
        } else {
            jsonContent[key] = "any";
            // optionalKeys.push(key);
        }
    }


    return jsonContent
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "j2t" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.convert.json.to.ts', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        ncp.paste((err, content) => {
            if (err) {
                vscode.window.showInformationMessage(err)
            }
            if (content) {
                const res = parseJSON(content)
                const jsonContent = convertJsonToTs(res)
                let result = JSON.stringify(jsonContent, null, "\t")
                    .replace(new RegExp("\"", "g"), "")
                    .replace(new RegExp(",", "g"), "");
                if (result && result !== 'null') {
                    const xentity = `declare interface XEntity ${result}`
                    ncp.copy(xentity, (err) => {
                        vscode.window.setStatusBarMessage('Convert json to interface done.Please paste it in your code.', 3000)
                    })
                } else {
                    vscode.window.setStatusBarMessage('Clipboard is Empty Or not a valid JSON string.', 3000)
                }

            } else {
                vscode.window.showInformationMessage("No contents available from clipboard.")
            }
        })
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
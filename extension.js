// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const editor = vscode.window.activeTextEditor;
const writer = vscode.window.writer;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "jsontophparray" is now active!');
	let format = vscode.commands.registerCommand('jsontophparray.jsonToPHPArray', function() {
		const selectedText = editor.document.getText(editor.selection);
		try {
			const jsonObject = JSON.parse(selectedText);
			const firstline = editor.document.lineAt(editor.selection.start.line);
			const startlevel = (firstline["_text"].match(/\t/g) || []).length + 1;
			const converted = formatJSONtoPHPArray(jsonObject, startlevel);
			editor.edit(editBuilder => {
				editBuilder.replace(
					new vscode.Range(
						editor.selection.start.line,
						editor.selection.start.character,
						editor.selection.end.line,
						editor.selection.end.character
					),
					converted.replaceAll("\n\n", "\n")
				);
			});
		} catch(exception) {
			console.log(exception);
			vscode.window.showInformationMessage('Invalid JSON');
		}
	});

	context.subscriptions.push(format);
}

function formatJSONtoPHPArray(obj, level = 1) {
	let PHPArray = "";
	const keys = Object.keys(obj);
	keys.forEach((key, index) => {
		let string;
		if(obj[key].constructor.name === "Object") {
			string = formatJSONtoPHPArray(obj[key], level + 1);
		} else if(obj[key].constructor.name === "Array") {
			PHPArray += indent(level) + "'" + key + "' => " + JSON.stringify(obj[key]);
			if(keys[index + 1]) {
				PHPArray += ",";
			}
			return;
		} else if(obj[key].constructor.name === "Number") {
			string = obj[key];
		} else if(obj[key].constructor.name === "String") {
			string = "'" + obj[key] + "'";
		} else {
			throw new Error('Invalid JSON');
		}
		PHPArray += indent(level) + "'" + key + "' => " + string;
		if(keys[index + 1]) {
			PHPArray += ",";
		}
		PHPArray += "\n";
	});
	return "[\n" + PHPArray + "\n" + indent(level - 1) + "]";
}

function indent(level) {
	return "\t".repeat(level);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

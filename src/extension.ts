import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('dot-env-sorter.sort', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		editor.edit(builder => {
			if(!isDotEnv(editor.document)) {
				return;
			}

			const text = editor.document.getText();
			const formattedText = formatEnvFile(text);
			const range = getDocumentRange(editor.document);

			builder.replace(range, formattedText);
		});
	});

	context.subscriptions.push(disposable);
}

const isDotEnv = (doc: vscode.TextDocument): boolean => {
	const path = doc.fileName.split('/');
	const filename = path[path.length - 1];
	return filename.includes('.env');
};

const getDocumentRange = (doc: vscode.TextDocument): vscode.Range => {
	const firstLine = doc.lineAt(0);
	const lastLine = doc.lineAt(doc.lineCount - 1);
	return new vscode.Range(firstLine.range.start, lastLine.range.end);
};

const formatEnvFile = (text: string): string => {
	const lines = text.split('\n').filter(line => !!line);
	lines.sort();
	
	let formatted = '';
	let prevPrefix = '';
	lines.forEach(line => {
		const [varName] = line.split('=');
		const prefix = varName.includes('_') ? varName.split('_')[0] : varName;

		if(prevPrefix && prevPrefix !== prefix) {
			formatted += '\n';
		}

		formatted += line + '\n';
		prevPrefix = prefix;
	});

	return formatted;
};
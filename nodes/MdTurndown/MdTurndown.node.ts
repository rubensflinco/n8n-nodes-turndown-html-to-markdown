import { IExecuteFunctions } from 'n8n-core';
import { INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError } from 'n8n-workflow';
import TurndownService from 'turndown';
import * as marked from 'marked';

export class NotionMd implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MarkDown TurnDown',
		name: 'MdTurndown',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:free-markdown.png',
		group: ['transform'],
		version: 1,
		description: 'Node to use in n8n that allows you to convert HTML to MarkDown using one of the most famous JS libraries that perform this conversion to Turndown | PT-BR: Nó para usar em n8n que permite converter HTML para MarkDown usando uma das bibliotecas JS mais famosas que realizam essa conversão, Turndown',
		defaults: {
			name: 'MarkDown TurnDown',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'HTML > Markdown',
						value: 'htmlToMarkdown',
					},
					{
						name: 'Markdown > HTML',
						value: 'markdownToHtml',
					},
				],
				default: 'htmlToMarkdown',
				description: 'Choose whether you want to convert markdown to html or vice versa | PT-BR: Escolha se deseja converter markdown em html ou vice-versa',
			},
			{
				displayName: 'Input',
				name: 'input',
				type: 'string',
				default: '',
				placeholder: 'Place your markup or notion blocks here | PT-BR: Coloque sua marcação ou blocos de noção aqui',
				description: 'The input to be transformed | PT-BR: A entrada a ser transformada',
			},
			{
				displayName: 'Output Key',
				name: 'outputKey',
				type: 'string',
				default: 'data',
				description: 'Key to use for the output object | PT-BR: Chave a ser usada para o objeto de saída',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let item: INodeExecutionData;
		let operation: string;
		let input: string;
		let outputKey: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				operation = this.getNodeParameter('operation', itemIndex, '') as string;
				input = this.getNodeParameter('input', itemIndex, '') as string;
				outputKey = this.getNodeParameter('outputKey', itemIndex, '') as string;
				item = items[itemIndex];

				if (operation === 'htmlToMarkdown') {
					item.json[outputKey] = await htmlToMarkdown.call(this, input);
				} else if (operation === 'markdownToHtml') {
					item.json[outputKey] = await markdownToHtml.call(this, input);
				} else {
					throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}
		return this.prepareOutputData(items);
	}
}

async function htmlToMarkdown(this: IExecuteFunctions, input: string): Promise<any> {
	const turndownService = new TurndownService();
	const markdown = turndownService.turndown(input);
	return markdown;
}

// @ts-ignore
async function markdownToHtml(this: IExecuteFunctions, input: string): Promise<any> {
	const html = marked.parse(input);
	return html;
}
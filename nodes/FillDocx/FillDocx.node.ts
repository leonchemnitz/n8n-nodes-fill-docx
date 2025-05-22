/* eslint-disable n8n-nodes-base/node-class-description-outputs-wrong */
/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { TemplateData, TemplateHandler, MimeType } from 'easy-template-x';

export class FillDocx implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fill Docx',
		name: 'fillDocx',
		icon: 'file:report_template.svg',
		group: ['transform'],
		version: 1,
		description: 'Fill a DocX Template with JSON data.',
		defaults: {
			name: 'Fill Docx',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Template Key',
				name: 'sourceKey',
				type: 'string',
				default: 'template',
				required: true,
				placeholder: 'template',
				description:
					'The name of the binary key to get the template from. It is also possible to define deep keys by using dot-notation like for example: "level1.level2.currentKey".',
			},
			{
				displayName: 'Output Key',
				name: 'destinationKey',
				type: 'string',
				default: 'document',
				required: true,
				placeholder: 'document',
				description:
					'The name of the binary key to copy data to. It is also possible to define deep keys by using dot-notation like for example: "level1.level2.newKey".',
			},
			{
				displayName: 'Input Data',
				name: 'data',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'data',
				description:
					'Data to use to fill the document. Insert as string, so please use JSON.stringify(data) if needed.',
			},
			{
				displayName: 'Output File Name',
				name: 'outputFileName',
				type: 'string',
				default: 'Document',
				required: true,
				placeholder: 'Document',
				description: 'File name of the output document, enter without extension',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const returnData: INodeExecutionData[] = [];

		let item: INodeExecutionData;
		let newItem: INodeExecutionData;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			item = items[itemIndex];
			newItem = {
				json: {},
				binary: {},
			};

			const sourceKey = this.getNodeParameter('sourceKey', itemIndex) as string;
			const destinationKey = this.getNodeParameter('destinationKey', itemIndex) as string;
			const data = this.getNodeParameter('data', itemIndex) as string;
			const outputFileName = this.getNodeParameter('outputFileName', itemIndex) as string;
			let templateData;

			try {
				templateData = JSON.parse(data) as TemplateData;
			} catch (err) {
				throw new NodeOperationError(
					this.getNode(),
					('Something went wrong while parsing the template data.' + err) as string,
				);
			}

			if (item.binary === undefined) {
				throw new NodeOperationError(this.getNode(), 'No binary data exists on item!');
			}

			// Process template data using the extracted function
			templateData = await addImageProcessing.bind(this)(templateData, itemIndex);

			console.log(templateData);

			const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, sourceKey);

			const handler = new TemplateHandler();

			try {
				const doc = await handler.process(binaryDataBuffer, templateData);

				newItem.binary![destinationKey] = await this.helpers.prepareBinaryData(
					doc,
					`${outputFileName}.docx`,
				);
			} catch (err) {
				throw new NodeOperationError(
					this.getNode(),
					('Something went wrong filling the document. ' + err) as string,
				);
			}

			returnData.push(newItem);
		}

		return [returnData];
	}
}

/**
 * Process template data to handle images
 */
async function addImageProcessing(
	this: IExecuteFunctions,
	templateData: TemplateData,
	itemIndex: number,
): Promise<TemplateData> {
	for (const key in templateData) {
		if (Array.isArray(templateData[key])) {
			console.log('processing array');
			// Process each item in the array recursively
			const processedArray = [];
			for (const item of templateData[key]) {
				if (typeof item === 'object' && item !== null) {
					console.log('processing Array Item');
					console.log(item);
					processedArray.push(await addImageProcessing.call(this, item, itemIndex));
				} else {
					processedArray.push(item);
				}
			}
			templateData[key] = processedArray;
		} else if (
			typeof templateData[key] === 'object' &&
			templateData[key] !== null &&
			templateData[key]['_type'] === 'image'
		) {
			console.log('processing image');
			// Process image object
			if (templateData[key].format && typeof templateData[key].format === 'string') {
				const format = templateData[key].format.toLowerCase().trim();
				if (format === 'png') {
					templateData[key]['format'] = MimeType.Png;
				} else if (format === 'jpg') {
					templateData[key]['format'] = MimeType.Jpeg;
				} else {
					throw new NodeOperationError(this.getNode(), 'Unsupported image format!');
				}
			}

			if (templateData[key].source && typeof templateData[key].source === 'string') {
				templateData[key]['source'] = await this.helpers.getBinaryDataBuffer(
					itemIndex,
					templateData[key]['source'],
				);
			}
		}
	}
	return templateData;
}

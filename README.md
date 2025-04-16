# n8n-nodes-fill-docx

This is an n8n community node. It lets you fill a docx file with data using placeholders.

This node is based on [n8n-nodes-generate-report](https://github.com/bramkn/n8n-nodes-generate-report), but with several improvements:

- Updated the easy-template-x dependency to a current version
- Added support for complex objects as input to easy-template-x
- Removed PDF generation functionality to reduce complexity

For this node, the [easy-template-x](https://www.npmjs.com/package/easy-template-x) package is used.
For more info on its usage, please check the package documentation.
The start and end tag for normal data are {{ }} instead of the standard { }
The tags for lists/containers are the same as default.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Developer

Hi,

My name is Leon Chemnitz and I am the developer of this fork.
The original node was developed by Bram (bram@knitco.nl).

For questions or issues with this node, please open an issue on Github.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- Fill in placeholders of a DocX file with data, supporting complex objects.

## Compatibility

Tested on n8n version 0.222.1 and above.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [easy-template-x documentation](https://www.npmjs.com/package/easy-template-x)

## Version history

v1.0 - Initial release of the fork

- Updated easy-template-x dependency
- Added support for complex objects
- Removed PDF conversion functionality

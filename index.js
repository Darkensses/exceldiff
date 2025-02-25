const fs = require('node:fs');
const path = require('node:path')
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { toCSV } = require('./lib');

const argv = yargs(hideBin(process.argv))
.usage('Usage: $0 --original [path] --compare [path] --report [path]')
.option('expected', {
	alias: 'e',
	describe: 'Path to the original file',
	type: 'string',
	demandOption: true
})
.option('actual', {
	alias: 'a',
	describe: 'Path to the file to compare',
	type: 'string',
	demandOption: true
})
.option('report', {
	alias: 'r',
	describe: 'Path to the report file',
	type: 'string',
	demandOption: true
})
.help()
.argv;

(async () => {
	// https://github.com/sindresorhus/file-type/issues/525#issuecomment-1013041630
  const { fileTypeFromFile } = await import('file-type');

	// validate that the directory exists
	if (fs.existsSync(argv.expected)) {
		// validate if the file is xslx
		const type = await fileTypeFromFile(argv.expected);
		if (type && type.ext === 'xlsx') {
			// Convert to CSV
			console.log('It is a XLSX');
			toCSV(argv.expected)

		} else if(path.extname(argv.expected).toLowerCase() === '.csv') {
			console.log('It is a CSV');
		} else {
			throw new Error('Unsupported file format: Only .CSV or .XSLX are supported.')
		}
	} else {
		throw new Error('The expected file does not exists or the path is not valid.');
	}
})();
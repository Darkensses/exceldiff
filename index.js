const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { parseInput, diff, createReport } = require('./lib');

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
	demandOption: false
})
.help()
.argv;

(async () => {
	const expected = await parseInput(argv.expected);
	const actual = await parseInput(argv.actual);

	const output = diff(expected, actual);
	console.log(output.is_equal);

	if(argv.report) {

		const info = {
			title: 'Excel Diffing',
			expected: argv.expected,
			actual: argv.actual
		}

		createReport(output.html, info, argv.report);
	}

})();
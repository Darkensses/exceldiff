const fs = require('node:fs');
const path = require('node:path')
const ExcelJS = require('exceljs');
const daff = require('daff');

async function parseInput(arg) {
	// https://github.com/sindresorhus/file-type/issues/525#issuecomment-1013041630
	const { fileTypeFromFile } = await import('file-type');

	// validate that the directory exists
	if (fs.existsSync(arg)) {
		// validate if the file is xslx
		const type = await fileTypeFromFile(arg);
		if (type && type.ext === 'xlsx') {
			const worksheet = await getXLSXWorksheet(arg);
			const csv = await toCSV(worksheet);
			return csv;

		} else if(path.extname(arg).toLowerCase() === '.csv') {
			const worksheet = await getCSVWorksheet(arg);
			const csv = await toCSV(worksheet);
			return csv;

		} else {
			throw Error('Unsupported file format: Only .CSV or .XSLX are supported.');
		}
	} else {
		throw Error('The expected file does not exists or the path is not valid.');
	}
}

async function getXLSXWorksheet(filepath, worksheet=1) {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(filepath);
	return workbook.getWorksheet(worksheet);
}

async function getCSVWorksheet(filepath) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = await workbook.csv.readFile(filepath);
	return worksheet;
}

async function toCSV(worksheet) {
	const csv = [];
	for (let i=1; i <= worksheet.actualRowCount; i++) {
		csv.push(worksheet.getRow(i).values.slice(1)) // slice at 1 'cause it's 1-based index
	}
	return csv;
}

// https://github.com/Yinger/ts-excel-compare/blob/master/src/utils/Diff.ts
function diff(left, right) {
	let tableLeft = new daff.TableView(left);
	let tableRight = new daff.TableView(right);

	tableLeft.trim();
	tableRight.trim();

	var ct = daff.compareTables(tableLeft, tableRight);

  let align = ct.align();
  let output = new daff.TableView([]);
  let flags = new daff.CompareFlags();
  flags.always_show_header = true;
  flags.always_show_order = true; // shows number rows (i.e 9:8)
  flags.never_show_order = false;
	flags.show_unchanged = true;
  flags.unchanged_context = true;
	flags.show_unchanged_columns = true; // Avoids to display column with NULL values

  var td = new daff.TableDiff(align, flags);
  td.hilite(output);

	var diff2html = new daff.DiffRender();
	diff2html.render(output);
	var table_diff_html = diff2html.html();

	return table_diff_html;

}

function createReport(data, info, filepath) {
	let base = fs.readFileSync('assets/base.html', 'utf8')

	const report = base
	.replace('<title></title>', `<title>${info.title}</title>`)
	.replace('<p id="expected"></p>', `<p id="expected">${info.expected}</p>`)
	.replace('<p id="actual"></p>', `<p id="actual">${info.actual}</p>`)
	.replace('<div id="table-container"></div>', `<div id="table-container">\n${data}\n</div>`);

	const absolutePath = path.isAbsolute(filepath) ? filepath : path.join(__dirname, filepath);
	const outputDir = path.dirname(absolutePath);

	try {
			fs.mkdirSync(outputDir, { recursive: true });
			fs.writeFileSync(absolutePath, report, 'utf8');

			console.log('File written successfully', absolutePath);
	} catch (err) {
			console.error('Error when save:', err);
	}
}

module.exports = {
	parseInput,
	toCSV,
	diff,
	createReport
}
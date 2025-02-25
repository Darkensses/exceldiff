const ExcelJS = require('exceljs');
const daff = require('daff');

async function getWorksheet(filepath, worksheet=1) {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(filepath);
	return workbook.getWorksheet(worksheet);
}

function toCSV(filepath) {
	const worksheet = getWorksheet(filepath);

	const csv = [];
	for (let i=1; i <= worksheet.actualRowCount; i++) {
		csv.push(worksheet.getRow(i).values.slice(1)) // slice at 1 'cause it's 1-based index
	}
	return csv;
}

module.exports = {
	toCSV
}
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

async function loadCsv(filePath: string): Promise<string[][]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines = Array<Array<string>>();

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

class ImportTransactionsService {
  async execute(transactions_filename: string): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const csvFilePath = path.resolve(
      uploadConfig.directory,
      transactions_filename,
    );

    const csvLines = await loadCsv(csvFilePath);

    const mapAllTransactions = csvLines.map(async line => {
      const [title, type, value, categoryTitle] = line;
      const transaction = await createTransaction.execute({
        title,
        type,
        value: Number(value),
        categoryTitle,
      });

      return transaction;
    });

    const transactions = await Promise.all(mapAllTransactions);

    return transactions;
  }
}

export default ImportTransactionsService;

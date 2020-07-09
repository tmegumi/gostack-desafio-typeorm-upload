import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const initialValue = 0;

    const incomeTransactions = await this.find({ where: { type: 'income' } });
    const outcomeTransactions = await this.find({ where: { type: 'outcome' } });

    const incomeBalance = incomeTransactions.reduce(
      (accumulator, currentValue) => accumulator + currentValue.value,
      initialValue,
    );
    const outcomeBalance = outcomeTransactions.reduce(
      (accumulator, currentValue) => accumulator + currentValue.value,
      initialValue,
    );

    const totalBalance = incomeBalance - outcomeBalance;

    return {
      income: incomeBalance,
      outcome: outcomeBalance,
      total: totalBalance,
    };
  }
}

export default TransactionsRepository;

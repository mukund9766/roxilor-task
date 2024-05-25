import React, { useState } from 'react';
import '../styles/TransactionsTable.css';

const TransactionsTable = ({ transactions, fetchCombinedData }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchCombinedData(search, page);
  };

  const handlePageChange = (direction) => {
    const newPage = direction === 'next' ? page + 1 : page - 1;
    setPage(newPage);
    fetchCombinedData(search, newPage);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions"
        />
        <button type="submit">Search</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Date of Sale</th>
            <th>Category</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
              <td>{transaction.category}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => handlePageChange('prev')} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => handlePageChange('next')}>Next</button>
    </div>
  );
};

export default TransactionsTable;

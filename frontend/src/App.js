import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/App.css';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';

const App = () => {
  const [month, setMonth] = useState('3'); // Default March
  const [data, setData] = useState({ transactions: [], statistics: {}, barChart: [], pieChart: [] });

  useEffect(() => {
    fetchCombinedData(month);
  }, [month]);

  const fetchCombinedData = async (month) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/combined?month=${month}`);
      setData(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <select onChange={(e) => setMonth(e.target.value)} value={month}>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {new Date(0, i).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>
      <TransactionsTable transactions={data.transactions} fetchCombinedData={fetchCombinedData} />
      <Statistics statistics={data.statistics} />
      <BarChart data={data.barChart} />
      <PieChart data={data.pieChart} />
    </div>
  );
};

export default App;

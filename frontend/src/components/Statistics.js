import React from 'react';
import '../styles/Statistics.css';

const Statistics = ({ statistics }) => {
  return (
    <div>
      <h3>Statistics</h3>
      <p>Total Sales: {statistics.totalSales}</p>
      <p>Total Sold Items: {statistics.totalSoldItems}</p>
      <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
    </div>
  );
};

export default Statistics;

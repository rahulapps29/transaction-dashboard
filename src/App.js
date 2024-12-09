import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { FaMoon, FaSun } from "react-icons/fa";
import "./App.css";

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    month: "",
    year: "",
    description: "",
    debitCredit: "",
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    axios
      .get("https://ledger.rahulluthra.in/api/tasks/d")
      .then((response) => {
        const data = response.data.tasks || [];
        setTransactions(data);
        setFilteredTransactions(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = transactions;

      if (filters.name) {
        filtered = filtered.filter((transaction) =>
          new RegExp(filters.name, "i").test(transaction.name)
        );
      }
      if (filters.description) {
        filtered = filtered.filter((transaction) =>
          new RegExp(filters.description, "i").test(
            transaction.TransactionDescription
          )
        );
      }
      if (filters.month) {
        filtered = filtered.filter(
          (transaction) =>
            new Date(transaction.TransactionDate).getMonth() + 1 ===
            parseInt(filters.month)
        );
      }
      if (filters.year) {
        filtered = filtered.filter(
          (transaction) =>
            new Date(transaction.TransactionDate).getFullYear() ===
            parseInt(filters.year)
        );
      }
      if (filters.debitCredit) {
        filtered = filtered.filter(
          (transaction) => transaction.DebitCredit === filters.debitCredit
        );
      }

      setFilteredTransactions(filtered);
    };

    applyFilters();
  }, [filters, transactions]);

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const calculateSubtotal = () =>
    filteredTransactions.reduce(
      (total, transaction) => total + transaction.Amt,
      0
    );

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const uniqueSortedValues = (array) => {
    return [...new Set(array)].sort((a, b) => {
      if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b);
      }
      return a - b; // Numeric sorting
    });
  };

  const uniqueNames = uniqueSortedValues(
    filteredTransactions.map((transaction) => transaction.name)
  );
  const uniqueDescriptions = uniqueSortedValues(
    filteredTransactions.map(
      (transaction) => transaction.TransactionDescription
    )
  );
  const uniqueMonths = uniqueSortedValues(
    filteredTransactions.map(
      (transaction) => new Date(transaction.TransactionDate).getMonth() + 1
    )
  );
  const uniqueYears = uniqueSortedValues(
    filteredTransactions.map((transaction) =>
      new Date(transaction.TransactionDate).getFullYear()
    )
  );
  const uniqueDebitCredit = uniqueSortedValues(
    filteredTransactions.map((transaction) => transaction.DebitCredit)
  );

  return (
    <div className={`dashboard ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <div className="top-bar">
        <h1>Transaction Dashboard</h1>
        <button className="toggle-mode" onClick={toggleDarkMode}>
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* Subtotal Section */}
      <div className="subtotal">
        <strong>Subtotal: ₹{calculateSubtotal()}</strong>
      </div>

      {/* Filters Section */}
      <div className="filters">
        <label>
          Name:
          <select
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          >
            <option value="">All</option>
            {uniqueNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Month:
          <select
            value={filters.month}
            onChange={(e) => handleFilterChange("month", e.target.value)}
          >
            <option value="">All</option>
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year:
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange("year", e.target.value)}
          >
            <option value="">All</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          Description:
          <select
            value={filters.description}
            onChange={(e) => handleFilterChange("description", e.target.value)}
          >
            <option value="">All</option>
            {uniqueDescriptions.map((description) => (
              <option key={description} value={description}>
                {description}
              </option>
            ))}
          </select>
        </label>
        <label>
          Debit/Credit:
          <select
            value={filters.debitCredit}
            onChange={(e) => handleFilterChange("debitCredit", e.target.value)}
          >
            <option value="">All</option>
            {uniqueDebitCredit.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Date</th>
              <th>Debit/Credit</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction.name}</td>
                <td>{transaction.TransactionDescription}</td>
                <td>
                  {format(new Date(transaction.TransactionDate), "yyyy-MM-dd")}
                </td>
                <td>{transaction.DebitCredit}</td>
                <td>{transaction.Amt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;

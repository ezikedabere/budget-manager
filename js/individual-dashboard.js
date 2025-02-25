const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const balanceEl = document.getElementById('balance');
const recentTransactions = document.getElementById('recentTransactions');
const addIncomeBtn = document.getElementById('addIncome');
const addExpenseBtn = document.getElementById('addExpense');
const resetDataBtn = document.getElementById('resetData');
const transactionModal = document.getElementById('transactionModal');
const transactionForm = document.getElementById('transactionForm');
const cancelTransactionBtn = document.getElementById('cancelTransaction');
const userGreeting = document.getElementById('userGreeting');

// Load saved transactions from browser storage, or start with empty list if none exist
let transactions = JSON.parse(localStorage.getItem('individualTransactions')) || [];

// Keeps track of whether we're adding income or expense
let currentTransactionType = 'income';

let doughnutChart = null;

// Start everything up when the page loads
document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    // Set username in greeting
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('name') || localStorage.getItem('username') || 'User';
    if (userGreeting) {
        userGreeting.textContent = username;
    }

    initializeEventListeners();
    updateSummary();
    renderTransactions();
    initializeChart();
    updateChart();
}

function initializeEventListeners() {
    // Add Income button
    addIncomeBtn.addEventListener('click', () => {
        currentTransactionType = 'income';
        openTransactionModal();
    });

    // Add Expense button
    addExpenseBtn.addEventListener('click', () => {
        currentTransactionType = 'expense';
        openTransactionModal();
    });

    // Cancel transaction button
    cancelTransactionBtn.addEventListener('click', closeTransactionModal);

    // Reset data button
    resetDataBtn.addEventListener('click', () => {
        showConfirmDialog(
            'Reset Dashboard',
            'Are you sure you want to reset all data? This will delete all your transactions and cannot be undone.',
            resetAllData
        );
    });

    // Transaction form submission
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTransaction();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === transactionModal) {
            closeTransactionModal();
        }
    });
}

function openTransactionModal() {
    if (!transactionModal || !transactionForm) return;
    
    transactionModal.style.display = 'block';
    document.getElementById('description').focus();

    // Update category options based on transaction type
    const categorySelect = document.getElementById('category');
    if (currentTransactionType === 'income') {
        categorySelect.innerHTML = `
            <option value="">Select Category</option>
            <option value="salary">Salary</option>
            <option value="business">Business Income</option>
            <option value="investment">Investment Returns</option>
            <option value="rental">Rental Income</option>
            <option value="others">Other Income</option>
        `;
    } else {
        categorySelect.innerHTML = `
            <option value="">Select Category</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="others">Others</option>
        `;
    }
}

function closeTransactionModal() {
    if (!transactionModal || !transactionForm) return;
    
    transactionModal.style.display = 'none';
    transactionForm.reset();
}
// Adds a new transaction
function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    if (!description || !amount || !category) {
        alert('Please fill in all fields');
        return;
    }

    const transaction = {
        id: Date.now(),
        description,
        amount,
        category,
        type: currentTransactionType,
        date: new Date().toISOString()
    };

    transactions.unshift(transaction);
    localStorage.setItem('individualTransactions', JSON.stringify(transactions));
    
    updateSummary();
    renderTransactions();
    updateChart();
    closeTransactionModal();
}

// Shows a list of recent transactions
function renderTransactions() {
    if (!recentTransactions) return;
    
    const recent = transactions.slice(0, 5);
    recentTransactions.innerHTML = recent.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span class="transaction-description">${transaction.description}</span>
                <span class="transaction-date">${formatDate(transaction.date)}</span>
            </div>
            <div class="transaction-details">
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                </div>
                <span class="transaction-category">${transaction.category}</span>
                <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}


function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const balance = income - expenses;
    
    if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(income);
    if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(expenses);
    if (balanceEl) balanceEl.textContent = formatCurrency(balance);
}

// To delete a transaction and update the UI
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('individualTransactions', JSON.stringify(transactions));
        updateSummary();
        renderTransactions();
        updateChart();
    }
}

function initializeChart() {
    const ctx = document.getElementById('doughnutChart')?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (doughnutChart) {
        doughnutChart.destroy();
    }

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Others'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total ? Math.round((value / total) * 100) : 0;
                            return `${label}: ₦${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

//Updates the expense distribution chart with current data
function updateChart() {
    if (!doughnutChart) {
        initializeChart();
        return;
    }

    const categories = ['food', 'transport', 'utilities', 'entertainment', 'others'];
    const categoryTotals = categories.map(category => 
        transactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0)
    );

    doughnutChart.data.datasets[0].data = categoryTotals;
    doughnutChart.update();
}

// Resets all dashboard data
function resetAllData() {
    transactions = [];
    localStorage.removeItem('individualTransactions');
    updateSummary();
    renderTransactions();
    
    if (doughnutChart) {
        doughnutChart.data.datasets[0].data = [0, 0, 0, 0, 0];
        doughnutChart.update();
    }
    
    alert('All data has been reset successfully!');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Shows a confirmation dialog
function showConfirmDialog(title, message, onConfirm) {
    // Create dialog if it doesn't exist
    let dialog = document.querySelector('.confirm-dialog');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        document.body.appendChild(dialog);
    }

    // Set dialog content
    dialog.innerHTML = `
        <div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirm-actions">
                <button class="cancel">Cancel</button>
                <button class="confirm">Confirm</button>
            </div>
        </div>
    `;

    // Add event listeners
    const cancelBtn = dialog.querySelector('.cancel');
    const confirmBtn = dialog.querySelector('.confirm');

    cancelBtn.addEventListener('click', () => {
        dialog.classList.remove('active');
    });

    confirmBtn.addEventListener('click', () => {
        onConfirm();
        dialog.classList.remove('active');
    });

    // Show dialog
    dialog.classList.add('active');
} 
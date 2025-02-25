const customizeModal = document.getElementById('customizeModal');
const customizeForm = document.getElementById('customizeForm');
const cancelCustomizeBtn = document.getElementById('cancelCustomize');

// Loop through all buttons using querySelector
document.querySelectorAll('.btn-select').forEach(button => {
    button.addEventListener('click', () => {
        const dashboardType = button.dataset.dashboard;
        openCustomizeModal(dashboardType);
    });
});

customizeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const dashboardType = customizeModal.dataset.dashboardType;
    
    localStorage.setItem('username', username);

    if (dashboardType === 'individual') {
        window.location.href = '/individual-dashboard.html?name=' + encodeURIComponent(username);
    } 
});

cancelCustomizeBtn.addEventListener('click', () => {
    closeCustomizeModal();
});

window.addEventListener('click', (e) => {
    if (e.target === customizeModal) {
        closeCustomizeModal();
    }
});

function openCustomizeModal(dashboardType) {
    customizeModal.style.display = 'block';
    customizeModal.dataset.dashboardType = dashboardType;
    document.getElementById('username').focus();
}

function closeCustomizeModal() {
    customizeModal.style.display = 'none';
    customizeForm.reset();
    delete customizeModal.dataset.dashboardType;
} 
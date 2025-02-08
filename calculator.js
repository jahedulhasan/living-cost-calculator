document.addEventListener('DOMContentLoaded', function() {
    // Initialize Chart.js for Inflation
    const ctxInflation = document.getElementById('inflationChart').getContext('2d');
    let inflationChart = new Chart(ctxInflation, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Living Cost',
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                data: [],
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.raw;
                            value = value > Math.floor(value) + 0.5 ? Math.ceil(value) : Math.floor(value);
                            const period = document.getElementById('calculationMode').checked ? 'Year' : 'Month';
                            return `Living Cost per ${period}: ৳${value.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '৳' + Math.round(value).toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // Theme switching functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');

    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);

        // Update chart colors based on theme
        updateChartColors(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    function updateChartColors(theme) {
        const textColor = theme === 'light' ? '#333' : '#f8f9fa';
        inflationChart.options.scales.y.ticks.color = textColor;
        inflationChart.options.plugins.legend.labels.color = textColor;
        inflationChart.update();
    }

    // Initialize chart colors based on current theme
    updateChartColors(savedTheme);

    // Form elements
    const inflationForm = document.getElementById('inflationForm');
    const currentCost = document.getElementById('currentCost');
    const inflationRate = document.getElementById('inflationRate');
    const inflationRateValue = document.getElementById('inflationRateValue');
    const targetYear = document.getElementById('targetYear');
    const yearError = document.getElementById('yearError');
    const calculationMode = document.getElementById('calculationMode');
    const periodLabel = document.getElementById('periodLabel');
    const periodLabels = document.querySelectorAll('.period-label');

    const currentYear = new Date().getFullYear();

    // Update period labels when calculation mode changes
    calculationMode.addEventListener('change', function() {
        const period = this.checked ? 'Per Year' : 'Per Month';
        periodLabel.textContent = period;
        periodLabels.forEach(label => label.textContent = period);

        // Adjust current cost based on mode
        if (this.checked) {
            currentCost.value = (parseFloat(currentCost.value) * 12).toString();
        } else {
            currentCost.value = Math.round(parseFloat(currentCost.value) / 12).toString();
        }

        calculateInflation();
    });

    // Update inflation rate display
    inflationRate.addEventListener('input', function() {
        inflationRateValue.textContent = `${this.value}% p.a.`;
        calculateInflation();
    });

    // Validate target year and calculate on any input change
    targetYear.addEventListener('input', function() {
        const year = parseInt(this.value);
        if (year < currentYear) {
            this.classList.add('is-invalid');
            yearError.style.display = 'block';
        } else {
            this.classList.remove('is-invalid');
            yearError.style.display = 'none';
            calculateInflation();
        }
    });

    inflationForm.addEventListener('input', function(e) {
        if (e.target !== targetYear && e.target !== calculationMode) {
            calculateInflation();
        }
    });

    function calculateInflation() {
        const isYearly = calculationMode.checked;
        const cost = parseFloat(currentCost.value) || 0;
        const rate = parseFloat(inflationRate.value) / 100;
        const year = parseInt(targetYear.value) || currentYear;

        if (year < currentYear) return;

        const years = year - currentYear;
        let costs = [];
        let yearLabels = [];
        let summaryData = [];

        for (let i = 0; i <= years; i++) {
            const inflatedCost = cost * Math.pow(1 + rate, i);
            costs.push(inflatedCost);
            yearLabels.push(currentYear + i);

            summaryData.push({
                year: currentYear + i,
                cost: inflatedCost
            });
        }

        updateChart(yearLabels, costs);
        updateSummaryTable(summaryData);
        updateFutureCost(summaryData[years]);
    }

    function updateChart(years, costs) {
        inflationChart.data.labels = years;
        inflationChart.data.datasets[0].data = costs;
        inflationChart.update();
    }

    function updateSummaryTable(data) {
        const tbody = document.getElementById('summaryTableBody');
        tbody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.year}</td>
                <td>৳${Math.round(row.cost).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function updateFutureCost(finalData) {
        const period = calculationMode.checked ? 'per year' : 'per month';
        document.getElementById('futureCost').textContent =
            `Living Cost of Year ${finalData.year} will be ৳${Math.round(finalData.cost).toLocaleString()} ${period}`;
    }

    // Initial calculation
    calculateInflation();
});

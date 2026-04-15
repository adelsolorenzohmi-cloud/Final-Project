let academicData = [];

// 1. Initialize data from JSON
async function init() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) throw new Error("Failed to load local data");
        const data = await response.json();
        academicData = data.featured_resources;
        renderGrid(academicData);

        localStorage.setItem('gsd_last_visit', new Date().toLocalSetring());
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

// 2. Render the Local Grid
function renderGrid(dataList) {
    const grid = document.getElementById('academic-grid');
    if (!grid) return;

    if (dataList.length === 0) {
        grid.innerHTML = `<p>No resources found for this region.</p>`;
        return;
    }

    grid.innerHTML = dataList.map(item => `
        <div class="academic-card">
            <h4>${item.name}</h4>
            <p><strong>Capital:</strong> ${item.capital || 'N/A'}</p>
            <p><strong>Focus:</strong> ${item.academic_focus}</p>
            <p><strong>Top Uni:</strong> ${item.top_uni}</p>
            <p><strong>Literacy:</strong> ${item.literacy_rate}</p>
            <p><small>Region: ${item.region}</small></p>
        </div>
    `).join('');
}

// 3. Filter Local Data
document.getElementById('region-filter')?.addEventListener('change', (e) => {
    const region = e.target.value;

    localStorage.setItem('gsd_region_pref', region);

    const filtered = region === 'all'
        ? academicData
        : academicData.filter(item => item.region === region);
    renderGrid(filtered);
});

// 4. Search External API
document.getElementById('search-btn')?.addEventListener('click', async () => {
    const query = document.getElementById('search-input').value.trim();
    const container = document.getElementById('country-card-container');

    if (!query) return;

    localStorage.setItem('gsd_last_query', query);

    container.innerHTML = `<p>Searching for ${query}...</p>`; // Loading state

    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${query}`);
        if (!response.ok) throw new Error("Country not found");

        const data = await response.json();
        const country = data[0];

        // Safe extraction of data
        const capital = country.capital ? country.capital[0] : "N/A";
        const flag = country.flags.svg || country.flags.png;

        container.innerHTML = `
            <div class="api-card">
                <img src="${flag}" alt="Flag of ${country.name.common}" width="120">
                <div>
                    <h2>${country.name.common}</h2>
                    <p><strong>Capital:</strong> ${capital}</p>
                    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                    <p><strong>Timezone:</strong> ${country.timezones?.[0] || "N/A"}</p>
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
    }
});

document.getElementById('search-input')?.addEventListener('focus', () => {
    localStorage.setItem('gsd_status', 'User is typing...');
});

init();

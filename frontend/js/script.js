const API_BASE_URL = 'http://localhost:8080';

function getApiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

function showMessage(elementId, text, isError = false) {
    const messageBox = document.getElementById(elementId);
    if (!messageBox) return;

    messageBox.textContent = text;
    messageBox.style.display = 'block';
    messageBox.style.color = isError ? '#d93025' : '#1d7a3d';
    messageBox.style.borderColor = isError ? '#f5c6cb' : '#c3e6cb';
    messageBox.style.background = isError ? '#fff2f2' : '#f1fff5';
}

async function getResponseMessage(response, fallbackMessage) {
    try {
        const result = await response.json();
        return result.message || fallbackMessage;
    } catch (error) {
        return fallbackMessage;
    }
}

async function submitRegistrationForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = getFormData(form);
    const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        password: formData.password,
        role: 'FARMER'
    };

    if (formData.password !== formData.confirmPassword) {
        showMessage('form-message', 'Passwords do not match.', true);
        return;
    }

    try {
        const response = await fetch(getApiUrl('/api/auth/register'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            showMessage('form-message', await getResponseMessage(response, 'Registration failed. Please check your details.'), true);
            return;
        }

        const result = await response.json();
        if (result.success === false) {
            showMessage('form-message', result.message || 'Registration failed. Please check your details.', true);
            return;
        }
        showMessage('form-message', result.message || 'Registration successful!');
        form.reset();
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.textContent = ' Go to login';
        loginLink.style.marginLeft = '6px';
        loginLink.style.color = '#16834b';
        document.getElementById('form-message').appendChild(loginLink);
    } catch (error) {
        showMessage('form-message', 'Unable to connect to the backend server. Please start the Spring Boot app.', true);
        console.error('Registration error:', error);
    }
}

async function submitLoginForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = getFormData(form);
    const payload = {
        email: formData.email,
        password: formData.password
    };

    try {
        const response = await fetch(getApiUrl('/api/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            showMessage('form-message', await getResponseMessage(response, 'Login failed. Please check your email and password.'), true);
            return;
        }

        const result = await response.json();
        if (result.success === false) {
            showMessage('form-message', result.message || 'Login failed. Please check your email and password.', true);
            return;
        }
        showMessage('form-message', result.message || 'Login successful!');
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('role', result.role);
        localStorage.setItem('fullName', result.fullName);

        if (result.role === 'FARMER') {
            window.location.href = 'farmer-dashboard.html';
            return;
        }

        window.location.href = '../index.html';
    } catch (error) {
        showMessage('form-message', 'Unable to connect to the backend server. Please start the Spring Boot app.', true);
        console.error('Login error:', error);
    }
}

function formatValue(value, fallback = '—') {
    return value === null || value === undefined || value === '' ? fallback : value;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderProduce(produceList) {
    const produceListElement = document.getElementById('produceList');
    if (!produceListElement) return;

    if (!Array.isArray(produceList) || produceList.length === 0) {
        produceListElement.innerHTML = '<p class="produce-empty">No produce records found. Add your first crop to get started.</p>';
        return;
    }

    produceListElement.innerHTML = produceList.map((produce) => `
        <article class="produce-item">
            <div class="produce-item-heading">
                <strong>${escapeHtml(formatValue(produce.cropName))}</strong>
                <span>${escapeHtml(formatValue(produce.qualityGrade, 'Grade not set'))}</span>
            </div>
            <div class="produce-item-details">
                <span><b>Quantity:</b> ${escapeHtml(formatValue(produce.quantity))} ${escapeHtml(formatValue(produce.unit, ''))}</span>
                <span><b>Expected price:</b> ₹${escapeHtml(formatValue(produce.expectedPrice))}</span>
                <span><b>Harvest date:</b> ${escapeHtml(formatValue(produce.harvestDate))}</span>
                <span><b>Location:</b> ${escapeHtml(formatValue(produce.location))}</span>
            </div>
        </article>
    `).join('');
}

async function loadFarmerProduce() {
    const farmerId = localStorage.getItem('userId');
    if (!farmerId) {
        window.location.href = 'login.html';
        return;
    }

    const produceListElement = document.getElementById('produceList');
    try {
        const response = await fetch(getApiUrl(`/api/produce/farmer/${encodeURIComponent(farmerId)}`));
        if (!response.ok) {
            showMessage('dashboard-message', await getResponseMessage(response, 'Unable to load your produce records.'), true);
            return;
        }

        const produceList = await response.json();
        renderProduce(produceList);

        const totalQuantity = produceList.reduce((total, produce) => total + Number(produce.quantity || 0), 0);
        const totalProduceElement = document.getElementById('total-produce');
        if (totalProduceElement) totalProduceElement.textContent = `${totalQuantity} kg`;
        const farmerNameElement = document.getElementById('farmer-name');
        if (farmerNameElement) farmerNameElement.textContent = localStorage.getItem('fullName') || 'Farmer';
    } catch (error) {
        if (produceListElement) {
            produceListElement.innerHTML = '<p class="produce-empty produce-error">Unable to connect to the backend server. Please start the Spring Boot app.</p>';
        }
        console.error('Produce loading error:', error);
    }
}

async function submitProduceForm(event) {
    event.preventDefault();

    const farmerId = localStorage.getItem('userId');
    if (!farmerId) {
        window.location.href = 'login.html';
        return;
    }

    const form = event.currentTarget;
    const formData = getFormData(form);
    const payload = {
        farmerId: Number(farmerId),
        cropName: formData.cropName,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        qualityGrade: formData.qualityGrade,
        expectedPrice: Number(formData.expectedPrice),
        harvestDate: formData.harvestDate,
        location: formData.location
    };

    try {
        const response = await fetch(getApiUrl('/api/produce'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            showMessage('produce-message', await getResponseMessage(response, 'Unable to save produce. Please check your details.'), true);
            return;
        }

        const result = await response.json();
        showMessage('produce-message', `Produce saved successfully${result.analysisStatus ? ` (${result.analysisStatus})` : ''}.`);
        form.reset();
    } catch (error) {
        showMessage('produce-message', 'Unable to connect to the backend server. Please start the Spring Boot app.', true);
        console.error('Produce submission error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const produceForm = document.getElementById('produceForm');

    if (registerForm) {
        const messageBox = document.createElement('div');
        messageBox.id = 'form-message';
        messageBox.style.display = 'none';
        messageBox.style.marginTop = '12px';
        messageBox.style.padding = '10px 12px';
        messageBox.style.border = '1px solid transparent';
        messageBox.style.borderRadius = '8px';
        messageBox.style.fontSize = '0.92rem';
        messageBox.style.fontWeight = '600';

        registerForm.appendChild(messageBox);
        registerForm.addEventListener('submit', submitRegistrationForm);
    }

    if (loginForm) {
        const messageBox = document.createElement('div');
        messageBox.id = 'form-message';
        messageBox.style.display = 'none';
        messageBox.style.marginTop = '12px';
        messageBox.style.padding = '10px 12px';
        messageBox.style.border = '1px solid transparent';
        messageBox.style.borderRadius = '8px';
        messageBox.style.fontSize = '0.92rem';
        messageBox.style.fontWeight = '600';

        loginForm.appendChild(messageBox);
        loginForm.addEventListener('submit', submitLoginForm);
    }

    if (produceForm) {
        produceForm.addEventListener('submit', submitProduceForm);
    }

    if (document.body.classList.contains('dashboard-page')) {
        loadFarmerProduce();
    }
});

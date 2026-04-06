class QrGenerator {
    constructor() {
        this.container = document.getElementById('qr-container');
        this.placeholder = document.getElementById('qr-placeholder');
        this.downloadBtn = document.getElementById('download-btn');
        this.currentData = '';
        this.qrCode = null;
        
        this.initTheme();
        this.initTabs();
        this.initForms();
        this.initPasswordToggle();
        this.initDynamicFields();
        this.initDownload();
    }

    initDynamicFields() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-field-btn')) {
                const btn = e.target.closest('.add-field-btn');
                const target = btn.dataset.target;
                
                if (target === 'phones') {
                    this.addDynamicField('phones', 'tel', 'Phone');
                } else if (target === 'emails') {
                    this.addDynamicField('emails', 'email', 'Email');
                }
            }
            
            if (e.target.closest('.remove-field-btn') || e.target.closest('.remove-field-btn svg')) {
                const btn = e.target.closest('.remove-field-btn');
                btn.closest('.dynamic-field-row').remove();
                this.debounce(this.generateQr, 200)();
            }
        });
    }

    addDynamicField(type, inputType, placeholder) {
        const group = document.getElementById(`${type}-group`);
        const row = document.createElement('div');
        row.className = 'dynamic-field-row';
        
        const typeSelectClass = type === 'phones' ? 'phone-type-select' : 'email-type-select';
        const typeOptions = type === 'phones' 
            ? '<option value="cell">Mobile</option><option value="home">Home</option><option value="work">Work</option>'
            : '<option value="personal">Personal</option><option value="work">Work</option>';
        
        row.innerHTML = `
            <div class="input-group" style="flex:1">
                <input type="${inputType}" class="vcard-${type === 'phones' ? 'phone' : 'email'}" placeholder="${placeholder}">
            </div>
            <select class="${typeSelectClass}">
                ${typeOptions}
            </select>
            <button type="button" class="remove-field-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        
        group.appendChild(row);
        
        const input = row.querySelector('input');
        input.addEventListener('input', () => this.debounce(this.generateQr, 200)());
        input.focus();
    }

    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-theme');
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    initTabs() {
        const tabs = document.querySelectorAll('.type-btn');
        const forms = document.querySelectorAll('.qr-form');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetType = tab.dataset.type;

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                forms.forEach(f => {
                    f.classList.remove('active');
                    if (f.dataset.type === targetType) {
                        f.classList.add('active');
                    }
                });

                this.generateQr();
            });
        });
    }

    initForms() {
        const allInputs = document.querySelectorAll('.qr-form input, .qr-form textarea');
        
        allInputs.forEach(input => {
            input.addEventListener('input', () => this.debounce(this.generateQr, 200)());
        });

        const selectSecurity = document.getElementById('wifi-security');
        if (selectSecurity) {
            selectSecurity.addEventListener('change', () => this.debounce(this.generateQr, 200)());
        }
    }

    initPasswordToggle() {
        const toggleBtns = document.querySelectorAll('.toggle-password');
        
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.parentElement.querySelector('input');
                const eyeOpen = btn.querySelector('.eye-open');
                const eyeClosed = btn.querySelector('.eye-closed');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    eyeOpen.style.display = 'none';
                    eyeClosed.style.display = 'block';
                } else {
                    input.type = 'password';
                    eyeOpen.style.display = 'block';
                    eyeClosed.style.display = 'none';
                }
            });
        });
    }

    initDownload() {
        this.downloadBtn.addEventListener('click', async () => {
            if (!this.qrCode) return;

            this.downloadBtn.disabled = true;
            this.downloadBtn.innerHTML = `
                <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                Downloading...
            `;

            try {
                await this.qrCode.download({ name: 'qrcode', extension: 'png' });
            } catch (error) {
                console.error('Download error:', error);
            }

            this.downloadBtn.disabled = false;
            this.downloadBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PNG
            `;
        });
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    getActiveType() {
        const activeTab = document.querySelector('.type-btn.active');
        return activeTab ? activeTab.dataset.type : 'url';
    }

    buildWifiString() {
        const ssid = document.getElementById('wifi-ssid').value.trim();
        const password = document.getElementById('wifi-password').value;
        const security = document.getElementById('wifi-security').value;

        if (!ssid) return '';

        let wifiString = `WIFI:S:${this.escapeWifi(ssid)};T:${security};`;
        if (security !== 'nopass' && password) {
            wifiString += `P:${this.escapeWifi(password)};`;
        }
        wifiString += ';';
        
        return wifiString;
    }

    escapeWifi(str) {
        return str.replace(/([\\;,:"'])/g, '\\$1');
    }

    buildTextString() {
        return document.getElementById('text-content').value;
    }

    buildUrlString() {
        let url = document.getElementById('url-content').value.trim();
        if (url && !url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
        }
        return url;
    }

    buildVCardString() {
        const firstname = document.getElementById('vcard-firstname').value.trim();
        const lastname = document.getElementById('vcard-lastname').value.trim();
        const nickname = document.getElementById('vcard-nickname').value.trim();
        const url = document.getElementById('vcard-url').value.trim();
        const org = document.getElementById('vcard-org').value.trim();
        const title = document.getElementById('vcard-title').value.trim();
        const birthday = document.getElementById('vcard-birthday').value.trim();
        const anniversary = document.getElementById('vcard-anniversary').value.trim();
        const street = document.getElementById('vcard-street').value.trim();
        const city = document.getElementById('vcard-city').value.trim();
        const postal = document.getElementById('vcard-postal').value.trim();
        const region = document.getElementById('vcard-region').value.trim();
        const country = document.getElementById('vcard-country').value.trim();
        const note = document.getElementById('vcard-note').value.trim();

        const phones = [];
        document.querySelectorAll('#phones-group .dynamic-field-row').forEach(row => {
            const phone = row.querySelector('.vcard-phone').value.trim();
            const type = row.querySelector('.phone-type-select').value;
            if (phone) phones.push({ phone, type });
        });

        const emails = [];
        document.querySelectorAll('#emails-group .dynamic-field-row').forEach(row => {
            const email = row.querySelector('.vcard-email').value.trim();
            const type = row.querySelector('.email-type-select').value;
            if (email) emails.push({ email, type });
        });

        if (!firstname && !lastname) return '';

        let vcard = 'BEGIN:VCARD\n';
        vcard += 'VERSION:3.0\n';
        vcard += `FN:${firstname} ${lastname}\n`;
        vcard += `N:${lastname};${firstname};;;${nickname ? nickname : ''}\n`;
        if (nickname) vcard += `NICKNAME:${nickname}\n`;
        
        phones.forEach(({ phone, type }) => {
            const typeStr = type === 'cell' ? 'CELL' : type.toUpperCase();
            vcard += `TEL;TYPE=${typeStr},VOICE:${phone}\n`;
        });
        
        emails.forEach(({ email, type }) => {
            vcard += `EMAIL;TYPE=${type.toUpperCase()}:${email}\n`;
        });
        
        if (url) vcard += `URL:${url}\n`;
        if (org) vcard += `ORG:${org}\n`;
        if (title) vcard += `TITLE:${title}\n`;
        
        if (birthday) vcard += `BDAY:${birthday.replace(/-/g, '')}\n`;
        if (anniversary) vcard += `ANNIVERSARY:${anniversary}\n`;
        
        if (street || city || postal || region || country) {
            vcard += `ADR;TYPE=WORK:;;${street};${city};${region};${postal};${country}\n`;
        }
        
        if (note) vcard += `NOTE:${note}\n`;
        vcard += 'END:VCARD';
        
        return vcard;
    }

    getCurrentContent() {
        switch (this.getActiveType()) {
            case 'wifi': return this.buildWifiString();
            case 'text': return this.buildTextString();
            case 'url': return this.buildUrlString();
            case 'vcard': return this.buildVCardString();
            default: return '';
        }
    }

    generateQr() {
        const content = this.getCurrentContent();
        
        if (!content) {
            this.container.innerHTML = '';
            this.placeholder.classList.remove('hidden');
            this.downloadBtn.disabled = true;
            this.currentData = '';
            this.qrCode = null;
            return;
        }

        try {
            this.container.innerHTML = '';
            this.placeholder.classList.add('hidden');

            this.qrCode = new QRCodeStyling({
                width: 280,
                height: 280,
                data: content,
                margin: 10,
                dotsOptions: {
                    type: 'rounded',
                    color: '#000000'
                },
                backgroundOptions: {
                    color: '#ffffff'
                },
                cornersSquareOptions: {
                    type: 'extra-rounded',
                    color: '#000000'
                },
                cornersDotOptions: {
                    type: 'dot',
                    color: '#000000'
                }
            });

            this.qrCode.append(this.container);
            
            this.downloadBtn.disabled = false;
            this.currentData = content;

        } catch (error) {
            console.error('QR generation error:', error);
            this.container.innerHTML = '';
            this.placeholder.classList.remove('hidden');
            this.downloadBtn.disabled = true;
            this.currentData = '';
            this.qrCode = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QrGenerator();
});

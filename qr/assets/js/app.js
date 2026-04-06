class QrGenerator {
    constructor() {
        this.container = document.getElementById('qr-container');
        this.placeholder = document.getElementById('qr-placeholder');
        this.downloadBtn = document.getElementById('download-btn');
        this.currentData = '';
        this.qrCode = null;
        
        this.initTabs();
        this.initForms();
        this.initPasswordToggle();
        this.initDownload();
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
        return activeTab ? activeTab.dataset.type : 'wifi';
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
        const phone = document.getElementById('vcard-phone').value.trim();
        const email = document.getElementById('vcard-email').value.trim();
        const org = document.getElementById('vcard-org').value.trim();

        if (!firstname && !lastname) return '';

        let vcard = 'BEGIN:VCARD\n';
        vcard += 'VERSION:3.0\n';
        vcard += `FN:${firstname} ${lastname}\n`;
        vcard += `N:${lastname};${firstname};;;\n`;
        if (phone) vcard += `TEL;TYPE=CELL:${phone}\n`;
        if (email) vcard += `EMAIL:${email}\n`;
        if (org) vcard += `ORG:${org}\n`;
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

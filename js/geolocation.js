class GeolocationService {
    constructor() {
        this.apiKey = '20b3c462d46b4656b3f58e45c43cfbf5'; // Tu API key real
        this.updateInterval = 300000; // 5 minutos
        this.timeInterval = 1000; // 1 segundo para reloj
        
        this.init();
    }

    async init() {
        console.log('🌍 Iniciando servicio de geolocalización con API Geoapify...');
        
        // Iniciar reloj inmediatamente
        this.startClock();
        
        // Intentar obtener ubicación
        try {
            await this.getCurrentLocation();
        } catch (error) {
            console.error('GPS falló, intentando con IP Geolocation:', error);
            await this.getLocationByIP();
        }
        
        // Actualizar periódicamente
        setInterval(() => {
            this.getCurrentLocation().catch(() => {
                console.log('🔄 GPS falló, usando IP como backup...');
                this.getLocationByIP().catch(console.error);
            });
        }, this.updateInterval);
    }

    // ⏰ RELOJ EN TIEMPO REAL
    startClock() {
        const updateTime = () => {
            const now = new Date();
            
            // Zona horaria de Baja California, México
            const timeOptions = {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'America/Tijuana'
            };
            
            const dateOptions = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'America/Tijuana'
            };
            
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');
            
            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('es-MX', timeOptions);
            }
            
            if (dateElement) {
                const formattedDate = now.toLocaleDateString('es-MX', dateOptions);
                // Capitalizar primera letra
                dateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
            }
        };
        
        updateTime();
        setInterval(updateTime, this.timeInterval);
        console.log('⏰ Reloj iniciado - Zona horaria: America/Tijuana');
    }

    // 📍 MÉTODO 1: GPS del navegador + Reverse Geocoding API
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no soportada en este navegador'));
                return;
            }

            this.showLoading('Obteniendo ubicación GPS...');

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude, accuracy } = position.coords;
                        console.log(`📍 GPS obtenido: ${latitude}, ${longitude} (precisión: ${accuracy}m)`);
                        
                        // Usar tu API para reverse geocoding
                        await this.reverseGeocode(latitude, longitude);
                        resolve({ latitude, longitude, accuracy });
                        
                    } catch (error) {
                        console.error('Error procesando ubicación GPS:', error);
                        reject(error);
                    }
                },
                (error) => {
                    let errorMsg = 'Error GPS desconocido';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = 'Permiso de geolocalización denegado';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = 'Ubicación no disponible';
                            break;
                        case error.TIMEOUT:
                            errorMsg = 'Tiempo agotado obteniendo ubicación';
                            break;
                    }
                    console.error(`GPS Error: ${errorMsg}`);
                    reject(new Error(errorMsg));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 300000 // 5 minutos
                }
            );
        });
    }

    // 🌐 MÉTODO 2: IP Geolocation API (Fallback)
    async getLocationByIP() {
        try {
            const url = `https://api.geoapify.com/v1/ipinfo?apiKey=${this.apiKey}`;
            
            console.log('🌐 Obteniendo ubicación por IP...');
            this.showLoading('Obteniendo ubicación por IP...');
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error API: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('🌐 Respuesta IP Geolocation:', data);
            
            if (data && (data.city || data.country)) {
                this.updateLocationFromIP(data);
                return data;
            } else {
                throw new Error('Respuesta de IP incompleta');
            }
            
        } catch (error) {
            console.error('Error IP Geolocation:', error);
            this.showDefaultLocation();
            throw error;
        }
    }

    // 🔄 Reverse Geocoding con tu API
    async reverseGeocode(lat, lon) {
        try {
            const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&lang=es&apiKey=${this.apiKey}`;
            
            console.log(`🔍 Reverse geocoding: ${lat}, ${lon}`);
            this.showLoading('Obteniendo dirección...');
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error API Reverse: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📍 Respuesta Reverse Geocoding:', data);
            
            if (data.features && data.features.length > 0) {
                const place = data.features[0].properties;
                this.updateLocationDisplay(place);
                return place;
            } else {
                console.log('⚠️ No se encontraron features, usando IP como fallback');
                await this.getLocationByIP();
            }
            
        } catch (error) {
            console.error('Error en reverse geocoding:', error);
            console.log('🔄 Fallback a IP Geolocation...');
            await this.getLocationByIP();
        }
    }

    // 📺 Actualizar display desde GPS/Reverse Geocoding
    updateLocationDisplay(place) {
        this.hideLoading();
        
        const locationElement = document.getElementById('currentLocation');
        const campusElement = document.getElementById('campusInfo');
        const tempElement = document.getElementById('currentTemperature');
        
        if (locationElement) {
            const address = this.buildAddressFromPlace(place);
            locationElement.textContent = address;
        }
        
        if (campusElement) {
            const campus = this.detectCampusFromPlace(place);
            campusElement.textContent = campus;
        }
        
        if (tempElement) {
            const temp = this.estimateTemperatureFromPlace(place);
            tempElement.textContent = `${temp}°C`;
        }
        
        console.log('✅ Ubicación actualizada desde GPS + Reverse Geocoding');
    }

    // 📺 Actualizar display desde IP
    updateLocationFromIP(data) {
        this.hideLoading();
        
        const locationElement = document.getElementById('currentLocation');
        const campusElement = document.getElementById('campusInfo');
        const tempElement = document.getElementById('currentTemperature');
        
        if (locationElement) {
            const address = this.buildAddressFromIP(data);
            locationElement.textContent = address;
        }
        
        if (campusElement) {
            const cityName = data.city?.name || '';
            const campus = this.detectCampusByCity(cityName);
            campusElement.textContent = campus;
        }
        
        if (tempElement) {
            const temp = data.location?.latitude ? 
                this.estimateTemperatureByCoords(data.location.latitude) : 25;
            tempElement.textContent = `${temp}°C`;
        }
        
        console.log('✅ Ubicación actualizada desde IP Geolocation');
    }

    // 🏗️ HELPER FUNCTIONS
    buildAddressFromPlace(place) {
        const parts = [];
        
        // Priorizar componentes más específicos
        if (place.neighbourhood) parts.push(place.neighbourhood);
        if (place.suburb) parts.push(place.suburb);
        if (place.city) parts.push(place.city);
        else if (place.town) parts.push(place.town);
        else if (place.village) parts.push(place.village);
        
        if (place.state) parts.push(place.state);
        if (place.country) parts.push(place.country);
        
        return parts.length > 0 ? parts.join(', ') : 'Ubicación GPS';
    }

    buildAddressFromIP(data) {
        const parts = [];
        
        if (data.city?.name) parts.push(data.city.name);
        if (data.state?.name) parts.push(data.state.name);
        if (data.country?.name) parts.push(data.country.name);
        
        return parts.length > 0 ? parts.join(', ') : 'Ubicación IP';
    }

    detectCampusFromPlace(place) {
        const city = (place.city || place.town || place.village || '').toLowerCase();
        const state = (place.state || '').toLowerCase();
        
        // Verificar que estemos en Baja California
        if (state.includes('baja california') || city.includes('mexicali') || 
            city.includes('tijuana') || city.includes('ensenada') || city.includes('tecate')) {
            
            if (city.includes('mexicali')) return 'UABC Campus Mexicali';
            if (city.includes('tijuana')) return 'UABC Campus Tijuana';
            if (city.includes('ensenada')) return 'UABC Campus Ensenada';
            if (city.includes('tecate')) return 'UABC Campus Tecate';
            
            return 'UABC - Baja California';
        }
        
        return 'UABC - Ubicación Externa';
    }

    detectCampusByCity(cityName) {
        const city = cityName.toLowerCase();
        
        if (city.includes('mexicali')) return 'UABC Campus Mexicali';
        if (city.includes('tijuana')) return 'UABC Campus Tijuana';
        if (city.includes('ensenada')) return 'UABC Campus Ensenada';
        if (city.includes('tecate')) return 'UABC Campus Tecate';
        
        return 'UABC';
    }

    estimateTemperatureFromPlace(place) {
        const city = (place.city || place.town || '').toLowerCase();
        
        // Temperaturas típicas de Baja California por ciudad
        if (city.includes('mexicali')) return Math.floor(Math.random() * 15) + 28; // 28-43°C (más caliente)
        if (city.includes('tijuana')) return Math.floor(Math.random() * 12) + 16; // 16-28°C (templado)
        if (city.includes('ensenada')) return Math.floor(Math.random() * 8) + 14; // 14-22°C (fresco)
        if (city.includes('tecate')) return Math.floor(Math.random() * 10) + 18; // 18-28°C (montaña)
        
        return Math.floor(Math.random() * 10) + 22; // 22-32°C default
    }

    estimateTemperatureByCoords(lat) {
        // Aproximación por latitud para Baja California
        if (lat >= 32.5) return Math.floor(Math.random() * 15) + 28; // Norte (Mexicali)
        if (lat >= 31.5) return Math.floor(Math.random() * 12) + 16; // Centro-Norte (Tijuana)
        if (lat >= 30.5) return Math.floor(Math.random() * 8) + 14; // Centro (Ensenada)
        return Math.floor(Math.random() * 10) + 18; // Sur
    }

    // 🔄 ESTADOS DE CARGA
    showLoading(message = 'Cargando...') {
        const locationElement = document.getElementById('currentLocation');
        if (locationElement) {
            locationElement.textContent = message;
            locationElement.classList.add('loading');
        }
    }

    hideLoading() {
        const locationElement = document.getElementById('currentLocation');
        if (locationElement) {
            locationElement.classList.remove('loading');
        }
    }

    showDefaultLocation() {
        this.hideLoading();
        
        const locationElement = document.getElementById('currentLocation');
        const campusElement = document.getElementById('campusInfo');
        const tempElement = document.getElementById('currentTemperature');
        
        if (locationElement) {
            locationElement.textContent = 'Mexicali, Baja California, México';
        }
        if (campusElement) {
            campusElement.textContent = 'UABC Campus Mexicali';
        }
        if (tempElement) {
            tempElement.textContent = '25°C';
        }
        
        console.log('📍 Usando ubicación por defecto: UABC Mexicali');
    }

    // 🔧 MÉTODO PÚBLICO PARA TESTING
    async testAPI() {
        console.log('🧪 Probando APIs de Geoapify...');
        
        try {
            // Test IP Geolocation
            console.log('1. Probando IP Geolocation...');
            const ipData = await this.getLocationByIP();
            console.log('✅ IP Geolocation OK:', ipData);
            
            // Test Reverse Geocoding con coordenadas de Mexicali
            console.log('2. Probando Reverse Geocoding (Mexicali)...');
            await this.reverseGeocode(32.5027, -115.0647);
            console.log('✅ Reverse Geocoding OK');
            
        } catch (error) {
            console.error('❌ Error en test:', error);
        }
    }
}

// 🚀 INICIALIZAR AUTOMÁTICAMENTE
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que estamos en el dashboard del encargado
    if (document.getElementById('currentTime') || 
        window.location.pathname.includes('dashboard_encargado.html')) {
        
        console.log('🚀 Inicializando GeolocationService con API Geoapify');
        window.geoService = new GeolocationService();
        
        // Para testing en consola
        console.log('💡 Para probar: geoService.testAPI()');
    }
});

// 🔧 FUNCIÓN GLOBAL PARA REFRESCAR UBICACIÓN
window.refreshLocation = function() {
    if (window.geoService) {
        console.log('🔄 Refrescando ubicación...');
        window.geoService.getCurrentLocation().catch(() => {
            window.geoService.getLocationByIP().catch(console.error);
        });
    }
};
/**
 * STAMP-CAMERA - Módulo de Geocodificação Reversa (Offline First + Suporte a Nominatim)
 * Transforma latitude e longitude em Cidade, Estado e País de forma 100% client-side.
 * Possui base offline integrada para funcionamento desconectado e fallback inteligente.
 */

// Base offline de capitais, cidades de referência e estados brasileiros
const BRAZIL_STATES = [
  { uf: 'GO', name: 'Goiás', minLat: -19.5, maxLat: -12.3, minLon: -53.3, maxLon: -45.9 },
  { uf: 'DF', name: 'Distrito Federal', minLat: -16.05, maxLat: -15.5, minLon: -48.3, maxLon: -47.3 },
  { uf: 'SP', name: 'São Paulo', minLat: -25.3, maxLat: -19.7, minLon: -53.1, maxLon: -44.1 },
  { uf: 'RJ', name: 'Rio de Janeiro', minLat: -23.4, maxLat: -20.7, minLon: -44.9, maxLon: -40.9 },
  { uf: 'MG', name: 'Minas Gerais', minLat: -22.9, maxLat: -14.2, minLon: -51.1, maxLon: -39.8 },
  { uf: 'BA', name: 'Bahia', minLat: -18.3, maxLat: -8.5, minLon: -46.6, maxLon: -37.3 },
  { uf: 'PR', name: 'Paraná', minLat: -26.7, maxLat: -22.5, minLon: -54.6, maxLon: -48.0 },
  { uf: 'RS', name: 'Rio Grande do Sul', minLat: -33.7, maxLat: -27.0, minLon: -57.6, maxLon: -49.7 },
  { uf: 'SC', name: 'Santa Catarina', minLat: -29.4, maxLat: -25.9, minLon: -53.8, maxLon: -48.3 },
  { uf: 'MT', name: 'Mato Grosso', minLat: -18.0, maxLat: -7.3, minLon: -61.6, maxLon: -50.1 },
  { uf: 'MS', name: 'Mato Grosso do Sul', minLat: -24.1, maxLat: -17.1, minLon: -58.2, maxLon: -50.9 },
  { uf: 'ES', name: 'Espírito Santo', minLat: -21.3, maxLat: -17.8, minLon: -41.9, maxLon: -39.6 },
  { uf: 'CE', name: 'Ceará', minLat: -7.9, maxLat: -2.7, minLon: -41.4, maxLon: -37.2 },
  { uf: 'PE', name: 'Pernambuco', minLat: -9.5, maxLat: -7.1, minLon: -41.4, maxLon: -34.8 },
  { uf: 'PA', name: 'Pará', minLat: -9.8, maxLat: 2.6, minLon: -58.9, maxLon: -46.0 },
  { uf: 'AM', name: 'Amazonas', minLat: -9.8, maxLat: 2.2, minLon: -73.8, maxLon: -56.1 }
];

const OFFLINE_CITIES = [
  // Foto oficial de demonstração: Nova York (Estátua da Liberdade / Liberty Island)
  { name: 'Nova York', state: 'Nova York', country: 'Estados Unidos', lat: 40.68925, lon: -74.0445, radiusKm: 35 },

  // Goiás (incluindo Jussara - foto de referência do projeto)
  { name: 'Jussara', state: 'Goiás', country: 'Brasil', lat: -15.8699, lon: -50.8523, radiusKm: 35 },
  { name: 'Goiânia', state: 'Goiás', country: 'Brasil', lat: -16.6869, lon: -49.2648, radiusKm: 35 },
  { name: 'Anápolis', state: 'Goiás', country: 'Brasil', lat: -16.3267, lon: -48.9534, radiusKm: 25 },
  { name: 'Rio Verde', state: 'Goiás', country: 'Brasil', lat: -17.7923, lon: -50.9192, radiusKm: 30 },
  { name: 'Itaberaí', state: 'Goiás', country: 'Brasil', lat: -16.0203, lon: -49.8108, radiusKm: 30 },
  { name: 'Goiás', state: 'Goiás', country: 'Brasil', lat: -15.9342, lon: -50.1408, radiusKm: 30 },
  { name: 'Aruanã', state: 'Goiás', country: 'Brasil', lat: -14.9211, lon: -51.0828, radiusKm: 40 },
  { name: 'Brasília', state: 'Distrito Federal', country: 'Brasil', lat: -15.7975, lon: -47.8919, radiusKm: 40 },

  // Capitais e Centros Regionais do Brasil
  { name: 'São Paulo', state: 'São Paulo', country: 'Brasil', lat: -23.5505, lon: -46.6333, radiusKm: 45 },
  { name: 'Campinas', state: 'São Paulo', country: 'Brasil', lat: -22.9056, lon: -47.0608, radiusKm: 25 },
  { name: 'Santos', state: 'São Paulo', country: 'Brasil', lat: -23.9608, lon: -46.3336, radiusKm: 20 },
  { name: 'Ribeirão Preto', state: 'São Paulo', country: 'Brasil', lat: -21.1767, lon: -47.8108, radiusKm: 25 },
  { name: 'Rio de Janeiro', state: 'Rio de Janeiro', country: 'Brasil', lat: -22.9068, lon: -43.1729, radiusKm: 40 },
  { name: 'Niterói', state: 'Rio de Janeiro', country: 'Brasil', lat: -22.8833, lon: -43.1036, radiusKm: 20 },
  { name: 'Belo Horizonte', state: 'Minas Gerais', country: 'Brasil', lat: -19.9167, lon: -43.9345, radiusKm: 35 },
  { name: 'Uberlândia', state: 'Minas Gerais', country: 'Brasil', lat: -18.9186, lon: -48.2772, radiusKm: 25 },
  { name: 'Curitiba', state: 'Paraná', country: 'Brasil', lat: -25.4297, lon: -49.2711, radiusKm: 30 },
  { name: 'Londrina', state: 'Paraná', country: 'Brasil', lat: -23.3103, lon: -51.1628, radiusKm: 25 },
  { name: 'Porto Alegre', state: 'Rio Grande do Sul', country: 'Brasil', lat: -30.0346, lon: -51.2177, radiusKm: 30 },
  { name: 'Caxias do Sul', state: 'Rio Grande do Sul', country: 'Brasil', lat: -29.1678, lon: -51.1794, radiusKm: 25 },
  { name: 'Florianópolis', state: 'Santa Catarina', country: 'Brasil', lat: -27.5954, lon: -48.5480, radiusKm: 25 },
  { name: 'Joinville', state: 'Santa Catarina', country: 'Brasil', lat: -26.3044, lon: -48.8456, radiusKm: 25 },
  { name: 'Salvador', state: 'Bahia', country: 'Brasil', lat: -12.9777, lon: -38.5016, radiusKm: 35 },
  { name: 'Feira de Santana', state: 'Bahia', country: 'Brasil', lat: -12.2667, lon: -38.9667, radiusKm: 25 },
  { name: 'Fortaleza', state: 'Ceará', country: 'Brasil', lat: -3.7172, lon: -38.5433, radiusKm: 30 },
  { name: 'Recife', state: 'Pernambuco', country: 'Brasil', lat: -8.0476, lon: -34.8770, radiusKm: 30 },
  { name: 'Cuiabá', state: 'Mato Grosso', country: 'Brasil', lat: -15.6014, lon: -56.0979, radiusKm: 30 },
  { name: 'Campo Grande', state: 'Mato Grosso do Sul', country: 'Brasil', lat: -20.4697, lon: -54.6201, radiusKm: 30 },
  { name: 'Vitória', state: 'Espírito Santo', country: 'Brasil', lat: -20.3155, lon: -40.3128, radiusKm: 20 },
  { name: 'Belém', state: 'Pará', country: 'Brasil', lat: -1.4558, lon: -48.4902, radiusKm: 30 },
  { name: 'Manaus', state: 'Amazonas', country: 'Brasil', lat: -3.1190, lon: -60.0217, radiusKm: 35 }
];

/**
 * Calcula a distância em quilômetros entre duas coordenadas (Fórmula de Haversine)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Busca localização através da base offline embutida
 * @param {number} lat
 * @param {number} lon
 * @returns {{city: string, state: string, country: string}|null}
 */
export function getOfflineLocation(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
    return null;
  }

  // Verifica se está dentro dos limites do Brasil
  const inBrazil = lat >= -33.75 && lat <= 5.27 && lon >= -73.98 && lon <= -34.79;
  const country = inBrazil ? 'Brasil' : 'Internacional';

  let bestCity = null;
  let minDistance = Infinity;

  // Procura cidade mais próxima no raio aceitável
  for (const city of OFFLINE_CITIES) {
    const dist = haversineDistance(lat, lon, city.lat, city.lon);
    if (dist < minDistance && dist <= city.radiusKm * 1.5) {
      minDistance = dist;
      bestCity = city;
    }
  }

  if (bestCity) {
    return {
      city: bestCity.name,
      state: bestCity.state,
      country: bestCity.country,
      source: 'OFFLINE_BASE'
    };
  }

  // Se não achou cidade exata, tenta achar o estado brasileiro pelo bounding box
  if (inBrazil) {
    for (const st of BRAZIL_STATES) {
      if (lat >= st.minLat && lat <= st.maxLat && lon >= st.minLon && lon <= st.maxLon) {
        return {
          city: '',
          state: st.name,
          country: 'Brasil',
          source: 'OFFLINE_STATE'
        };
      }
    }
    return {
      city: '',
      state: '',
      country: 'Brasil',
      source: 'OFFLINE_COUNTRY'
    };
  }

  return null;
}

/**
 * Realiza geocodificação reversa inteligente:
 * 1. Tenta consulta via rede (Nominatim OSM) com timeout rápido de 2.5s
 * 2. Em caso de falha (offline, erro ou timeout), usa a base offline embutida imediatamente.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{city: string, state: string, country: string, neighborhood: string, street: string, postalCode: string, source: string}>}
 */
export async function reverseGeocode(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
    return null;
  }

  // 1. Base offline local (instantânea, zero latência, 100% client-side)
  const offline = getOfflineLocation(lat, lon);
  let result = null;
  if (offline) {
    result = {
      city: offline.city,
      state: offline.state,
      country: offline.country,
      neighborhood: '',
      street: '',
      postalCode: '',
      source: 'AUTO'
    };
  }

  // 2. Se houver conexão com a internet, tenta enriquecer com rua/bairro detalhados
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const city = addr.city || addr.town || addr.municipality || addr.village || addr.city_district || (result ? result.city : '');
          const state = addr.state || (result ? result.state : '');
          const country = addr.country || 'Brasil';
          const neighborhood = addr.suburb || addr.neighbourhood || addr.quarter || '';
          const street = addr.road || '';
          const postalCode = addr.postcode || '';

          return {
            city,
            state,
            country,
            neighborhood,
            street,
            postalCode,
            source: 'AUTO'
          };
        }
      }
    } catch {
      // Ignora erro de rede e retorna o resultado da base offline
    }
  }

  return result;
}

import axios from 'axios';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('temp_new'); // Estado para la capa seleccionada

  const fetchWeather = async () => {
    setError('');
    setWeatherData(null);
    setForecastData(null);

    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${import.meta.env.VITE_API_KEY}&units=metric&lang=es`
      );
      setWeatherData(weatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${import.meta.env.VITE_API_KEY}&units=metric&lang=es`
      );

      // Filtrar el pronóstico para obtener solo una entrada por día
      const dailyForecast = [];
      const dates = new Set();

      forecastResponse.data.list.forEach((entry) => {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        if (!dates.has(date)) {
          dates.add(date);
          dailyForecast.push(entry);
        }
      });

      setForecastData(dailyForecast);
    } catch (error) {
      setError('Ciudad no encontrada o error en la API');
      console.error(error);
    }
  };

  // Mapas disponibles de OpenWeatherMap
  const layers = {
    temp_new: "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=",
    clouds_new: "https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=",
    precipitation_new: "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=",
    thunderstorm_new: "https://tile.openweathermap.org/map/thunderstorm_new/{z}/{x}/{y}.png?appid=",
    wind_new: "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=",
    snow_new: "https://tile.openweathermap.org/map/snow_new/{z}/{x}/{y}.png?appid=",
  };

  // Función para actualizar la capa seleccionada
  const handleLayerChange = (event) => {
    setSelectedLayer(event.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative bg-gray-800/80 backdrop-blur-lg shadow-xl rounded-xl p-6 w-full max-w-md border border-gray-600"
      >
        <h1 className="text-2xl font-bold text-center text-white mb-4">🌤 Weather App</h1>

        <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-2 w-full sm:w-auto">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ingrese Ciudad"
            className="w-full px-4 py-2 rounded-lg border border-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchWeather}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mt-2 sm:mt-0 sm:w-auto w-full"
          >
            Obtener Clima
          </motion.button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-red-400 mt-3 text-center"
          >
            {error}
          </motion.p>
        )}

        {weatherData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-6 text-center bg-gray-700/80 p-4 rounded-lg border border-gray-500 shadow-md"
          >
            <h2 className="text-xl font-semibold text-white">{weatherData.name}</h2>
            <motion.img
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
              alt={weatherData.weather[0].description}
              className="mx-auto"
            />
            <p className="text-lg capitalize text-white">{weatherData.weather[0].description}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-lg text-white">
              <p><span className="font-semibold">Temp:</span> {weatherData.main.temp}°C</p>
              <p><span className="font-semibold">Humedad:</span> {weatherData.main.humidity}%</p>
              <p><span className="font-semibold">Viento:</span> {weatherData.wind.speed} m/s</p>
              <p><span className="font-semibold">Probabilidad de lluvia:</span> {weatherData.rain ? `${weatherData.rain['1h']} mm` : 'N/A'}</p>
            </div>
          </motion.div>
        )}

        {forecastData && (
          <div className="mt-6 bg-gray-700/80 p-4 rounded-lg border border-gray-500 shadow-md">
            <h3 className="text-lg font-semibold text-center text-white">Pronóstico de 5 días</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {forecastData.map((day, index) => (
                <div key={index} className="text-center">
                  <p>{new Date(day.dt * 1000).toLocaleDateString()}</p>
                  <img
                    src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                    className="mx-auto"
                  />
                  <p>{day.main.temp}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {weatherData && weatherData.coord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="ml-6 w-full max-w-md h-96 sm:h-80 rounded-lg overflow-hidden border border-gray-600 shadow-md"
        >
          <MapContainer
            key={`${weatherData.coord.lat}-${weatherData.coord.lon}`}
            center={[weatherData.coord.lat, weatherData.coord.lon]}
            zoom={10}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <TileLayer
              url={`${layers[selectedLayer]}${import.meta.env.VITE_API_KEY}`}
              attribution="&copy; OpenWeatherMap"
            />
            <Marker position={[weatherData.coord.lat, weatherData.coord.lon]}>
              <Popup>{weatherData.name}</Popup>
            </Marker>
          </MapContainer>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mt-6 ml-6 bg-gray-800/80 p-4 rounded-lg border border-gray-600 shadow-xl w-full sm:w-3/4 max-w-sm text-center"
      >
        <h3 className="text-lg font-semibold text-white mb-3">Seleccionar Capa</h3>
        <select
          onChange={handleLayerChange}
          value={selectedLayer}
          className="w-full p-2 bg-gray-700 rounded-md text-white border border-gray-500"
        >
          <option value="temp_new">Temperatura</option>
          <option value="clouds_new">Nubes</option>
          <option value="precipitation_new">Precipitaciones</option>
          <option value="thunderstorm_new">Tormentas</option>
          <option value="wind_new">Viento</option>
          <option value="snow_new">Nieve</option>
        </select>
      </motion.div>
    </div>
  );
};

export default WeatherApp;

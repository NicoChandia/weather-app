import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/weather", async (req, res) => {
  try {
    const { city } = req.query;
    const apiKey = process.env.VITE_API_KEY;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener datos meteorológicos" });
  }
});

app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto
 ${PORT}`));

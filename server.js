import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

// Configurações de caminho para servir arquivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir HTML e outros arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Configuração do Multer para salvar arquivos com extensão
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Webhook do Discord
const webhookURL = "https://discord.com/api/webhooks/https://discord.com/api/webhooks/1434250571191160834/Kd9p4Zi8cZrl-zFz3DVBPsAEagwy6DpXJ2KWKmfu7zoDcgxo_2Y215mloSbUVJ8aGrGV";

// Rota para envio do formulário
app.post("/enviar", upload.single("print_discord"), async (req, res) => {
  try {
    const data = req.body;

    // Monta a mensagem
    const message = `
\`\`\`diff
+ **Novo Subdono Candidato**
+ Nome: ${data.nome}
+ Nick In-Game: ${data.nick}
+ Nick do Discord: ${data.nick_discord}
+ Idade: ${data.idade}
+ Discord: ${data.discord}
+ Horas/dia: ${data.horas}
+ Experiência: ${data.experiencia}
+ Tempo no Servidor: ${data.tempo_servidor}
+ Participação: ${data.participacao}
+ Regras: ${data.regras}
+ Contribuição Discord: ${data.discord_servidor}
+ Link Discord: ${data.link_discord}
+ Plugins: ${data.plugins}
+ Tipo de servidor: ${data.tipo_servidor}
+ Disponibilidade: ${data.preparacao}
+ Motivação: ${data.motivacao}
+ Situações de conflito: ${data.situacoes}
+ Ideias: ${data.ideias}
+ Fidelidade: ${data.fidelidade}
+ Sabe o que faz um dono: ${data.sabe_dono}
+ Situações extremas: ${data.situacoes_extremas}
+ Discord > 1 ano?: ${data.discord_ano}
+ Possui PC?: ${data.pc_obrigatorio}
\`\`\`
`;

    // Cria FormData para enviar para o Discord
    const form = new FormData();
    form.append("payload_json", JSON.stringify({
      content: message,
      embeds: req.file ? [{ title: "Print da conta Discord", image: { url: `attachment://${req.file.filename}` } }] : []
    }));

    if (req.file) {
      form.append("file", fs.createReadStream(req.file.path), req.file.filename);
    }

    // Envia para o Discord
    await axios.post(webhookURL, form, { headers: form.getHeaders() });

    // Remove arquivo temporário
    if (req.file) fs.unlinkSync(req.file.path);

    res.json({ success: true, message: "Formulário enviado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao enviar formulário." });
  }
});

// Inicializa servidor
app.listen(port, () => console.log(`✅ Servidor rodando em http://localhost:${port}`));


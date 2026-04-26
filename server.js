const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= CONFIG ================= */
const PORT = 3000;

// 🔴 COLOQUE SEU TOKEN AQUI
const client = new mercadopago.MercadoPagoConfig({
  accessToken: "SEU_ACCESS_TOKEN"
});

const { Payment } = mercadopago;

/* ================= PRODUTOS ================= */
let produtos = [
  { id: 1, nome: "Mountain Bike Aro 29", preco: 1299, categoria: "mtb", estoque: 10 },
  { id: 2, nome: "Bike Speed Pro", preco: 2499, categoria: "speed", estoque: 5 },
  { id: 3, nome: "Bike Urbana Confort", preco: 899, categoria: "urbana", estoque: 8 },
  { id: 4, nome: "Bike Infantil", preco: 499, categoria: "infantil", estoque: 15 },
  { id: 5, nome: "Bike Elétrica", preco: 4999, categoria: "eletrica", estoque: 3 },
  { id: 6, nome: "BMX Radical", preco: 999, categoria: "bmx", estoque: 6 }
];

/* ================= ROTAS ================= */

// 🔍 LISTAR PRODUTOS
app.get("/produtos", (req, res) => {
  let { busca, categoria } = req.query;
  let resultado = produtos;

  if (busca) {
    resultado = resultado.filter(p =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }

  if (categoria) {
    resultado = resultado.filter(p => p.categoria === categoria);
  }

  res.json(resultado);
});

// 📦 DETALHE DO PRODUTO
app.get("/produtos/:id", (req, res) => {
  const produto = produtos.find(p => p.id == req.params.id);
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

  res.json(produto);
});

// 🛒 CRIAR PEDIDO
app.post("/pedido", (req, res) => {
  const { itens } = req.body;

  let total = 0;

  for (let item of itens) {
    const produto = produtos.find(p => p.id === item.id);

    if (!produto) {
      return res.status(400).json({ erro: "Produto inválido" });
    }

    if (produto.estoque < item.qtd) {
      return res.status(400).json({ erro: "Sem estoque suficiente" });
    }

    total += produto.preco * item.qtd;
  }

  res.json({ status: "ok", total });
});

// 💳 PAGAMENTO PIX (FORMA CORRETA)
app.post("/pagar", async (req, res) => {
  try {
    const { total, email } = req.body;

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: Number(total),
        description: "Compra BikeStore",
        payment_method_id: "pix",
        payer: {
          email: email || "teste@email.com"
        }
      }
    });

    const data = result.point_of_interaction.transaction_data;

    res.json({
      qr_code: data.qr_code,
      qr_code_base64: data.qr_code_base64
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro no pagamento" });
  }
});

// 📊 ADMIN
app.post("/admin/produtos", (req, res) => {
  const { nome, preco, categoria, estoque } = req.body;

  const novo = {
    id: produtos.length + 1,
    nome,
    preco,
    categoria,
    estoque
  };

  produtos.push(novo);

  res.json({ status: "produto adicionado", produto: novo });
});

/* ================= SERVER ================= */
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
let pedidos = [];

// salvar pedido
app.post("/salvar-pedido", (req, res) => {
    const { itens, total } = req.body;

    const novoPedido = {
        id: pedidos.length + 1,
        itens,
        total,
        data: new Date()
    };

    pedidos.push(novoPedido);

    console.log("Pedido salvo:", novoPedido);

    res.json({ status: "ok", pedido: novoPedido });
});
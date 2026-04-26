// carregar carrinho
function getCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || [];
}

// salvar carrinho
function setCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// adicionar produto
function addCarrinho(produto) {
  let carrinho = getCarrinho();

  const item = carrinho.find(p => p.id === produto.id);

  if (item) item.qtd++;
  else carrinho.push({ ...produto, qtd: 1 });

  setCarrinho(carrinho);
  alert("Adicionado ao carrinho!");
}

// limpar carrinho
function limparCarrinho() {
  localStorage.removeItem("carrinho");
}
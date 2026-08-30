// Gera o canvas.json. A prancha de Auth entra só se o arquivo existir
// localmente — ela não é versionada (ver .gitignore na raiz).
const P1 = [
  ['Botoes.dc.html', 1320, 2400, 'Botões'],
  ['Badges.dc.html', 1320, 2200, 'Badges'],
  ['Selecao.dc.html', 1360, 2400, 'Seleção e menus'],
  ['Tabela.dc.html', 1360, 2000, 'Ferramentas de tabela'],
  ['Auth.dc.html', 1340, 2850, 'Autenticação'],
];
const P2 = [
  ['Main.dc.html', 1180, 2480, 'Fundações'],
  ['Dark.dc.html', 1320, 2280, 'Dark'],
  ['Raio.dc.html', 1240, 1400, 'Raio'],
  ['Antes.dc.html', 1240, 1080, 'Direção do botão'],
  ['Contorno.dc.html', 1280, 2050, 'Contorno e altura'],
];
const P1b = [
  ['Controles.dc.html', 1180, 820, 'Campos e seleção'],
  ['Dados.dc.html', 1180, 1600, 'Dados e feedback'],
];

const row = async (list, page, y) => {
  const out = []; let x = 0;
  for (const [file, w, h, title] of list) {
    if (!(await Bun.file(file).exists())) continue;
    out.push({ file, page, x, y, w, h, title });
    x += w + 120;
  }
  return out;
};

const linha1 = await row(P1, 'page-1', 0);
const alturaMax = Math.max(...linha1.map(a => a.h), 0);
const artboards = [
  ...linha1,
  ...(await row(P1b, 'page-1', alturaMax + 140)),
  ...(await row(P2, 'page-2', 0)),
];

const canvas = {
  pages: [
    { id: 'page-1', name: 'Componentes' },
    { id: 'page-2', name: 'Fundações e decisões' },
  ],
  artboards,
  annotations: [
    { id: 'note-1', page: 'page-1', x: -360, y: 40, w: 300,
      text: 'Toda folha de componente tem as duas metades: a clara em cima, a escura no bloco do fim. Decisão nova entra nas duas na mesma entrega.' },
    { id: 'note-2', page: 'page-1', x: 4360, y: -300, w: 320,
      text: 'A barra de ferramentas da linha: cinco ícones, zero palavra.\n\nO preço de não escrever nada é tooltip em todas e aria-label em todas. E no toque não existe hover: lá vira um único botão de 44px.' },
    { id: 'note-3', page: 'page-2', x: -360, y: 40, w: 300,
      text: 'As decisões que sustentam a página de Componentes: papel quente e tinta fria, raio por razão (÷5), fill fora do botão, e as três regras de tradução para o escuro.' },
  ],
  launch: { view: 'canvas', page: 'page-1' },
};
await Bun.write('canvas.json', JSON.stringify(canvas, null, 2) + '\n');
console.log(`canvas.json — ${artboards.length} pranchas` +
  (artboards.some(a => a.file === 'Auth.dc.html') ? ' (Auth incluída, local)' : ' (sem Auth)'));

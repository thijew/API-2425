import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

const allCategories = [
  { id: 0, name: "Miscellaneous" },
  { id: 1, name: "Ammo" },
  { id: 2, name: "Arrows" },
  { id: 3, name: "Bolts" },
  { id: 4, name: "Construction materials" },
  { id: 5, name: "Construction products" },
  { id: 6, name: "Cooking ingredients" },
  { id: 7, name: "Costumes" },
  { id: 8, name: "Crafting materials" },
  { id: 9, name: "Familiars" },
  { id: 10, name: "Farming produce" },
  { id: 11, name: "Fletching materials" },
  { id: 12, name: "Food and Drink" },
  { id: 13, name: "Herblore materials" },
  { id: 14, name: "Hunting equipment" },
  { id: 15, name: "Hunting Produce" },
  { id: 16, name: "Jewellery" },
  { id: 17, name: "Mage armour" },
  { id: 18, name: "Mage weapons" },
  { id: 19, name: "Melee armour - low level" },
  { id: 20, name: "Melee armour - mid level" },
  { id: 21, name: "Melee armour - high level" },
  { id: 22, name: "Melee weapons - low level" },
  { id: 23, name: "Melee weapons - mid level" },
  { id: 24, name: "Melee weapons - high level" },
  { id: 25, name: "Mining and Smithing" },
  { id: 26, name: "Potions" },
  { id: 27, name: "Prayer armour" },
  { id: 28, name: "Prayer materials" },
  { id: 29, name: "Range armour" },
  { id: 30, name: "Range weapons" },
  { id: 31, name: "Runecrafting" },
  { id: 32, name: "Runes, Spells and Teleports" },
  { id: 33, name: "Seeds" },
  { id: 34, name: "Summoning scrolls" },
  { id: 35, name: "Tools and containers" },
  { id: 36, name: "Woodcutting product" },
  { id: 37, name: "Pocket items" },
  { id: 38, name: "Stone spirits" },
  { id: 39, name: "Salvage" },
  { id: 40, name: "Firemaking products" },
  { id: 41, name: "Archaeology materials" },
  { id: 42, name: "Wood spirits" },
  { id: 43, name: "Necromancy armour" }
];

app.get('/', async (req, res) => {
  const html = await engine.renderFile('server/views/index', {
    title: 'RuneScape GE Categories',
    categories: allCategories,
  });
  res.send(html);
});

app.get('/category/:id', async (req, res) => {
  const categoryId = req.params.id;

  try {
    const response = await fetch(
      `https://secure.runescape.com/m=itemdb_rs/api/catalogue/category.json?category=${categoryId}`
    );
    const data = await response.json();
    console.log(categoryId);

    const selectedCategory = allCategories.find(c => c.id == categoryId);

    const html = await engine.renderFile('server/views/category', {
      title: `Items in ${selectedCategory?.name || 'onbekend'}`,
      alpha: data.alpha,
      categoryId
    });

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Fout bij ophalen van categorie');
  }
});




// 🧠 Route: Homepage → toon subcategorieën van Ammo
// app.get('/', async (req, res) => {
//   try {
//     const response = await fetch(
//       'https://secure.runescape.com/m=itemdb_rs/api/catalogue/category.json?category=1'
//     )
//     const data = await response.json()
//     console.log(data)

//     const categories = data.alpha

//     const html = await engine.renderFile('server/views/index.liquid', {
//       title: 'RuneScape Ammo Categories',
//       categories,
//       data,
//     })

//     res.send(html)
//   } catch (err) {
//     console.error(err); // 👈 debug info
//     res.status(500).send('Fout bij ophalen van data')
//   }
// });

app
  .use(logger())
  .use('/', sirv('dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));
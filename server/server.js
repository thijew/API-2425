import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

const categoryNames = {
  0: "Miscellaneous",
  1: "Ammo",
  2: "Arrows",
  3: "Bolts",
  4: "Construction materials",
  5: "Construction products",
  6: "Cooking ingredients",
  7: "Costumes",
  8: "Crafting materials",
  9: "Familiars",
  10: "Farming produce",
  11: "Fletching materials",
  12: "Food and Drink",
  13: "Herblore materials",
  14: "Hunting equipment",
  15: "Hunting Produce",
  16: "Jewellery",
  17: "Mage armour",
  18: "Mage weapons",
  19: "Melee armour - low level",
  20: "Melee armour - mid level",
  21: "Melee armour - high level",
  22: "Melee weapons - low level",
  23: "Melee weapons - mid level",
  24: "Melee weapons - high level",
  25: "Mining and Smithing",
  26: "Potions",
  27: "Prayer armour",
  28: "Prayer materials",
  29: "Range armour",
  30: "Range weapons",
  31: "Runecrafting",
  32: "Runes, Spells and Teleports",
  33: "Seeds",
  34: "Summoning scrolls",
  35: "Tools and containers",
  36: "Woodcutting product",
  37: "Pocket items",
  38: "Stone spirits",
  39: "Salvage",
  40: "Firemaking products",
  41: "Archaeology materials",
  42: "Wood spirits",
  43: "Necromancy armour"
};



app.get('/', async (req, res) => {
  // Zet de map om in een array van categorieën
  const categories = Object.entries(categoryNames).map(([id, name]) => ({
    id: Number(id),
    name
  }));


  const html = await engine.renderFile('server/views/index', {
    title: 'RuneScape GE Categories',
    categories
  });

  res.send(html);
});



app.get('/category/:id/:letter?', async (req, res) => {
  const categoryId = req.params.id;
  const alpha = req.params.letter || 'a';
  const page = req.query.page || 1;

  try {
    // Haal dynamisch de categorieën op
    const categories = Object.entries(categoryNames).map(([id, name]) => ({
      id: Number(id),
      name
    }));
    const selectedCategory = categories.find(c => c.id == Number(categoryId));


    const categoryUrl = `https://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?category=${categoryId}&alpha=${alpha}&page=${page}`;
    const response = await fetch(categoryUrl);
    const data = await response.json();
    console.log(data);

    // Voeg "type" toe per item (detail endpoint)
    const itemsWithDetails = await Promise.all(
      data.items.map(async item => {
        const detailUrl = `https://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=${item.id}`;
        try {
          const detailResponse = await fetch(detailUrl);
          const detailData = await detailResponse.json();
          return {
            ...item,
            type: detailData.item?.type || 'Onbekend'
          };
        } catch {
          return {
            ...item,
            type: 'Onbekend'
          };
        }
      })
    );

    const html = await engine.renderFile('server/views/category', {
      title: `Items in ${selectedCategory?.name || 'Onbekend'}`,
      categories,
      selectedCategory,
      items: itemsWithDetails,
      alpha,
      categoryId,
      page
    });

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Fout bij ophalen van categorieën of items');
  }
});


app.get('/npc/hans', async (req, res) => {
  const npcAppearance = 'AP--AAA-----------------'; // Hans

  // Of je gebruikt een aangepaste appearance string met echte items
  const appearanceString = 'AAAAAAABcgABHAEmAWEBIgEqA*SzIwAAAAAAABAQyAAAAAAAAAAAAAAAAAAAAAAKiwAAAA';

  try {
    const response = await fetch(`https://services.runescape.com/m=adventurers-log/avatardetails.json?details=${npcAppearance}`);
    const data = await response.json();

    const html = await engine.renderFile('server/views/npc', {
      title: 'NPC Hans met Gear',
      npcAppearance: appearanceString,
      wornItems: data.worn,
      stats: data,
    });

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Kon Hans\' items niet ophalen');
  }
});


app
  .use(logger())
  .use('/', sirv('dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));
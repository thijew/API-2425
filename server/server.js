import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';

const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();

// 🧠 Route: Homepage → toon subcategorieën van Ammo
app.get('/', async (req, res) => {
  try {
    const response = await fetch(
      'https://secure.runescape.com/m=itemdb_rs/api/catalogue/category.json?category=1'
    )
    const data = await response.json()

    const categories = data.letter

    const html = await engine.renderFile('server/views/index.liquid', {
      title: 'RuneScape Ammo Categories',
      categories
    })

    res.send(html)
  } catch (err) {
    console.error(err); // 👈 debug info
    res.status(500).send('Fout bij ophalen van data')
  }
});

app
  .use(logger())
  .use('/', sirv('dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));
import express from 'express';
import { api_v1 } from './api_v1.js';
import { generateHomepage, getHomepage } from '../frontend/ssg.js';

function runApi() {
	const app = express();
	const port = parseInt(process.env.PORT || '3000');

	app.use(express.json());
	app.use('/static/', express.static('public'));

	app.use('/api/v1', api_v1());

	app.get('/', async (req, res) => {
		const homepage = await generateHomepage();
		res.send(homepage);
		//res.sendFile(absolutePath('public/index.html'));
	});

	app.listen(port, () => {
		console.log(`API server running on port ${port}`);
	});
}

export { runApi };

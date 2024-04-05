import { asyncForeach } from "../utils/async-foreach.js";

interface FetchTask {
	url: string;
	resolve: (value: Response | PromiseLike<Response>) => void;
	reject: (reason?: any) => void;
}

const domainQueues: Record<string, FetchTask[]> = {};

let workerRunning = false;
const runWorker = async () => {
	if (workerRunning) return;
	workerRunning = true;
	while (true) {
		let queueLength = Object.values(domainQueues).reduce((acc, val) => acc + val.length, 0);

		if (queueLength === 0) {
			workerRunning = false;
			return;
		}

		// Pick domain queue using round-robin
		for (const [domain, queue] of Object.entries(domainQueues)) {
			if (queue.length === 0) {
				delete domainQueues[domain];
				continue;
			}

			const task = queue.shift();
			if (!task) {
				continue;
			};

			// Fetch task
			console.log(`[Fetch worker]: Queue: ${queueLength} | Fetching: ${task.url}`);
			queueLength--;
			try {
				const response = await fetch(task.url);
				task.resolve(response);
			} catch (e) {
				task.reject(e);
			}
		};
	}
};

const fetchTask = (url: string): Promise<Response> => {
	return new Promise<Response>((resolve, reject) => {
		const domain = new URL(url)?.hostname ?? 'default';
		const task = {
			url,
			resolve,
			reject
		};

		if (!domainQueues[domain]) domainQueues[domain] = [ task ];
		else domainQueues[domain].push(task);

		runWorker();
	});
};
export { fetchTask };

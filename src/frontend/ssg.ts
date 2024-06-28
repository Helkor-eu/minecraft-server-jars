import { transformJar } from "../api/api_v1.js";
import { getJarsBySoftware, getSoftwareList } from "../lib/indexer.js";
import IndexPage from "./template/index.html.js";
import layout from "./template/layout.html.js";

let homepage = 'We are sorrry, but homepage is generating now. Please try again later.';

export async function generateHomepage() {

	const software = await getSoftwareList();
	const categories = await Promise.all(software.map(async (s) => ({
		software: s,
		jars: await Promise.all((await getJarsBySoftware(s)).map(transformJar)),
	})));

	homepage = layout(IndexPage(categories));
	return homepage;
}

export function getHomepage() {
	return homepage;
}

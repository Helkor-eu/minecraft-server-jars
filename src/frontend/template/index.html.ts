function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

const orderByVersion = (a: string, b: string) => {
	const aParts = a.split(".");
	const bParts = b.split(".");
	for (let i = 0; i < aParts.length; i++) {
		if (aParts[i] === bParts[i]) {
			continue;
		}
		return parseInt(aParts[i]) - parseInt(bParts[i]);
	}
	return 0;
}

export default function IndexPage(categories: any[]) {

return `<h1>Minecraft Server Jars</h1>
<p>
	Download latest Minecraft Server Jars for your Minecraft server! <br />
	All download links lead to official source of software developer.
</p>

<p>You think this site looks ugly? You are right! Dont worry, our design team works on reskin 😎</p>

${categories.map((category) => {
	return `<h2>${capitalizeFirstLetter(category.software)}</h2>${category.jars.sort((a: any,b: any) => orderByVersion(b.gameVersion, a.gameVersion)).map((jar: any) => {
		return `<div>
			<h3>${jar.title}</h3>
			<p>
				Game version: <b>${jar.gameVersion}</b><br />
				${jar.javaVersion ? `Java version: <b>${jar.javaVersion}</b><br />` : ""}
				<a href="${jar.bestDownload}" target="_blank">Download</a>
			</p>
		</div>`;
	}).join("\n")}`;
}).join("<hr />")}
`;
}

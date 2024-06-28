export default function layout(content: string) {
	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Minecraft Server Jars</title>
		</head>
		<body>
			${content}
		</body>
	</html>`;
}

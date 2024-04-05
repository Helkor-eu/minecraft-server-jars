async function asyncForeach<T>(arr: T[], callbackFn: (value: T) => void): Promise<void>
async function asyncForeach<T>(arr: T[], callbackFn: (value: T, index: number) => void): Promise<void>
async function asyncForeach<T>(arr: T[], callbackFn: (value: T, index: number, array: T[]) => void): Promise<void> {
	await Promise.all(arr.map(callbackFn));
}

export { asyncForeach };

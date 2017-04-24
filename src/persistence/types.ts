
interface CRUD<T> {
	create: (candidateData?: Partial<T>) => Promise<string>
	read: (recordId: string) => Promise<T | undefined>
	update: (recordId: string, candidateData: Partial<T>) => Promise<void>
	purge: (recordId: string) => Promise<void>
}


export {
	CRUD
}

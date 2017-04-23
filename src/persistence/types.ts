
interface CRUD<T> {
	create: (candidateRecordId?: string, candidateData?: Partial<T>) => Promise<string>
	read: (recordId: string) => Promise<Partial<T> | undefined>
	update: (recordId: string, candidateData: Partial<T>) => Promise<void>
	purge: (recordId: string) => Promise<void>
}


export {
	CRUD
}

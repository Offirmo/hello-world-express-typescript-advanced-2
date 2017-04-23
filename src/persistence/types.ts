
interface CRUD<T> {
	create: (recordId?: string, data?: Partial<T>) => Promise<string>
	read: (recordId: string) => Promise<Partial<T> | undefined>
	update: (recordId: string, data: Partial<T>) => Promise<Partial<T>>
	purge: (recordId: string) => Promise<void>
}


export {
	CRUD
}

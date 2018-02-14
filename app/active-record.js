const dbConfig = {
    name: 'default',
    version: 1,
    stores: new Map(), 
    conn: null
};

const createConnection = () => 
    new Promise((resolve, reject) => {

        const request = indexedDB.open(dbConfig.dbName, dbConfig.dbVersion);

        request.onupgradeneeded = e => {

            const transactionalConn = e.target.result;
    
            for (let [classKey] of dbConfig.stores) {
                const store = classKey;
                if(transactionalConn.objectStoreNames.contains(store)) 
                    transactionalConn.deleteObjectStore(store);
                transactionalConn.createObjectStore(store, { autoIncrement: true });
            }     
        };

        request.onsuccess = e => {
            dbConfig.conn = e.target.result; 
            resolve();
        }
        
        request.onerror = e => {
            console.log(e.target.error);
            reject('Não foi possível obter a conexão com o banco');
        }; 
    }
);

const save = async function() {

    return new Promise((resolve, reject) => {

        if(!dbConfig.conn) return reject('Você precisa registrar o banco antes de utilizá-lo');

        const object = this;
        const store = this.constructor.name;
        
        const request = dbConfig.conn
            .transaction([store],"readwrite")
            .objectStore(store)
            .add(object);
    
        request.onsuccess = () => resolve();

        request.onerror = e => {
            console.log(e.target.error);
            reject('Não foi possível persistir o objeto');
        };
    });
};
    
const list = async function() {
        
    return new Promise((resolve, reject) => {
    
        const store = this.name;
        
        const transaction = dbConfig.conn
            .transaction([store],'readwrite')
            .objectStore(store); 
        
        const cursor = transaction.openCursor();
    
        const converter = dbConfig.stores.get(store);
    
        const list = [];
    
        cursor.onsuccess = e => {

            const current = e.target.result;

                if(current) {
                    list.push(converter(current.value));
                    current.continue();
            } else resolve(list);
        };

        cursor.onerror = e => {
            console.log(target.error);
            reject(`Não foi possível lista os dados da store ${store}.`);
        };  
    });    
}
    
export const activeRecord = async ({ dbName, dbVersion, mappers}) => {
 
    dbConfig.dbVersion = dbVersion;
    dbConfig.dbName = dbName;
    
    mappers.forEach(mapper => {
        dbConfig.stores.set(mapper.clazz.name, mapper.converter);
        mapper.clazz.prototype.save = save;
        mapper.clazz.list = list;
    });

    await createConnection();
}
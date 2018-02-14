import { activeRecord } from './active-record.js';
import { Person } from './Person.js';
import { Animal } from './Animal.js';

(async () => {
    await activeRecord({
        dbName: 'cangaceiro',
        dbVersion: 3, 
        mappers: [
            { 
                clazz: Person,
                converter: data => new Person(data._name)
            },
            { 
                clazz: Animal,
                converter: data => new Animal(data._name)
            }
        ]
    });
        
    const person = new Person('Flávio Almeida');
    const animal = new Animal('Calopsita');

    await person.save();
    await animal.save();

    const persons = await Person.list();
    persons.forEach(console.log);

    const animals = await Animal.list();
    animals.forEach(console.log);

})().catch(console.log);

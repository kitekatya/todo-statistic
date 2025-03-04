const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();
const comments = getComments();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function getComments() {
    const regexp = /\/\/ TODO .*\r/g;
    const answer = [];
    for (const content of files) {
        answer.push([...content.matchAll(regexp)].map(match => match[0]));
    }
    return answer.flat();
}

function showSort(command){
    switch (command) {
        case 'importance':
            comments.sort((a, b) => b.includes('!') - a.includes('!')).forEach(a => console.log(a));
            break;
        case 'user':
            const userTasks = new Map();
            const noUserTasks = [];

            comments.forEach(comment => {
                const match = comment.match(/\/\/ TODO (.+);.*;.*/i); // Ищем имя пользователя перед `:`
                if (match) {
                    const user = match[1].toLowerCase();

                    if (!userTasks.has(user)) {
                        userTasks.set(user, []);
                    }
                    userTasks.get(user).push(match[0]);
                } else {
                    noUserTasks.push(comment);
                }
            });

            [...userTasks.entries()]
                .sort(([userA], [userB]) => userA.localeCompare(userB)) // Сортируем пользователей по алфавиту
                .forEach(([user, tasks]) => {
                    console.log(`${user}:`); // Выводим имя пользователя в верхнем регистре
                    tasks.forEach(task => console.log(`  ${task}`));
                });

            if (noUserTasks.length > 0) {
                console.log(`NO USER:`);
                noUserTasks.forEach(task => console.log(`  ${task}`));
            }
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function processCommand(command) {
    const parts = command.split(' ');
    const action = parts[0];
    switch (action) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            comments.forEach(comment => console.log(comment));
            break;
        case 'important':
            for (const todo of comments) {
                if (todo.includes('!')) console.log(todo);
            }
            break;
        case 'user':
            const username = parts.slice(1).join(' ').toLowerCase();
            const userComments = comments.filter(comment => {
                const match = comment.match(/\/\/ TODO (\w+);.*;.*/i);
                return match && match[1].toLowerCase() === username;
            });
            userComments.forEach(comment => console.log(comment));
            break;
        case 'sort':
            const type = parts.slice(1);
            showSort(type[0]);
            break;
        default:
            console.log('wrong command');
            break;
    }
}
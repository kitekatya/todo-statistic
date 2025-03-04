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
                const match = comment.match(/\/\/ TODO (.+);.*;.*/i);
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
                .sort(([userA], [userB]) => userA.localeCompare(userB))
                .forEach(([user, tasks]) => {
                    console.log(`${user}:`);
                    tasks.forEach(task => console.log(`  ${task}`));
                });

            if (noUserTasks.length > 0) {
                console.log(`NO USER:`);
                noUserTasks.forEach(task => console.log(`  ${task}`));
            }
            break;
        case 'date':
            comments.sort((a,b) => new Date(a) - new Date(b))
                .forEach(comment => console.log(comment));
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
        case 'date':
            const dateStr = parts.slice(1).join(' ');
            const datePattern = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;
            const match = dateStr.match(datePattern);
            if (!match) {
                console.log('Invalid date format. Use yyyy, yyyy-mm, or yyyy-mm-dd.');
                break;
            }

            const targetDate = new Date(dateStr);
            comments.filter(comment => {
                const dateMatch = comment.match(/\/\/ TODO .*; (\d{4}-\d{2}-\d{2});/i);
                if (!dateMatch) return false;

                const commentDate = new Date(dateMatch[1]);
                return commentDate >= targetDate;
            }).forEach(comment => console.log(comment));
            break;
        default:
            console.log('wrong command');
            break;
    }
}
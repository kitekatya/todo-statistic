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
        default:
            console.log('wrong command');
            break;
    }
}
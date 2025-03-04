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
    return answer;
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            comments.flat(1).forEach(comment => console.log(comment));
            break;
        default:
            console.log('wrong command');
            break;
    }
}
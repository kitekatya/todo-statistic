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

function showTable(arr) {
    const rows = arr.map(parseComment);
    const colWidths = { Importance: 1, User: 10, Date: 10, Comment: 50 };

    function formatText(text, width) {
        return text.length > width ? text.slice(0, width - 3) + '...' : text.padEnd(width);
    }

    const header = ` ${'!'.padEnd(colWidths.Importance)} | ${'User'.padEnd(colWidths.User)} | ${'Date'.padEnd(colWidths.Date)} | ${'Comment'.padEnd(colWidths.Comment)} `;
    console.log(header);
    console.log('-'.repeat(header.length));

    rows.forEach(row => {
        console.log(
            ` ${formatText(row.Importance, colWidths.Importance)} | ` +
            `${formatText(row.User, colWidths.User)} | ` +
            `${formatText(row.Date, colWidths.Date)} | ` +
            `${formatText(row.Comment, colWidths.Comment)} `
        );
    });
}


function parseComment(comment) {
    const match = comment.match(/\/\/ TODO (.*);(.*);(.*)/i);
    if (match) {
        return {
            Importance: comment.includes('!') ? '!' : '',
            User: match[1] || '—',
            Date: match[2] || '—',
            Comment: match[3] || comment.replace('// TODO ', '')
        };
    } else {
        return {
            Importance: comment.includes('!') ? '!' : '',
            User: '—',
            Date: '—',
            Comment: comment.replace('// TODO ', '')
        };
    }
}


function showSort(command){
    switch (command) {
        case 'importance':
            showTable(comments.sort((a, b) => b.includes('!') - a.includes('!')));
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
                    userTasks.get(user).push(comment);
                } else {
                    noUserTasks.push(comment);
                }
            });

            const sortedTasks = [...userTasks.entries()]
                .sort(([userA], [userB]) => userA.localeCompare(userB))
                .flatMap(([, tasks]) => tasks); 

            showTable([...sortedTasks, ...noUserTasks]);
            break;
        case 'date':
            showTable(comments.sort((a,b) => new Date(a) - new Date(b)));
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
            showTable(comments);
            break;
        case 'important':
            showTable(comments.filter(x => x.includes('!')));
            break;
        case 'user':
            const username = parts.slice(1).join(' ').toLowerCase();
            const userComments = comments.filter(comment => {
                const match = comment.match(/\/\/ TODO (\w+);.*;.*/i);
                return match && match[1].toLowerCase() === username;
            });
            showTable(userComments);
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
            showTable(comments.filter(comment => {
                const dateMatch = comment.match(/\/\/ TODO .*; (\d{4}-\d{2}-\d{2});/i);
                if (!dateMatch) return false;

                const commentDate = new Date(dateMatch[1]);
                return commentDate >= targetDate;
            }));
            break;
        default:
            console.log('wrong command');
            break;
    }
}
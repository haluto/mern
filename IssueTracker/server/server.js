const express = require('express');
const bodyParser = require('body-parser');
const Issue = require('./issue.js');

const app = express();
app.use(express.static('static'));
app.use(bodyParser.json());

const issues = [
    {
        id: 1, status: 'Open', owner: 'Ravan',
        created: new Date('2016-08-15'), effort: 5, completionDate: undefined,
        title: 'Error in console when clicking Add',
    },
    {
        id: 2, status: 'Assigned', owner: 'Eddie',
        created: new Date('2016-08-16'), effort: 14, 
        completionDate: new Date('2016-08-30'),
        title: 'Missing bottom border on panel',
    },
];

app.get('/api/issues', (req, res) => {
    const metadata = {total_count: issues.length};
    //console.log("server response /api/issues.");
    res.json({__metadata: metadata, records: issues});
    //res.set('Content-Type', 'application/json');
    //res.send(JSON.stringify({__metadata: metadata, records: issues}));

});

app.post('/api/issues', (req, res) => {
    const newIssue = req.body;
    newIssue.id = issues.length + 1;
    newIssue.created = new Date();
    
    if(!newIssue.status) {
        newIssue.status = 'New';
    }
    
    //validation
    const err = Issue.validateIssue(newIssue);
    if(err) {
        res.status(422).json({message: `Invalid requrest: ${err}`});
        return;
    }

    issues.push(newIssue);
    console.log("response new added issue to clinet: ", newIssue);
    res.json(newIssue);
});

app.listen(3001, function() {
    console.log('App started on port 3001');
});

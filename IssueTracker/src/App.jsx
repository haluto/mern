
import React from 'react';
import ReactDOM from 'react-dom';
import IssueAdd from './IssueAdd.jsx';

const contentNode = document.getElementById('contents');

class IssueFilter extends React.Component {
  render() {
    return (
      <div>a placeholder for the issue filter</div>
    );
  }
}

class IssueRow extends React.Component {
  render() {
      const issue = this.props.issue;
      return (
          <tr>
              <td>{issue.id}</td>
              <td>{issue.status}</td>
              <td>{issue.owner}</td>
              <td>{issue.created.toDateString()}</td>
              <td>{issue.effort}</td>
              <td>{issue.completionDate ? 
                      issue.completionDate.toDateString() : '' }</td>
              <td>{issue.title}</td>
          </tr>
      );
  }
}

class IssueTable extends React.Component {
  render() {
      const issueRows = this.props.issues.map(
          issue => <IssueRow key={issue.id} issue={issue}></IssueRow>);
      console.log(issueRows);
      return (
          <table className="bordered-table">
              <thead>
                  <tr>
                      <th>Id</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th>Created</th>
                      <th>Effort</th>
                      <th>Completion Date</th>
                      <th>Title</th>
                  </tr>
              </thead>
              
              <tbody>{issueRows}</tbody>
          </table>
      );
  }
}

class IssueList extends React.Component {
  constructor() {
    super();
    this.state = {issues: []};

    this.createIssue = this.createIssue.bind(this);
  }

  loadData() {
    fetch('/api/issues').then(response => response.json()
    ).then(data => {
      console.log("Total count of records:", data.__metadata.total_count);
      data.records.forEach(issue => {
        issue.created = new Date(issue.created);
        if(issue.completionDate)
          issue.completionDate = new Date(issue.completionDate);
      });
      this.setState({issues:data.records});
    }).catch(err => {
      console.log(err);
    });
  }

  componentDidMount() {
    this.loadData();
  }

  createIssue(newIssue) {
    fetch('/api/issues', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newIssue),
    }).then(response => {
      if(response.ok) {
        response.json().then(updatedIssue => {
          console.log("response issue from server: ", updatedIssue);
          updatedIssue.created = new Date(updatedIssue.created);
          if(updatedIssue.completionDate)
            updatedIssue.completionDate = new Date(updatedIssue.completionDate);
          // 将服务器返回的新issue加到本地，不从服务器更新整个列表
          const newIssues = this.state.issues.concat(updatedIssue);
          this.setState({issues: newIssues});
        });
      } else {
        response.json().then(error => {
          alert("Failed to add issue: " + error.message);
        });
      }
    }).catch(err => {
      alert("Error in sending data to server: " + err.message);
    });
  }

  render() {
    return (
      <div>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable issues={this.state.issues} />
        <hr />
        <IssueAdd createIssue={this.createIssue}/>
      </div>
    );
  }
}

ReactDOM.render(<IssueList />, contentNode);
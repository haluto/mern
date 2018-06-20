[TOC]

# 快速调试

为调试方便，安装一些自动执行的插件，记录在文档头部，具体信息在各个章节中。

* 启动服务器：

```shell
$ npm start
```

* [修改JSX文件后自动编译为JS：](#自动化)

```shell
$ npm run watch
```

* [修改服务器js后自动重启服务器：](#服务器自动重启)

```shell
$ npm start
```

这里直接将start命令定义成重启服务器的命令了。

# Hello World

## 脱离服务器的hello world

```html
<!DOCTYPE HTML>

<html>

<head>
  <meta charset="UTF-8" />
  <title>
    Pro MERN Stack
  </title>
  <script src=
    "https://cdnjs.cloudflare.com/ajax/libs/react/15.2.1/react.js">
  </script>
  <script src=
    "https://cdnjs.cloudflare.com/ajax/libs/react/15.2.1/react-dom.js">
  </script>
  <script src=
    "https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js">
  </script>
</head>

<body>
  <div id="contents"></div>
  <script type="text/babel">
    var contentNode = document.getElementById('contents');
    var component = <h1>Hello World</h1>;
    ReactDOM.render(component, contentNode);
  </script>
</body>

</html>
```

* `type="text/babel"`表示其内容是JSX，而非普通JavaScript。babel编译器会将这样的脚本元素编译为JavaScript，然后再注入回来。



## 服务器搭建

如上示例中react和babel都是从内容分发网络（Content Delivery Network，CDN）加载脚本的，这会带来额外的耗时，既不适用于开发环境，也不适用于生产环境。



### nvm

这是Node版本管理工具，能够简化Node.js的安装过程，并能方便地在不同版本之间进行切换。

### Node.js

可从官网下载，如果已安装nvm，可以通过nvm安装：

```shell
$ nvm install node
```

可指定版本：

```shell
$ nvm install 4.5
```

为运行环境指定node版本：

```shell
$ nvm alias default 4.5
```

### 项目
新建项目目录，这里建立demo文件夹，在该目录下执行：
```shell
$ npm init
```
* 所有选项先用默认值，执行完会得到package.json:
```json
{
  "name": "demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

### npm
* 安装Express：
```shell
$ npm install express[@<version>] [-save]
```
* 用`--save`执行安装后，package.json中会多出：
```json
"dependencies": {
    "express": "^4.16.3"
}
```
* 若运行`npm install`时不指定任何选项和参数，就会安装package.json中找到的全部依赖项。
* 选项`--save-dev`会将包添加到devDependencies中（而非dependencies中）。开发依赖项并不会被安装到生产环境中，当环境变量`NODE_ENV`被设置为字符串production时，就表示当前处于生产环境。
* 查看已安装的包：
```shell
$ npm ls [--depth=0]
```
### Express
* 在项目根目录下创建server.js文件：
```js
const express = require('express');

const app = express();
app.use(express.static('static'));

app.listen(3001, function() {
    console.log('App started on port 3001');
});
```
* 接下来在项目目录中创建一个名为static的目录，将前面的index.html移动到该目录。然后启动Web服务器：
```shell
$ npm start
```
* 注意点：
  * 静态文件中间件并不会像特殊对待index.html那样对待其它文件，所以如果改为hello.html，需要通过文件名来访问，像这样：http://localhost:3001/hello.html
  * 想通过不同的路径访问静态文件，就将该中间件生成器助手函数的第一个参数指定为路径前缀。目录名则改成第二个参数。例如：epress.static('/public', 'static')。
  * 默认情况下，`npm start`会运行命令node server.js。如果使用了其它文件名，比如app.js，就需要在package.json的scripts节中添加一行脚本`"start":"node app.js" `，以此来告知npm真正的启动命令。也可以不使用npm，而是使用node app.js来直接启动服务。

## 构建阶段的JSX编译

### 分离脚本文件

* 将index.html中的jsx代码保存到App.jsx中：

  ```html
  <script type="text/babel" src="App.jsx"></script>
  ```

  App.jsx:

  ```js
  var contentNode = document.getElementById('contents');
  var component = <h1>Hello World!</h1>;
  ReactDOM.render(component, contentNode);
  ```

### 转换

* 创建一个目录来存放所有JSX文件，命名为src。把App.jsx移动到该目录。
* 安装babel工具：

```shell
$ npm install --save-dev babel-cli babel-preset-react
```

* 将App.jsx转换为纯JavaScript：

```shell
$ node_modules/.bin/babel src --presets react --out-dir static
```

可以看到static目录下多了App.js：

```js
var contentNode = document.getElementById('contents');
var component = React.createElement(
  'h1',
  null,
  'Hello World!'
);
ReactDOM.render(component, contentNode);
```

* 修改index.html中引用App.jsx为App.js，此时要从脚本定义里把`type="text/babel"`删除，也不再需要index.html加载运行时转换器：

```html
<!--去除加载运行时转换器
<script src=
    "https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js">
</script>
-->
  
<script src="App.js"></script>
```

* 注意
  * babel的第一个参数是来源：可以是一个目录，也可以是单独的文件。--presets react告诉它去运行React(JSX)转换。--out-dir告诉它将文件输出到指定位置（文件名和输入的文件保持一致）。可以使用--out-file来指定任何自定义文件名。

### 自动化

* 在package.json的scripts节中增加命令：

```json
"scripts": {
    "compile": "babel src --presets react --out-dir static",
    "test": "echo \"Error: no test specified\" && exit 1"
}
```

* 运行命令：

```shell
$ npm run compile
```

* 自动编译

在编写客户端代码时会频繁改源文件，每次编译很麻烦，可以通过babel支持的--watch选项来实现，在package.json的scripts节中增加watch命令：

```json
"scripts": {
    "compile": "babel src --presets react --out-dir static",
    "watch": "babel src --presets react --out-dir static --watch",
    "test": "echo \"Error: no test specified\" && exit 1"
}
```

运行命令：

```shell
$ npm run watch
```

它会在一个永久性循环里等待，监测对源文件的改动。对App.jsx进行修改后保存，会自动编译App.js出来。

### React库

### ES2015

* 安装babel插件：

```shell
$ npm install --save-dev babel-preset-es2015
```

* 修改package.json中的npm编译脚本，为其在React转换之外再增加对ES2015的编译。

```json
"scripts": {
    "compile": "babel src --presets react,es2015 --out-dir static",
    "watch": "babel src --presets react,es2015 --out-dir static --watch",
    "test": "echo \"Error: no test specified\" && exit 1"
}
```



# React组件

## React组件组装

* 拷贝上述demo示例工程为一个新项目IssueTracker。
* 编辑App.jsx代码：

```jsx
const contentNode = document.getElementById('contents');

class IssueFilter extends React.Component {
  render() {
    return (
      <div>a placeholder for the issue filter</div>
    );
  }
}

class IssueTable extends React.Component {
  render() {
    return (
      <div>a placeholder for the issue table</div>
    );
  }
}

class IssueAdd extends React.Component {
  render() {
    return (
      <div>a placeholder for an Issue Add entry form</div>
    );
  }
}


class IssueList extends React.Component {
  render() {
    return (
      <div>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable />
        <hr />
        <IssueAdd />
      </div>
    );
  }
}

ReactDOM.render(<IssueList />, contentNode);
```

## 传递数据

### 使用属性

* 在子组件中，可以通过一个特殊的变量this.props来访问来自父组件的所有属性。
* 新增IssueRow组件并修改IssueTable组件：

```jsx
class IssueRow extends React.Component {
  render() {
    const borderedStyle = {border:"1px solid silver", padding:4};
    return (
      <tr>
        <td style={borderedStyle}>{this.props.issue_id}</td>
        <td style={borderedStyle}>{this.props.issue_title}</td>
      </tr>
    );
  }
}

class IssueTable extends React.Component {
  render() {
    const borderedStyle = {border:"1px solid silver", padding:6};
    return (
      <table style={{borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th style={borderedStyle}>Id</th>
            <th style={borderedStyle}>Title</th>
          </tr>
        </thead>
        <tbody>
          <IssueRow issue_id={1}
            issue_title="Error in console when clicking Add" />
          <IssueRow issue_id={2}
            issue_title="Missing bottom border on panel" />
        </tbody>
      </table>
    );
  }
}
```

### 属性校验

* 可以通过React.PropTypes对组件间传递的属性进行类型校验。

```jsx
//在IssueRow类中添加：
...
static get propTypes() {
    return {
        issue_id: React.PropTypes.number.isRequired,
        issue_title: React.PropTypes.string
    };
}
...

//或者可以在IssueRow类声明之外添加：
IssueRow.propTypes = {
    issue_id: React.PropTypes.number.isRequired,
    issue_title: React.PropTypes.string
};

//可以通过defalutProps设置默认值：
IssueRow.defaultProps = {
    issue_title: '-- no title --'
};
```

### 使用Children

* 另一种向其他组件中传递数据的方式，在子组件中使用this.props的一个特殊属性：this.props.children。

```jsx
// 在IssueRow中的修改： 
  {/*
   <td style={borderedStyle}>{this.props.issue_title}</td>
  */}
   <td style={borderedStyle}>{this.props.children}</td>

// 在IssueTable中的修改：
  {/*
  <IssueRow issue_id={1}
    issue_title="Error in console when clicking Add" />
  <IssueRow issue_id={2}
    issue_title="Missing bottom border on panel" />
  */}
  <IssueRow issue_id={1}>Error in console when clicking Add</IssueRow>
  <IssueRow issue_id={2}>Missing bottom <b>border</b> on panel</IssueRow>

//这样就可以把一段带格式的HTML（而不仅是纯文本）直接作为标题内容传递给IssueRow。
```

### 动态组装

* 用数组来传递issue的数据，而不再使用hardcode的内容。后续再替换成从服务器、数据库读取数据。

```jsx
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
```

* 把问题列表issues数组从IssueList传递到IssueTable：

```jsx
...
    <hr />
    <IssueTable issues={issues} />
    <hr />
...
```

* IssueTable的render()方法中，遍历数组然后依次生成IssueRow数组：

```jsx
...
    issues.map(issue => <IssueRow key={issue.id} issue={issue} />);
...
```

**注意：**

**在JSX中不支持使用for循环来代替这个过程，因为JSX并不是一个真正的模板语言。我们必须在render()方法中创建一个变量，然后在JSX中使用它。把两段硬编码的问题组件替换成这个变量，可以让代码具有更好的可读性。**

* 在IssueTable类中，扩展表头来包含所有的字段，并将内嵌的样式换成一个CSS类：

```jsx
class IssueTable extends React.Component {
    render() {
        const issueRows = this.props.issues.map(
            issue => <IssueRow key={issue.id} issue={issue} />);
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
```

* 新的IssueRow类：

```jsx
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
```

* 在index.html中增加一个样式段落：

```html
...
<style>
    table.bordered-table th, td {border: 1px solid silver; padding: 4px;}
    table.bordered-table {border-collapse: collapse};
</style>
...
```

为验证代码方便，列一下修改前的完整App.jsx代码：

```jsx
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
    const borderedStyle = {border:"1px solid silver", padding:4};
    return (
      <tr>
        <td style={borderedStyle}>{this.props.issue_id}</td>
        {/*
        <td style={borderedStyle}>{this.props.issue_title}</td>
        */}
        <td style={borderedStyle}>{this.props.children}</td>
      </tr>
    );
  }
}

class IssueTable extends React.Component {
  render() {
    const borderedStyle = {border:"1px solid silver", padding:6};
    return (
      <table style={{borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th style={borderedStyle}>Id</th>
            <th style={borderedStyle}>Title</th>
          </tr>
        </thead>
        <tbody>
          {/*
          <IssueRow issue_id={1}
            issue_title="Error in console when clicking Add" />
          <IssueRow issue_id={2}
            issue_title="Missing bottom border on panel" />
          */}
          <IssueRow issue_id={1}>Error in console when clicking Add</IssueRow>
          <IssueRow issue_id={2}>Missing bottom <b>border</b> on panel</IssueRow>
        </tbody>
      </table>
    );
  }
}

class IssueAdd extends React.Component {
  render() {
    return (
      <div>a placeholder for an Issue Add entry form</div>
    );
  }
}


class IssueList extends React.Component {
  render() {
    return (
      <div>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable />
        <hr />
        <IssueAdd />
      </div>
    );
  }
}

ReactDOM.render(<IssueList />, contentNode);
```

# Express REST APIs

## TODO： 理论部分

## List API

* 首先实现列出所有问题列表的API，修改server.js：

```js
const express = require('express');

const app = express();
app.use(express.static('static'));

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
    res.json({__metadata: metadata, records: issues});
});

app.listen(3001, function() {
    console.log('App started on port 3001');
});

```

`res.json({__metadata: metadata, records: issues});`相当于下面两行代码：

```js
...
res.set('Content-Type', 'application/json');
res.send(JSON.stringify({__metadata: metadata, records: issues}));
...
```



### 服务器自动重启

**最佳实践：在开发阶段使用nodemon（因为这时经常需要对代码进行修改），而在生产环境中使用forever（这时最重要的是在程序崩溃时自动重启）。**

* 安装nodemon：

```shell
$ npm install nodemon --save-dev
```

* 启动nodemon（由于在生产环境中，我们不会使用`npm start`直接启动服务器，所以直接修改start指令，不再增加新的指令），修改package.json：

```json
...
"scripts": {
    "start": "nodemon -w server.js server.js",
...
```

命令行参数-w的作用是告诉nodemon要监视哪些文件的修改。如果使用默认的行为，即使我们只修改了前端的代码，nodemon也会重启服务器，这显然不是我们想要的。

### 测试

重启服务器后，

1. 可以在浏览器中输入http://localhost:3001/api/issues来测试。
2. 也可以**使用命令行工具curl进行测试，这是一个可以非常方便地测试各种HTTP方法的工具**（在浏览器中直接输入一个URL，只能模拟一个GET请求）。
3. 也可以安装一些浏览器插件或者App比如Postman（www.getpostman.com/）这样的全功能API测试工具，会让测试更加方便。
4. 也可以使用Chrome的Developer Console来监视网络通信。它也可以自动地解析JSON数据，并以树状视图的方式显示它。

* 以curl为例：

```shell
$ curl -s http://localhost:3001/api/issues | json_pp
```

* Q：使用Chrome浏览器，输入API的终结点URL测试API。打开Developer Console的网络面板，单击刷新。会看到请求的状态码是304,而非200。这是为何？如果问题列表数据被修改了，这会是一个问题吗？

A：Express使用ETags标识一个资源的版本。这是一个哈希值，如果资源发生变化，它也会跟着变化。如果你查看请求的标头，就会看到Chrome会在请求中发送一个ETag标头。这意味着Chrome已经有了资源的一个版本，如果它匹配服务器上的资源的版本，就可以使用缓存的版本。如果问题列表发生变化，这不会是一个问题;参考下一个问题。

* Q：在发送响应之前，打印一条log语句。重启服务器之后，你看到在一个新的请求上发送响应吗？这一次你是期望一个304状态码，还是200呢？这告诉了你Express的什么行为？

A：Express并不会缓存响应，相反，它总是会生成新的响应（就如同log语句所展现的那样）。Express会重新计算哈希，如果哈希值与浏览器的相匹配，它就发送一个304状态码而不发送响应。这种避免不必要网络流量的方法，要比传统的诸如Cache-Control、Max-Age和If-Modified-Since标头等机制稳定得多。

但要注意，这种方法并不能避免生成新响应的开销，生成新响应这个操作总是会被执行。这种优化方式的目的只是节省一些网络流量，而不能节省生成响应所需的运算时间。

综上，当修改资源后重启服务器，可以看到第一次的请求码是200，再次刷新，会是304。

* Q：通过curl查看List API，如果不使用json_pp，会看到没有格式化的json字符串，如果想要返回格式良好的JSON，应当怎么做？

A：通过管道将结果传递给json_pp（JSON pretty-print的简称），可以格式化并更好地输出JSON数据。如果需要总是返回一个格式化好的JSON，可以使用res.send()来代替res.json()，并使用JSON.stringify()来构造返回的JSON字符串。JSON.stringify()允许你通过传入额外的参数来返回一个格式化后的字符串。或者，也可以使用app.set()来设置应用，指定JSON空格参数，这样所有的响应就都会被格式化地打印出来。

#### 用JSON.stringify()实现json_pp的效果

TODO：

## Create API

应用支持添加一个新的问题。需要一个支持添加新问题的Create API。

查看HTTP方法映射，这个API的资源URI应该是/api/issues，方法应该是POST。请求正文中需要包含将要创建的新问题对象。

Express并没有内置可以解析请求正文并将其转换成对象的程序。首先需要安装一个npm程序包来帮助我们完成这个操作。**body-parser程序包可以解析多种类型的请求正文，包括URL Encoded form data和JSON类型**。

* 安装body-parser：

```shell
$ npm install body-parser --save
```

* 在server.js中使用：

```js
...
const bodyParser = require('body-parser');
...
//使用bodyParser.json()创建该中间件，并使用app.use()在应用级别加载它。
app.use(bodyParser.json());
```

* 添加Express路由，来处理对/api/issues的POST请求：

```js
app.post('/api/issues', (req, res) => {
    const newIssue = req.body;
    newIssue.id = issues.length + 1;
    newIssue.created = new Date();
    
    if(!newIssue.status) {
        newIssue.status = 'New';
    }
    
    issues.push(newIssue);
    res.json(newIssue);
});
```

* 使用curl测试Create API：

```shell
$ curl -s http://localhost:3001/api/issues \
  --data '{"title": "Test Test", "owner": "me"}' \
  --header 'Content-Type: application/json' | json_pp
```

注意：

我们**并没有在curl命令行中指定POST方法。这是因为当使用了--data参数时，curl会自动使用POST**。

## 使用List API

接下来我们将在应用程序前端使用List API，需要发起异步API调用（即Ajax调用）。使用流行的jQuery库就很容易进行这样的操作，它包含了一个`$.ajax()`函数。但是如果仅仅因为需要用到jQuery的这个功能，就将整个jQuery库都包含到应用中，未免显得有些过“重”了。

可以使用浏览器原生支持的Fetch API来实现。（Safari和IE暂不支持Fetch，可以通过polyfill来使用fetch()，从CDN中直接使用它，并在index.html中引用：）

```html
...
<script src=
        "https://cdnjs.cloudflare.com/ajax/libs/fetch/1.0.0/fetch.min.js">
</script>
...
```

* 修改IssueList，用List API从服务器获取数据：

```jsx
class IssueList extends React.Component {
  constructor() {
    super();
    this.state = {issues: []};
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

  render() {
    return (
      <div>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable issues={this.state.issues} />
        <hr />
        <IssueAdd />
      </div>
    );
  }
}
```

## 使用Create API

使用fetch() API进行POST方法不仅仅需要提供URL路径，还需要其他一些额外的信息。这些信息以一个可选对象的形式，作为第二个参数传递给fetch()。你需要在这个对象中包括要使用的method、Content Type标头和body。body的值是以JSON格式所表现的新建问题对象。

当请求返回时，你知道服务器端会将新建的问题以JSON格式返回给你。你既可以重新加载整个问题列表，也可以将返回的新建对象附加到当前状态中的现有问题列表中。这里采用第二个方案，因为它要比重新从服务器获取更新的完整列表拥有更好的性能。

* 修改IssueAdd，增加一个form并在点击Add时通过createIssue传递给IssueList：

```jsx
class IssueAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    var form = document.forms.issueAdd;
    this.props.createIssue({
      owner: form.owner.value,
      title: form.title.value,
      status: 'New',
      created: new Date(),
    });
    // clear the form for the next input
    form.owner.value = "";
    form.title.value = "";
  }

  render() {
    return (
      <div>
        <form name="issueAdd" onSubmit={this.handleSubmit}>
          <input type="text" name="owner" placeholder="Owner" />
          <input type="text" name="title" placeholder="Title" />
          <button>Add</button>
        </form>
      </div>
    );
  }
}
```

* 修改IssueList，createIssue函数传递给IssueAdd组件，createIssue实现往服务器添加Issue：

```jsx
...
// constructor中：
this.createIssue = this.createIssue.bind(this);
...
createIssue(newIssue) {
    fetch('/api/issues', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newIssue),
    }).then(response => response.json()
    ).then(updatedIssue => {
      console.log("response issue from server: ", updatedIssue);
      updatedIssue.created = new Date(updatedIssue.created);
      if(updatedIssue.completionDate)
        updatedIssue.completionDate = new Date(updatedIssue.completionDate);
      // 将服务器返回的新issue加到本地，不从服务器更新整个列表
      const newIssues = this.state.issues.concat(updatedIssue);
      this.setState({issues: newIssues});
    }).catch(err => {
      alert("Error in sending data to server: " + err.message);
    });
  }
...
// render()中
<IssueAdd createIssue={this.createIssue}/>
...
```

## 错误处理

调用REST API的结果是成功还是失败，通常会通过HTTP状态码反映出来。在服务器上，发送一个错误很简单：使用res.status()来设置状态码，然后将错误信息作为响应发送回去。
[TOC]

# 快速调试

为调试方便，安装一些自动执行的插件，记录在文档头部，具体信息在各个章节中。

* 启动服务器：

```shell
$ npm start
```

* [修改JSX文件后自动编译为JS：](#自动化)
* 后面使用[webpack执行babel编译和打包](#转换和打包)：

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

* 在server.js中增加错误处理函数，在Create API返回新的issue之前做验证：

```js
const validIssueStatus = {
    New: true,
    Open: true,
    Assigned: true,
    Fixed: true,
    Verified: true,
    Closed: true,
};
const issueFieldType = {
    id: 'required',
    status: 'required',
    owner: 'required',
    effort: 'optional',
    created: 'required',
    completionDate: 'optional',
    title: 'required',
};
function validateIssue(issue) {
    for(const field in issueFieldType) {
        const type = issueFieldType[field];
        if(!type) {
            delete issue[field];
        } else if(type === 'required' && !issue[field]) {
            return `${field} is required.`;
        }
    }

    if(!validIssueStatus[issue.status]) {
        return `${field.status} is not a valid status.`;
    }

    return null;
}

...

app.post('/api/issues', (req, res) => {
    const newIssue = req.body;
    newIssue.id = issues.length + 1;
    newIssue.created = new Date();
    
    if(!newIssue.status) {
        newIssue.status = 'New';
    }
    
    //validation
    const err = validateIssue(newIssue);
    if(err) {
        res.status(422).json({message: `Invalid requrest: ${err}`});
        return;
    }

    issues.push(newIssue);
    console.log("response new added issue to clinet: ", newIssue);
    res.json(newIssue);
});
```

* 在客户端检测未成功的HTTP状态码：

```jsx
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
```

注意：

对于失败的HTTP状态码，Fetch API并不会抛出异常，所以使用一个catch来捕获这种错误是不可行的。我们必须检查响应的属性response.ok，如果它的结果不是OK，就需要显示一个错误。



# 使用MongoDB

## MongoDB基础

几个核心概念：MongoDB、文档、集合。

### 文档

MongoDB是一个文档（document）数据库，也就是说，每条记录都相当于一个文档，或者说是一个对象。在关系型数据库中，必须使用行和列；而在文档数据库中，一个完整的对象可以使用文档的形式写入数据库。

文档是由“字段-值”这样的键值对所组成的结构滑数据形式。字段的值可以是其他的文档、数组，甚至文档的数组。

### 集合

集合（collection）就像是关系型数据库中的表。它是一组文档的集合，通过它，可以访问其中的每一个文档。就像关系型数据库一样，你可以在集合中使用主键、索引，但略有差别。

在MongoDB中，**主键是强制性的，它拥有一个保留的字段名称：_id**。如果在创建文档时没有指定_id字段，MongoDB会为每个文档自动生成一个唯一的主键并保存到该字段中。即使在多个客户端并发写入时，也能够保证主键的唯一性--MongoDB会使用一种成为ObjectId的特殊数据类型作为主键。

_id字段会自动进行索引。此外，也可以在任何一个字段上创建索引，包括嵌入文档和数组类型的字段。使用索引可以高效地访问集合中一组特定的文档。

和关系型数据库不同的是，MongoDB并不需要为集合定义一个架构（schema）。唯一需要确保的，就是所有文档必须包含一个唯一的_id字段值。

### 查询语言

与关系型数据库中看起来像是英语模式的SQL不同，MongoDB的查询语言是通过一组方法来完成各种操作。其中主要用于读写的方法就是CRUD方法，此外还包括聚合（aggregation）、文本检索（text search）和地理信息查询（geospatial queries）。

### 安装

1. 参考[官网](https://docs.mongodb.com/manual/tutorial/)安装MongoDB
2. 启动MongoDB服务器（守护进程mongod）
3. 运行mongo shell来验证：新起一个终端运行`mongo`，如果mongod已启动，则会打印MongoDB版本信息并进入mongo shell命令行模式。

### mongo shell

mongo shell是一个交互式的JavaScript shell，在这个交互式环境中，除了能够利用JavaScript的强大特性之外，也包含一些非JavaScript的便捷操作。完整文档可参考[官网教程](https://docs.mongodb.com/manual/tutorial/)。

或参考[mongodb.md](https://github.com/haluto/notes/blob/master/mongodb.md)

### shell脚本

mongo shell脚本就是一个普通的JavaScript程序，其中可以使用所有的集合方法和内置函数。与交互性shell不同的是，你无法使用便捷的use命令或默认全局变量db，而必须在shell脚本程序中手动地初始化它们，比如：

```js
var db = new Mongo().getDB("dbname");
```

把脚本文件作为mongo shell的启动参数，可以运行脚本：

```shell
$ mongo test.mongo.js
```

## 架构初始化

因为MongoDB并不强制使用一个特定的架构，所以并不需要对架构进行初始化。唯一一件需要做的事就是创建索引：在应用中，对于常用的筛选字段创建索引是非常有必要的。

继续IssueTracker项目。

* 在项目文件夹下创建新目录scripts，创建一个mongo shell脚本init.mongo.js放入scripts中：

```js
db = new Mongo().getDB('issuetracker');

db.issues.remove({});
db.issues.insert([
    {
        status: 'Open', owner: 'Ravan',
        created: new Date('2016-08-15'), effort: 5, completionDate: undefined,
        title: 'Error in console when clicking Add',
    },
    {
        status: 'Assigned', owner: 'Eddie',
        created: new Date('2016-08-16'), effort: 14, 
        completionDate: new Date('2016-08-30'),
        title: 'Missing bottom border on panel',
    },
]);

db.issues.createIndex({ status: 1});
db.issues.createIndex({ owner: 1});
db.issues.createIndex({ created: 1});
```

* 在命令行中运行这个脚本：

```shell
$ mongo scripts/init.mongo.js
```

* 打开mongo shell进行验证：

```shell
#db切换到issuetracker
> use issuetracker

#用find()列出所有文档 -- 应该返回init.mongo.js中插入的两个文档
> db.issues.find()

#用getIndexes()列出所有索引 -- 应该返回init.mongo.js中创建的status、owner、created，以及自动创建的_id共四个索引
> db.issues.getIndexes()
```

## MongoDB Node.js驱动程序

连接MongoDB服务器并与之进行交互的过程，需要通过Node.js驱动程序来完成。它是一个npm模块。

另一种选择是使用mongoose模块，它是一个对象文档映射框架（object-document-mapper）。

* 安装驱动程序：

```shell
$ npm install mongodb --save
```

mongodb模块包含了很多函数和对象，其中MongoClient对象提供了客户端访问的能力，其最主要的方法之一就是connect。connect函数的参数是一个类似URL的字符串，它以mongo://开头，后面紧跟着服务器名称，然后在/分隔符后面再指定数据库名称。

使用collection()方法，提供集合的名称作为参数来访问db中的集合。

* 一个示例：

```js
const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost/playground', function(err, db) {
    db.collection('exployees').find().toArray(function(err, docs) {
        console.log('Result of find:', docs);
        db.close();
    });
});
```

注意：

**驱动程序中的所有调用都是异步的**，我们在上述示例中在所有的MongoDB驱动程序方法中都提供了一个回调函数。MongoDB驱动程序的文档中为我们提供了三种不同的模式来处理这些异步调用：

1. **回调模式**
2. **promise模式**
3. **使用co模块来生成函数**
4. async模块的方式（未在MongoDB驱动程序文档中提及的方法）

* 接下来创建一个名为trymongo.js的脚本来测试和验证这些操作：

```js
// trymongo.js

/*eslint-disable*/
'use strict';
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost';
const dbName = 'playground';
const colName = 'employees';

function testWithCallbacks() {
  MongoClient.connect(url, function(err, client) {
    const col = client.db(dbName).collection(colName);
    col.insertOne({id: 1, name: 'A. Callback'}, function(err, result) {
      console.log("Result of insert:", result.insertedId);
      col.find({id: 1}).toArray(function(err, docs) {
        console.log('Result of find:', docs);
        client.close();
      });
    });
  });
}

function testWithPromises() {
  let client;
  MongoClient.connect(url).then(c => {
    client = c;
    return client.db(dbName).collection(colName).insertOne({id: 1, name: 'B. Promises'});

  }).then(result => {
    console.log("Result of insert:", result.insertedId);
    return client.db(dbName).collection('employees').find({id: 1}).toArray();

  }).then(docs => {
    console.log('Result of find:', docs);
    client.close();

  }).catch(err => {
    console.log('ERROR', err);
  });
}

function testWithGenerator() {
  const co = require('co');
  co(function*() {
    const db = yield MongoClient.connect('mongodb://localhost/playground');

    const result = yield db.collection('employees').insertOne({id: 1, name: 'C. Generator'});
    console.log('Result of insert:', result.insertedId);

    const docs = yield db.collection('employees').find({id: 1}).toArray();
    console.log('Result of find:', docs);

    db.close();
  }).catch(err => {
    console.log('ERROR', err);
  });
}

function testWithAsync() {
  const async = require('async');
  let db;
  async.waterfall([
    next => {
      MongoClient.connect('mongodb://localhost/playground', next);
    },
    (connection, next) => {
      db = connection;
      db.collection('employees').insertOne({id: 1, name: 'D. Async'}, next);
    },
    (insertResult, next) => {
      console.log('Insert result:', insertResult.insertedId);
      db.collection('employees').find({id: 1}).toArray(next);
    },
    (docs, next) => {
      console.log('Result of find:', docs);
      db.close();
      next(null, 'All done');
    }
  ], (err, result) => {
    if (err)
      console.log('ERROR', err);
    else
      console.log(result);
  });
}

function usage() {
  console.log('Usage:');
  console.log('node', __filename, '<option>');
  console.log('Where option is one of:');
  console.log('  callbacks   Use the callbacks paradigm');
  console.log('  promises    Use the Promises paradigm');
  console.log('  generator   Use the Generator paradigm');
  console.log('  async       Use the async module');
}

if (process.argv.length < 3) {
  console.log("Incorrect number of arguments");
  usage();
} else {
  if (process.argv[2] === 'callbacks') {
    testWithCallbacks();
  } else if (process.argv[2] === 'promises') {
    testWithPromises();
  } else if (process.argv[2] === 'generator') {
    testWithGenerator();
  } else if (process.argv[2] === 'async') {
    testWithAsync();
  } else {
    console.log("Invalid option:", process.argv[2]);
    usage();
  }
}
```

[MongoDB3.x版本API](http://mongodb.github.io/node-mongodb-native/3.0/api/)与2.x不同，需要修改。上述示例中只修改了callbacks，promises。

* 运行脚本进行测试：

```shell
$ node node trymongo.js callbacks
$ node node trymongo.js promises
...
```

# 模块化与webpack

## 服务器端模块

服务器端公共模块通过npm install安装，通过**module.exports来导入自己本地文件**。

**我们的目的是将与问题对象（或模型）相关的代码拆分到单独的文件中**。

* 先创建一个名为server的目录来存放所有服务器端文件，将server.js移动到该目录。
* 创建一个名为issue.js的文件，将有关问题验证的所有代码都移到这个文件中：

```js
'use strict';

const validIssueStatus = {
    New: true,
    Open: true,
    Assigned: true,
    Fixed: true,
    Verified: true,
    Closed: true,
};
const issueFieldType = {
    id: 'required',
    status: 'required',
    owner: 'required',
    effort: 'optional',
    created: 'required',
    completionDate: 'optional',
    title: 'required',
};
function validateIssue(issue) {
    for(const field in issueFieldType) {
        const type = issueFieldType[field];
        if(!type) {
            delete issue[field];
        } else if(type === 'required' && !issue[field]) {
            return `${field} is required.`;
        }
    }

    if(!validIssueStatus[issue.status]) {
        return `${field.status} is not a valid status.`;
    }

    return null;
}

module.exports = {
    validateIssue: validateIssue
};
```

'use strict'非常重要。缺少了会使const和let的行为有所不同。

* 在server.js中导入这个模块，修改引用处：

```js
const Issue = require('./issue.js');
...
//validation
    const err = Issue.validateIssue(newIssue);
...
```

* 修改package.json的启动脚本：

```json
"start": "nodemon -w server server/server.js",
```

* 重启服务。



## webpack简介

webpack和Browserify这样的工具提供了一种类似Node.js应用中依赖定义的方式，可以使用require或等价的语句。它们在自动解析依赖关系时，不仅会解析你自己依赖的模块，还会解析第三方库。然后，它们会把这些独立的文件合并到一个或多个捆绑包中。捆绑包是一个囊括了全部所需代码的纯JavaScript文件，可以被引入到HTML文件中。Browserify只做打包的工作，完成完整的任务还需要其它工具配合。

webpack不仅可以打包，在借助加载器的情况下还能完成很多其他任务（比如转换和监控文件变更）。使用webpack，就再也不需要其他任务运行器。

webpack也能处理诸如CSS文件等静态资源。它甚至还可以拆分捆绑包以使其能够异步加载。这里先专注于模块化客户端代码这一目标。

注意：书中大量代码在新版本上无法使用，参考[webpack文档](https://webpack.js.org/concepts/)。

## 手工使用webpack

* 安装webpack：

```shell
$ npm install --save-dev webpack
```

* 尝试用webpack把App.js文件打包成名为app.bundle.js的捆绑包：

```shell
$ node_modules/.bin/webpack static/App.js --output static/app.bundle.js
```

* 新建IssueAdd.jsx，将IssueAdd类从App.jsx中移动到该文件中：

```jsx
export default class IssueAdd extends React.Component {
    ...
}
```

* App.jsx中移除IssueAdd类，并将其导入：

```jsx
import IssueAdd from './IssueAdd.js';
```

* babel编译jsx为js后再运行上述webpack打包命令，可以看到IssueAdd.js自动添加到捆绑包中了（即使你并没有告诉它包含这个文件）。

```shell
$ ./node_modules/.bin/webpack ./static/App.js  --output ./static/app.bundle.js
Hash: d3ce8c46cab598b474c6
Version: webpack 4.12.0
Time: 314ms
Built at: 2018-06-22 10:53:25
        Asset     Size  Chunks             Chunk Names
app.bundle.js  6.5 KiB       0  [emitted]  main
[0] ./static/IssueAdd.js 2.86 KiB {0} [built]
[1] ./static/App.js 7.91 KiB {0} [built]
```

* 在index.html中引用App.js的地方改为引用app.bundle.js：

```html
<script src="app.bundle.js"></script>
```

* 刷新应用，正常工作。html中只需引用一个js文件，所有js依赖关系都由webpack处理好了。App.js、IssueAdd.js成了中间文件，可以删除掉了。

## 转换和打包

上述过程分了两步执行，先要手动转换JSX文件，然后再使用webpack将它们打包到一起。webpack有能力组合这两个步骤，不再依赖中间状态文件。但它单靠自己做不到这一点，需要借助于**加载器**。除了纯JavaScript之外的其他文件类型以及所有的转换操作都需要webpack加载器。它们都是独立的模块。

在本例中，需要babel加载器来处理JSX转换。

* 安装babel加载器：

```shell
$ npm install --save-dev babel-loader
```

* 命令行使用加载器非常烦琐，使用webpack.config.js配置文件：

```js
module.exports = {
    entry: './src/App.jsx',
    output: {
        path: './static',
        filename: 'app.bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015']
                }
            },
        ]
    }
};

//   新版本webpack的变化，需修改成如下：
// 1 path必须是绝对路径，使用path.resolve，path需要先导入。
// 2 module中loaders没有了
const path = require('path');

module.exports = {
    entry: './src/App.jsx',
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'app.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['react', 'es2015']
                    }
                }
            },
        ]
    }
};
```

加载器规范：一个用来匹配文件的test（正则表达式）、想要应用的loader（本例中是babel-loader）以及该加载器的一组选项（通过属性query来指定）。

* webpack会在内存中将IssueAdd.jsx转换为IssueAdd.js，不会再创建js文件，所以App.jsx中的import语句要改为：

```jsx
import IssueAdd from './IssueAdd.jsx';
```

* webpack编译也有监控模式，将它替换原来的脚本：

```json
...
"compile": "webpack",
"watch": "webpack --watch",
...
```

## 库捆绑包

React等三方库目前是从CDN作为脚本引入进来的，接下来也打包：

* npm安装库：

```shell
$ npm install --save react react-dom
```

* 在App.jsx等文件中用import载入react、react-dom：

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
```

* 删除index.html中react、react-dom等的脚本引用。

这样有个问题，三方库和自己的代码全都一起编译，每次很小的改动，都要进行整编。更好的方式是生成两个捆绑包，一个用于应用代码，另一个用于所有库。webpack内置了一个名为CommonsChunkPlugin的插件能够相当轻松地完成这个任务。

* 修改webpack.config.js文件：

```js
...
entry: {
    app: './src/App.jsx',
    vendor: ['react', 'react-dom'],
},
...
plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
],
...
```

这个用法无法使用，TODO。
[TOC]

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

为验证代码方便，分别列一下修改前、修改后的完整App.jsx代码：

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

```jsx
const contentNode = document.getElementById('contents');

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
        <IssueTable issues={issues} />
        <hr />
        <IssueAdd />
      </div>
    );
  }
}

ReactDOM.render(<IssueList />, contentNode);
```


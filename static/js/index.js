var TodoContainer = React.createClass({
	render: function(){
		return (
			<div className="container">
				<TodoHeader />
				<TodoBox {...this.props} />
				<TodoFooter />
			</div>
		)
	}
});

var TodoHeader = React.createClass({
	render: function(){
		return (
			<header className="header">
				<h1>todos</h1>
			</header>
		)
	}
});

var TodoFooter = React.createClass({
	render: function(){
		return (
			<footer className="footer">
				<p>Double-click to edit a todo</p>
				<p>Created by kagol</p>
				<p>Part of TodoMVC</p>
			</footer>
		)
	}
});

var TodoBox = React.createClass({
	handleTodoSubmit: function(todo){
		$.ajax({
			url: this.props.url_add,
			type: 'post',
			dataType: 'json',
			cache: false,
			data: todo,
			success: function(data){
				this.setState({
					data: data
				});
			}.bind(this)
		});
	},
	handleTodoModify: function(todo){
		$.ajax({
			url: this.props.url_modify,
			type: 'post',
			dataType: 'json',
			cache: false,
			data: todo,
			success: function(data){
				this.setState({
					data: data
				});
			}.bind(this)
		});
	},
	handleTodoRemove: function(id){
		$.ajax({
			url: this.props.url_remove,
			type: 'post',
			dataType: 'json',
			cache: false,
			data: {
				id: id
			},
			success: function(data){
				this.setState({
					data: data
				});
			}.bind(this)
		});
	},
	handleTodoBatchRemove: function(ids){
		$.ajax({
			url: this.props.url_batch_remove,
			type: 'post',
			dataType: 'json',
			cache: false,
			data: {
				ids: ids
			},
			success: function(data){
				this.setState({
					data: data
				});
			}.bind(this)
		});
	},
	handleAllStatus: function(isAllCompleted){
		$.ajax({
			url: this.props.url_allstatus,
			type: 'post',
			dataType: 'json',
			cache: false,
			data: {
				isAllCompleted: isAllCompleted
			},
			success: function(data){
				this.setState({
					data: data
				});
			}.bind(this)
		});
	},
	getInitialState: function(){
		return {
			data: [],
			status: 'all'
		};
	},
	getAllStatus: function(){
		var arr = this.state.data;
		var num = 0;
		for(var i=0;i<arr.length;i++){
			if(arr[i].isCompleted === true){
				num++;
			}
		}
		return num === arr.length ? true : false;
	},
	getDatasByStatus: function(){
		var arr = this.state.data;
		var status = this.state.status;
		status = status === 'all' ? undefined : (status === 'active' ? false : true)
		//console.log('status:' + status);
		if(status === undefined){
			result = arr;
			return result;
		}
		var result = [];
		
		for(var i=0;i<arr.length;i++){
			if(arr[i].isCompleted === status){
				result.push(arr[i]);
			}
		}
		//console.log('result:');
		//console.log(result);
		return result;
	},
	changeStateByStatus: function(status){
		this.setState({
			status: status
		});
	},
	getLeftNum: function(){
		var arr = this.state.data;
		var num = 0;
		var currentStatus = this.state.status;
		if(currentStatus === 'all' || currentStatus === 'active'){
			for(var i=0;i<arr.length;i++){
				if(arr[i].isCompleted === false){
					num++;
				}
			}
		}else if(currentStatus === 'completed'){
			num = 0;
		}
		return num;
	},
	getCompletedNum: function(){
		var arr = this.state.data;
		var num = 0;
		for(var i=0;i<arr.length;i++){
			if(arr[i].isCompleted === true){
				num++;
			}
		}
		return num;
	},
	handleClearCompleted: function(){
		var ids = [];
		var arr = this.state.data;
		for(var i=0;i<arr.length;i++){
			if(arr[i].isCompleted === true){
				ids.push(arr[i].id);
			}
		}
		this.handleTodoBatchRemove(ids.join(','));
	},
	componentDidMount: function(){
		$.ajax({
			url: this.props.url_list,
			type: 'get',
			dataType: 'json',
			cache: false,
			success: function(data){
				this.setState({
					data: data
				});
			}.bind(this)// 不加 bind(this) 会报错，"index.js:49 Uncaught TypeError: this.setState is not a function"
		});
	},
	render: function(){
		// console.log(this.state.data);
		// console.log(this.getAllStatus());
		return (
			<div className="todo-box">
				<TodoItemInput onTodoGetAllStatus={this.getAllStatus} onTodoAllStatus={this.handleAllStatus} onTodoSubmit={this.handleTodoSubmit} />
				<TodoItemList onTodoGetDatasByStatus={this.getDatasByStatus} onTodoRemove={this.handleTodoRemove} onTodoModify={this.handleTodoModify} data={this.state.data} />
				<TodoItemStatus onTodoClearCompleted={this.handleClearCompleted} onTodoChangeStateByStatus={this.changeStateByStatus} onTodoLeftNum={this.getLeftNum()} onTodoCompletedNum={this.getCompletedNum()} />
			</div>
		)
	}
});

var TodoItemInput = React.createClass({
	getInitialState: function(){
		return {
			text: '',
			isCompleted: false,
			allIsCompleted: false
		}
	},
	handleSubmit: function(e){
		e.preventDefault();
		this.props.onTodoSubmit(this.state);
		this.setState({text: ''});
	},
	handleText: function(e){
		this.setState({
			text: e.target.value
		});
	},
	handleChangeAllStatus: function(){
		this.props.onTodoAllStatus(!this.state.allIsCompleted);
		this.setState({
			allIsCompleted: !this.state.allIsCompleted
		});
	},
	componentWillReceiveProps: function(){
		// console.log('componentWillReceiveProps:'+this.props.onTodoGetAllStatus());
		var allIsCompleted = this.props.onTodoGetAllStatus();
		this.setState({
			allIsCompleted: allIsCompleted
		});
	},
	render: function(){
		return (
			<form className="todo-item-input" onSubmit={this.handleSubmit}>
				<input type="checkbox" checked={this.state.allIsCompleted} onChange={this.handleChangeAllStatus} />
				<input type="text" onChange={this.handleText} placeholder="What needs to be done?"  />
			</form>
		)
	}
});

var TodoItemList = React.createClass({
	handleChangeStatus: function(obj){
		this.props.onTodoModify(obj);
	},
	handleRemoveItem: function(id){
		this.props.onTodoRemove(id);
	},
	render: function(){
		var todoNodes = this.props.onTodoGetDatasByStatus().map(function(todo){
			return (
				<TodoItem key={todo.id} onRemoveItem={this.handleRemoveItem} onChangeStatus={this.handleChangeStatus} id={todo.id} text={todo.text} isCompleted={todo.isCompleted} />
			);
		}.bind(this));
		return (
			<ul className="todo-item-list">
				{todoNodes}
			</ul>
		)
	}
});

var TodoItem = React.createClass({
	handleStatus: function(e){
		this.props.onChangeStatus({
			id: this.refs.lblText.getAttribute('data-id'),
			text: this.refs.lblText.getAttribute('data-text'),
			isCompleted: e.target.checked
		});
	},
	handleRemove: function(){
		this.props.onRemoveItem(this.refs.btnRemove.getAttribute('data-id'));
	},
	handleText: function(){
		/*this.props.onChangeStatus({
			id: this.refs.lblText.getAttribute('data-id'),
			text: '000000000hahha',//this.refs.lblText.getAttribute('data-text'),
			isCompleted: this.refs.lblText.getAttribute('data-iscompleted')
		});*/
		$(this.refs.liTodoItem)['0'].className = 'editing';
	},
	editText: function(e){
		this.props.onChangeStatus({
			id: this.refs.txtText.getAttribute('data-id'),
			text: e.target.value,//this.refs.lblText.getAttribute('data-text'),
			isCompleted: this.refs.txtText.getAttribute('data-iscompleted')
		});
	},
	handleEnterEvent: function(e){
		if(e.keyCode === 13){
			$(this.refs.liTodoItem)['0'].className = '';
		}
	},
	render: function(){
		return (
			<li ref="liTodoItem">
				<div className="todo-item view">
					<input type="checkbox" onChange={this.handleStatus} checked={this.props.isCompleted} />
					<label ref="lblText" onDoubleClick={this.handleText} data-text={this.props.text} data-id={this.props.id} data-iscompleted={this.props.isCompleted}>{this.props.text}</label>
					<button ref="btnRemove" data-id={this.props.id} className="btn-delete" onClick={this.handleRemove}>X</button>
				</div>
				<input type="text" ref="txtText" className="edit" value={this.props.text} onKeyDown={this.handleEnterEvent} onChange={this.editText} data-id={this.props.id} data-iscompleted={this.props.isCompleted} />
			</li>
		)
	}
});

var TodoItemStatus = React.createClass({
	changeStatusToAll: function(e){
		e.preventDefault();
		this.props.onTodoChangeStateByStatus('all');
	},
	changeStatusToActive: function(e){
		e.preventDefault();
		this.props.onTodoChangeStateByStatus('active');
	},
	changeStatusToCompleted: function(e){
		e.preventDefault();
		this.props.onTodoChangeStateByStatus('completed');
	},
	clearCompleted: function(e){
		e.preventDefault();
		this.props.onTodoClearCompleted();
	},
	render: function(){
		var leftnum = this.props.onTodoLeftNum;
		var itemtext = leftnum < 2 ? 'item' : 'items';
		var completednum = this.props.onTodoCompletedNum;
		console.log('completednum:'+completednum);
		var btnCompletedNode = completednum > 0 ? <button onClick={this.clearCompleted}>Clear completed</button> : '';
		return (
			<div className="todo-item-status">
				<span>{leftnum} {itemtext} left</span>
				<ul>
					<li><a href="javascript:void(0);" onClick={this.changeStatusToAll}>All</a></li>
					<li><a href="javascript:void(0);" onClick={this.changeStatusToActive}>Active</a></li>
					<li><a href="javascript:void(0);" onClick={this.changeStatusToCompleted}>Completed</a></li>
				</ul>
				{btnCompletedNode}
			</div>
		)
	}
});

ReactDOM.render(
	<TodoContainer url_list="/todo/list" url_add="/todo/add" url_modify="/todo/modify" url_remove="/todo/remove" url_batch_remove="/todo/batch/remove" url_allstatus="/todo/allstatus" />,
	document.querySelector('#content')
);

/*

error!!!

browser.min.js:4 XMLHttpRequest cannot load file:///D:/Code/FrontEnd/React/20160808/react-todos/react-todo-v1.0.0/index.js. Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https, chrome-extension-resource.

*/
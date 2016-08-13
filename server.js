var fs = require('fs');
var path = require('path');
var bodyParse = require('body-parser');
var express = require('express');
var app = express();

var TODOS_FILE = __dirname + '/todos.json';
console.log('TODOS_FILE:'+TODOS_FILE);

app.use(express.static(path.join(__dirname, '/static')));
app.use(bodyParse.json());
app.use(bodyParse.urlencoded({extended: true}));

app.get('/', function(req, res){
	fs.readFile('./index.html', 'utf-8', function(err, data){
		if(err) res.send(err);
		res.send(data);
	});
});

app.get('/todo/list', function(req, res){
	fs.readFile(TODOS_FILE, function(err, data){
		if(err){
			console.log('error');
			process.exit(1);
		}
		res.json(JSON.parse(data));
	});
});

app.post('/todo/add', function(req, res){
	fs.readFile(TODOS_FILE, function(err, data){
		var todos = JSON.parse(data);

		var newTodo = {
			id: Date.now(),
			text: req.body.text,
			isCompleted: req.body.isCompleted === 'false' ? false : true
		};

		todos.push(newTodo);

		fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 4), function(err){
			res.json(todos);
		});
	});
});

app.post('/todo/modify', function(req, res){
	fs.readFile(TODOS_FILE, function(err, data){
		var todos = JSON.parse(data);

		var newTodos = [];

		for(var i=0;i<todos.length;i++){
			console.log('todos[i].id:'+todos[i].id);
			console.log('req.body.id:'+req.body.id);
			if(parseInt(todos[i].id) === parseInt(req.body.id)){
				var isCompleted = req.body.isCompleted === 'false' ? false : true;
				console.log(isCompleted);
				newTodos.push({
					id: todos[i].id,
					text: req.body.text,
					isCompleted: isCompleted
				});
			}else{
				newTodos.push(todos[i]);
			}
		}

		console.log(newTodos);

		fs.writeFile(TODOS_FILE, JSON.stringify(newTodos, null, 4), function(err){
			res.json(newTodos);
		});
	});
});

app.post('/todo/remove', function(req, res){
	fs.readFile(TODOS_FILE, function(err, data){
		var todos = JSON.parse(data);

		var newTodos = [];

		for(var i=0;i<todos.length;i++){
			if(parseInt(todos[i].id) !== parseInt(req.body.id)){
				newTodos.push(todos[i]);
			}
		}

		fs.writeFile(TODOS_FILE, JSON.stringify(newTodos, null, 4), function(err){
			res.json(newTodos);
		});
	});
});

app.post('/todo/batch/remove', function(req, res){
	fs.readFile(TODOS_FILE, function(err, data){
		var todos = JSON.parse(data);
		var ids_arr = req.body.ids.split(',');

		console.log('ids_arr:');
		console.log(ids_arr);

		var newTodos = [];

		for(var i=0;i<todos.length;i++){
			var flag = true;
			for(var j=0;j<ids_arr.length;j++){
				if(parseInt(todos[i].id) === parseInt(ids_arr[j])){
					flag = false;
				}
			}
			if(flag){
				newTodos.push(todos[i]);
			}
		}

		console.log('newTodos:');
		console.log(newTodos);



		fs.writeFile(TODOS_FILE, JSON.stringify(newTodos, null, 4), function(err){
			res.json(newTodos);
		});
	});
});

app.post('/todo/allstatus', function(req, res){
	fs.readFile(TODOS_FILE, function(err, data){
		var todos = JSON.parse(data);
		var isAllCompleted = req.body.isAllCompleted === 'false' ? false : true;

		var newTodos = [];

		for(var i=0;i<todos.length;i++){
			if(isAllCompleted === false){
				newTodos.push({
					id: todos[i].id,
					text: todos[i].text,
					isCompleted: false
				});
			}else{
				newTodos.push({
					id: todos[i].id,
					text: todos[i].text,
					isCompleted: true
				});
			}
		}

		fs.writeFile(TODOS_FILE, JSON.stringify(newTodos, null, 4), function(err){
			res.json(newTodos);
		});
	});
});

app.listen(3002, function(){
	console.log('welcome to visit localhost:3002');
});